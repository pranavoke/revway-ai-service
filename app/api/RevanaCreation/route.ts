import { NextRequest, NextResponse } from "next/server";

interface RevanaCreationRequest {
  productUrl: string;
  prompt?: string;
  adStory?: string;
}

interface RevanaCreationResponse {
  title: string;
  sections: Array<{
    sectionTitle: string;
    totalModules: number;
    moduleCounts: Record<string, number>;
    modules: any[];
  }>;
}

interface Product {
  id: number;
  title: string;
  description: string;
  productUrl: string;
  imageUrl: string;
  finalPrice: number;
  totalRating: number;
  sku: string;
}

interface ProductResponse {
  content: Product[];
}

async function findProductByUrl(
  products: Product[],
  productUrl: string
): Promise<Product | undefined> {
  console.log("🔄 STEP 2: FINDING MAIN PRODUCT FROM COMPLETE DATASET");
  console.log(`🔍 Searching for: ${productUrl}`);
  console.log(`📊 Searching in ${products.length} total products`);

  const foundProduct = products.find((product) => {
    if (!product) return false;
    return product.productUrl === productUrl;
  });

  if (foundProduct) {
    console.log(
      `✅ STEP 2 COMPLETE: Main product found - ID: ${foundProduct.id}, Title: ${foundProduct.title}`
    );
  } else {
    console.log(
      `❌ STEP 2 FAILED: Product not found in ${products.length} available products`
    );
  }

  return foundProduct;
}

