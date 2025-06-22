import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Icon library data with URLs

const ICON_LIBRARY = [
  {
    name: "Made in India",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Made%20in%20India.png?updatedAt=1749905148763",
  },
  {
    name: "24x7 Support",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/24x7%20Support.png?updatedAt=1749905148783",
  },
  {
    name: "Tick",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Tick.png?updatedAt=1749905148888",
  },
  {
    name: "Pin",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Pin.png?updatedAt=1749905148897",
  },
  {
    name: "FDA Approved",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/FDA%20Approved.png?updatedAt=1749905148893",
  },
  {
    name: "Warranty",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Warranty.png?updatedAt=1749905148912",
  },
  {
    name: "Best Seller",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Best%20Seller.png?updatedAt=1749905148909",
  },
  {
    name: "Lightining",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Lightining.png?updatedAt=1749905148931",
  },
  {
    name: "Award Winning",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Award%20Winning.png?updatedAt=1749905148956",
  },
  {
    name: "Verified Reviews",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Verified%20Reviews.png?updatedAt=1749905148974",
  },
  {
    name: "Dot",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Dot.png?updatedAt=1749905153092",
  },
  {
    name: "Sparkle",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Sparkle.png?updatedAt=1749905153920",
  },
  {
    name: "Cruelty Free",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Cruelty%20Free.png?updatedAt=1749905153897",
  },
  {
    name: "Trending Product",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Trending%20Product.png?updatedAt=1749905153916",
  },
  {
    name: "Clinically Proven",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Clinically%20Proven.png?updatedAt=1749905154022",
  },
  {
    name: "Influencer Approved",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Influencer%20Approved.png?updatedAt=1749905154283",
  },
  {
    name: "Tamper Proof Packaging",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Tamper%20Proof%20Packaging.png?updatedAt=1749905154384",
  },
  {
    name: "Worldwide Shipping",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Worldwide%20Shipping.png?updatedAt=1749905154421",
  },
  {
    name: "Eco Friendly",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Eco%20Friendly.png?updatedAt=1749905154434",
  },
  {
    name: "Ethically Sourced",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Ethically%20Sourced.png?updatedAt=1749905154458",
  },
  {
    name: "Authentic Product",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Authentic%20Product.png?updatedAt=1749905156563",
  },
  {
    name: "COD Available",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/COD%20Available.png?updatedAt=1749905157812",
  },
  {
    name: "Long Lasting Results",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Long%20Lasting%20Results.png?updatedAt=1749905157866",
  },
  {
    name: "100% Money Back Guarantee",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/100_%20Money%20Back%20Guarantee.png?updatedAt=1749905157784",
  },
  {
    name: "Sustainable Packaging",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Sustainable%20Packaging.png?updatedAt=1749905157856",
  },
  {
    name: "ISO Certified",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/ISO%20Certified.png?updatedAt=1749905157860",
  },
  {
    name: "Target",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Target.png?updatedAt=1749905157910",
  },
  {
    name: "Rocket",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Rocket.png?updatedAt=1749905157983",
  },
  {
    name: "As Seen On",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/As%20Seen%20On.png?updatedAt=1749905158345",
  },
  {
    name: "Vegan",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Vegan.png?updatedAt=1749905158502",
  },
  {
    name: "Packaged with Care",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Packaged%20with%20Care.png?updatedAt=1749905160280",
  },
  {
    name: "Diamond",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Diamond.png?updatedAt=1749905161431",
  },
  {
    name: "Dermatologically Tested",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Dermatologically%20Tested.png?updatedAt=1749905161454",
  },
  {
    name: "Community Favourite",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Community%20Favourite.png?updatedAt=1749905161514",
  },
  {
    name: "Over X Happy Customers",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Over%20X%20Happy%20Customers.png?updatedAt=1749905161555",
  },
  {
    name: "Backed by Experts",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Backed%20by%20Experts.png?updatedAt=1749905161587",
  },
  {
    name: "Free Shipping",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Free%20Shipping.png?updatedAt=1749905161613",
  },
  {
    name: "Easy Return",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Easy%20Return.png?updatedAt=1749905161910",
  },
  {
    name: "Magnifying Glass",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Magnifying%20Glass.png?updatedAt=1749905161956",
  },
  {
    name: "Fast Delivery",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Fast%20Delivery.png?updatedAt=1749905162038",
  },
  {
    name: "Love",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Love.png?updatedAt=1749905163705",
  },
  {
    name: "Puzzle Piece",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Puzzle%20Piece.png?updatedAt=1749905164520",
  },
  {
    name: "Loop",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Loop.png?updatedAt=1749905164562",
  },
  {
    name: "Secure Payment",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Secure%20Payment.png?updatedAt=1749905164661",
  },
  {
    name: "Lightbulb",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Lightbulb.png?updatedAt=1749905164725",
  },
  {
    name: "Quality Certified",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Quality%20Certified.png?updatedAt=1749905164742",
  },
  {
    name: "Recyclable Materials",
    url: "https://ik.imagekit.io/yoph3tdfu/fwdicons/Recyclable%20Materials.png?updatedAt=1749905165156",
  },
];

