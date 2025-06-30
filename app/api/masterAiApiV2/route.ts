// app/api/masterAiApiV2/route.ts - SEPARATE PAIR FLOW MASTER API
import { NextRequest, NextResponse } from "next/server";

// IMPROVED SCHEMAS WITH COMPLETE PRODUCT DATA
interface GenerateProductSectionsResponse {
  success: boolean;
  mainProduct: {
    id: number;
    title: string;
    description: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
    totalRating: number;
    sku: string; // Complete product data
  };
  sections: {
    intro: {
      header: string;
      paragraph: string;
      ctaText: string;
    };
    collection: {
      header: string;
      products: Array<{
        id: number;
        title: string;
        description: string;
        productUrl: string;
        imageUrl: string;
        finalPrice: number;
        totalRating: number;
        sku: string; // Complete product data
      }>;
    };
    pair_it_with?: {
      header: string;
      text: string;
      product: {
        id: number;
        title: string;
        description: string;
        productUrl: string;
        imageUrl: string;
        finalPrice: number;
        totalRating: number;
        sku: string; // Complete product data
      };
    };
    customer_love: {
      header: string;
      testimonials: Array<{
        subject: string;
        body: string;
        reviewerName: string;
        rating: number;
      }>;
    };
  };
}

interface MasterApiRequest {
  productUrl: string;
  prompt?: string;
  adStory?: string;
}

interface MasterApiResponse {
  title: string;
  sections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>;
}

// --- New helper types for downstream API calls ---
interface EnhancedSectionIdeasResponse {
  new_sections: Array<{
    section_title: string;
    purpose: string;
    content_focus: string;
    theme: string;
  }>;
}

interface DirectEnhancedSectionApiResponse {
  title: string;
  banner?: {
    type: string;
    subtype: "BANNER_TEXT";
    content: string;
  };
  sections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>;
}

// Helper: Parse JSON that might be wrapped in markdown fences
function cleanAndParseJSON(content: string): any {
  try {
    let cleaned = content.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error parsing JSON:", error, "\nRaw Content:\n", content);
    throw error;
  }
}

// Helper: recursively set any string containing `example.com` to null
function cleanExampleUrls(data: any): any {
  if (data === null || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => cleanExampleUrls(item));
  }

  const cleaned: any = { ...data };
  for (const key in cleaned) {
    if (typeof cleaned[key] === "string") {
      if (cleaned[key].includes("example.com")) {
        cleaned[key] = null;
      }
    } else if (typeof cleaned[key] === "object" && cleaned[key] !== null) {
      cleaned[key] = cleanExampleUrls(cleaned[key]);
    }
  }
  return cleaned;
}

/**
 * Call the ProductMappingSectionsV2 API (separate pair flow)
 */
