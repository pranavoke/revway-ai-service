// app/api/create-landing-page/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateLandingPage, formatSectionToModules } from "@/lib/openai";
import { dynamicLandingPagePrompt, moduleCreationPrompt } from "@/lib/prompts";
import { Module } from "@/lib/types";
import OpenAI from "openai";

/**
 * Segment content into appropriate modules based on content type
 *
 * @param title Section title
 * @param content Content to segment
 * @returns Array of segmented modules
 */
function segmentContent(title: string, content: string): any[] {
  const modules: any[] = [
    {
      type: "TEXT",
      subtype: "HEADER",
      content: title,
    },
  ];

  // Split content by double newlines to identify paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim() !== "");

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    // Skip empty paragraphs
    if (trimmedParagraph === "") continue;

    // Check if paragraph contains bullet points
    if (
      trimmedParagraph.includes("\n") &&
      (trimmedParagraph.includes("- ") ||
        trimmedParagraph.includes("* ") ||
        trimmedParagraph.includes("• "))
    ) {
      const lines = trimmedParagraph.split("\n");
      let textContent: string[] = [];
      let bulletPoints: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === "") continue;

        if (trimmedLine.match(/^[-*•]\s+/)) {
          bulletPoints.push(trimmedLine.replace(/^[-*•]\s+/, "").trim());
        } else {
          textContent.push(trimmedLine);
        }
      }

      // Add paragraph text if it exists
      if (textContent.length > 0) {
        modules.push({
          type: "TEXT",
          subtype: "PARAGRAPH",
          content: textContent.join("\n").trim(),
        });
      }

      // Add bullet points if they exist
      if (bulletPoints.length > 0) {
        // Check if these are bullet points with supporting text
        const bulletPointsWithSupport: Array<{
          title: string;
          supportingText: string;
        }> = [];
        let isWithSupport = true;

        for (const point of bulletPoints) {
          const match = point.match(/^([^:]+):\s*(.*?)$/);
          if (match) {
            bulletPointsWithSupport.push({
              title: match[1].trim(),
              supportingText: match[2].trim(),
            });
          } else {
            isWithSupport = false;
            break;
          }
        }

        if (isWithSupport && bulletPointsWithSupport.length > 0) {
          modules.push({
            type: "LIST",
            subtype: "BULLET_POINTS_WITH_SUPPORTING_TEXT",
            content: bulletPointsWithSupport,
          });
        } else {
          modules.push({
            type: "LIST",
            subtype: "BULLET_POINTS",
            content: bulletPoints,
          });
        }
      }
    }
    // Check if paragraph contains bullet points with supporting text structure
    else if (
      trimmedParagraph.includes("\n") &&
      trimmedParagraph.match(/^([^:]+):\s*(.*?)$/m)
    ) {
      // This looks like bullet points with title and supporting text
      const lines = trimmedParagraph.split("\n");
      let isBulletWithSupport = true;
      const bulletPointsWithSupport: Array<{
        title: string;
        supportingText: string;
      }> = [];

      // Process each line
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === "") continue;

        // Check for "Title: Supporting text" pattern
        const match = trimmedLine.match(/^([^:]+):\s*(.*?)$/);
        if (match) {
          bulletPointsWithSupport.push({
            title: match[1].trim(),
            supportingText: match[2].trim(),
          });
        } else {
          // If any line doesn't match the pattern, this might not be bullet points with support
          isBulletWithSupport = false;
          break;
        }
      }

      if (isBulletWithSupport && bulletPointsWithSupport.length > 0) {
        modules.push({
          type: "LIST",
          subtype: "BULLET_POINTS_WITH_SUPPORTING_TEXT",
          content: bulletPointsWithSupport,
        });
      } else {
        // Fallback to regular paragraph
        modules.push({
          type: "TEXT",
          subtype: "PARAGRAPH",
          content: trimmedParagraph,
        });
      }
    }
    // Check if it's a testimonial (contains quotation marks and attribution)
    else if (
      trimmedParagraph.includes('"') &&
      (trimmedParagraph.includes("- ") ||
        trimmedParagraph.includes("— ") ||
        trimmedParagraph.includes("\n"))
    ) {
      const quoteMatch = trimmedParagraph.match(/"([^"]+)"/);
      const authorMatch = trimmedParagraph.match(/[-—]\s*([^,\n]+)/);

      if (quoteMatch) {
        modules.push({
          type: "TESTIMONIAL",
          subtype: "TESTIMONIAL",
          content: {
            quote: quoteMatch[1],
            author: authorMatch ? authorMatch[1].trim() : "Happy Customer",
          },
        });
      } else {
        // Fallback to paragraph
        modules.push({
          type: "TEXT",
          subtype: "PARAGRAPH",
          content: trimmedParagraph,
        });
      }
    }
    // Check for media references
    else if (
      trimmedParagraph.toLowerCase().includes("image") ||
      trimmedParagraph.toLowerCase().includes("photo") ||
      trimmedParagraph.toLowerCase().includes("picture") ||
      trimmedParagraph.toLowerCase().includes("video")
    ) {
      // Add the text paragraph
      modules.push({
        type: "TEXT",
        subtype: "PARAGRAPH",
        content: trimmedParagraph,
      });

      // Also suggest a media module
      if (trimmedParagraph.toLowerCase().includes("video")) {
        modules.push({
          type: "MEDIA",
          subtype: "VIDEO",
          content: {
            src: "https://example.com/videos/product-video.mp4",
            thumbnail: "https://example.com/images/video-thumbnail.jpg",
            title: "Product Demo Video",
          },
        });
      } else {
        modules.push({
          type: "MEDIA",
          subtype: "IMAGE",
          content: {
            src: "https://example.com/images/product-image.jpg",
            alt: "Product Image",
          },
        });
      }
    }
    // Check for table-like content
    else if (
      trimmedParagraph.includes("|") ||
      (trimmedParagraph.includes("\n") &&
        trimmedParagraph.split("\n").length >= 3 &&
        trimmedParagraph.split("\n").every((line) => line.includes("\t")))
    ) {
      // This looks like tabular data, try to convert to table
      let headers: string[] = [];
      let rows: string[][] = [];

      if (trimmedParagraph.includes("|")) {
        // Parse pipe-separated table
        const lines = trimmedParagraph.split("\n");
        headers = lines[0]
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h !== "");

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === "" || lines[i].includes("---")) continue;
          const row = lines[i]
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell !== "");
          if (row.length > 0) rows.push(row);
        }
      } else {
        // Parse tab-separated table
        const lines = trimmedParagraph.split("\n");
        headers = lines[0].split("\t").map((h) => h.trim());

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === "") continue;
          rows.push(lines[i].split("\t").map((cell) => cell.trim()));
        }
      }

      if (headers.length > 0 && rows.length > 0) {
        modules.push({
          type: "TABLE",
          subtype: headers.length >= 3 ? "TABLE_1" : "TABLE_2",
          content: {
            headers,
            rows,
          },
        });
      } else {
        // Fallback to regular paragraph
        modules.push({
          type: "TEXT",
          subtype: "PARAGRAPH",
          content: trimmedParagraph,
        });
      }
    }
    // Regular paragraph
    else {
      modules.push({
        type: "TEXT",
        subtype: "PARAGRAPH",
        content: trimmedParagraph,
      });
    }
  }

  // Check if we should add a CTA
  if (
    title.toLowerCase().includes("order") ||
    title.toLowerCase().includes("buy") ||
    title.toLowerCase().includes("get") ||
    title.toLowerCase().includes("shop") ||
    title.toLowerCase().includes("today") ||
    title.toLowerCase().includes("offer") ||
    content.toLowerCase().includes("click") ||
    content.toLowerCase().includes("order now") ||
    content.toLowerCase().includes("buy now")
  ) {
    modules.push({
      type: "TEXT",
      subtype: "CTA",
      content: {
        text: "Shop Now",
        url: "/shop",
      },
    });
  }

  return modules;
}

