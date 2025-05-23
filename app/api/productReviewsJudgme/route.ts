import { NextResponse } from "next/server";
import OpenAI from "openai";

// TypeScript types for the review structure
interface Reviewer {
  id: number;
  external_id: number;
  email: string;
  name: string;
  phone: string | null;
  accepts_marketing: boolean;
  unsubscribed_at: string | null;
  tags: string | null;
}

interface Review {
  id: number;
  title: string;
  body: string;
  rating: number;
  product_external_id: number;
  reviewer: Reviewer;
  source: string;
  curated: string;
  published: boolean;
  hidden: boolean;
  verified: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  has_published_pictures: boolean;
  has_published_videos: boolean;
  pictures: any[];
  ip_address: string | null;
  product_title: string;
  product_handle: string;
}

interface TopReviewsResponse {
  reviews: Review[];
}

let ACCESS_TOKEN: any;
let SHOP_DOMAIN: any;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopifyProductId = searchParams.get("shopifyProductId");
    const numberOfReviews = searchParams.get("numberOfReviews");
    ACCESS_TOKEN = searchParams.get("ACCESS_TOKEN");
    SHOP_DOMAIN = searchParams.get("SHOP_DOMAIN");

    if (!shopifyProductId) {
      return NextResponse.json(
        { error: "Shopify product ID is required" },
        { status: 400 }
      );
    }

    // Find Judge.me product ID from Shopify product ID
    const judgemeProductId = await getJudgemeProductId(
      parseInt(shopifyProductId)
    );

    if (!judgemeProductId) {
      return NextResponse.json(
        { error: "Product not found in Judge.me" },
        { status: 404 }
      );
    }

    // Get reviews and stats
    const reviewData = await getProductReviews(
      judgemeProductId,
      parseInt(numberOfReviews || "5")
    );

    return NextResponse.json(reviewData);
  } catch (error) {
    console.error("Error processing review data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getJudgemeProductId(
  shopifyProductId: number
): Promise<number | null> {
  let page = 1;
  const perPage = 10;

  while (true) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        api_token: ACCESS_TOKEN,
        shop_domain: SHOP_DOMAIN,
      });

      const response = await fetch(
        `https://judge.me/api/v1/products?${params}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const products = data.products;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return null;
      }

      // Find matching product
      for (const product of products) {
        if (product.external_id === shopifyProductId) {
          return product.id;
        }
      }

      // If less than perPage results, we've reached the end
      if (products.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error("Error retrieving products:", error);
      throw error;
    }
  }

  return null;
}

async function getProductReviews(
  judgemeProductId: number,
  numberOfReviews: number
): Promise<TopReviewsResponse> {
  let page = 1;
  const perPage = 100;
  let allReviews: Review[] = [];

  while (true) {
    const params = new URLSearchParams({
      product_id: judgemeProductId.toString(),
      page: page.toString(),
      per_page: perPage.toString(),
      api_token: ACCESS_TOKEN,
      shop_domain: SHOP_DOMAIN,
    });

    const response = await fetch(`https://judge.me/api/v1/reviews?${params}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    const reviewsData = await response.json();

    if (!reviewsData.reviews || !Array.isArray(reviewsData.reviews)) {
      break;
    }

    const reviews = reviewsData.reviews;
    allReviews = [...allReviews, ...reviews];

    if (reviews.length < perPage) {
      break;
    }

    page++;
  }

  const TEMPLATE = `
  Give me ${numberOfReviews} top reviews from the Reviews Set. Reviews which talk about the benefits of the product should be ranked higher. Consider Reviews between 10 to 40 words!
  
  Return the response in this exact JSON format:
  {
    "reviews": [
      {
        "id": number,
        "title": "string",
        "body": "string", 
        "rating": number,
        "product_external_id": number,
        "reviewer": {
          "id": number,
          "external_id": number,
          "email": "string",
          "name": "string",
          "phone": null,
          "accepts_marketing": boolean,
          "unsubscribed_at": null,
          "tags": null
        },
        "source": "string",
        "curated": "string",
        "published": boolean,
        "hidden": boolean,
        "verified": "string",
        "featured": boolean,
        "created_at": "string",
        "updated_at": "string",
        "pinned": boolean,
        "has_published_pictures": boolean,
        "has_published_videos": boolean,
        "pictures": [],
        "ip_address": null,
        "product_title": "string",
        "product_handle": "string"
      }
    ]
  }
 
  Reviews: ${JSON.stringify(allReviews)}
`;

  console.log("Generated Prompt: ", TEMPLATE);

  const openai = new OpenAI();

  const completion = await openai.beta.chat.completions.parse({
    messages: [
      {
        role: "user",
        content: TEMPLATE,
      },
    ],
    model: "gpt-4o-2024-08-06",
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message?.content || "{}";
  console.log("\nResponse Content: ", responseContent);

  try {
    const parsedResponse = JSON.parse(responseContent) as TopReviewsResponse;
    return parsedResponse;
  } catch (parseError) {
    console.error("Error parsing OpenAI response:", parseError);
    return { reviews: [] };
  }
}
