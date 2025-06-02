// app/api/generate-product-sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Types
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

interface PairItWithSection {
  header: string;
  text: string;
  product: {
    title: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
  };
}

interface CollectionSection {
  header: string;
  products: Array<{
    title: string;
    description: string;
    productUrl: string;
    imageUrl: string;
    finalPrice: number;
    totalRating: number;
  }>;
}

interface ApiResponse {
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
    intro: IntroSection;
    pair_it_with?: PairItWithSection;
    collection: CollectionSection;
  };
}

interface ProductMatchingResponse {
  pairProduct: string; // Product URL
  collectionProducts: string[]; // Array of Product URLs
  reasoning: string;
}

// Helper function to fetch products from the brand API
async function fetchBrandProducts(): Promise<Product[]> {
  try {
    const allProducts: Product[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`Fetching products page ${currentPage}...`);

      const response = await fetch(
        `https://backend.np.revway.io/product/brand/23?page=${currentPage}`,
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
        currentPage++;

        if (data.content.length < 20) {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }

      if (currentPage > 50) {
        // Maximum 50 pages safeguard
        console.warn("Reached maximum page limit (50), stopping pagination");
        hasMorePages = false;
      }
    }

    console.log(
      `Total products fetched: ${allProducts.length} from ${
        currentPage - 1
      } pages`
    );
    return allProducts;
  } catch (error) {
    console.error("Error fetching brand products:", error);
    return [];
  }
}

// Helper function to find product by URL
function findProductByUrl(
  products: Product[],
  productUrl: string
): Product | undefined {
  return products.find(
    (product) =>
      product.productUrl === productUrl ||
      product.productUrl.includes(productUrl) ||
      productUrl.includes(product.sku)
  );
}

// Helper function to find products by URLs
function findProductsByUrls(
  products: Product[],
  productUrls: string[]
): Product[] {
  return productUrls
    .map((url) =>
      products.find(
        (product) =>
          product.productUrl === url ||
          product.productUrl.includes(url) ||
          url.includes(product.sku)
      )
    )
    .filter((product): product is Product => product !== undefined);
}

