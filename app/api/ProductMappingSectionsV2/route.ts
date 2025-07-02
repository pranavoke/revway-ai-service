// app/api/ProductMappingSectionsV2/route.ts - SEPARATE PAIR IT WITH FLOW
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getProductIntroSectionPrompt,
  getProductPairItWithSectionPrompt,
  getAIProductCollectionPrompt,
  getAIPairProductPrompt,
  getCustomerLoveSectionPrompt,
} from "@/lib/prompts/productSectionsV2";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// IMPROVED SCHEMAS
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

interface GenerateRequest {
  productUrl: string;
  additionalPrompt?: string;
}

interface IntroSection {
  header: string;
  paragraph: string;
}

// COMPLETE PAIR PRODUCT SCHEMA
interface PairItWithSection {
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
    sku: string; // Added complete product data
  };
}

interface CollectionSection {
  header: string;
  products: Array<{
    id: number;
    title: string;
    description: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
    totalRating: number;
    sku: string; // Added complete product data
  }>;
}

// Add new interface for customer love section
interface CustomerLoveSection {
  header: string;
  testimonials: Array<{
    subject: string;
    body: string;
    reviewerName: string;
    rating: number;
  }>;
}

interface ApiResponse {
  success: boolean;
  mainProduct: {
    id: number;
    title: string;
    description: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
    totalRating: number;
    sku: string;
  };
  sections: {
    intro: IntroSection;
    customer_love: CustomerLoveSection;
    pair_it_with?: PairItWithSection;
    collection: CollectionSection;
  };
}

// SEPARATE AI RESPONSE SCHEMAS
interface PairProductResponse {
  pairProduct: string;
  reasoning: string;
}

interface CollectionProductsResponse {
  collectionProducts: string[];
  reasoning: string;
}

// STEP 1: MANDATORY - Fetch ALL products from brand API
async function fetchBrandProducts(): Promise<Product[]> {
  try {
    console.log("🔄 STEP 1: FETCHING ALL PRODUCTS (MANDATORY)");
    const allProducts: Product[] = [];
    let currentPage = 0;
    let hasMorePages = true;
    let totalFetched = 0;

    while (hasMorePages) {
      console.log(`📦 Fetching products page ${currentPage}...`);

      const response = await fetch(
        `https://backend.revway.io/product/brand/23?page=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} for page ${currentPage}`
        );
      }

      const data: ProductResponse = await response.json();

      if (data.content && data.content.length > 0) {
        allProducts.push(...data.content);
        totalFetched += data.content.length;
        console.log(
          `📊 Page ${currentPage}: ${data.content.length} products fetched`
        );
        currentPage++;

        
      } else {
        hasMorePages = false;
      }

      if (currentPage > 50) {
        console.warn("⚠️ Reached maximum page limit (50), stopping pagination");
        hasMorePages = false;
      }
    }

    console.log(
      `✅ STEP 1 COMPLETE: Total products fetched: ${totalFetched} from ${
        currentPage - 1
      } pages`
    );
    console.log(`📋 Products available for AI analysis: ${allProducts.length}`);

    return allProducts;
  } catch (error) {
    console.error("❌ STEP 1 FAILED: Error fetching brand products:", error);
    throw new Error("Failed to fetch complete product catalog");
  }
}