// Types
interface BulletPoint {
  point: string;
  supportingText?: string | null;
  icon?: string;
}

interface Module {
  type: string;
  subtype: string;
  content?: string;
  bulletPoints?: BulletPoint[];
  testimonials?: any[];
  table?: any[][];
  mediaList?: any[];
  products?: any[];
}

interface Section {
  sectionTitle: string;
  totalModules: number;
  moduleCounts: Record<string, number>;
  modules: Module[];
}

interface EnhanceRequest {
  title: string;
  sections: Section[];
  originalPrompt?: string;
  adStory?: string;
  productUrl?: string;
}

interface EnhanceResponse {
  title: string;
  sections: Section[];
}

function getSystemPrompt(): string {
  return `You are a landing page optimization expert. Your task is to enhance existing landing page sections for better conversion and user experience while preserving the original campaign context and themes.

CORE RULES:
1. NEVER modify these section types: INTRO, PAIR_IT_WITH, GRID_COLLECTION
2. SHOP_NOW MODULE OPTIMIZATION: If multiple SHOP_NOW modules exist, keep only ONE in the most strategic section (preferably after intro/benefits section) and remove all others
2B. If SHOP_NOW module is not present add one in any of the sections which is appropriate .
3. PRESERVE ORIGINAL CAMPAIGN CONTEXT: If original prompt or ad story mentions specific themes (like Women's Day, festivals, target audience), incorporate these themes throughout the enhanced content
4. Maintain 6-8 total sections (consolidate if >8, enhance if <6)
5. Each section must use different module combinations
6. Minimum 3 sections must include separate MEDIA modules (not just headers with images)
7. Every section requires a HEADER module

SECTION STRUCTURE REQUIREMENTS:
Each section should contain multiple modules working together:
- HEADER module (mandatory for every section)
- Primary content module (LIST, TABLE, TESTIMONIAL, etc.)
- Optional MEDIA module (IMAGE_CAROUSEL or VIDEO) - required in at least 3 sections
- Optional supporting modules (SUB_HEADER, additional content)

COMPLETE MODULE SPECIFICATIONS:

1. TEXT MODULES:
{
  "type": "TEXT",
  "subtype": "HEADER" | "SUB_HEADER" | "PARAGRAPH" | "PAIR_IT_WITH" | "GRID",
  "content": "string content" // null for PAIR_IT_WITH and GRID
}

For PAIR_IT_WITH and GRID subtypes:
{
  "type": "TEXT",
  "subtype": "PAIR_IT_WITH" | "GRID",
  "content": null,
  "products": [product_objects]
}

For SHOP_NOW subtypes:
{
  "type": "TEXT",
  "subtype": "SHOP_NOW",
  "content": null,
  "products": [product_objects] // here orginal product link
}

2. LIST MODULES (6 variations):
{
  "type": "LIST",
  "subtype": "BULLET_POINTS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT" | "BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS" | "BULLET_POINTS_WITH_ICONS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES" | "BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2",
  "bulletPoints": [
    {
      "point": "Main bullet text (always required)",
      "supportingText": "Additional explanation or null",
      "icon": "ONLY use full URLs from provided icon library OR example.com image URLs OR null"
    }
  ]
}

LIST Subtype Usage Guidelines:
- BULLET_POINTS: Simple list items only
- BULLET_POINTS_WITH_SUPPORTING_TEXT: Main point + detailed explanation
- BULLET_POINTS_WITH_ICONS: Main point + relevant icon (no supporting text)
- BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS: Main point + explanation + icon
- BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES: Main point + explanation + example.com image
- BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2: Timeline/process format with icons

3. MEDIA MODULES (standalone visual content):
{
  "type": "MEDIA",
  "subtype": "IMAGE_CAROUSEL" | "VIDEO",
  "mediaList": [
    {
      "link": "https://example.com/image.jpg",
      "extension": "jpg",
      "type": "image"
    }
  ]
}

4. TABLE MODULES:
{
  "type": "TABLE",
  "subtype": "TABLE_1" | "TABLE_2",
  "table": {
    "headers": ["Column 1", "Column 2", "Column 3"],
    "rows": [
      ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
      ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]
    ]
  }
}
Limits: Max 10 rows, 2-3 columns , where TABLE_1 = 3-col table and TABLE_2 = 2-col table

5. TESTIMONIAL MODULES:
{
  "type": "TESTIMONIAL",
  "subtype": "TESTIMONIAL_1",
  "testimonials": [
    {
      "subject": "Great product!",
      "body": "Detailed review text explaining benefits",
      "reviewerName": "Indian Name",
      "rating": 5
    }
  ]
}

ENHANCEMENT OBJECTIVES:
- Convert simple paragraphs to structured formats (bullets, tables, media)
- Add standalone MEDIA modules to enhance visual appeal
- Eliminate generic FAQ content
- Ensure module variety across sections
- Optimize for conversion

ICON AND IMAGE USAGE:
- **ICONS**: Use ONLY from the provided icon library (full URLs) - no other icon sources allowed
- **IMAGES**: Use https://example.com/descriptive-name.jpg for image placeholders only
- Icons from library go in bullet point 'icon' field
- Image placeholders go in separate MEDIA modules OR bullet point 'icon' field
- **RESTRICTION**: Do not use any icons outside the provided ICON_LIBRARY list

Focus on creating visually engaging, conversion-optimized sections with proper module combinations while preserving original messaging and product information.`;
}

