import { NextRequest, NextResponse } from "next/server";

interface GenerateProductSectionsResponse {
  success: boolean;
  mainProduct: {
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
  sections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>;
}

/**
 * Convert product sections to landing page prompt format
 */
function convertProductSectionsToPrompt(
  productSections: GenerateProductSectionsResponse
): string {
  const { mainProduct, sections } = productSections;

  let prompt = `Create a comprehensive landing page for the product "${mainProduct.title}".

MAIN PRODUCT DETAILS:
- Title: ${mainProduct.title}
- Description: ${mainProduct.description}
- Price: ₹${mainProduct.finalPrice}
- Rating: ${mainProduct.totalRating}
- Product URL: ${mainProduct.productUrl}

EXISTING SECTIONS (already created separately):

1. INTRO SECTION:
   Header: ${sections.intro.header}
   Content: ${sections.intro.paragraph}

2. COLLECTION SECTION (${sections.collection.header}):
   Products to feature:`;

  sections.collection.products.forEach((product, index) => {
    prompt += `
   ${index + 1}. ${product.title} - ${product.description} (₹${
      product.finalPrice
    })`;
  });

  if (sections.pair_it_with) {
    prompt += `

3. PAIR IT WITH SECTION:
   Header: ${sections.pair_it_with.header}
   Content: ${sections.pair_it_with.text}
   Recommended Product: ${sections.pair_it_with.product.title} (₹${sections.pair_it_with.product.finalPrice})`;
  }

  prompt += `

Create additional sections that would naturally complement this product and enhance the landing page experience. Let your creativity flow to build the most compelling product page possible. The above sections are already handled, so focus on creating other valuable sections that would help convert visitors into customers . Also create only content sections here we are not required to create Footers or any such kind of boilerplate sections`;

  return prompt;
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
          prompt,
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

    // Step 2: Convert product sections data to landing page prompt
    console.log(`\n🔄 ========== CONVERTING TO LANDING PAGE PROMPT ==========`);
    const landingPagePrompt = convertProductSectionsToPrompt(
      productSectionsResponse
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

    // Step 6: Build final response
    const finalResponse: MasterApiResponse = {
      sections: combinedSections,
    };

    console.log(`\n🎉 ========== MASTER API COMPLETED SUCCESSFULLY ==========`);
    console.log(`📊 Final Response Summary:`);
    console.log(`   📋 Product: ${productSectionsResponse.mainProduct.title}`);
    console.log(`   📦 Product Sections: ${productSectionModules.length}`);
    console.log(
      `   📦 Landing Page Sections: ${landingPageResponse.modulesBySection.length}`
    );
    console.log(`   📦 Combined Sections: ${combinedSections.length}`);
    console.log(`⏰ Request completed at: ${new Date().toISOString()}`);

    return NextResponse.json(finalResponse);
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