export async function POST(request: NextRequest) {
  try {
    const { productUrl, prompt, adStory }: RevanaCreationRequest =
      await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log("\n🚀 ========== REVANA CREATION FLOW STARTED ==========");
    console.log(`📦 Product URL: ${productUrl}`);
    console.log(`📝 Prompt: ${prompt || "None"}`);
    console.log(`📖 Ad Story: ${adStory || "None"}`);

    console.log("\n📋 ========== STEP 1: CATEGORY DETERMINATION ==========");
    const categoryDeterminationResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/SectionPlanning`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl }),
      }
    );

    if (!categoryDeterminationResponse.ok) {
      throw new Error("Category determination failed");
    }

    const categoryDetermination = await categoryDeterminationResponse.json();
    console.log(
      `✅ Category determination completed - ${categoryDetermination.category}`
    );

    const product: Product | undefined = await findProductByUrl(
      categoryDetermination.content,
      productUrl
    );

    // Step 2: Currency Determination
    console.log("\n🎯 ========== STEP 2: CURRENCY DETERMINATION ==========");
    const currencyDeterminationResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/CurrencyDetermination`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl }),
      }
    );

    if (!currencyDeterminationResponse.ok) {
      throw new Error("Currency determination failed");
    }

    const currencyDetermination = await currencyDeterminationResponse.json();
    console.log(
      `✅ Currency determination completed - ${currencyDetermination.currency}`
    );

    const currency = currencyDetermination.currency;

    // Step 3: Style Determination
    console.log("\n🎯 ========== STEP 3: STYLE DETERMINATION ==========");
    const styleDeterminationResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/StyleDetermination`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalPrice: product?.finalPrice,
          adStory,
          currency,
          product_category: categoryDetermination.category,
        }),
      }
    );

    if (!styleDeterminationResponse.ok) {
      throw new Error("Style determination failed");
    }

    const styleDetermination = await styleDeterminationResponse.json();
    console.log(
      `✅ Style determination completed - ${
        styleDetermination.total_sections ||
        styleDetermination.sections?.length ||
        0
      } sections`
    );

    // Step 3: Section Planning
    console.log("\n📋 ========== STEP 3: SECTION PLANNING ==========");
    const sectionPlanningResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/SectionPlanning`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl, prompt, adStory }),
      }
    );

    if (!sectionPlanningResponse.ok) {
      throw new Error("Section planning failed");
    }

    const sectionPlan = await sectionPlanningResponse.json();
    console.log(
      `✅ Section planning completed - ${
        sectionPlan.total_sections || sectionPlan.sections?.length || 0
      } sections planned`
    );

    // Step 2: Content Generation
    console.log("\n✍️ ========== STEP 2: CONTENT GENERATION ==========");
    const contentGenerationResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/ContentGeneration`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl,
          prompt,
          adStory,
          sectionPlan: sectionPlan.sections, // Pass the sections array
        }),
      }
    );

    if (!contentGenerationResponse.ok) {
      throw new Error("Content generation failed");
    }

    const contentGeneration = await contentGenerationResponse.json();
    console.log(
      `✅ Content generation completed - ${
        contentGeneration.total_content_blocks ||
        contentGeneration.contentBlocks?.length ||
        0
      } content blocks`
    );

    // Step 3: Module Mapping
    console.log("\n🔧 ========== STEP 3: MODULE MAPPING ==========");
    const moduleMappingResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/ModuleMapping`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl,
          contentBlocks: contentGeneration.contentBlocks, // Pass the contentBlocks array
        }),
      }
    );

    if (!moduleMappingResponse.ok) {
      throw new Error("Module mapping failed");
    }

    const moduleMapping = await moduleMappingResponse.json();
    console.log(
      `✅ Module mapping completed - ${
        moduleMapping.total_sections || moduleMapping.sections?.length || 0
      } sections`
    );

    // Step 4: Layout Composition
    console.log("\n🎨 ========== STEP 4: LAYOUT COMPOSITION ==========");
    const layoutCompositionResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/LayoutComposition`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl,
          sections: moduleMapping.sections, // Pass the sections array
        }),
      }
    );

    if (!layoutCompositionResponse.ok) {
      throw new Error("Layout composition failed");
    }

    const layoutComposition = await layoutCompositionResponse.json();
    console.log(
      `✅ Layout composition completed - ${
        layoutComposition.total_sections ||
        layoutComposition.sections?.length ||
        0
      } sections`
    );

    // Step 6: CTA Insertion
    console.log("\n🎯 ========== STEP 6: CTA INSERTION ==========");
    const ctaInsertionResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/CtaInsertion`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl,
          sections: styleDetermination.sections, // Pass the sections array
        }),
      }
    );

    if (!ctaInsertionResponse.ok) {
      throw new Error("CTA insertion failed");
    }

    const ctaInsertion = await ctaInsertionResponse.json();
    console.log(
      `✅ CTA insertion completed - ${
        ctaInsertion.total_sections || ctaInsertion.sections?.length || 0
      } sections`
    );

    // Step 7: Final Rendering
    console.log("\n🚀 ========== STEP 7: FINAL RENDERING ==========");
    const renderingResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/RevanaCreation/Rendering`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl,
          sections: ctaInsertion.sections, // Pass the sections array
        }),
      }
    );

    if (!renderingResponse.ok) {
      throw new Error("Final rendering failed");
    }

    const finalResult = await renderingResponse.json();
    console.log(`✅ Final rendering completed - "${finalResult.title}"`);

    // Build final response matching MasterApiV2 format
    const response: RevanaCreationResponse = {
      title: finalResult.title,
      sections: finalResult.sections,
    };

    console.log(
      "\n🎉 ========== REVANA CREATION COMPLETED SUCCESSFULLY =========="
    );
    console.log(`📋 Final title: ${response.title}`);
    console.log(`📊 Final sections count: ${response.sections?.length || 0}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 REVANA CREATION FLOW FAILED:", error);
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

export async function GET() {
  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "RevanaCreation API is running",
    flow: [
      "STEP 1: Section Planning - Plan page structure",
      "STEP 2: Content Generation - Create engaging content",
      "STEP 3: Module Mapping - Convert to UI modules",
      "STEP 4: Layout Composition - Organize for conversion",
      "STEP 5: Style Determination - Apply visual styles",
      "STEP 6: CTA Insertion - Add strategic CTAs",
      "STEP 7: Final Rendering - Generate final page",
    ],
  });
}