function getUserPrompt(
  sections: Section[],
  originalPrompt?: string,
  adStory?: string,
  productUrl?: string
): string {
  const currentSectionCount = sections.length;
  const iconList = ICON_LIBRARY.map((icon) => `${icon.name}: ${icon.url}`).join(
    "\n"
  );

  // Count SHOP_NOW modules
  const shopNowCount = sections.reduce((count, section) => {
    return (
      count +
      section.modules.filter(
        (module) => module.type === "TEXT" && module.subtype === "SHOP_NOW"
      ).length
    );
  }, 0);

  let contextSection = "";
  if (originalPrompt || adStory) {
    contextSection = `
ORIGINAL CAMPAIGN CONTEXT (MUST INCORPORATE):
${originalPrompt ? `Original Prompt: ${originalPrompt}` : ""}
${adStory ? `Ad Story: ${adStory}` : ""}
${productUrl ? `Product URL: ${productUrl}` : ""}

CRITICAL THEME INTEGRATION:
- Extract key themes from the original context Ad Story
- Weave these themes naturally into section headers, content, and testimonials
- Ensure the enhanced landing page reflects the original campaign intent
- Maintain consistency with the specified target audience and occasion
`;
  }

  return `ENHANCE THESE LANDING PAGE SECTIONS:
${JSON.stringify(sections, null, 2)}
${contextSection}
AVAILABLE ICONS (use ONLY these full URLs - no other icons allowed):
${iconList}

ICON USAGE RESTRICTION:
- **MANDATORY**: Use ONLY icons from the above list
- **NO EXTERNAL ICONS**: Do not use any icon sources outside this provided list
- **FORMAT**: Always use the complete URL as provided

CRITICAL SHOP_NOW MODULE OPTIMIZATION: Very Important
- Current SHOP_NOW modules detected: ${shopNowCount}
- **REQUIREMENT**: Keep only ONE SHOP_NOW module in the most strategic section
- **STRATEGY**: Place the single SHOP_NOW module in a benefits/features section (not intro, not at the very end)
- **ACTION**: Remove all other SHOP_NOW modules and replace with appropriate content modules

SPECIFIC REQUIREMENTS:
1. Current sections: ${currentSectionCount} → Target: 6-8 sections
2. DO NOT modify: INTRO, PAIR_IT_WITH, GRID_COLLECTION sections
3. Add standalone MEDIA modules to at least 3 different sections
4. Use different module combinations for each section
5. Convert weak FAQs to structured content (tables, enhanced bullets)
6. Minimize usage of simple PARAGRAPH modules

SECTION ENHANCEMENT STRATEGY:
Each enhanced section should typically contain:
- HEADER module (mandatory)
- Primary content module (LIST/TABLE/TESTIMONIAL)
- MEDIA module (in at least 3 sections) - standalone visual content
- Optional SUB_HEADER for additional context

MEDIA MODULE IMPLEMENTATION:
Add as separate modules within sections, not just icons in bullets:
{
  "type": "MEDIA",
  "subtype": "IMAGE_CAROUSEL",
  "mediaList": [
    {
      "link": "https://example.com/product-demo.jpg",
      "extension": "jpg",
      "type": "image"
    },
    {
      "link": "https://example.com/usage-example.jpg", 
      "extension": "jpg",
      "type": "image"
    }
  ]
}

BULLET POINT VARIETY USAGE:
- Use different LIST subtypes across sections
- Don't repeat the same subtype in consecutive sections
- Match subtype to content purpose:
  * Simple features → BULLET_POINTS_WITH_ICONS
  * Detailed benefits → BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS
  * Process steps → BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2
  * How-to guides → BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES

QUALITY ENHANCEMENTS:
- Remove generic FAQ questions
- Convert data-heavy text to tables
- Add relevant testimonials with Indian names
- Use descriptive image placeholders (https://example.com/specific-description.jpg)
- Ensure each section serves a clear conversion purpose

Return enhanced sections as JSON:
{
  "sections": [enhanced_sections_array]
}`;
}