/**
 * Enhance content segregation by splitting mixed content modules
 *
 * @param modules The modules to enhance
 * @param originalContent The original content for reference
 * @returns Enhanced modules with better content segregation
 */
function enhanceContentSegregation(
  modules: any[],
  originalContent: string
): any[] {
  const enhancedModules: any[] = [];

  for (const module of modules) {
    // Skip header and CTA modules - no need for additional processing
    if (
      (module.type === "TEXT" &&
        (module.subtype === "HEADER" ||
          module.subtype === "SUB_HEADER" ||
          module.subtype === "CTA" ||
          module.subtype === "SHOP_NOW")) ||
      module.type === "TESTIMONIAL" ||
      module.type === "MEDIA" ||
      module.type === "TABLE"
    ) {
      enhancedModules.push(module);
      continue;
    }

    // Focus on paragraph modules that might contain mixed content
    if (module.type === "TEXT" && module.subtype === "PARAGRAPH") {
      const content = module.content;

      // Skip if content is very short or not a string
      if (typeof content !== "string" || content.length < 30) {
        enhancedModules.push(module);
        continue;
      }

      // Check for mixed content (paragraphs and bullet points)
      if (
        content.includes("\n") &&
        (content.includes("- ") ||
          content.includes("* ") ||
          content.includes("• "))
      ) {
        const lines = content.split("\n");
        let currentParagraph: string[] = [];
        let currentBulletPoints: string[] = [];

        for (const line of lines) {
          const trimmedLine = line.trim();

          // Skip empty lines
          if (trimmedLine === "") continue;

          // Check if line is a bullet point
          if (trimmedLine.match(/^[-*•]\s+/)) {
            // If we have paragraph content, add it as a module
            if (currentParagraph.length > 0) {
              enhancedModules.push({
                type: "TEXT",
                subtype: "PARAGRAPH",
                content: currentParagraph.join("\n").trim(),
              });
              currentParagraph = [];
            }

            // Add the bullet point
            currentBulletPoints.push(
              trimmedLine.replace(/^[-*•]\s+/, "").trim()
            );
          } else {
            // If we have bullet points, add them as a module
            if (currentBulletPoints.length > 0) {
              // Check if bullet points have a title: support pattern
              const bulletPointsWithSupport: Array<{
                title: string;
                supportingText: string;
              }> = [];
              let isWithSupport = true;

              for (const point of currentBulletPoints) {
                const match = point.match(/^([^:]+):\s*(.*?)$/);
                if (match) {
                  bulletPointsWithSupport.push({
                    title: match[1].trim(),
                    supportingText: match[2].trim(),
                  });
                } else {
                  isWithSupport = false;
                  break;
                }
              }

              if (isWithSupport && bulletPointsWithSupport.length > 0) {
                enhancedModules.push({
                  type: "LIST",
                  subtype: "BULLET_POINTS_WITH_SUPPORTING_TEXT",
                  content: bulletPointsWithSupport,
                });
              } else {
                enhancedModules.push({
                  type: "LIST",
                  subtype: "BULLET_POINTS",
                  content: currentBulletPoints,
                });
              }

              currentBulletPoints = [];
            }

            // Add the paragraph line
            currentParagraph.push(trimmedLine);
          }
        }

        // Add any remaining content
        if (currentParagraph.length > 0) {
          enhancedModules.push({
            type: "TEXT",
            subtype: "PARAGRAPH",
            content: currentParagraph.join("\n").trim(),
          });
        }

        if (currentBulletPoints.length > 0) {
          // Check if these are bullet points with supporting text
          const bulletPointsWithSupport: Array<{
            title: string;
            supportingText: string;
          }> = [];
          let isWithSupport = true;

          for (const point of currentBulletPoints) {
            const match = point.match(/^([^:]+):\s*(.*?)$/);
            if (match) {
              bulletPointsWithSupport.push({
                title: match[1].trim(),
                supportingText: match[2].trim(),
              });
            } else {
              isWithSupport = false;
              break;
            }
          }

          if (isWithSupport && bulletPointsWithSupport.length > 0) {
            enhancedModules.push({
              type: "LIST",
              subtype: "BULLET_POINTS_WITH_SUPPORTING_TEXT",
              content: bulletPointsWithSupport,
            });
          } else {
            enhancedModules.push({
              type: "LIST",
              subtype: "BULLET_POINTS",
              content: currentBulletPoints,
            });
          }
        }
      } else {
        // No mixed content, add the module as is
        enhancedModules.push(module);
      }
    } else {
      // For non-paragraph modules, add them as is
      enhancedModules.push(module);
    }
  }

  return enhancedModules;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
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
            "description": "Detailed section content"
          }
        ]
      }`;

    const landingPageCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    // Parse and validate the response
    let landingPageData;
    try {
      landingPageData = JSON.parse(
        landingPageCompletion.choices[0].message.content || "{}"
      );
      console.log(`\n ------------------------------------------------\n`);
      console.log("LandingPage:", landingPageData);

      // Validate that sections exists and is an array
      if (
        !landingPageData.sections ||
        !Array.isArray(landingPageData.sections) ||
        landingPageData.sections.length === 0
      ) {
        console.error(
          "Invalid response format: sections is missing or not an array",
          landingPageData
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
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);

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
    }

    // Step 2: Process each section into appropriate modules
    const modulesBySection: Record<string, any[]> = {};

    for (const section of landingPageData.sections) {
      // Ensure the section has a title
      if (!section.title) {
        console.warn("Skipping section with missing title:", section);
        continue;
      }

      // Handle different description formats
      let description = section.description;
      if (Array.isArray(description)) {
        // If description is an array, convert it to a string with double line breaks
        // to ensure proper paragraph separation
        description = description.join("\n\n");
      } else if (typeof description !== "string") {
        // If description is neither a string nor an array, convert to string
        description = JSON.stringify(description);
      }

      const moduleSystemPrompt = `You are an expert landing page content formatter. Your task is to convert section content into well-structured modules.