async function callGenerateProductSections(
  productUrl: string,
  prompt?: string
): Promise<GenerateProductSectionsResponse | null> {
  try {
    console.log(`🔄 Calling ProductMappingSectionsV2 API for: ${productUrl}`);
    console.log(`📝 Additional prompt: ${prompt || "None"}`);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/ProductMappingSectionsV2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productUrl,
          additionalPrompt: prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `ProductMappingSectionsV2 API returned ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`✅ ProductMappingSectionsV2 API response received`);
    console.log(`📊 Sections generated: ${Object.keys(data.sections).length}`);
    console.log(
      `🎯 Pair it with section: ${data.sections.pair_it_with ? "YES" : "NO"}`
    );

    return data;
  } catch (error) {
    console.error(`❌ Error calling ProductMappingSectionsV2 API:`, error);
    return null;
  }
}

/**
 * Convert product sections to module format with complete data
 * IMPROVED: Better handling of pair it with section with complete product data
 */
function convertProductSectionsToModules(
  productSections: GenerateProductSectionsResponse
): Array<{
  sectionTitle: string;
  totalModules: number;
  moduleCounts: Record<string, number>;
  modules: any[];
}> {
  const modulesBySection: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }> = [];

  // 1. Convert Intro Section
  const introModules = [
    // Banner is already being injected by directEnhancedResponse.banner
    {
      type: "TEXT",
      subtype: "HEADER",
      content: productSections.sections.intro.header,
    },

    {
      type: "MEDIA",
      subtype: "IMAGE_CAROUSEL",
      content: {
        mediaList: [
          {
            link: productSections.mainProduct.imageUrl,
            extension: "jpg",
            type: "image",
          },
          {
            link: null,
            extension: null,
            type: null,
          },
          {
            link: null,
            extension: null,
            type: null,
          },
        ],
      },
    },
    {
      type: "TEXT",
      subtype: "PARAGRAPH",
      content: `${productSections.mainProduct.title}\n🔥20K happy customers\n✅${productSections.sections.intro.paragraph}`,
    },
    {
      type: "TEXT",
      subtype: "CTA",
      content: productSections.sections.intro.ctaText || "Shop Now",
      products: [
        {
          id: productSections.mainProduct.id,
          title: productSections.mainProduct.title,
          description: productSections.mainProduct.description,
          productUrl: productSections.mainProduct.productUrl,
          imageUrl: productSections.mainProduct.imageUrl,
          finalPrice: productSections.mainProduct.finalPrice,
          totalRating: productSections.mainProduct.totalRating,
          sku: productSections.mainProduct.sku,
        },
      ],
    },
  ];

  modulesBySection.push({
    sectionTitle: "Intro Section",
    totalModules: introModules.length,
    moduleCounts: { TEXT: 3, MEDIA: 1 },
    modules: introModules,
  });

  // Add Customer Love Section
  if (productSections.sections.customer_love) {
    const customerLoveModules = [
      {
        type: "TEXT",
        subtype: "HEADER",
        content: productSections.sections.customer_love.header,
      },
      {
        type: "TESTIMONIAL",
        subtype: "TESTIMONIAL_1",
        testimonials: productSections.sections.customer_love.testimonials,
      },
    ];

    modulesBySection.push({
      sectionTitle: "Why Customers Love Us",
      totalModules: customerLoveModules.length,
      moduleCounts: {
        TEXT: 1,
        TESTIMONIAL: 1,
      },
      modules: customerLoveModules,
    });
  }

  // 2. Add Shop Now Section with main product (complete data)
  const shopNowModules = [
    {
      type: "TEXT",
      subtype: "HEADER",
      content: "Shop Now",
    },
    {
      type: "TEXT",
      subtype: "SHOP_NOW",
      content: null,
      products: [
        {
          id: productSections.mainProduct.id,
          title: productSections.mainProduct.title,
          description: productSections.mainProduct.description,
          productUrl: productSections.mainProduct.productUrl,
          imageUrl: productSections.mainProduct.imageUrl,
          finalPrice: productSections.mainProduct.finalPrice,
          totalRating: productSections.mainProduct.totalRating,
          sku: productSections.mainProduct.sku, // Complete product data
        },
      ],
    },
  ];

  modulesBySection.push({
    sectionTitle: "Shop Now",
    totalModules: shopNowModules.length,
    moduleCounts: { TEXT: 2 },
    modules: shopNowModules,
  });

  // 3. IMPROVED: Convert Pair It With Section (if exists) with complete data
  if (productSections.sections.pair_it_with) {
    console.log(
      `🔄 Converting Pair It With section for: ${productSections.sections.pair_it_with.product.title}`
    );

    const pairModules = [
      {
        type: "TEXT",
        subtype: "HEADER",
        content: "Pair It With",
      },
      {
        type: "TEXT",
        subtype: "PAIR_IT_WITH",
        content: null,
        products: [
          {
            id: productSections.sections.pair_it_with.product.id,
            title: productSections.sections.pair_it_with.product.title,
            description:
              productSections.sections.pair_it_with.product.description,
            productUrl:
              productSections.sections.pair_it_with.product.productUrl,
            imageUrl: productSections.sections.pair_it_with.product.imageUrl,
            finalPrice:
              productSections.sections.pair_it_with.product.finalPrice,
            totalRating:
              productSections.sections.pair_it_with.product.totalRating,
            sku: productSections.sections.pair_it_with.product.sku,
          },
        ],
      },
      {
        type: "TEXT",
        subtype: "HEADER",
        content: productSections.sections.pair_it_with.header,
      },
      {
        type: "TEXT",
        subtype: "PARAGRAPH",
        content: productSections.sections.pair_it_with.text,
      },
    ];

    modulesBySection.push({
      sectionTitle: "Pair It With",
      totalModules: pairModules.length,
      moduleCounts: { TEXT: pairModules.length },
      modules: pairModules,
    });

    console.log(`✅ Pair It With section converted successfully`);
  } else {
    console.log(`ℹ️ No Pair It With section to convert`);
  }

  // 4. Convert Collection Section with complete data
  const collectionModules = [
    {
      type: "TEXT",
      subtype: "HEADER",
      content: productSections.sections.collection.header,
    },
    {
      type: "TEXT",
      subtype: "GRID",
      content: null,
      products: productSections.sections.collection.products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        productUrl: product.productUrl,
        imageUrl: product.imageUrl,
        finalPrice: product.finalPrice,
        totalRating: product.totalRating,
        sku: product.sku, // Complete product data
      })),
    },
  ];

  modulesBySection.push({
    sectionTitle: "Product Collection",
    totalModules: collectionModules.length,
    moduleCounts: { TEXT: collectionModules.length },
    modules: collectionModules,
  });

  return modulesBySection;
}

// --- New API call helpers ---

async function callEnhancedSectionIdeas(
  productUrl: string,
  prompt?: string,
  adStory?: string
): Promise<EnhancedSectionIdeasResponse | null> {
  try {
    console.log(`🔄 Calling EnhancedSectionIdeas API for: ${productUrl}`);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/EnhancedSectionIdeas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productUrl, prompt, adStory }),
      }
    );

    if (!response.ok) {
      throw new Error(`EnhancedSectionIdeas API returned ${response.status}`);
    }

    const data = (await response.json()) as EnhancedSectionIdeasResponse;
    console.log("✅ EnhancedSectionIdeas response received");
    return data;
  } catch (error) {
    console.error("❌ Error calling EnhancedSectionIdeas API:", error);
    return null;
  }
}

async function callDirectEnhancedSection(
  productUrl: string,
  adStory: string | undefined,
  prompt: string | undefined,
  content: any
): Promise<DirectEnhancedSectionApiResponse | null> {
  try {
    console.log("🔄 Calling DirectEnhancedSection API");

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/DirectEnhancedSection`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productUrl,
          adStory: adStory && adStory.trim() !== "" ? adStory : "N/A",
          prompt,
          content,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DirectEnhancedSection API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.response) {
      throw new Error("DirectEnhancedSection API missing response field");
    }

    const parsed = cleanAndParseJSON(data.response);

    if (!parsed.sections) {
      throw new Error("Parsed DirectEnhancedSection response missing sections");
    }

    console.log(
      `✅ DirectEnhancedSection generated ${parsed.sections.length} sections`
    );
    return parsed as DirectEnhancedSectionApiResponse;
  } catch (error) {
    console.error("❌ Error calling DirectEnhancedSection API:", error);
    return null;
  }
}