// Helper function to clean and parse JSON response
function cleanAndParseJSON(content: string): any {
  try {
    let cleaned = content.trim();

    // Remove markdown code blocks if present
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error cleaning and parsing JSON:", error);
    throw error;
  }
}

// Helper function to clean example.com URLs and set them to null
function cleanExampleUrls(data: any): any {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => cleanExampleUrls(item));
  }

  const cleaned = { ...data };

  for (const key in cleaned) {
    if (typeof cleaned[key] === "string") {
      // If the value is a string and contains example.com, set it to null
      if (cleaned[key].includes("example.com")) {
        cleaned[key] = null;
      }
    } else if (typeof cleaned[key] === "object" && cleaned[key] !== null) {
      // Recursively clean nested objects and arrays
      cleaned[key] = cleanExampleUrls(cleaned[key]);
    }
  }

  return cleaned;
}

// Helper function to validate response structure
function validateResponse(
  response: any,
  originalSections: Section[]
): EnhanceResponse {
  if (!response.sections || !Array.isArray(response.sections)) {
    throw new Error("Invalid response: sections array missing");
  }

  // Find protected sections in original sections
  const protectedSections = originalSections.filter((section) => {
    // Check if section title contains protected keywords
    const isIntro = section.sectionTitle.toLowerCase().includes("intro");
    const isPairItWith = section.sectionTitle
      .toLowerCase()
      .includes("pair it with");
    const isCollection = section.sectionTitle
      .toLowerCase()
      .includes("collection");

    return isIntro || isPairItWith || isCollection;
  });

  // Create a map of protected sections for quick lookup
  const protectedSectionMap = new Map(
    protectedSections.map((section) => [section.sectionTitle, section])
  );

  // Get the intro section
  const introSection = protectedSections.find((section) =>
    section.sectionTitle.toLowerCase().includes("intro")
  );

  // Get non-protected sections from the response
  const nonProtectedSections = response.sections.filter(
    (section: Section) => !protectedSectionMap.has(section.sectionTitle)
  );

  // Get pair it with and collection sections
  const pairItWithSection = protectedSections.find((section) =>
    section.sectionTitle.toLowerCase().includes("pair it with")
  );
  const collectionSection = protectedSections.find((section) =>
    section.sectionTitle.toLowerCase().includes("collection")
  );

  // Reconstruct sections array in the correct order
  response.sections = [
    // 1. Intro section (must be first)
    ...(introSection ? [introSection] : []),
    // 2. Non-protected sections (including optimized SHOP_NOW sections)
    ...nonProtectedSections,
    // 3. Pair it with section
    ...(pairItWithSection ? [pairItWithSection] : []),
    // 4. Collection section
    ...(collectionSection ? [collectionSection] : []),
  ];

  return response as EnhanceResponse;
}

