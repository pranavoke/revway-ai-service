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
    moduleCounts: { TEXT: 2 },
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
  }>
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

  // 2. Add all landing page sections in the middle
  combinedSections.push(...landingPageSections);

  // 3. Find and add Pair It With section (if exists)
  const pairItWithSection = productSectionModules.find(
    (section) => section.sectionTitle === "Pair It With"
  );
  if (pairItWithSection) {
    combinedSections.push(pairItWithSection);
  }

  // 4. Find and add Product Collection section
  const collectionSection = productSectionModules.find(
    (section) => section.sectionTitle === "Product Collection"
  );
  if (collectionSection) {
    combinedSections.push(collectionSection);
  }

  return combinedSections;
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
  }>
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
  console.log(
    `\n🚀 ========== MASTER PRODUCT LANDING PAGE API STARTED ==========`
  );
  console.log(`⏰ Request started at: ${new Date().toISOString()}`);

  try {
    const body: MasterApiRequest = await request.json();
    const { productUrl, prompt, adStory } = body;

    console.log(`📥 Request body:`, body);

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log(`🔗 Processing Product URL: ${productUrl}`);
    if (prompt) {
      console.log(`💡 Additional prompt: ${prompt}`);
    }

    // Step 1: Call ProductMappingSections API
    console.log(`\n📞 ========== CALLING PRODUCT SECTIONS API ==========`);
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
      `📋 Main product: ${productSectionsResponse.mainProduct.title}`
    );
    console.log(
      `📦 Sections generated: intro, collection${
        productSectionsResponse.sections.pair_it_with ? ", pair_it_with" : ""
      }`
    );

    // Step 2: Convert product sections data to landing page prompt using prompt function
    console.log(`\n🔄 ========== CONVERTING TO LANDING PAGE PROMPT ==========`);
    const landingPagePrompt = convertProductSectionsToPrompt(
      productSectionsResponse,
      prompt,
      adStory
    );
    console.log(
      `📝 Generated prompt length: ${landingPagePrompt.length} characters`
    );

    // Step 3: Call create-landing-page API
    console.log(`\n📞 ========== CALLING LANDING PAGE API ==========`);
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
      landingPageResponse.modulesBySection
    );

    console.log(`✅ Combined sections successfully`);
    console.log(`📊 Total combined sections: ${combinedSections.length}`);

    // Step 6: Call enhance-landing-page API
    console.log(`\n🔄 ========== ENHANCING LANDING PAGE ==========`);
    const enhancedResponse = await callEnhanceLandingPage(
      landingPageResponse.title,
      combinedSections
    );

    if (!enhancedResponse) {
      console.log(`⚠️ Enhancement failed, returning combined sections`);
      return NextResponse.json({
        title: landingPageResponse.title,
        sections: combinedSections,
      });
    }

    console.log(`✅ Landing page enhanced successfully`);
    console.log(
      `📊 Enhanced sections count: ${enhancedResponse.sections.length}`
    );

    // Step 7: Return enhanced response
    console.log(`\n🎉 ========== MASTER API COMPLETED SUCCESSFULLY ==========`);
    console.log(`📊 Final Response Summary:`);
    console.log(`   📋 Product: ${productSectionsResponse.mainProduct.title}`);
    console.log(`   📋 Page Title: ${enhancedResponse.title}`);
    console.log(`   📦 Product Sections: ${productSectionModules.length}`);
    console.log(
      `   📦 Landing Page Sections: ${landingPageResponse.modulesBySection.length}`
    );
    console.log(`   📦 Enhanced Sections: ${enhancedResponse.sections.length}`);
    console.log(`   📦 Enhanced Sections: ${JSON.stringify(enhancedResponse)}`);

    console.log(`⏰ Request completed at: ${new Date().toISOString()}`);

    // Process response to replace example.com URLs with null
    const processResponse = (sections: any[]) => {
      console.log("Processing sections:", JSON.stringify(sections, null, 2));

      const checkAndReplaceUrl = (url: string | null) => {
        if (
          url &&
          (url.includes("example.com") || url.includes("example.co"))
        ) {
          console.log("Found example URL, replacing:", url);
          return null;
        }
        return url;
      };

      return sections.map((section) => {
        if (section.modules) {
          section.modules = section.modules.map((module: any) => {
            console.log("Processing module:", module.type);

            if (module.type === "MEDIA" && module.mediaList) {
              console.log(
                "Processing MEDIA module mediaList:",
                module.mediaList
              );
              module.mediaList = module.mediaList.map((media: any) => {
                // Check both url and link properties
                media.url = checkAndReplaceUrl(media.url);
                media.link = checkAndReplaceUrl(media.link);
                return media;
              });
            }

            if (module.type === "LIST" && module.bulletPoints) {
              console.log(
                "Processing LIST module bulletPoints:",
                module.bulletPoints
              );
              module.bulletPoints = module.bulletPoints.map((point: any) => {
                point.icon = checkAndReplaceUrl(point.icon);
                return point;
              });
            }

            // Check for any nested URLs in the module itself
            if (module.url) {
              module.url = checkAndReplaceUrl(module.url);
            }
            if (module.link) {
              module.link = checkAndReplaceUrl(module.link);
            }
            if (module.imageUrl) {
              module.imageUrl = checkAndReplaceUrl(module.imageUrl);
            }
            if (module.icon) {
              module.icon = checkAndReplaceUrl(module.icon);
            }

            return module;
          });
        }
        return section;
      });
    };

    // Process the enhanced response
    console.log(
      "Original response:",
      JSON.stringify(enhancedResponse, null, 2)
    );
    enhancedResponse.sections = processResponse(enhancedResponse.sections);
    console.log(
      "Processed response:",
      JSON.stringify(enhancedResponse, null, 2)
    );

    return NextResponse.json(enhancedResponse);
  } catch (error) {
    console.error(`💥 ========== MASTER API FATAL ERROR ==========`);
    console.error(`❌ Error in master API:`, error);
    console.error(`⏰ Error occurred at: ${new Date().toISOString()}`);

    return NextResponse.json(
      {
        error: "Failed to generate complete landing page",
        message:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
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
    message: "Master Product Landing Page API is running",
    endpoints: {
      productSections: "/api/ProductMappingSections",
      landingPage: "/api/create-landing-page",
      master: "/api/masterAiApi",
    },
  });
}
