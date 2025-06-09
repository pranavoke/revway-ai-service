// app/api/create-landing-page/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dynamicLandingPagePrompt } from "@/lib/prompts";

import OpenAI from "openai";

// Add timeout wrapper for OpenAI calls
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
};

function createFallbackModules(title: string, content: string): any[] {
  console.log(`🚨 Creating fallback modules for section: "${title}"`);

  return [
    {
      type: "TEXT",
      subtype: "HEADER",
      content: title,
    },
    {
      type: "TEXT",
      subtype: "PARAGRAPH",
      content: content || "Content will be added here.",
    },
  ];
}

/**
 * Normalize GPT response to ensure consistent format
 */
function normalizeGPTResponse(
  response: any,
  sectionTitle: string,
  sectionData: any
): any[] {
  console.log(`🔧 Normalizing response for section: "${sectionTitle}"`);
  console.log(`📊 Raw response type: ${typeof response}`);
  console.log(`🔍 Raw response:`, response);

  // Helper to normalize testimonial objects
  function normalizeTestimonial(testimonial: any) {
    return {
      subject: testimonial.subject || testimonial.quote || "",
      body: testimonial.body || testimonial.text || testimonial.quote || "",
      reviewerName: testimonial.reviewerName || testimonial.author || "",
      rating:
        typeof testimonial.rating === "number"
          ? testimonial.rating
          : testimonial.rating
          ? Number(testimonial.rating)
          : 5,
    };
  }

  // Helper to normalize a module
  function normalizeModule(module: any): any {
    if (module.type === "TESTIMONIAL") {
      module.type = "TESTIMONIAL";
      module.subtype = "TESTIMONIAL_1";
      if (Array.isArray(module.testimonials)) {
        module.testimonials = module.testimonials.map(normalizeTestimonial);
      }
    }
    if (module.type === "TABLE") {
      if (Array.isArray(module.table) && module.table.length > 0) {
        const colCount = Array.isArray(module.table[0])
          ? module.table[0].length
          : 0;
        if (colCount === 2) module.subtype = "TABLE_1";
        if (colCount === 3) module.subtype = "TABLE_2";
      }
    }
    if (module.type === "MEDIA") {
      if (Array.isArray(module.mediaList) && module.mediaList.length > 0) {
        module.subtype = "IMAGE_CAROUSEL";
      }
      if (module.subtype === "VIDEO") {
        module.subtype = "VIDEO";
      }
    }
    return module;
  }

  // If response already has modules array, use it
  if (response && Array.isArray(response.modules)) {
    return response.modules.map(normalizeModule);
  }

  // If response is directly an array
  if (Array.isArray(response)) {
    return response.map(normalizeModule);
  }

  // If response is a single module object, wrap it in array
  if (response && response.type) {
    const modules = [normalizeModule(response)];
    // Add content module if we have description and it's not already included
    if (
      sectionData.description &&
      typeof sectionData.description === "string"
    ) {
      modules.push({
        type: "TEXT",
        subtype: "PARAGRAPH",
        content: sectionData.description,
      });
    } else if (Array.isArray(sectionData.description)) {
      // Handle array descriptions (bullet points)
      modules.push({
        type: "LIST",
        subtype: "BULLET_POINTS",
        content: sectionData.description,
      });
    }
    return modules;
  }

  // Fallback - create modules from section data
  return createFallbackModules(
    sectionTitle,
    typeof sectionData.description === "string"
      ? sectionData.description
      : Array.isArray(sectionData.description)
      ? sectionData.description.join(". ")
      : "Content will be added here."
  );
}

/**
 * Process a single section with timeout and error handling
 */
