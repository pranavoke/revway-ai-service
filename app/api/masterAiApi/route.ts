// app/api/masterAiApi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMasterLandingPagePrompt } from "@/lib/prompts/index";

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
  };
  sections: {
    intro: {
      header: string;
      paragraph: string;
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
      }>;
    };
    pair_it_with?: {
      header: string;
      text: string;
      product: {
        id: number;
        title: string;
        productUrl: string;
        imageUrl: string;
        finalPrice: number;
      };
    };
    shop_now?: {
      product: {
        id: number;
        title: string;
        description: string;
        productUrl: string;
        imageUrl: string;
        finalPrice: number;
        totalRating: number;
      };
    };
  };
}

interface CreateLandingPageResponse {
  title: string;
  modulesBySection: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>;
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

/**
 * Convert product sections to landing page prompt format using prompt functions
 * EXACT IMPLEMENTATION from original code - no modifications
 */
function convertProductSectionsToPrompt(
  productSections: GenerateProductSectionsResponse,
  extraPrompt?: string,
  adStory?: string
): string {
  const { mainProduct, sections } = productSections;

  // Use the exact prompt function from masterApi.ts with additional parameters
  return getMasterLandingPagePrompt(
    mainProduct,
    sections,
    extraPrompt,
    adStory
  );
}

/**
 * Call the ProductMappingSections API
 */
async function callGenerateProductSections(
  productUrl: string,
  prompt?: string
): Promise<GenerateProductSectionsResponse | null> {
  try {
    console.log(`🔄 Calling ProductMappingSections API for: ${productUrl}`);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/ProductMappingSections`,
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
      throw new Error(`ProductMappingSections API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ ProductMappingSections API response received`);
    return data;
  } catch (error) {
    console.error(`❌ Error calling ProductMappingSections API:`, error);
    return null;
  }
}

/**
 * Call the create-landing-page API
 */
async function callCreateLandingPage(
  productUrl: string,
  prompt: string
): Promise<CreateLandingPageResponse | null> {
  try {
    console.log(`🔄 Calling create-landing-page API for: ${productUrl}`);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/create-landing-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: productUrl,
          prompt: prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`create-landing-page API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ create-landing-page API response received`);
    return data;
  } catch (error) {
    console.error(`❌ Error calling create-landing-page API:`, error);
    return null;
  }
}

/**
 * Convert product sections to module format for consistency
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
    {
      type: "TEXT",
      subtype: "HEADER",
      content: productSections.sections.intro.header,
    },
    {
      type: "TEXT",
      subtype: "PARAGRAPH",
      content: productSections.sections.intro.paragraph,
    },
  ];

  modulesBySection.push({
    sectionTitle: "Intro Section",
    totalModules: introModules.length,
    moduleCounts: { TEXT: introModules.length },
    modules: introModules,
  });

  // 2. Convert Pair It With Section (if exists)
  if (productSections.sections.pair_it_with) {
    const pairModules = [
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
      {
        type: "TEXT",
        subtype: "PAIR_IT_WITH",
        content: null,
        products: [
          {
            id: productSections.sections.pair_it_with.product.id,
            title: productSections.sections.pair_it_with.product.title,
            productUrl:
              productSections.sections.pair_it_with.product.productUrl,
            imageUrl: productSections.sections.pair_it_with.product.imageUrl,
            finalPrice:
              productSections.sections.pair_it_with.product.finalPrice,
            description: "", // Add if available
            totalRating: 0, // Add if available
          },
        ],
      },
    ];

    modulesBySection.push({
      sectionTitle: "Pair It With",
      totalModules: pairModules.length,
      moduleCounts: { TEXT: 1 },
      modules: pairModules,
    });
  }

  // 3. Convert Collection Section
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
      })),
    },
  ];

  modulesBySection.push({
    sectionTitle: "Product Collection",
    totalModules: collectionModules.length,
    moduleCounts: { TEXT: 2 },
    modules: collectionModules,
  });

  // 4. Add Shop Now Section (if exists)
  if (productSections.sections.shop_now) {
    const shopNowModules = [
      {
        type: "TEXT",
        subtype: "SHOP_NOW",
        content: null,
        products: [
          {
            id: productSections.sections.shop_now.product.id,
            title: productSections.sections.shop_now.product.title,
            description: productSections.sections.shop_now.product.description,
            productUrl: productSections.sections.shop_now.product.productUrl,
            imageUrl: productSections.sections.shop_now.product.imageUrl,
            finalPrice: productSections.sections.shop_now.product.finalPrice,
            totalRating: productSections.sections.shop_now.product.totalRating,
          },
        ],
      },
    ];

    modulesBySection.push({
      sectionTitle: "Shop Now",
      totalModules: shopNowModules.length,
      moduleCounts: { TEXT: 1 },
      modules: shopNowModules,
    });
  }

  return modulesBySection;
}

/**
 * Combine and merge sections from both APIs
 */
function combineSections(
  productSectionModules: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>,
  landingPageSections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>,
  mainProduct: {
    id: number;
    title: string;
    description: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
    totalRating: number;
  }
): Array<{
  sectionTitle: string;
  totalModules: number;
  moduleCounts: Record<string, number>;
  modules: any[];
}> {
  const combinedSections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }> = [];

  // 1. Find and add Intro Section first
  const introSection = productSectionModules.find(
    (section) => section.sectionTitle === "Intro Section"
  );
  if (introSection) {
    combinedSections.push(introSection);
  }

  // 2. Process landing page sections and look for SHOP_NOW module
  let foundShopNow = false;
  for (const section of landingPageSections) {
    // Look for SHOP_NOW module in this section
    const shopNowModule = section.modules.find(
      (module) => module.type === "TEXT" && module.subtype === "SHOP_NOW"
    );

    if (shopNowModule) {
      // If found, update it with main product details
      shopNowModule.content = null;
      shopNowModule.products = [
        {
          id: mainProduct.id,
          title: mainProduct.title,
          description: mainProduct.description,
          productUrl: mainProduct.productUrl,
          imageUrl: mainProduct.imageUrl,
          finalPrice: mainProduct.finalPrice,
          totalRating: mainProduct.totalRating,
        },
      ];
      foundShopNow = true;
    }
    combinedSections.push(section);
  }

  // 3. If no SHOP_NOW module was found in landing page sections, create a new one
  if (!foundShopNow) {
    const shopNowSection = {
      sectionTitle: "Shop Now",
      totalModules: 1,
      moduleCounts: { TEXT: 1 },
      modules: [
        {
          type: "TEXT",
          subtype: "SHOP_NOW",
          content: null,
          products: [
            {
              id: mainProduct.id,
              title: mainProduct.title,
              description: mainProduct.description,
              productUrl: mainProduct.productUrl,
              imageUrl: mainProduct.imageUrl,
              finalPrice: mainProduct.finalPrice,
              totalRating: mainProduct.totalRating,
            },
          ],
        },
      ],
    };
    combinedSections.push(shopNowSection);
  }

  // 4. Find and add Pair It With section (if exists)
  const pairItWithSection = productSectionModules.find(
    (section) => section.sectionTitle === "Pair It With"
  );
  if (pairItWithSection) {
    combinedSections.push(pairItWithSection);
  }

  // 5. Find and add Product Collection section
  const collectionSection = productSectionModules.find(
    (section) => section.sectionTitle === "Product Collection"
  );
  if (collectionSection) {
    combinedSections.push(collectionSection);
  }

  return combinedSections;
}

// NEW HELPER: Ensure a fallback SHOP_NOW module exists after all processing
function ensureShopNowModule(
  sections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>,
  mainProduct: {
    id: number;
    title: string;
    description: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
    totalRating: number;
  }
) {
  let foundSectionIndex: number | null = null;

  // 1. Locate and remove existing SHOP_NOW modules (if any)
  sections.forEach((section, idx) => {
    const initialLen = section.modules.length;
    section.modules = section.modules.filter(
      (module: any) =>
        !(module.type === "TEXT" && module.subtype === "SHOP_NOW")
    );

    const removed = initialLen - section.modules.length;
    if (removed > 0) {
      // Adjust counts when we remove existing modules
      section.totalModules -= removed;
      section.moduleCounts["TEXT"] = Math.max(
        (section.moduleCounts["TEXT"] || 0) - removed,
        0
      );
      if (foundSectionIndex === null) foundSectionIndex = idx;
    }
  });

  // 2. Decide where to place the fallback module
  let targetIndex: number;
  if (foundSectionIndex !== null) {
    targetIndex = foundSectionIndex; // replace in same section you removed from
  } else {
    targetIndex =
      sections.length >= 3 ? sections.length - 3 : sections.length - 1;
  }

  const targetSection = sections[targetIndex];

  const fallbackShopNowModule = {
    type: "TEXT",
    subtype: "SHOP_NOW",
    content: null,
    products: [mainProduct],
  } as const;

  targetSection.modules.push(fallbackShopNowModule);
  targetSection.totalModules += 1;
  targetSection.moduleCounts["TEXT"] =
    (targetSection.moduleCounts["TEXT"] || 0) + 1;

  console.log(
    `🛠️ Fallback SHOP_NOW module ensured in section "${targetSection.sectionTitle}"`
  );
}

/**
 * Call the enhance-landing-page API
 */
async function callEnhanceLandingPage(
  title: string,
  sections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>,
  originalPrompt?: string,
  adStory?: string,
  productUrl?: string
): Promise<MasterApiResponse | null> {
  try {
    console.log(`🔄 Calling enhance-landing-page API`);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/enhance-landing-page`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          sections,
          originalPrompt: originalPrompt,
          adStory: adStory,
          productUrl,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`enhance-landing-page API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ enhance-landing-page API response received`);
    return data;
  } catch (error) {
    console.error(`❌ Error calling enhance-landing-page API:`, error);
    return null;
  }
}

