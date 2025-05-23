// app/api/html-to-modules/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";
import { OpenAI } from "openai";

// Type definitions for our module system
type ModuleType = "TEXT" | "MEDIA" | "LIST" | "TESTIMONIAL" | "TABLE";

type TextSubtype =
  | "HEADER"
  | "SUB_HEADER"
  | "PARAGRAPH"
  | "CTA"
  | "SHOP_NOW"
  | "PAGE_HEADER"
  | "BANNER";

type MediaSubtype = "VIDEO" | "IMAGE";

type ListSubtype =
  | "BULLET_POINTS"
  | "BULLET_POINTS_WITH_SUPPORTING_TEXT"
 
type TestimonialSubtype = "TESTIMONIAL" | "REVIEW";

type TableSubtype = "TABLE";

type ModuleSubtype =
  | TextSubtype
  | MediaSubtype
  | ListSubtype
  | TestimonialSubtype
  | TableSubtype;

interface Module {
  type: ModuleType;
  subtype: ModuleSubtype;
  content: any;
}

interface ModuleResponse {
  totalModules: number;
  moduleCounts: Record<ModuleType, number>;
  modules: Module[];
}

interface RequestBody {
  productLink: string;
  useAutoDiscovery?: boolean;
  sectionTemplateMap?: Record<string, string>;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { productLink, useAutoDiscovery = true } = body;

    if (!productLink) {
      return NextResponse.json(
        { error: "Missing required parameter: productLink" },
        { status: 400 }
      );
    }

    console.log(`Fetching HTML from: ${productLink}`);
    const htmlContent = await fetchHtml(productLink);
    console.log(`Successfully fetched HTML (${htmlContent.length} bytes)`);

    let processedSections;

    if (useAutoDiscovery) {
      console.log("Using auto-discovery to find sections");
      processedSections = await autoDiscoverSections(htmlContent);
    } else {
      const { sectionTemplateMap } = body;
      if (!sectionTemplateMap) {
        return NextResponse.json(
          {
            error:
              "When useAutoDiscovery is false, sectionTemplateMap is required",
          },
          { status: 400 }
        );
      }

      console.log("Using provided section template map");
      processedSections = await processSections(
        htmlContent,
        sectionTemplateMap
      );
    }

    return NextResponse.json({
      success: true,
      data: processedSections,
      sectionsCount: Object.keys(processedSections).length,
    });
  } catch (error: any) {
    console.error("Error processing HTML:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process HTML" },
      { status: 500 }
    );
  }
}

// Helper function to fetch HTML content from a URL
async function fetchHtml(url: string): Promise<string> {
  try {
    // Set appropriate headers to mimic a browser
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
      timeout: 15000, // 15 seconds timeout
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Failed to fetch HTML from ${url}: Status ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(`No response received from ${url}: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch HTML from ${url}: ${error.message}`);
    }
  }
}

// Function for traditional section processing with provided selectors
async function processSections(
  htmlContent: string,
  sectionTemplateMap: Record<string, string>
): Promise<Record<string, ModuleResponse | null>> {
  const $ = cheerio.load(htmlContent);
  const result: Record<string, ModuleResponse | null> = {};

  // Log all available section IDs for debugging
  console.log("Available Shopify sections:");
  $(".shopify-section").each((i, el) => {
    console.log($(el).attr("id"));
  });

  // Process each section defined in the map
  for (const [sectionKey, templateId] of Object.entries(sectionTemplateMap)) {
    try {
      // Convert the templateId to an ID selector if it doesn't already have the # prefix
      const selector = templateId.startsWith("#")
        ? templateId
        : `#${templateId}`;

      // Extract the section using the ID selector
      const sectionElement = $(selector);

      if (sectionElement.length > 0) {
        console.log(`Found section with ID: ${templateId}`);
        // Get the HTML content for this section
        const sectionHtml = sectionElement.html();

        if (sectionHtml) {
          // Process the HTML through the module classification system
          const processedSection = await classifyIntoModules(sectionHtml);
          result[sectionKey] = processedSection;
          console.log(`Successfully processed section: ${sectionKey}`);
        } else {
          result[sectionKey] = null; // Empty section
          console.log(
            `Section found for ID "${templateId}" but it has no HTML content`
          );
        }
      } else {
        result[sectionKey] = null; // Section not found
        console.warn(`Section with ID "${templateId}" not found in HTML`);
      }
    } catch (error) {
      console.error(`Error processing section ${sectionKey}:`, error);
      result[sectionKey] = null;
    }
  }

  return result;
}