Use these module types:

TEXT Modules:
- HEADER: Main section title
- SUB_HEADER: Secondary title
- PARAGRAPH: Standard paragraph text
- CTA: Call to Action buttons or links

LIST Modules:
- BULLET_POINTS: Simple bullet point list
- BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with title and supporting text

TESTIMONIAL Modules:
- TESTIMONIAL: Customer quotes with author

MEDIA Modules:
- IMAGE: Image content
- VIDEO: Video content

TABLE Modules:
- TABLE_1: Table with multiple columns

IMPORTANT: Properly separate different content types within the section. If a section contains a paragraph followed by bullet points and then another paragraph, create THREE separate modules (PARAGRAPH, BULLET_POINTS, PARAGRAPH) rather than combining them into one module.

Look for natural content breaks in the text and create separate modules for each distinct content type. Properly separate text, lists, testimonials, media, and tables.`;

      const moduleUserPrompt = `Section Title: ${section.title}
        Section Description:
        
        ${description}
        
        Create separate modules for different content types (paragraphs, lists, testimonials, media, tables). 
        DO NOT combine different content types into a single module.

        These are important :
        
        For bullet points with titles and explanations, use the BULLET_POINTS_WITH_SUPPORTING_TEXT type.
        where ever normal only points are given use simple bullet points 
        If there are images or videos mentioned, include appropriate MEDIA modules.
        If there are structured data that would fit in a table, use TABLE modules.
        
        Return a JSON array of module objects that clearly segregate the content.
        
        Example of good segregation:
        [
          { "type": "TEXT", "subtype": "HEADER", "content": "Why Choose Us" },
          { "type": "TEXT", "subtype": "PARAGRAPH", "content": "We offer the best products because:" },
          { "type": "LIST", "subtype": "BULLET_POINTS", "content": ["High quality", "Affordable", "Eco-friendly"] },
          { "type": "LIST", "subtype": "BULLET_POINTS_WITH_SUPPORTING_TEXT", "content": [
            { "title": "Quality", "supportingText": "Made from premium materials" },
            { "title": "Durability", "supportingText": "Lasts for years of use" }
          ]},
          { "type": "MEDIA", "subtype": "IMAGE", "content": { "src": "https://example.com/image.jpg", "alt": "Product Image" } },
          { "type": "TEXT", "subtype": "PARAGRAPH", "content": "Contact us today to learn more." }
        ]`;

      try {
        const moduleCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: moduleSystemPrompt },
            { role: "user", content: moduleUserPrompt },
          ],
        });

        const moduleResponse =
          moduleCompletion.choices[0].message.content || "[]";
        console.log(`\n ------------------------------------------------\n`);
        console.log("Module:", moduleResponse);
        let modules;

        try {
          const parsedResponse = JSON.parse(moduleResponse);

          // Check if response is already an array
          if (Array.isArray(parsedResponse)) {
            modules = parsedResponse;
          } else if (
            parsedResponse.modules &&
            Array.isArray(parsedResponse.modules)
          ) {
            modules = parsedResponse.modules;
          } else {
            // Look for any array property in the response
            const arrayProps = Object.keys(parsedResponse).filter((key) =>
              Array.isArray(parsedResponse[key])
            );

            if (arrayProps.length > 0) {
              modules = parsedResponse[arrayProps[0]];
            } else {
              // Fallback to automatic content segmentation
              console.warn(
                `No array found in response for section "${section.title}". Using automatic segmentation.`
              );
              modules = segmentContent(section.title, description);
            }
          }
        } catch (parseError) {
          console.error(
            `Error parsing module response for section "${section.title}":`,
            parseError
          );
          // Fallback to automatic content segmentation
          modules = segmentContent(section.title, description);
        }

        // Apply additional content segregation if needed
        modulesBySection[section.title] = enhanceContentSegregation(
          modules,
          description
        );
      } catch (error) {
        console.error(
          `Error processing modules for section "${section.title}":`,
          error
        );
        // Fallback to automatic content segmentation
        modulesBySection[section.title] = segmentContent(
          section.title,
          description
        );
      }
    }

    // Step 3: Create a flat array of all modules
    const allModules = Object.values(modulesBySection).flat();

    // Step 3: Transform modulesBySection to the required array format
    const transformedModulesBySection: Array<{
      sectionTitle: string;
      totalModules: number;
      moduleCounts: Record<string, number>;
      modules: any[];
    }> = [];

    for (const [sectionTitle, modules] of Object.entries(modulesBySection)) {
      // Count total modules
      const totalModules = modules.length;

      // Count modules by type
      const moduleCounts: Record<string, number> = {};
      modules.forEach((module) => {
        const type = module.type;
        moduleCounts[type] = (moduleCounts[type] || 0) + 1;
      });

      // Create the transformed structure and push to array
      transformedModulesBySection.push({
        sectionTitle,
        totalModules,
        moduleCounts,
        modules,
      });
    }

    // Return the complete result with the transformed array structure
    return NextResponse.json({
      title: landingPageData.title,
      modulesBySection: transformedModulesBySection,
    });
  } catch (error) {
    console.error("Error creating landing page:", error);

    return NextResponse.json(
      { error: "Failed to create landing page" },
      { status: 500 }
    );
  }
}