// AI-powered product matching
async function getAIProductMatching(
  mainProduct: Product,
  allProducts: Product[]
): Promise<ProductMatchingResponse | null> {
  try {
    // Filter out the main product
    const otherProducts = allProducts.filter((p) => p.id !== mainProduct.id);

    // Create a simplified product list for AI analysis
    const productList = otherProducts.map((product) => ({
      url: product.productUrl,
      title: product.title,
      description: stripHtmlTags(product.description),
      price: product.finalPrice,
      rating: product.totalRating,
    }));

    const prompt = `
      Analyze the main product and suggest the best complementary products for cross-selling and collection.

      MAIN PRODUCT:
      Title: ${mainProduct.title}
      Description: ${stripHtmlTags(mainProduct.description)}
      Price: ₹${mainProduct.finalPrice}

      AVAILABLE PRODUCTS:
      ${JSON.stringify(productList, null, 2)}

      TASK:
      1. Select 1 product that would be PERFECT to pair with the main product (for cross-selling)
      2. Select products for a "You might also like" collection
      3. Consider factors like:
         - Complementary functionality
         - Similar target audience
         - Price compatibility
         - Product synergy
         - Customer journey enhancement

      REQUIREMENTS:
      - The pair product should enhance or complement the main product's benefits
      - Collection products should appeal to the same customer but offer variety
      - Avoid selecting the same product for both pair and collection
      - Consider different price points for collection diversity
      - Return ONLY the JSON object, no markdown formatting, no code blocks

      Return the response as a pure JSON object without any markdown formatting:
      {
        "pairProduct": "complete_product_url_here",
        "collectionProducts": ["url1", "url2", "url3", "url4"],
        "reasoning": "Brief explanation of why these products were selected"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert e-commerce product analyst who specializes in cross-selling and product recommendations. Always return pure JSON without any markdown code blocks or formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.6,
    });

    const content = completion.choices[0].message.content?.trim();
    if (!content) return null;

    return cleanAndParseJSON(content);
  } catch (error) {
    console.error("Error in AI product matching:", error);
    return null;
  }
}

// Helper function to generate AI content
async function generateAIContent(prompt: string): Promise<string | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a skilled marketing copywriter specializing in product descriptions and cross-selling content. Keep responses concise and engaging. Always return pure JSON without any markdown code blocks or formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() || null;
  } catch (error) {
    console.error("Error generating AI content:", error);
    return null;
  }
}

// Helper function to strip HTML tags
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// Helper function to clean AI response and extract JSON
function cleanAndParseJSON(content: string): any {
  try {
    // Remove markdown code blocks if present
    let cleaned = content.trim();

    // Remove ```json and ``` markers
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    // Clean up any extra whitespace
    cleaned = cleaned.trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error cleaning and parsing JSON:", error);
    throw error;
  }
}

// Fallback product matching (random selection)
function getFallbackProductMatching(
  products: Product[],
  mainProduct: Product
): {
  pairProduct: Product | null;
  collectionProducts: Product[];
} {
  const otherProducts = products.filter((p) => p.id !== mainProduct.id);
  const shuffled = otherProducts.sort(() => Math.random() - 0.5);

  return {
    pairProduct: shuffled[0] || null,
    collectionProducts: shuffled.slice(1, 5),
  };
}

// Main API handler
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

    // Fetch all products from the brand
    const allProducts = await fetchBrandProducts();

    if (allProducts.length === 0) {
      return NextResponse.json(
        { error: "Unable to fetch product data" },
        { status: 500 }
      );
    }

    // Find the main product
    const mainProduct = findProductByUrl(allProducts, productUrl);

    if (!mainProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get AI-powered product matching
    console.log("Getting AI product matching...");
    const aiMatching = await getAIProductMatching(mainProduct, allProducts);

    let pairProduct: Product | null = null;
    let collectionProducts: Product[] = [];

    if (aiMatching) {
      console.log("AI Matching Result:", aiMatching);

      // Find the pair product
      const pairProductFound = findProductByUrl(
        allProducts,
        aiMatching.pairProduct
      );
      if (pairProductFound) {
        pairProduct = pairProductFound;
      }

      // Find collection products
      collectionProducts = findProductsByUrls(
        allProducts,
        aiMatching.collectionProducts
      );

      // Ensure we have 4 collection products, fill with fallback if needed
      if (collectionProducts.length < 4) {
        const fallback = getFallbackProductMatching(allProducts, mainProduct);
        const needed = 4 - collectionProducts.length;
        const additionalProducts = fallback.collectionProducts
          .filter(
            (p) =>
              !collectionProducts.some((cp) => cp.id === p.id) &&
              p.id !== pairProduct?.id
          )
          .slice(0, needed);
        collectionProducts = [...collectionProducts, ...additionalProducts];
      }
    } else {
      console.log("AI matching failed, using fallback...");
      // Fallback to random selection
      const fallback = getFallbackProductMatching(allProducts, mainProduct);
      pairProduct = fallback.pairProduct;
      collectionProducts = fallback.collectionProducts;
    }

    // Generate content for each section
    const sections: ApiResponse["sections"] = {
      intro: { header: "", paragraph: "" },
      collection: { header: "You Might Also Like", products: [] },
    };

    // 1. Generate Intro Section
    const introPrompt = `
      Create an engaging product introduction for "${mainProduct.title}".
      
      Product Description: ${stripHtmlTags(mainProduct.description)}
      ${additionalPrompt ? `Additional Context: ${additionalPrompt}` : ""}
      
      Generate:
      1. A compelling page header (5-8 words)
      2. An engaging paragraph that highlights the key benefits
      
      Return the response as a pure JSON object without any markdown formatting:
      {
        "header": "Your header here",
        "paragraph": "Your paragraph here"
      }
    `;

    const introContent = await generateAIContent(introPrompt);

    try {
      if (introContent) {
        sections.intro = cleanAndParseJSON(introContent);
      }
    } catch (parseError) {
      console.error("Error parsing intro content:", parseError);
      sections.intro = {
        header: mainProduct.title,
        paragraph: stripHtmlTags(mainProduct.description),
      };
    }

    // 2. Generate Pair It With Section
    if (pairProduct) {
      const pairPrompt = `
        Create a compelling cross-sell section explaining why "${
          pairProduct.title
        }" should be bought with "${mainProduct.title}".
        
        Main Product: ${mainProduct.title} - ${stripHtmlTags(
        mainProduct.description
      )}
        Complementary Product: ${pairProduct.title} - ${stripHtmlTags(
        pairProduct.description
      )}
        
        Objective: Show how buying both products together maximizes benefits compared to buying only the main product.
        
        Generate:
        1. A punchy, eye-catching header (4-6 words)
        2. Short persuasive text (2-3 sentences) explaining the combined benefits
        
        Return the response as a pure JSON object without any markdown formatting:
        {
          "header": "Your header here",
          "text": "Your text here"
        }
      `;

      const pairContent = await generateAIContent(pairPrompt);

      try {
        if (pairContent) {
          const pairData = cleanAndParseJSON(pairContent);
          sections.pair_it_with = {
            ...pairData,
            product: {
              title: pairProduct.title,
              productUrl: pairProduct.productUrl,
              imageUrl: pairProduct.imageUrl,
              finalPrice: pairProduct.finalPrice,
            },
          };
        }
      } catch (parseError) {
        console.error("Error parsing pair content:", parseError);
        sections.pair_it_with = {
          header: `Perfect with ${pairProduct.title}`,
          text: `Enhance your experience by combining ${mainProduct.title} with ${pairProduct.title} for maximum benefits.`,
          product: {
            title: pairProduct.title,
            productUrl: pairProduct.productUrl,
            imageUrl: pairProduct.imageUrl,
            finalPrice: pairProduct.finalPrice,
          },
        };
      }
    }

    // 3. Generate Collection Section
    sections.collection = {
      header: "You Might Also Like",
      products: collectionProducts.map((product) => ({
        title: product.title,
        description: stripHtmlTags(product.description),
        productUrl: product.productUrl,
        imageUrl: product.imageUrl,
        finalPrice: product.finalPrice,
        totalRating: product.totalRating,
      })),
    };

    // Build response
    const response: ApiResponse = {
      success: true,
      mainProduct: {
        title: mainProduct.title,
        description: stripHtmlTags(mainProduct.description),
        productUrl: mainProduct.productUrl,
        imageUrl: mainProduct.imageUrl,
        finalPrice: mainProduct.finalPrice,
        totalRating: mainProduct.totalRating,
      },
      sections,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
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
    message: "AI-powered product content generation API is running",
  });
}