// Function for auto-discovering sections
async function autoDiscoverSections(
  htmlContent: string
): Promise<Record<string, ModuleResponse | null>> {
  const $ = cheerio.load(htmlContent);
  const result: Record<string, ModuleResponse | null> = {};

  // Find all Shopify sections in the document
  const sections = $(".shopify-section");
  console.log(`Found ${sections.length} Shopify sections`);

  // Process each section one by one
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionElement = $(section);
    const sectionId = sectionElement.attr("id");

    if (sectionId) {
      try {
        // Get the HTML content for this section
        const sectionHtml = sectionElement.html();

        if (sectionHtml) {
          // Extract a section name from comments or classes if available
          let sectionName = sectionId;

          // Try to extract section name from HTML comments (Shopify often includes descriptive comments)
          const commentMatch = sectionHtml.match(
            /<!--\s*(section\/[^>]+)\s*-->/
          );
          if (commentMatch && commentMatch[1]) {
            sectionName = commentMatch[1].trim();
          } else {
            // Try to extract a meaningful name from classes
            const classList = sectionElement
              .find('[class*="product-"], [class*="section-"]')
              .first()
              .attr("class");
            if (classList) {
              const classMatch = classList.match(
                /(product-[a-z-]+|section-[a-z-]+)/
              );
              if (classMatch && classMatch[1]) {
                sectionName = classMatch[1];
              }
            }
          }

          console.log(`Processing section: ${sectionName}`);

          // Process the HTML through the module classification system
          const processedSection = await classifyIntoModules(sectionHtml);

          // Store the result with a meaningful key
          result[sectionName] = processedSection;
          console.log(`Successfully processed section: ${sectionName}`);
        } else {
          console.log(
            `Section found with ID ${sectionId} but it has no HTML content`
          );
        }
      } catch (error) {
        console.error(`Error processing section ${sectionId}:`, error);
      }
    }
  }

  return result;
}