// STEP 2: Find main product from complete dataset (EXACT MATCH ONLY)
function findProductByUrl(
  products: Product[],
  productUrl: string
): Product | undefined {
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

// Helper function to find products by URLs from complete dataset (EXACT MATCH ONLY)
function findProductsByUrls(
  products: Product[],
  productUrls: string[]
): Product[] {
  console.log(
    `🔍 Finding ${productUrls.length} products from ${products.length} available products`
  );

  return productUrls
    .map((url) =>
      products.find((product) => {
        if (!product) return false;
        return product.productUrl === url;
      })
    )
    .filter((product): product is Product => product !== undefined);
}

// STEP 3A: SEPARATE AI FLOW - Get Pair Product
async function getAIPairProduct(
  mainProduct: Product,
  allProducts: Product[],
  additionalPrompt?: string
): Promise<PairProductResponse | null> {
  try {
    console.log("🔄 STEP 3A: AI PAIR PRODUCT SELECTION");
    console.log(`🤖 Finding best pair for: ${mainProduct.title}`);
    console.log(`📊 Analyzing against ${allProducts.length} total products`);

    const otherProducts = allProducts.filter((p) => p.id !== mainProduct.id);
    console.log(`🔄 Products available for pairing: ${otherProducts.length}`);

    const productList = otherProducts.map((product) => ({
      url: product.productUrl,
      title: product.title,
      description: stripHtmlTags(product.description),
      price: product.finalPrice,
      rating: product.totalRating,
    }));

    const { systemPrompt, userPrompt } = getAIPairProductPrompt({
      mainProduct,
      productList,
      additionalPrompt,
    });

    console.log("🤖 Sending complete catalog to OpenAI for PAIR selection...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.6,
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) {
      console.log("❌ STEP 3A: No content received from OpenAI");
      return null;
    }

    const result = cleanAndParseJSON(content);
    console.log("✅ STEP 3A COMPLETE: AI pair selection successful");
    console.log(`🎯 AI selected pair product: ${result.pairProduct || "NONE"}`);

    return result;
  } catch (error) {
    console.error(
      "❌ STEP 3A FAILED: Error in AI pair product selection:",
      error
    );
    return null;
  }
}

// STEP 3B: SEPARATE AI FLOW - Get Collection Products
async function getAICollectionProducts(
  mainProduct: Product,
  allProducts: Product[],
  pairProduct: Product | null,
  additionalPrompt?: string
): Promise<CollectionProductsResponse | null> {
  try {
    console.log("🔄 STEP 3B: AI COLLECTION PRODUCT SELECTION");
    console.log(`🤖 Finding collection for: ${mainProduct.title}`);

    // Exclude main product and pair product from collection
    const excludeIds = [mainProduct.id];
    if (pairProduct) {
      excludeIds.push(pairProduct.id);
      console.log(
        `🚫 Excluding pair product from collection: ${pairProduct.title}`
      );
    }

    const availableProducts = allProducts.filter(
      (p) => !excludeIds.includes(p.id)
    );
    console.log(
      `🔄 Products available for collection: ${availableProducts.length}`
    );

    const productList = availableProducts.map((product) => ({
      url: product.productUrl,
      title: product.title,
      description: stripHtmlTags(product.description),
      price: product.finalPrice,
      rating: product.totalRating,
    }));

    const { systemPrompt, userPrompt } = getAIProductCollectionPrompt({
      mainProduct,
      productList,
      pairProduct: pairProduct
        ? {
            title: pairProduct.title,
            description: stripHtmlTags(pairProduct.description),
            price: pairProduct.finalPrice,
          }
        : null,
      additionalPrompt,
    });

    console.log(
      "🤖 Sending available products to OpenAI for COLLECTION selection..."
    );
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.6,
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) {
      console.log("❌ STEP 3B: No content received from OpenAI");
      return null;
    }

    const result = cleanAndParseJSON(content);
    console.log("✅ STEP 3B COMPLETE: AI collection selection successful");
    console.log(
      `🎯 AI selected ${
        result.collectionProducts?.length || 0
      } collection products`
    );

    return result;
  } catch (error) {
    console.error(
      "❌ STEP 3B FAILED: Error in AI collection selection:",
      error
    );
    return null;
  }
}