// Helper: Convert stray module objects into proper sections
function normalizeEnhancedSections(rawArray: any[]): Array<{
  sectionTitle: string;
  totalModules: number;
  moduleCounts: Record<string, number>;
  modules: any[];
}> {
  if (!Array.isArray(rawArray)) return [];

  const finalSections: any[] = [];

  let currentSection: any | null = null;

  const pushCurrent = () => {
    if (currentSection) {
      currentSection.totalModules = currentSection.modules.length;
      // compute counts
      const counts: Record<string, number> = {};
      for (const m of currentSection.modules) {
        counts[m.type] = (counts[m.type] || 0) + 1;
      }
      currentSection.moduleCounts = counts;
      finalSections.push(currentSection);
    }
  };

  for (const item of rawArray) {
    if (item && typeof item === "object" && "sectionTitle" in item) {
      // push previous
      pushCurrent();
      currentSection = { ...item };
    } else if (item && typeof item === "object" && "type" in item) {
      // it's a module
      if (
        item.type === "TEXT" &&
        item.subtype === "HEADER" &&
        (!currentSection || currentSection.modules.length > 0)
      ) {
        // Start new section using header content as title if no explicit title
        pushCurrent();
        currentSection = {
          sectionTitle: item.content || "Enhanced Section",
          modules: [item],
          totalModules: 0,
          moduleCounts: {},
        };
      } else {
        // Add to current section; if none create default
        if (!currentSection) {
          currentSection = {
            sectionTitle: "Enhanced Section",
            modules: [],
            totalModules: 0,
            moduleCounts: {},
          };
        }
        currentSection.modules.push(item);
      }
    }
  }
  pushCurrent();
  return finalSections;
}