async function processSectionWithTimeout(
  section: any,
  openai: OpenAI,
  timeoutMs: number = 60000
): Promise<{ sectionTitle: string; modules: any[] }> {
  const sectionTitle = section.title;

  console.log(`\n🔄 Processing section: "${sectionTitle}"`);
  console.log(`📋 Section data:`, section);

  const moduleSystemPrompt = `You are an expert landing page content formatter. Your task is to convert section content into well-structured modules.

Focus on these module types:

1. TEXT modules:
   - HEADER: Section main title
   - SUB_HEADER: Secondary titles
   - PARAGRAPH: Text paragraphs
   - PAIR_IT_WITH: Product recommendation (content: null, products: array)
   - GRID: Product collection (content: null, products: array)

2. LIST modules (use 'bulletPoints' field):
   - BULLET_POINTS: Simple bullet lists
   - BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with title and supporting text

3. TESTIMONIAL modules (use 'testimonials' field):
   - TESTIMONIAL_1: All customer reviews in one module. Each testimonial must have: subject, body, reviewerName, rating.

4. MEDIA modules (use 'mediaList' field):
   - IMAGE: Single image content
   - IMAGE_CAROUSEL: Multiple images (use if more than one image)
   - VIDEO: Video content

5. TABLE modules (use 'table' field):
   - TABLE_1: Two-column table
   - TABLE_2: Three-column table

   CRITICAL FIELD MAPPINGS:
- TEXT type → uses 'content' field 
- LIST type → uses 'bulletPoints' field
- TESTIMONIAL type → uses 'testimonials' field (see structure below)
- MEDIA type → uses 'mediaList' field
- TABLE type → uses 'table' field

Never use 'content' field for non-TEXT types.

TESTIMONIAL structure example:
{
  "type": "TESTIMONIAL",
  "subtype": "TESTIMONIAL_1",
  "testimonials": [
    {
      "subject": "Short summary or headline",
      "body": "Full testimonial text",
      "reviewerName": "Customer name",
      "rating": 5
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Always return a JSON object with a "modules" array
2. Create separate modules for different content types
3. Include BOTH the header AND the content from the description
4. If description is a string, create a PARAGRAPH module
5. If description is an array, create appropriate LIST modules
6. For testimonials, extract individual reviews into a single TESTIMONIAL_1 module with the above structure
7. For tables, use TABLE_1 for 2 columns, TABLE_2 for 3 columns (check the number of columns in the data)
8. For media, use IMAGE_CAROUSEL if more than one image, otherwise IMAGE. For video, use VIDEO.

Response format must be: {"modules": [...]}`;

  const moduleUserPrompt = `Section Title: ${sectionTitle}
Section Content: ${JSON.stringify(section)}

Convert this section into appropriate modules. You MUST:
1. Create a HEADER module for the title
2. Create appropriate content modules for the description
3. Return the response in this exact format: {"modules": [...]}

CORRECT way to structure (properly segregated):
[{
  "type": "TEXT",
  "subtype": "PARAGRAPH",
  "content": "Our product is designed with three core values in mind:"
}, {
  "type": "LIST",
  "subtype": "BULLET_POINTS_WITH_SUPPORTING_TEXT",
  "bulletPoints": [
    {"point": "Quality", "supportingText": "We use only the finest materials"},
    {"point": "Durability", "supportingText": "Built to last for years"},
    {"point": "Sustainability", "supportingText": "Environmentally friendly production"}
  ]
}, {
  "type": "TEXT",
  "subtype": "SUB_HEADER",
  "content": "What we learned?"
}, {
  "type": "LIST",
  "subtype": "BULLET_POINTS",
  "bulletPoints": [
    {"point": "Better Quality", "supportingText": null},
    {"point": "Better Durability", "supportingText": null},
    {"point": "Better sustainability", "supportingText": null}
  ]
}, {
  "type": "TEXT",
  "subtype": "PARAGRAPH",
  "content": "Contact us today to learn more about our commitment to excellence."
}, {
  "type": "TESTIMONIAL",
  "subtype": "TESTIMONIAL_1",
  "testimonials": [
    {"subject": "Great product!", "body": "I loved using this product, it really helped me a lot.", "reviewerName": "Jane Doe", "rating": 5}
  ]
}, {
  "type": "MEDIA",
  "subtype": "IMAGE_CAROUSEL",
  "mediaList": [
    {"url": "image1.jpg"},
    {"url": "image2.jpg"}
  ]
}, {
  "type": "TABLE",
  "subtype": "TABLE_1",
  "table": [["Feature", "Value"], ["Color", "Red"]]
}, {
  "type": "TABLE",
  "subtype": "TABLE_2",
  "table": [["Feature", "Value", "Notes"], ["Color", "Red", "Popular"]]
}]`;

  console.log(`\n📤 SENDING MODULE PROMPT FOR SECTION: "${sectionTitle}"`);

  try {
    const moduleCompletion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: moduleSystemPrompt },
          { role: "user", content: moduleUserPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent responses
      }),
      timeoutMs
    );

    const moduleResponse = moduleCompletion.choices[0].message.content || "{}";

    console.log(`\n📥 GPT RESPONSE FOR SECTION: "${sectionTitle}"`);
    console.log(`📊 Response length: ${moduleResponse.length} characters`);

    const parsedResponse = JSON.parse(moduleResponse);
    console.log(`🔍 Parsed Response:`, parsedResponse);

    // Normalize the response to ensure consistent format
    const normalizedModules = normalizeGPTResponse(
      parsedResponse,
      sectionTitle,
      section
    );

    console.log(
      `✅ Successfully processed section "${sectionTitle}" with ${normalizedModules.length} modules`
    );

    return { sectionTitle, modules: normalizedModules };
  } catch (error) {
    console.error(`❌ Error processing section "${sectionTitle}":`, error);

    // Return fallback modules instead of empty array
    const fallbackModules = createFallbackModules(
      sectionTitle,
      typeof section.description === "string"
        ? section.description
        : Array.isArray(section.description)
        ? section.description.join(". ")
        : "Content will be added here."
    );

    return { sectionTitle, modules: fallbackModules };
  }
}

