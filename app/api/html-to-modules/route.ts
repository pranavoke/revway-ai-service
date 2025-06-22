// app/api/html-to-modules/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";
import { OpenAI } from "openai";
import { getHtmlToModulesClassificationPrompt } from "@/lib/prompts/index";

// Type definitions matching Master API structure exactly
type ModuleType = "TEXT" | "MEDIA" | "LIST" | "TESTIMONIAL" | "TABLE";

type TextSubtype =
  | "HEADER"
  | "SUB_HEADER"
  | "PARAGRAPH"
  | "PAGE_HEADER"
  | "BANNER";

type MediaSubtype = "VIDEO" | "IMAGE" | "IMAGE_CAROUSEL";

type ListSubtype = "BULLET_POINTS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT";

type TestimonialSubtype = "TESTIMONIAL_1" | "REVIEW";

type TableSubtype = "TABLE_1" | "TABLE_2";

type ModuleSubtype =
  | TextSubtype
  | MediaSubtype
  | ListSubtype
  | TestimonialSubtype
  | TableSubtype;

interface Module {
  type: ModuleType;
  subtype: ModuleSubtype;
  content?: any;
  bulletPoints?: Array<{
    point: string;
    supportingText: string | null;
  }>;
  testimonials?: Array<{
    subject: string;
    body: string;
    reviewerName: string;
    rating: number;
  }>;
  mediaList?: Array<{
    url: string;
    alt?: string;
    title?: string;
    thumbnail?: string;
  }>;
  table?: string[][];
}

// Updated to match Master API structure exactly
interface SectionResponse {
  sectionTitle: string;
  modules: any[];
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

    // Return in Master API format - array of sections
    const sectionsArray = Object.entries(processedSections)
      .filter(([_, section]) => section !== null)
      .map(([key, section]) => {
        // Process each section to fix image URLs
        const processedSection = {
          ...section!,
          sectionTitle: key,
          modules: section!.modules.map((module: any) => {
            // If module has mediaList, fix the URLs
            if (module.type === "MEDIA" && module.mediaList) {
              return {
                ...module,
                mediaList: module.mediaList.map((media: any) => ({
                  ...media,
                  link: media.link ? fixImageUrl(media.link) : media.link,
                })),
              };
            }
            return module;
          }),
        };
        return processedSection;
      });