/**
 * Main API handler with separate pair flow
 */
export async function POST(request: NextRequest) {
  try {
    const { productUrl, prompt, adStory }: MasterApiRequest =
      await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log(
      `\n🔄 ========== STARTING MASTER API V2 (SEPARATE PAIR FLOW) ==========`
    );
    console.log(`📦 Processing product URL: ${productUrl}`);
    console.log(`📝 Additional prompt: ${prompt || "None"}`);
    console.log(`📖 Ad story: ${adStory || "None"}`);

    // Call product sections API V2 (separate pair flow)
    console.log(
      `\n🔄 ========== GENERATING PRODUCT SECTIONS (SEPARATE PAIR FLOW) ==========`
    );
    const productSectionsResponse = await callGenerateProductSections(
      productUrl,
      prompt
    );

    if (!productSectionsResponse || !productSectionsResponse.success) {
      return NextResponse.json(
        { error: "Failed to generate product sections" },
        { status: 500 }
      );
    }

    console.log(`✅ Product sections generated successfully`);
    console.log(
      `📊 Total sections: ${
        Object.keys(productSectionsResponse.sections).length
      }`
    );

    // Log section details
    console.log(`📋 Section breakdown:`);
    console.log(`   - Intro: ✅`);
    console.log(
      `   - Collection: ✅ (${productSectionsResponse.sections.collection.products.length} products)`
    );
    console.log(
      `   - Pair It With: ${
        productSectionsResponse.sections.pair_it_with ? "✅" : "❌"
      }`
    );

    // Convert product sections to module format
    console.log(
      `\n🔄 ========== CONVERTING PRODUCT SECTIONS TO MODULES ==========`
    );
    const productSectionModules = convertProductSectionsToModules(
      productSectionsResponse
    );

    console.log(
      `✅ Converted ${productSectionModules.length} product sections to module format`
    );

    // Log module breakdown
    productSectionModules.forEach((section, index) => {
      console.log(
        `   ${index + 1}. ${section.sectionTitle}: ${
          section.totalModules
        } modules`
      );
    });

    // ==========================================
    // STEP 5: Get Enhanced Section Ideas (3 ideas)
    // ==========================================
    console.log(`\n🔄 ========== FETCHING ENHANCED SECTION IDEAS ==========`);
    const enhancedIdeasResponse = await callEnhancedSectionIdeas(
      productUrl,
      prompt,
      adStory
    );

    if (enhancedIdeasResponse) {
      console.log(
        `✅ Received ${enhancedIdeasResponse.new_sections.length} section ideas`
      );
    } else {
      console.log(`⚠️ Failed to fetch enhanced section ideas – continuing`);
    }

    // ==========================================
    // STEP 6: Generate 3 Direct Enhanced Sections using all context
    // ==========================================
    console.log(
      `\n🔄 ========== GENERATING DIRECT ENHANCED SECTIONS ==========`
    );
    const contentForDirect = {
      productSections: productSectionModules,
      sectionIdeas: enhancedIdeasResponse?.new_sections || [],
    };

    const directEnhancedResponse = await callDirectEnhancedSection(
      productUrl,
      adStory,
      prompt,
      contentForDirect
    );

    let bannerModule: {
      type: string;
      subtype: "BANNER_TEXT";
      content: string;
    } | null = null;

    let combinedSections: Array<{
      sectionTitle: string;
      totalModules: number;
      moduleCounts: Record<string, number>;
      modules: any[];
    }> = [];

    let directEnhancedSections: Array<{
      sectionTitle: string;
      totalModules: number;
      moduleCounts: Record<string, number>;
      modules: any[];
    }> = [];

    if (directEnhancedResponse) {
      directEnhancedSections = normalizeEnhancedSections(
        directEnhancedResponse.sections as any
      );

      if (directEnhancedResponse.banner) {
        bannerModule = directEnhancedResponse.banner;

        // inject banner into intro section modules at top
        const introIndex = productSectionModules.findIndex((sec) =>
          sec.sectionTitle.toLowerCase().includes("intro")
        );
        if (introIndex !== -1) {
          const introSec = productSectionModules[introIndex];
          introSec.modules.unshift(bannerModule);
          introSec.totalModules += 1;
          introSec.moduleCounts["TEXT"] =
            (introSec.moduleCounts["TEXT"] || 0) + 1;
        }
      }

      // Limit to first 3 enhanced sections
      const firstThreeEnhanced = directEnhancedSections.slice(0, 3);

      // Insert the 3 sections right after Intro section
      const introIdx = productSectionModules.findIndex((sec) =>
        sec.sectionTitle.toLowerCase().includes("intro")
      );

      combinedSections = [
        ...productSectionModules.slice(0, introIdx + 1),
        ...firstThreeEnhanced,
        ...productSectionModules.slice(introIdx + 1),
      ];

      console.log(
        `✅ Direct Enhanced Sections count: ${directEnhancedSections.length}`
      );
    } else {
      console.log(`⚠️ Direct Enhanced Section generation failed – continuing`);
    }

    // ==========================================
    // STEP 7: Combine all sections & clean example URLs
    // ==========================================
    if (combinedSections.length === 0) {
      combinedSections = [...productSectionModules];
    }

    const cleanedSections = cleanExampleUrls(combinedSections);

    // ==========================================
    // STEP 8: Build final response
    // ==========================================
    let title = `${productSectionsResponse.mainProduct.title} - Product Landing Page`;

    if (directEnhancedResponse?.title) {
      // Use the AI generated title that incorporates the ad theme
      title = directEnhancedResponse.title;
    } else if (directEnhancedResponse?.banner?.content) {
      // Fallback to banner content if no title
      title = `${directEnhancedResponse.banner.content} - ${productSectionsResponse.mainProduct.title}`;
    }

    // Find the intro section and replace its header with page title
    if (directEnhancedResponse?.title) {
      const introSection = cleanedSections.find(
        (section: {
          sectionTitle: string;
          modules: Array<{
            type: string;
            subtype: string;
            content: string;
          }>;
        }) => section.sectionTitle.toLowerCase().includes("intro")
      );

      if (introSection) {
        const headerModule = introSection.modules.find(
          (module: { type: string; subtype: string; content: string }) =>
            module.type === "TEXT" && module.subtype === "HEADER"
        );

        if (headerModule) {
          headerModule.content = directEnhancedResponse.title;
        }
      }
    }

    const response: MasterApiResponse = {
      title,
      sections: cleanedSections,
    };

    console.log(
      `\n🎉 ========== MASTER API V2 COMPLETED SUCCESSFULLY ==========`
    );
    console.log(`📋 Final title: ${title}`);
    console.log(`📊 Final sections count: ${cleanedSections.length}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 MASTER API V2 FAILED:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message:
      "Master Product Landing Page API V2 is running - Separate Pair Flow",
    features: [
      "Separate AI flow for pair product selection",
      "Separate AI flow for collection products (excluding pair)",
      "Complete product data schemas with SKU",
      "Improved error handling and logging",
      "Better module conversion with complete data",
    ],
    endpoints: {
      productSections: "/api/ProductMappingSectionsV2",
      master: "/api/masterAiApiV2",
    },
    flow: [
      "STEP 1: Fetch ALL products (mandatory)",
      "STEP 2: Find main product from complete dataset",
      "STEP 3A: SEPARATE AI flow - Get best pair product",
      "STEP 3B: SEPARATE AI flow - Get collection products (excluding pair)",
      "STEP 4: Generate content for all sections with complete data",
    ],
  });
}
