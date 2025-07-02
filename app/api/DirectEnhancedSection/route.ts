import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { adStory, productUrl, content, prompt } = body;
    console.log("content", JSON.stringify(content));

    // Validate required inputs
    if (!adStory || !productUrl || !content) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: ad, productUrl, and content are required",
        },
        { status: 400 }
      );
    }

    // Construct your prompt using the inputs
    const DESprompt = `

You are an expert landing page content creator specializing in conversion-optimized, visually engaging sections. Your task is to generate exactly content for 3 unique, high-converting  sections based on the provided product information. For each section the content generated must be directly relevant to the ad story, clearly reflecting its key message and supporting the overall theme.
Your task is to first generate the Content with reference to the Ad and Section themes provided below and then create a JSON schema by seggregating the content into different modules.

DO NOT ASSUME FACTS , DO NOT MAKE UP ANYTHING , ONLY USE THE PROVIDED INFORMATION .
ALSO DO NOT DUPLICATE THE CONTENT OF THE EXISTING SECTIONS .

## SECTION REQUIREMENTS AND THEMES:
${JSON.stringify(content)}

Contain Header in every section Compulsory.
## INPUT PARAMETERS:
- **Product URL**: ${JSON.stringify(productUrl)}
- **Additional Client Information**: ${JSON.stringify(prompt)}
- **Ad Story**: ${JSON.stringify(adStory)}
- **Available Icons** ICON_LIBRARY: ${JSON.stringify(ICON_LIBRARY)}

First, create a compelling SEO-friendly title (10-12 words) that : 
It must be directly connected to the ad story .
It must be Attention grabbing and very impactful .
It must be specific if possible and not generic .

## EXISTING LANDING PAGE STRUCTURE:
The landing page already includes these sections (DO NOT recreate these):
1. **Intro** - Introduction content
2. **Why Customers Love Us** - 10 testimonials
3. **Shop Now** - a product highlight 
4. **Pair It With** - Complementary product recommendations
5. **Collections** - 4 related products showcase



## COMPLETE MODULE SPECIFICATIONS:

### 1. TEXT MODULES:


{
  "type": "TEXT",
  "subtype": "HEADER"  | "PARAGRAPH" | "PAIR_IT_WITH" | "GRID" | "SHOP_NOW" | "BANNER_TEXT" | "CTA",
  "content": "string content" // null for PAIR_IT_WITH, GRID, and SHOP_NOW
}


**Special Subtypes:**
- **PAIR_IT_WITH & GRID**: "content": null, "products": [product_objects]
- **SHOP_NOW**: "content": null, "products": [original_product_object]
- **BANNER_TEXT**: Short 4-5 word attention-grabbing headline that appears at the very top of the page.
- **CTA**: A call-to-action content in 2-4 words . 

PARAGRAPH MODULE : Should be crisp and punchy , should be 10-15 words.
HEADER MODULE : Should be Crisp and very Impactful 3-6 words .

### 2. LIST MODULES (6 Variations):

{
  "type": "LIST",
  "subtype": "BULLET_POINTS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT" | "BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS" | "BULLET_POINTS_WITH_ICONS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES" | "BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2",
  "bulletPoints": [
    {
      "point": "Main bullet text (always required)",
      "supportingText": "Additional explanation or null",
      "icon": "ONLY use full URLs from provided icon library OR https://example.com/image.jpg URLs OR null"
    }
  ]
}



**LIST Subtype Selection Guide:**
- **BULLET_POINTS**: Simple feature lists , only point field is required others are null , word limit of each is 6-10 words .
- **BULLET_POINTS_WITH_SUPPORTING_TEXT**: Detailed benefits with explanations . here point and supporting text both are required .where point is 3-4 words and supporting text is 6-10 words .
- **BULLET_POINTS_WITH_ICONS**: This is an ICON group , here point and icon both are required . Bullet point should be 2-4 words and icon should be from the ICON_LIBRARY .
- **BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS**: Comprehensive benefit explanations with visual elements. here point and supporting text both are required .where point is 3-4 words , supporting text is 6-8 words and icon is from the ICON_LIBRARY .
- **BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES**: How-to guides with visual examples. here point and supporting text both are required .where point is 3-4 words , supporting text is 6-8 words and icon is   null .
- **BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2**:This is timeline /Step by step module . here point  supporting text and icon all are required .where point is 2-3 words , supporting text is 4-6 words and icon is from the ICON_LIBRARY .

For ICONS YOU SHOULD MUST ADD THE ICONS FROM THE ICON_LIBRARY . 

### 3. MEDIA MODULES:

{
  "type": "MEDIA",
  "subtype": "IMAGE_CAROUSEL" | "VIDEO",
  "mediaList": [
    {
      "link": "https://example.com/descriptive-name.jpg",
      "extension": "jpg",
      "type": "image"
    }
  ]
}


### 4. TABLE MODULES:

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

**Limits**: Maximum 10 rows, 2-3 columns (TABLE_1 = 3 columns, TABLE_2 = 2 columns)
Every column entry should for 2-3 words . 
Use a 2-column table when the content presents a clear comparison between two ideas — like "Before vs After", "Problem vs Solution", or "Without vs With". Each column should have a heading, with 3–6 aligned points for fast scanning. Ideal for handling objections, showcasing transformation, or comparing brand vs generic.comparision type of sections 

Use a 3-column table when content includes three related columns that help users compare, choose, or understand structured information. This can be:
Comparing three options, plans, or bundles side-by-side (e.g. Basic / Standard / Premium)
Comparing two items against shared features, with the first column listing the features
Showing different user segments, scenarios, or categories side-by-side
Presenting a stepwise process or sequence across three stages
Illustrating a time-based progression or phased experience

Use this module when the content has 3–7 aligned rows that enable clear, quick evaluation across all three columns.

### 5. TESTIMONIAL MODULES:

{
  "type": "TESTIMONIAL",
  "subtype": "TESTIMONIAL_2",
  "testimonials": [
    {
      "subject": "Compelling headline",
      "body": "Detailed review explaining specific benefits and results",
      "reviewerName": "Indian name (realistic)",
      "rating": 5
    }
  ]
}

## CRITICAL RESTRICTIONS:

### Icon Usage:
- **MANDATORY**: Use ONLY icons from the provided in ICON_LIBRARY
- **NO EXTERNAL ICONS**: Do not use any icon sources outside the provided list
- **FORMAT**: Always use the complete URL exactly as provided
- **PLACEMENT**: Icons go in LIST module 'icon' fields only


### Image Usage:
- **PLACEHOLDER FORMAT**: Use https://example.com/descriptive-name.jpg for all image placeholders
- **DESCRIPTIVE NAMING**: Use meaningful, product-relevant filenames
- **PLACEMENT**: Images go in MEDIA modules or LIST module 'icon' fields


Return data strictly in the following JSON structure **without any extra properties or loose modules**:
{
  "title": "Your SEO-friendly title here",
  "banner": {
    "type": "TEXT",
    "subtype": "BANNER_TEXT",
    "content": "string content"
  },
  "sections": [
    {
      "sectionTitle": "string title",
      "totalModules": number, // auto-calculated
      "moduleCounts": { "TEXT": number, "LIST": number, ... },
      "modules": [Module objects defined above]
    }
  ]
}

Do NOT include any module objects outside the sections array.

Generate a captivating page-top banner first, followed by exactly **3 sections** inserted after the intro on the landing page.

CRITICAL(VERY IMPORTANT): Ensure the total number of sections returned in the sections array is exactly 3. Ensure the banner content fits within 4-5 words. Enusre to add media modules in atmost 2 sections and a CTA module in any section where you think it is required but atleast 1 section should have a CTA module .These modules are addtional modules do not combine and shorten the original sections . 
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-3.5-turbo" for faster/cheaper responses
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.", // Customize this system message
        },
        {
          role: "user",
          content: DESprompt,
        },
      ],

      temperature: 0.7, // Adjust for creativity vs consistency
    });

    // Extract the response
    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Return the response
    return NextResponse.json({
      success: true,
      response: aiResponse,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("DirectEnhancedSections API Error:", error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "OpenAI API rate limit exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    message: "DirectEnhancedSections API endpoint is running",
    timestamp: new Date().toISOString(),
  });
}