// STEP 4: Generate content based on AI recommendations
async function generateAIContent(
  systemPrompt: string,
  userPrompt: string,
  fallbackContent?: any
): Promise<any> {
  try {
    console.log("🤖 Generating AI content...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) return fallbackContent;

    return cleanAndParseJSON(content);
  } catch (error) {
    console.error("❌ Error generating AI content:", error);
    return fallbackContent;
  }
}

// Helper function to strip HTML tags
function stripHtmlTags(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

// Helper function to clean AI response and extract JSON
function cleanAndParseJSON(content: string): any {
  try {
    let cleaned = content.trim();

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

// Fallback product matching from complete dataset
function getFallbackProducts(
  products: Product[],
  mainProduct: Product,
  pairProduct: Product | null
): {
  pairProduct: Product | null;
  collectionProducts: Product[];
} {
  console.log("🔄 Using fallback product selection with complete dataset");

  const excludeIds = [mainProduct.id];
  if (pairProduct) excludeIds.push(pairProduct.id);

  const otherProducts = products.filter((p) => !excludeIds.includes(p.id));
  const shuffled = otherProducts.sort(() => Math.random() - 0.5);

  return {
    pairProduct: pairProduct || shuffled[0] || null,
    collectionProducts: shuffled.slice(pairProduct ? 0 : 1, 4),
  };
}

// Add customer love section generation
async function generateCustomerLoveSection(
  mainProduct: Product,
  additionalPrompt?: string
): Promise<CustomerLoveSection> {
  console.log("🔄 Generating Why Customers Love Us section...");

  const { systemPrompt, userPrompt } = getCustomerLoveSectionPrompt({
    productTitle: mainProduct.title,
    productDescription: stripHtmlTags(mainProduct.description),
    additionalPrompt,
  });

  const customerLoveContent = await generateAIContent(
    systemPrompt,
    userPrompt,
    {
      header: "Why Our Customers Love Us",
      testimonials: Array(5).fill({
        subject: "Great Product",
        body: "This product exceeded my expectations. Highly recommended!",
        reviewerName: "Happy Customer",
        rating: 5,
      }),
    }
  );

  console.log("✅ Customer love section generated successfully");
  return customerLoveContent;
}

// MAIN API HANDLER - SEPARATE PAIR IT WITH FLOW
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { productUrl, additionalPrompt = "" } = body;

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log("🚀 STARTING SEPARATE PAIR IT WITH FLOW");
    console.log("=".repeat(60));

    // ==========================================
    // STEP 1: MANDATORY - Fetch ALL products
    // ==========================================
    const allProducts = await fetchBrandProducts();

    if (allProducts.length === 0) {
      return NextResponse.json(
        { error: "Unable to fetch complete product catalog" },
        { status: 500 }
      );
    }

    // ==========================================
    // STEP 2: Find main product from complete dataset
    // ==========================================
    const mainProduct = findProductByUrl(allProducts, productUrl);

    if (!mainProduct) {
      return NextResponse.json(
        {
          error: "Product not found",
          debug: {
            searchedUrl: productUrl,
            totalProductsAvailable: allProducts.length,
            sampleUrls: allProducts.slice(0, 3).map((p) => p.productUrl),
          },
        },
        { status: 404 }
      );
    }

    // ==========================================
    // STEP 3A: SEPARATE AI FLOW - Get Pair Product
    // ==========================================
    const pairResponse = await getAIPairProduct(
      mainProduct,
      allProducts,
      additionalPrompt
    );
    let pairProduct: Product | null = null;

    if (pairResponse && pairResponse.pairProduct) {
      const foundPairProduct = findProductByUrl(
        allProducts,
        pairResponse.pairProduct
      );
      if (foundPairProduct) {
        pairProduct = foundPairProduct;
        console.log(`✅ Pair product found: ${pairProduct.title}`);
      } else {
        console.log(
          `⚠️ AI recommended pair product not found: ${pairResponse.pairProduct}`
        );
      }
    }

    // ==========================================
    // STEP 3B: SEPARATE AI FLOW - Get Collection Products
    // ==========================================
    const collectionResponse = await getAICollectionProducts(
      mainProduct,
      allProducts,
      pairProduct,
      additionalPrompt
    );
    let collectionProducts: Product[] = [];

    if (collectionResponse && collectionResponse.collectionProducts) {
      collectionProducts = findProductsByUrls(
        allProducts,
        collectionResponse.collectionProducts
      );
      console.log(`✅ Collection products found: ${collectionProducts.length}`);

      // Ensure we have 4 collection products
      if (collectionProducts.length < 4) {
        console.log(
          "🔄 Filling remaining collection slots with fallback products..."
        );
        const fallback = getFallbackProducts(
          allProducts,
          mainProduct,
          pairProduct
        );
        const needed = 4 - collectionProducts.length;
        const additionalProducts = fallback.collectionProducts
          .filter((p) => !collectionProducts.some((cp) => cp.id === p.id))
          .slice(0, needed);
        collectionProducts = [...collectionProducts, ...additionalProducts];
      }
    } else {
      console.log("⚠️ AI collection selection failed, using fallback...");
      const fallback = getFallbackProducts(
        allProducts,
        mainProduct,
        pairProduct
      );
      collectionProducts = fallback.collectionProducts;
    }

    // If no pair product found, try fallback
    if (!pairProduct) {
      console.log("⚠️ No pair product found, using fallback...");
      const fallback = getFallbackProducts(allProducts, mainProduct, null);
      pairProduct = fallback.pairProduct;
    }

    // ==========================================
    // STEP 4: Generate content for all sections
    // ==========================================
    console.log("🔄 STEP 4: GENERATING CONTENT FOR ALL SECTIONS");

    const sections: ApiResponse["sections"] = {
      intro: { header: "", paragraph: "" },
      customer_love: {
        header: "",
        testimonials: [],
      },
      collection: { header: "You Might Also Like", products: [] },
    };

    // Generate Intro Section
    const { systemPrompt: introSystemPrompt, userPrompt: introUserPrompt } =
      getProductIntroSectionPrompt({
        productTitle: mainProduct.title,
        productDescription: stripHtmlTags(mainProduct.description),
        additionalPrompt,
      });

    const introContent = await generateAIContent(
      introSystemPrompt,
      introUserPrompt,
      {
        header: mainProduct.title,
        paragraph:
          stripHtmlTags(mainProduct.description).substring(0, 150) + "...",
      }
    );

    sections.intro = introContent;

    // Generate Customer Love Section
    sections.customer_love = await generateCustomerLoveSection(
      mainProduct,
      additionalPrompt
    );

    // Generate Pair It With Section (if pair product exists)
    if (pairProduct) {
      console.log(
        `🔄 Generating Pair It With content for: ${pairProduct.title}`
      );

      const { systemPrompt: pairSystemPrompt, userPrompt: pairUserPrompt } =
        getProductPairItWithSectionPrompt({
          mainProductTitle: mainProduct.title,
          mainProductDescription: stripHtmlTags(mainProduct.description),
          pairProductTitle: pairProduct.title,
          pairProductDescription: stripHtmlTags(pairProduct.description),
          additionalPrompt,
        });

      const pairContent = await generateAIContent(
        pairSystemPrompt,
        pairUserPrompt,
        {
          header: `Perfect with ${pairProduct.title}`,
          text: `Enhance your experience by combining ${mainProduct.title} with ${pairProduct.title} for maximum benefits.`,
        }
      );

      sections.pair_it_with = {
        ...pairContent,
        product: {
          id: pairProduct.id,
          title: pairProduct.title,
          description: stripHtmlTags(pairProduct.description),
          productUrl: pairProduct.productUrl,
          imageUrl: pairProduct.imageUrl,
          finalPrice: pairProduct.finalPrice,
          totalRating: pairProduct.totalRating,
          sku: pairProduct.sku, // Complete product data
        },
      };
    }

    // Generate Collection Section
    sections.collection = {
      header: "You Might Also Like",
      products: collectionProducts.map((product) => ({
        id: product.id,
        title: product.title,
        description: stripHtmlTags(product.description),
        productUrl: product.productUrl,
        imageUrl: product.imageUrl,
        finalPrice: product.finalPrice,
        totalRating: product.totalRating,
        sku: product.sku, // Complete product data
      })),
    };

    console.log("✅ STEP 4 COMPLETE: All content generated successfully");
    console.log("🎉 SEPARATE PAIR IT WITH FLOW COMPLETED SUCCESSFULLY");
    console.log("=".repeat(60));

    // Build final response with complete schemas
    const response: ApiResponse = {
      success: true,
      mainProduct: {
        id: mainProduct.id,
        title: mainProduct.title,
        description: stripHtmlTags(mainProduct.description),
        productUrl: mainProduct.productUrl,
        imageUrl: mainProduct.imageUrl,
        finalPrice: mainProduct.finalPrice,
        totalRating: mainProduct.totalRating,
        sku: mainProduct.sku, // Complete product data
      },
      sections,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 SEPARATE PAIR IT WITH FLOW FAILED:", error);
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

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Separate Pair It With Flow API is running",
    flow: [
      "STEP 1: Fetch ALL products (mandatory)",
      "STEP 2: Find main product from complete dataset",
      "STEP 3A: SEPARATE AI flow - Get pair product",
      "STEP 3B: SEPARATE AI flow - Get collection products (excluding pair)",
      "STEP 4: Generate content for all sections with complete data",
    ],
  });
}
