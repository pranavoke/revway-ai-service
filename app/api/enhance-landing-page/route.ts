import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Icon library data with URLs
const ICON_LIBRARY = [
  {
    name: "Pin",
    url: "https://ik.imagekit.io/btezpgst5/icons/Pin.png?updatedAt=1745918846119",
  },
  {
    name: "Tick",
    url: "https://ik.imagekit.io/btezpgst5/icons/Tick.png?updatedAt=1745918846124",
  },
  {
    name: "Verified Reviews",
    url: "https://ik.imagekit.io/btezpgst5/icons/Verified%20Reviews.png?updatedAt=1745918846122",
  },
  {
    name: "24x7 Support",
    url: "https://ik.imagekit.io/btezpgst5/icons/24x7%20Support.png?updatedAt=1745918846117",
  },
  {
    name: "FDA Approved",
    url: "https://ik.imagekit.io/btezpgst5/icons/FDA%20Approved.png?updatedAt=1745918846172",
  },
  {
    name: "Award Winning",
    url: "https://ik.imagekit.io/btezpgst5/icons/Award%20Winning.png?updatedAt=1745918846185",
  },
  {
    name: "Made in India",
    url: "https://ik.imagekit.io/btezpgst5/icons/Made%20in%20India.png?updatedAt=1745918846182",
  },
  {
    name: "Lightning",
    url: "https://ik.imagekit.io/btezpgst5/icons/Lightining.png?updatedAt=1745918846406",
  },
  {
    name: "Warranty",
    url: "https://ik.imagekit.io/btezpgst5/icons/Warranty.png?updatedAt=1745918846402",
  },
  {
    name: "Best Seller",
    url: "https://ik.imagekit.io/btezpgst5/icons/Best%20Seller.png?updatedAt=1745918846410",
  },
  {
    name: "Dot",
    url: "https://ik.imagekit.io/btezpgst5/icons/Dot.png?updatedAt=1745918849690",
  },
  {
    name: "Trending Product",
    url: "https://ik.imagekit.io/btezpgst5/icons/Trending%20Product.png?updatedAt=1745918849662",
  },
  {
    name: "Cruelty Free",
    url: "https://ik.imagekit.io/btezpgst5/icons/Cruelty%20Free.png?updatedAt=1745918851505",
  },
  {
    name: "Clinically Proven",
    url: "https://ik.imagekit.io/btezpgst5/icons/Clinically%20Proven.png?updatedAt=1745918851553",
  },
  {
    name: "Worldwide Shipping",
    url: "https://ik.imagekit.io/btezpgst5/icons/Worldwide%20Shipping.png?updatedAt=1745918851874",
  },
  {
    name: "Sparkle",
    url: "https://ik.imagekit.io/btezpgst5/icons/Sparkle.png?updatedAt=1745918851871",
  },
  {
    name: "Tamper Proof Packaging",
    url: "https://ik.imagekit.io/btezpgst5/icons/Tamper%20Proof%20Packaging.png?updatedAt=1745918851925",
  },
  {
    name: "Eco Friendly",
    url: "https://ik.imagekit.io/btezpgst5/icons/Eco%20Friendly.png?updatedAt=1745918851988",
  },
  {
    name: "Influencer Approved",
    url: "https://ik.imagekit.io/btezpgst5/icons/Influencer%20Approved.png?updatedAt=1745918852500",
  },
  {
    name: "Ethically Sourced",
    url: "https://ik.imagekit.io/btezpgst5/icons/Ethically%20Sourced.png?updatedAt=1745918852493",
  },
  {
    name: "Authentic Product",
    url: "https://ik.imagekit.io/btezpgst5/icons/Authentic%20Product.png?updatedAt=1745918853499",
  },
  {
    name: "Sustainable Packaging",
    url: "https://ik.imagekit.io/btezpgst5/icons/Sustainable%20Packaging.png?updatedAt=1745918854004",
  },
  {
    name: "COD Available",
    url: "https://ik.imagekit.io/btezpgst5/icons/COD%20Available.png?updatedAt=1745918855776",
  },
  {
    name: "Long Lasting Results",
    url: "https://ik.imagekit.io/btezpgst5/icons/Long%20Lasting%20Results.png?updatedAt=1745918855502",
  },
  {
    name: "Vegan",
    url: "https://ik.imagekit.io/btezpgst5/icons/Vegan.png?updatedAt=1745918855475",
  },
  {
    name: "Target",
    url: "https://ik.imagekit.io/btezpgst5/icons/Target.png?updatedAt=1745918855772",
  },
  {
    name: "Rocket",
    url: "https://ik.imagekit.io/btezpgst5/icons/Rocket.png?updatedAt=1745918855499",
  },
  {
    name: "100% Money Back Guarantee",
    url: "https://ik.imagekit.io/btezpgst5/icons/100_%20Money%20Back%20Guarantee.png?updatedAt=1745918856089",
  },
  {
    name: "As Seen On",
    url: "https://ik.imagekit.io/btezpgst5/icons/As%20Seen%20On.png?updatedAt=1745918856890",
  },
  {
    name: "ISO Certified",
    url: "https://ik.imagekit.io/btezpgst5/icons/ISO%20Certified.png?updatedAt=1745918856828",
  },
  {
    name: "Packaged with Care",
    url: "https://ik.imagekit.io/btezpgst5/icons/Packaged%20with%20Care.png?updatedAt=1745918857623",
  },
  {
    name: "Backed by Experts",
    url: "https://ik.imagekit.io/btezpgst5/icons/Backed%20by%20Experts.png?updatedAt=1745918858226",
  },
  {
    name: "Diamond",
    url: "https://ik.imagekit.io/btezpgst5/icons/Diamond.png?updatedAt=1745918859525",
  },
  {
    name: "Fast Delivery",
    url: "https://ik.imagekit.io/btezpgst5/icons/Fast%20Delivery.png?updatedAt=1745918859582",
  },
  {
    name: "Free Shipping",
    url: "https://ik.imagekit.io/btezpgst5/icons/Free%20Shipping.png?updatedAt=1745918859591",
  },
  {
    name: "Over X Happy Customers",
    url: "https://ik.imagekit.io/btezpgst5/icons/Over%20X%20Happy%20Customers.png?updatedAt=1745918860076",
  },
  {
    name: "Dermatologically Tested",
    url: "https://ik.imagekit.io/btezpgst5/icons/Dermatologically%20Tested.png?updatedAt=1745918860079",
  },
  {
    name: "Community Favourite",
    url: "https://ik.imagekit.io/btezpgst5/icons/Community%20Favourite.png?updatedAt=1745918860105",
  },
  {
    name: "Magnifying Glass",
    url: "https://ik.imagekit.io/btezpgst5/icons/Magnifying%20Glass.png?updatedAt=1745918860607",
  },
  {
    name: "Easy Return",
    url: "https://ik.imagekit.io/btezpgst5/icons/Easy%20Return.png?updatedAt=1745918861405",
  },
  {
    name: "Puzzle Piece",
    url: "https://ik.imagekit.io/btezpgst5/icons/Puzzle%20Piece.png?updatedAt=1745918861801",
  },
  {
    name: "Love",
    url: "https://ik.imagekit.io/btezpgst5/icons/Love.png?updatedAt=1745918861976",
  },
  {
    name: "Secure Payment",
    url: "https://ik.imagekit.io/btezpgst5/icons/Secure%20Payment.png?updatedAt=1745918863236",
  },
  {
    name: "Loop",
    url: "https://ik.imagekit.io/btezpgst5/icons/Loop.png?updatedAt=1745918863751",
  },
  {
    name: "Recyclable Materials",
    url: "https://ik.imagekit.io/btezpgst5/icons/Recyclable%20Materials.png?updatedAt=1745918863813",
  },
  {
    name: "Lightbulb",
    url: "https://ik.imagekit.io/btezpgst5/icons/Lightbulb.png?updatedAt=1745918863990",
  },
  {
    name: "Quality Certified",
    url: "https://ik.imagekit.io/btezpgst5/icons/Quality%20Certified.png?updatedAt=1745918864234",
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
}

interface EnhanceResponse {
  title: string;
  sections: Section[];
}

// Helper function to generate system prompt
function getSystemPrompt(): string {
  return `You are an expert landing page optimizer and content strategist specializing in post-generation enhancement and filtering. Your role is to analyze existing landing page sections and optimize them for maximum conversion and user experience without adding or removing sections.
  
  Your core responsibilities:
  1. **ENHANCE EXISTING SECTIONS ONLY** - Never add new sections or remove existing ones
  2. **PRESERVE INTRO SECTION STRUCTURE** - Keep intro section exactly as is (header + paragraph format)
  3. **OPTIMIZE NON-INTRO SECTION STRUCTURE** - Improve how content is organized within all other sections
  4. **CONVERT TO BETTER FORMATS** - Transform content into more effective module types when appropriate (except intro)
  5. **MAINTAIN SECTION COUNT** - Keep the total number of sections between 6-8 (if more than 8, consolidate; if less than 6, enhance existing ones)
  6. **IMPROVE CONTENT QUALITY** - Enhance text, structure, and presentation without changing the core message
  7. **ADD VISUAL ELEMENTS** - Incorporate relevant icons and images to enhance user engagement
  
  Enhanced Bullet Point Types Available:
  - BULLET_POINTS: Simple bullet points
  - BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with explanatory text
  - BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES: Bullet points with text and relevant images
  - BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS: Bullet points with text and relevant icons
  - BULLET_POINTS_WITH_ICONS: Icon-only bullet points for key features
  - BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2: Timeline/process format with icons
  
  Icon Library Available:
  ${ICON_LIBRARY.join(", ")}
  
  Key Enhancement Rules:
  - HEADER MODULE IS COMPULSORY FOR EVERY SECTION 
  - **INTRO SECTION**: Leave completely unchanged - maintain original header + paragraph structure
  - **MODULE VARIETY MANDATORY**: Each section must use different module types/subtypes
  - **MEDIA MODULES REQUIRED**: Minimum 50% of sections must include IMAGE or IMAGE_CAROUSEL modules
  - FAQ sections with generic or low-value questions should be restructured as informational content or tables
  - Repetitive content should be consolidated
  - Paragraph-heavy sections (except intro) should be broken into digestible formats (bullet points, tables, etc.)
  - **ELIMINATE ALL SIMPLE Paragraph modules ** (except intro) and convert to enhanced formats
  
  - Tables should be used when data can be presented more clearly in tabular format
  - Add relevant icons from the provided library when enhancing bullet points
  - Add image placeholders (example.com) for visual context where beneficial using the 'icon' field
  - **AVOID OVERUSING** BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS (max 2 sections)
  - Maintain the original section intent while improving presentation
  - Preserve all product information and key messaging
  - Focus on conversion optimization and user experience
  
  CRITICAL: Use only the 'icon' field for both icons (from library) and images (example.com URLs) in bullet points.`;
}

// Helper function to generate user prompt
function getUserPrompt(sections: Section[]): string {
  const currentSectionCount = sections.length;
  const iconList = ICON_LIBRARY.map((icon) => `${icon.name}: ${icon.url}`).join(
    "\n"
  );

  return `LANDING PAGE SECTIONS TO ENHANCE:
  ${JSON.stringify(sections, null, 2)}
  
  
  ICON LIBRARY AVAILABLE (use FULL URLs):
  ${iconList}
  
  ENHANCEMENT OBJECTIVES:
  1. **Section Count Optimization**: Current sections: ${currentSectionCount}
     - Target: 6-8 sections total
     - If >8: Consolidate similar/redundant sections
     - If <6: Enhance existing sections with richer content structure or Create more if required .
  
  2. **Content Structure Enhancement**:
     - **PRESERVE INTRO SECTION**: Do not modify the intro section structure, content, or format
     - Convert FAQ sections with generic questions into structured informational content
     - Transform data-heavy text into tables bullets where appropriate
     - IF you want to discard a section and completely create a new section you're open for it 
     - Ensure each section has a clear, conversion-focused purpose
     - Want to minimise the usage of SUBTYPE : PARAGRAPH module 
     - DO NOT CHANGE or even TOUCH INTRO SECTION , PAIR_IT_WITH , AND GRID COLLECTION 
  
  3. **Enhanced Module Type Optimization - ENFORCE VARIETY**:
     - **MANDATORY**: Each section must use DIFFERENT module combinations
     - **MANDATORY**: At least 50% of sections must include MEDIA modules (IMAGE_CAROUSEL)
     - **MANDATORY**: Alternate between different LIST subtypes across sections
     - **MANDATORY**: Keep HEADER Module in every section . 
     - Use enhanced LIST modules strategically:
       * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS for trust/benefits 
       * BULLET_POINTS_WITH_ICONS for quick key points
       * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES for processes/how-to
       * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2 for timelines/steps
       * BULLET_POINTS_WITH_SUPPORTING_TEXT for detailed explanations
     - Use TABLE modules for comparisons, specifications, ingredient details
      row limit: 10 , col limit:  2<=col<=3 
   

     - Use TESTIMONIAL modules for social proof
    
     - **MANDATORY**: Add MEDIA modules in at least 3-4 sections:
       * Product demonstration images
       * Before/after comparison images
       * Ingredient/process illustrations
       * Usage scenario images
  
  4. **Icon Selection Guidelines (use FULL URLs)**:

  5. **Image Placeholder Guidelines - MANDATORY USAGE**:
     - **MINIMUM 3-4 sections MUST include MEDIA modules**
     - Use example.com URLs for image placeholders in the 'icon' field for image-based bullet points
     - Use FULL icon URLs from library for icon-based bullet points in the 'icon' field
     - **MANDATORY MEDIA modules for**:
       * Product demonstration sections (IMAGE_CAROUSEL)
       * How-to or usage sections (add step-by-step images)
       * Before/after sections (add comparison images)
       * Ingredient sections (add ingredient visuals)
       * Feature explanation sections (add feature illustrations)
       *    {
                   "type": "MEDIA",
                   "subtype": "IMAGE_CAROUSEL" | "VIDEO", only these two subtypes inside media . 
                   "content": "example.com/sustainable-practices.jpg"
               }

  
  6. **CRITICAL BULLET POINT STRUCTURE - ALWAYS USE**:
     Every bullet point MUST have exactly these fields:
     {
       "point": "Main text content (always required)",
       "supportingText": "Additional explanation text or null if not needed",
       "icon": "Full icon URL from library or example.com image URL or null if not needed"
     }
  
  7. **Quality Filters to Apply**:
     - Remove or restructure FAQ items that are:
       * Generic or commonly known information
       * Already covered in other sections  
       * Vague or non-specific questions
       * Questions that don't add purchasing confidence
       * Overly promotional questions and answers
     - Keep only 5-8 high-value, unique FAQs that provide genuine purchasing confidence
     - Consolidate sections that cover similar topics
     - Enhance weak sections with stronger, more specific content using icons and images
     Always make it bullet point main type only . 
  
  RESPONSE FORMAT:
  Return the enhanced sections in the exact same structure as input, but with improved content organization, enhanced module types, and visual elements.
  
  {
    "sections": [enhanced_sections_array],
  
  }

  Final Module Schema
1. TEXT Modules
json
{
  "type": "TEXT",
  "subtype": "HEADER" | "SUB_HEADER" | "PARAGRAPH" | "PAIR_IT_WITH" | "GRID",
  "content": "string content here" // null for PAIR_IT_WITH and GRID subtypes
}
When subtype is PAIR_IT_WITH or GRID, add:
json
{
  "type": "TEXT",
  "subtype": "PAIR_IT_WITH",
  "content": null,
  "products": [{ single product object multiple product in grid }]
}
2. LIST Modules
json
{
  "type": "LIST",
  "subtype": "BULLET_POINTS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT | BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS   | BULLET_POINTS_WITH_ICONS       * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES  |     * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2 
",
  "bulletPoints": [
    {
      "point": "Main text",
      "supportingText": "" 
	 “Icon”: “”// Empty string for simple bullets
    }
  ]
}
3. TESTIMONIAL Modules
json
{
  "type": "TESTIMONIAL",
  "subtype": "TESTIMONIAL_1",
  "testimonials": [
   {"subject": "Great product!", "body": "I loved using this product, it really helped me a lot.", "reviewerName": "INDIAN NAMES", "rating": 5}

  ]
}
4. MEDIA Modules
json
{
  "type": "MEDIA",
  "subtype": "IMAGE_CAROUSEL" | "VIDEO",
  "mediaList": [
    {
      "link": "media URL",
      "extension": "jpg",
      "type": "image"
    }
  ]
}
5. TABLE Modules
json
{
  "type": "TABLE",
  "subtype": "TABLE_1" | "TABLE_2",
  "table": {
    "headers": ["Column 1", "Column 2"],
    "rows": [["Row 1 Col 1", "Row 1 Col 2"]]
  }
}

  
  CRITICAL REQUIREMENTS:
  1. Do NOT modify the intro section in any way
  2. Convert ALL simple header+text combinations (except intro) to enhanced formats
  3. **ENFORCE MODULE VARIETY**: Each section must use different module combinations
  4. **MANDATORY**: Include MEDIA modules in at least 50% of sections (3-4 sections minimum)
  5. **AVOID REPETITION**: Don't use the same LIST subtype in consecutive sections
  6. **USE FULL ICON URLs** from the provided library OR example.com image URLs in the 'icon' field for bullet points
  7. **MAINTAIN BULLET STRUCTURE**: Always use point, supportingText, icon fields (set to null if not needed)
  8. Maintain section count between 6-8
  9. Preserve all original product information and key messaging
  10. Focus on conversion optimization and visual engagement
  11. Always return valid JSON without markdown formatting
  
  **MODULE VARIETY REQUIREMENTS**:
  - Alternate between different formats across sections it should be like bullet points only or mostly text or every section is a table there should be uniformity `;
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

// Helper function to validate response structure
function validateResponse(
  response: any,
  originalSections: Section[]
): EnhanceResponse {
  if (!response.sections || !Array.isArray(response.sections)) {
    throw new Error("Invalid response: sections array missing");
  }

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
    const userPrompt = getUserPrompt(sections);

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

    const validatedResponse = validateResponse(parsedResponse, sections);
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