// Function to classify HTML into modules using OpenAI
async function classifyIntoModules(html: string): Promise<ModuleResponse> {
  // Clean the HTML for processing
  const $ = cheerio.load(html);

  // Remove script and style tags to focus on content
  $("script, style").remove();

  const cleanHtml = $.html();

  // Prepare the prompt for classification
  const prompt = `
HTML to Modules Conversion Task

Context
You are tasked with analyzing an HTML section and breaking it down into structured modules according to our predefined module system. Each section should be classified into appropriate module types and subtypes.

Module Types
The following are the available module types and their subtypes:

TEXT Modules

HEADER: Usually Section Opener .
SUB_HEADER: Secondary title text
PARAGRAPH: Standard paragraph text
CTA: Call to Action buttons or links
SHOP_NOW: Shopping-specific call to action
PAGE_HEADER: Main page title
BANNER: Banner text, typically prominent


MEDIA Modules

VIDEO: Video content with link
IMAGE: Image with the link 


Bullet point Modules

BULLET_POINTS: Simple bullet point list
BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with additional explanatory text



TESTIMONIAL Modules

TESTIMONIAL: Customer or user testimonial
REVIEW: Product or service review

TABLE Modules

Table : Table with headers and rows


Your Task

Analyze the provided HTML section
Identify all distinct modules within the section
For each identified module:
1.Determine the primary module type (TEXT, MEDIA, LIST, TESTIMONIAL, TABLE)
2.Identify the appropriate subtype
3.The most important of all "Want the exact content no rubbish at all"


Example Output JSON Format
{
  "totalModules": 15,
  "moduleCounts": {
    "TEXT": 6,
    "MEDIA": 2,
    "LIST": 5,
    "TESTIMONIAL": 1,
    "TABLE": 1
  },
  "modules": [
    {
      "type": "TEXT",
      "subtype": "HEADER",
      "content": "Welcome to Our Wellness Platform"
    },
    {
      "type": "TEXT",
      "subtype": "SUB_HEADER",
      "content": "Your journey to better health starts here"
    },
    {
      "type": "TEXT",
      "subtype": "PARAGRAPH",
      "content": "Our platform offers personalized wellness plans tailored to your unique needs using time-tested Ayurvedic science."
    },
    {
      "type": "TEXT",
      "subtype": "CTA",
      "content": {
        "text": "Explore Plans",
        "url": "/plans"
      }
    },
    {
      "type": "TEXT",
      "subtype": "SHOP_NOW",
      "content": {
        "text": "Shop Wellness Kits",
        "url": "/shop"
      }
    },
    {
      "type": "TEXT",
      "subtype": "PAGE_HEADER",
      "content": "Wellness Programs for Every Lifestyle"
    },
    {
      "type": "MEDIA",
      "subtype": "IMAGE",
      "content": {
        "src": "https://example.com/images/wellness_kit.jpg",
        "alt": "Ayurvedic Wellness Kit"
      }
    },
    {
      "type": "MEDIA",
      "subtype": "VIDEO",
      "content": {
        "src": "https://example.com/videos/intro.mp4",
        "thumbnail": "https://example.com/thumb.jpg",
        "title": "Introduction to Holistic Wellness"
      }
    },
    {
      "type": "LIST",
      "subtype": "BULLET_POINTS",
      "content": [
        "Pure Ayurvedic Ingredients",
        "Clinically Tested Formulas",
        "Free Wellness Consultation"
      ]
    },
    {
      "type": "LIST",
      "subtype": "BULLET_POINTS_WITH_SUPPORTING_TEXT",
      "content": [
        {
          "point": "Boosts Immunity",
          "supportingText": "Natural herbs enhance your body's defense mechanism."
        },
        {
          "point": "Reduces Stress",
          "supportingText": "Adaptogens help your body manage stress better."
        }
      ]
    },
  
    {
      "type": "TESTIMONIAL",
      "subtype": "TESTIMONIAL",
      "content": {
        "quote": "This changed my life! My hair feels fuller and I'm more energized.",
        "author": "Aarav Patel",
        "designation": "Customer since 2022"
      }
    },
    {
      "type": "TABLE",
      "subtype": "TABLE",
      "content": {
        "headers": ["Ingredient", "Benefit", "Source"],
        "rows": [
          ["Ashwagandha", "Reduces Stress", "India"],
          ["Shatavari", "Balances Hormones", "Nepal"],
          ["Brahmi", "Enhances Focus", "Sri Lanka"]
        ]
      }
    }
  ]
}

Important Notes
    1. Pay attention to the semantic purpose of elements rather than just their HTML tags
    2. Some elements may contain multiple modules nested within them
    3. When in doubt about a module type, choose the one that best represents the user's intent also Stick to the modules given 
    4. Provide rationale for any ambiguous classifications



    HTML : ${cleanHtml}
`;

  try {
    const processingTimeout = 30000;

    const timeoutPromise = new Promise<ModuleResponse>((_, reject) => {
      setTimeout(
        () => reject(new Error("Language model request timed out")),
        processingTimeout
      );
    });

    const processingPromise = new Promise<ModuleResponse>(
      async (resolve, reject) => {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that classifies HTML into structured modules according to specific guidelines.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.1, // Low temperature for more deterministic results
            response_format: { type: "json_object" }, // Ensure response is valid JSON
          });

          const content = response.choices[0].message.content;

          if (!content) {
            reject(new Error("Empty response from language model"));
            return;
          }

          try {
            resolve(JSON.parse(content) as ModuleResponse);
          } catch (e) {
            reject(
              new Error("Failed to parse JSON from language model response")
            );
          }
        } catch (error: any) {
          reject(new Error(`Error calling language model: ${error.message}`));
        }
      }
    );

    // Race the processing against the timeout
    return Promise.race([processingPromise, timeoutPromise]);
  } catch (error: any) {
    console.error("Error classifying modules:", error);

    // Return a fallback response in case of error
    return {
      totalModules: 0,
      moduleCounts: {
        TEXT: 0,
        MEDIA: 0,
        LIST: 0,
        TESTIMONIAL: 0,
        TABLE: 0,
      },
      modules: [],
    };
  }
}