export async function POST(request: NextRequest) {
  console.log(`\n🚀 ========== LANDING PAGE GENERATION STARTED ==========`);
  console.log(`⏰ Request started at: ${new Date().toISOString()}`);

  // Add overall request timeout
  const requestTimeout = setTimeout(() => {
    console.error("Request timeout after 8 minutes");
  }, 8 * 60 * 1000);

  try {
    const body = await request.json();
    console.log(`📥 Request body:`, body);

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(`🔗 Processing URL: ${body.url}`);
    if (body.prompt) {
      console.log(`💡 Additional instructions: ${body.prompt}`);
    }

    // Initialize OpenAI with custom prompts
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Step 1: Analyze the URL and determine appropriate sections
    const systemPrompt = dynamicLandingPagePrompt;
    const userPrompt = `URL: ${body.url}
      ${body.prompt ? `Additional Instructions: ${body.prompt}` : ""}
      
      Analyze this URL and create a comprehensive landing page structure with appropriate sections.
      Determine the number and types of sections based on the URL's content and purpose.
      
      The response should be a JSON object with the following structure:
      {
        "title": "Landing Page Title",
        "sections": [
          {
            "title": "Section Title",
            "description": "Detailed section content or array of bullet points"
          }
        ]
      }`;

    console.log(`\n📤 SENDING INITIAL LANDING PAGE PROMPT`);

    console.log(`⏱️ Starting initial GPT call with 60s timeout...`);

    const landingPageCompletion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      }),
      60000
    );

    const initialResponse =
      landingPageCompletion.choices[0].message.content || "{}";

    console.log(`\n📥 INITIAL GPT RESPONSE`);
    console.log(`📊 Response length: ${initialResponse.length} characters`);

    // Parse and validate the response
    let landingPageData;
    try {
      landingPageData = JSON.parse(initialResponse);
      console.log(`✅ Successfully parsed initial JSON response`);
      console.log(`📋 Landing page title: "${landingPageData.title}"`);

      // Validate that sections exists and is an array
      if (
        !landingPageData.sections ||
        !Array.isArray(landingPageData.sections) ||
        landingPageData.sections.length === 0
      ) {
        console.error(
          `❌ Invalid response format: sections missing or not array`
        );

        // Create a default structure if sections is missing
        landingPageData = {
          title: landingPageData.title || "Landing Page",
          sections: [
            {
              title: "Main Section",
              description:
                "This is the main content section of the landing page.",
            },
          ],
        };
        console.log(`🚨 Using fallback structure with 1 section`);
      } else {
        console.log(`✅ Found ${landingPageData.sections.length} sections:`);
        landingPageData.sections.forEach((section: any, index: number) => {
          console.log(
            `   ${index + 1}. "${section.title}" (${
              typeof section.description === "string"
                ? section.description.length + " chars"
                : Array.isArray(section.description)
                ? section.description.length + " items"
                : "unknown type"
            })`
          );
        });
      }
    } catch (error) {
      console.error(`❌ Error parsing initial GPT response:`, error);

      // Create a default structure if parsing fails
      landingPageData = {
        title: "Landing Page",
        sections: [
          {
            title: "Main Section",
            description:
              "This is the main content section of the landing page.",
          },
        ],
      };
      console.log(`🚨 Using fallback structure due to parse error`);
    }

    console.log(`\n🔄 ========== PROCESSING SECTIONS IN PARALLEL ==========`);
    console.log(
      `📊 Total sections to process: ${landingPageData.sections.length}`
    );

    // Step 2: Process each section into appropriate modules IN PARALLEL
    const sectionPromises = landingPageData.sections.map(
      (section: any, index: number) => {
        console.log(
          `🔄 Creating promise for section ${index + 1}: "${section.title}"`
        );
        return processSectionWithTimeout(section, openai, 90000); // Increased timeout
      }
    );

    console.log(
      `⏱️ Starting parallel processing of ${sectionPromises.length} sections...`
    );

    // Wait for all sections to complete in parallel
    const sectionResults = await Promise.allSettled(sectionPromises);

    console.log(`\n📊 ========== PARALLEL PROCESSING COMPLETED ==========`);
    console.log(
      `✅ Completed: ${
        sectionResults.filter((r) => r.status === "fulfilled").length
      }`
    );
    console.log(
      `❌ Failed: ${
        sectionResults.filter((r) => r.status === "rejected").length
      }`
    );

    // Step 3: Transform results to required format
    const transformedModulesBySection: Array<{
      sectionTitle: string;
      totalModules: number;
      moduleCounts: Record<string, number>;
      modules: any[];
    }> = [];

    for (const [index, result] of sectionResults.entries()) {
      if (result.status === "fulfilled") {
        const { sectionTitle, modules } = result.value;

        console.log(
          `✅ Processing successful result ${
            index + 1
          }: "${sectionTitle}" with ${modules.length} modules`
        );

        // Ensure modules is an array before processing
        const moduleArray = Array.isArray(modules) ? modules : [];

        if (moduleArray.length === 0) {
          console.log(
            `⚠️ No modules found for section "${sectionTitle}", creating fallback`
          );
          const fallbackModules = createFallbackModules(
            sectionTitle,
            landingPageData.sections[index]?.description ||
              "Content will be added here."
          );
          moduleArray.push(...fallbackModules);
        }

        // Count total modules
        const totalModules = moduleArray.length;

        // Count modules by type
        const moduleCounts: Record<string, number> = {};
        moduleArray.forEach((module: any) => {
          if (module && module.type) {
            const type = module.type;
            moduleCounts[type] = (moduleCounts[type] || 0) + 1;
          }
        });

        console.log(`📊 Module counts for "${sectionTitle}":`, moduleCounts);

        // Create the transformed structure and push to array
        transformedModulesBySection.push({
          sectionTitle,
          totalModules,
          moduleCounts,
          modules: moduleArray,
        });
      } else {
        console.error(
          `❌ Failed to process section ${index + 1}:`,
          result.reason
        );

        // Create fallback for failed sections
        const originalSection = landingPageData.sections[index];
        if (originalSection) {
          const fallbackModules = createFallbackModules(
            originalSection.title,
            typeof originalSection.description === "string"
              ? originalSection.description
              : Array.isArray(originalSection.description)
              ? originalSection.description.join(". ")
              : "Content will be added here."
          );

          transformedModulesBySection.push({
            sectionTitle: originalSection.title,
            totalModules: fallbackModules.length,
            moduleCounts: { TEXT: fallbackModules.length },
            modules: fallbackModules,
          });
        }
      }
    }

    clearTimeout(requestTimeout);

    console.log(`\n🎉 ========== GENERATION COMPLETED SUCCESSFULLY ==========`);
    console.log(`📊 Final Results Summary:`);
    console.log(`   📋 Landing Page Title: "${landingPageData.title}"`);
    console.log(
      `   📦 Total Sections Processed: ${transformedModulesBySection.length}`
    );

    let totalModules = 0;
    const overallModuleCounts: Record<string, number> = {};

    transformedModulesBySection.forEach((section, index) => {
      console.log(
        `   ${index + 1}. "${section.sectionTitle}": ${
          section.totalModules
        } modules`
      );
      totalModules += section.totalModules;
      Object.keys(section.moduleCounts).forEach((type) => {
        overallModuleCounts[type] =
          (overallModuleCounts[type] || 0) + section.moduleCounts[type];
      });
    });

    console.log(`   🎯 Total Modules Created: ${totalModules}`);
    console.log(`   📈 Module Type Distribution:`, overallModuleCounts);
    console.log(`⏰ Request completed at: ${new Date().toISOString()}`);

    // Return the complete result
    return NextResponse.json({
      title: landingPageData.title,
      modulesBySection: transformedModulesBySection,
    });
  } catch (error) {
    clearTimeout(requestTimeout);
    console.error(`💥 ========== FATAL ERROR ==========`);
    console.error(`❌ Error creating landing page:`, error);
    console.error(`⏰ Error occurred at: ${new Date().toISOString()}`);

    return NextResponse.json(
      { error: "Failed to create landing page" },
      { status: 500 }
    );
  }
}