// Helper function to create fallback response
function createFallbackResponse(
  originalSections: Section[],
  title: string
): EnhanceResponse {
  console.log(
    "🚨 Creating fallback response - returning original sections with minimal enhancements"
  );

  return {
    title,
    sections: originalSections,
  };
}

// Main API handler
export async function POST(request: NextRequest) {
  console.log(
    `\n🚀 ========== LANDING PAGE ENHANCEMENT API STARTED ==========`
  );
  console.log(`⏰ Request started at: ${new Date().toISOString()}`);

  try {
    const body: EnhanceRequest = await request.json();
    const { sections, title } = body;

    console.log(`📥 Request body:`, JSON.stringify(body, null, 2));

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: "Sections array is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Page title is required" },
        { status: 400 }
      );
    }

    console.log(`📊 Processing ${sections.length} sections for enhancement`);

    // Generate prompts
    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(
      sections,
      body.originalPrompt,
      body.adStory,
      body?.productUrl
    );

    console.log(`\n📤 SENDING ENHANCEMENT REQUEST TO GPT`);
    console.log(`📋 System prompt length: ${systemPrompt.length} characters`);
    console.log(`📋 User prompt length: ${userPrompt.length} characters`);

    // Call OpenAI with timeout
    const completion = (await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
      new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 120000) // 2 minute timeout
      ),
    ])) as any;

    const responseContent = completion.choices[0].message.content || "{}";

    console.log(`\n📥 GPT ENHANCEMENT RESPONSE RECEIVED`);
    console.log(`📊 Response length: ${responseContent.length} characters`);

    // Parse and validate response
    const parsedResponse = cleanAndParseJSON(responseContent);
    console.log(`✅ Successfully parsed JSON response`);

    const cleanedResponse = cleanExampleUrls(parsedResponse);
    console.log(`✅ Cleaned example.com URLs`);

    const validatedResponse = validateResponse(cleanedResponse, sections);
    console.log(`✅ Response validation successful`);

    // Ensure title is included in the response
    validatedResponse.title = title;

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error(`💥 ========== ENHANCEMENT API ERROR ==========`);
    console.error(`❌ Error in enhancement API:`, error);
    console.error(`⏰ Error occurred at: ${new Date().toISOString()}`);

    // Return fallback response instead of error
    try {
      const body: EnhanceRequest = await request.json();
      if (body.sections && Array.isArray(body.sections)) {
        const fallbackResponse = createFallbackResponse(
          body.sections,
          body.title
        );
        console.log(`🚨 Returning fallback response`);
        return NextResponse.json(fallbackResponse);
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed:`, fallbackError);
    }

    return NextResponse.json(
      {
        error: "Failed to enhance landing page sections",
        message:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Landing Page Enhancement API is running",
    iconLibraryCount: ICON_LIBRARY.length,
    availableIcons: ICON_LIBRARY.slice(0, 10), // Show first 10 icons as sample
  });
}