/**
 * Main API handler
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Get product URL from request
    const { productUrl, prompt, adStory } = await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log(`\n🔄 ========== STARTING MASTER API ==========`);
    console.log(`📦 Processing product URL: ${productUrl}`);

    // Step 2: Call product sections API
    console.log(`\n🔄 ========== GENERATING PRODUCT SECTIONS ==========`);
    const productSectionsResponse = await callGenerateProductSections(
      productUrl,
      prompt
    );

    if (!productSectionsResponse) {
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

    // Step 3: Generate landing page prompt and call create-landing-page API
    console.log(`\n🔄 ========== GENERATING LANDING PAGE ==========`);
    const landingPagePrompt = getMasterLandingPagePrompt(
      productSectionsResponse.mainProduct,
      productSectionsResponse.sections,
      prompt,
      adStory
    );

    console.log(`✅ Landing page prompt generated`);
    console.log(`📋 Prompt length: ${landingPagePrompt.length} characters`);

    const landingPageResponse = await callCreateLandingPage(
      productUrl,
      landingPagePrompt
    );

    if (!landingPageResponse) {
      return NextResponse.json(
        { error: "Failed to generate landing page sections" },
        { status: 500 }
      );
    }

    console.log(`✅ Landing page sections generated successfully`);
    console.log(`📋 Landing page title: ${landingPageResponse.title}`);
    console.log(
      `📦 Additional sections generated: ${landingPageResponse.modulesBySection.length}`
    );

    // Step 4: Convert product sections to module format
    console.log(
      `\n🔄 ========== CONVERTING PRODUCT SECTIONS TO MODULES ==========`
    );
    const productSectionModules = convertProductSectionsToModules(
      productSectionsResponse
    );
    console.log(
      `✅ Converted ${productSectionModules.length} product sections to module format`
    );

    // Step 5: Combine all sections
    console.log(`\n🔗 ========== COMBINING ALL SECTIONS ==========`);
    const combinedSections = combineSections(
      productSectionModules,
      landingPageResponse.modulesBySection,
      productSectionsResponse.mainProduct
    );

    console.log(`✅ Combined sections successfully`);
    console.log(`📊 Total combined sections: ${combinedSections.length}`);

    // Step 6: Call enhance-landing-page API
    console.log(`\n🔄 ========== ENHANCING LANDING PAGE ==========`);
    const enhancedResponse = await callEnhanceLandingPage(
      landingPageResponse.title,
      combinedSections,
      prompt,
      adStory,
      productUrl
    );

    if (!enhancedResponse) {
      console.log(
        `⚠️ Enhancement failed, returning combined sections (with fallback check)`
      );
      ensureShopNowModule(
        combinedSections,
        productSectionsResponse.mainProduct
      );

      return NextResponse.json({
        title: landingPageResponse.title,
        sections: combinedSections,
      });
    }

    console.log(`✅ Landing page enhanced successfully`);
    console.log(
      `📊 Enhanced sections count: ${enhancedResponse.sections.length}`
    );

    // Ensure fallback SHOP_NOW module after enhancement
    ensureShopNowModule(
      enhancedResponse.sections,
      productSectionsResponse.mainProduct
    );

    // Step 7: Return enhanced response
    console.log(`\n🎉 ========== MASTER API COMPLETED SUCCESSFULLY ==========`);

    return NextResponse.json(enhancedResponse);
  } catch (error) {
    console.error("Error in master API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    message: "Master Product Landing Page API is running",
    endpoints: {
      productSections: "/api/ProductMappingSections",
      landingPage: "/api/create-landing-page",
      master: "/api/masterAiApi",
    },
  });
}