    return NextResponse.json({
      success: true,
      sections: sectionsArray,
      sectionsCount: sectionsArray.length,
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
): Promise<Record<string, SectionResponse | null>> {
  const $ = cheerio.load(htmlContent);
  const result: Record<string, SectionResponse | null> = {};

  // Log all available section IDs for debugging
  console.log("\n=== Available Shopify Sections ===");
  $(".shopify-section").each((i, el) => {
    console.log(`Section ${i + 1}:`, $(el).attr("id"));
  });
  console.log("================================\n");

  // Process each section defined in the map
  console.log("\n=== Processing Sections with Template Map ===");
  console.log("Template Map:", JSON.stringify(sectionTemplateMap, null, 2));

  for (const [sectionKey, templateId] of Object.entries(sectionTemplateMap)) {
    try {
      console.log(`\nProcessing section: ${sectionKey}`);
      // Convert the templateId to an ID selector if it doesn't already have the # prefix
      const selector = templateId.startsWith("#")
        ? templateId
        : `#${templateId}`;
      console.log("Using selector:", selector);

      // Extract the section using the ID selector
      const sectionElement = $(selector);

      if (sectionElement.length > 0) {
        console.log(`Found section with ID: ${templateId}`);
        // Get the HTML content for this section
        const sectionHtml = sectionElement.html();

        if (sectionHtml) {
          console.log(`Section HTML length: ${sectionHtml.length} characters`);
          // Process the HTML through the module classification system
          console.log("Classifying section into modules...");
          const processedSection = await classifyIntoModules(sectionHtml);

          // Convert to Master API format
          result[sectionKey] = {
            sectionTitle: sectionKey,
            modules: processedSection.modules,
          };
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

  console.log("\n=== Section Processing Summary ===");
  console.log("Total sections processed:", Object.keys(result).length);
  console.log(
    "Successfully processed sections:",
    Object.keys(result).filter((key) => result[key] !== null).length
  );
  console.log(
    "Failed sections:",
    Object.keys(result).filter((key) => result[key] === null).length
  );
  console.log("================================\n");

  return result;
}

// Function for auto-discovering sections
async function autoDiscoverSections(
  htmlContent: string
): Promise<Record<string, SectionResponse | null>> {
  const $ = cheerio.load(htmlContent);
  const result: Record<string, SectionResponse | null> = {};

  // Find all Shopify sections in the document
  const sections = $(".shopify-section");
  console.log(`\n=== Auto-Discovering Sections ===`);
  console.log(`Found ${sections.length} Shopify sections`);

  // Process each section one by one
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionElement = $(section);
    const sectionId = sectionElement.attr("id");

    if (sectionId) {
      try {
        console.log(`\nProcessing section ${i + 1}/${sections.length}`);
        console.log(`Section ID: ${sectionId}`);

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
            console.log(`Found section name in comments: ${sectionName}`);
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
                console.log(`Found section name in classes: ${sectionName}`);
              }
            }
          }

          console.log(`Processing section content: ${sectionName}`);
          console.log(`Section HTML length: ${sectionHtml.length} characters`);

          // Process the HTML through the module classification system
          console.log("Classifying section into modules...");
          const processedSection = await classifyIntoModules(sectionHtml);

          result[sectionName] = {
            sectionTitle: sectionName,
            modules: processedSection.modules,
          };
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

  console.log("\n=== Auto-Discovery Summary ===");
  console.log("Total sections found:", sections.length);
  console.log("Successfully processed sections:", Object.keys(result).length);
  console.log("Failed sections:", sections.length - Object.keys(result).length);
  console.log("============================\n");

  return result;
}

// Function to classify HTML into modules using prompt functions and OpenAI
async function classifyIntoModules(html: string): Promise<any> {
  // Clean the HTML for processing
  const $ = cheerio.load(html);

  // Remove script and style tags to focus on content
  $("script, style").remove();

  const cleanHtml = $.html();

  // Use prompt function instead of hardcoded prompt
  const { systemPrompt, userPrompt } = getHtmlToModulesClassificationPrompt({
    cleanHtml,
  });

  // Log the prompts being used
  console.log("\n=== HTML to Modules Classification Prompts ===");
  console.log("System Prompt:", systemPrompt);
  console.log("User Prompt:", userPrompt);
  console.log("==========================================\n");

  try {
    const processingPromise = new Promise<any>(async (resolve, reject) => {
      try {
        console.log("Making OpenAI API request...");
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;

        if (!content) {
          console.error("Received empty response from OpenAI");
          reject(new Error("Empty response from language model"));
          return;
        }

        console.log("\n=== OpenAI API Response ===");
        console.log("Raw response:", content);
        console.log("===========================\n");

        try {
          const parsed = JSON.parse(content) as any;

          resolve({
            ...parsed,
          });
        } catch (e) {
          console.error("Error parsing OpenAI response:", e);
          reject(e);
        }
      } catch (error: any) {
        console.error("OpenAI API Error:", error);
        reject(new Error(`Error calling language model: ${error.message}`));
      }
    });

    return processingPromise;
  } catch (error: any) {
    console.error("Error classifying modules:", error);

    return {
      section: [],
    };
  }
}

// Function to fix image URLs that are missing protocol
function fixImageUrl(url: string): string {
  if (!url) return url;

  // Check if URL starts with // (protocol-relative)
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/") && !url.startsWith("//")) {
    // You might need to add your domain here if needed
    return url;
  }

  // If URL already has protocol, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If no protocol at all, assume https
  return `https://${url}`;
}

// Function to fix image URLs in media objects
function fixMediaUrls(mediaList: any[]): any[] {
  return mediaList.map((media) => ({
    ...media,
    url: media.url ? fixImageUrl(media.url) : media.url,
    thumbnail: media.thumbnail ? fixImageUrl(media.thumbnail) : media.thumbnail,
  }));
}
