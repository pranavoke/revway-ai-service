import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.Judgme_Private_Token || "";
const SHOP_DOMAIN = "vilvahstore.myshopify.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopifyProductId = searchParams.get("shopifyProductId");

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
    const reviewData = await getProductReviews(judgemeProductId);

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

async function getProductReviews(judgemeProductId: number) {
  let page = 1;
  const perPage = 100;
  let allReviews: any[] = [];

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

  // Calculate statistics
  const totalReviews = allReviews.length;
  const totalRating = allReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
  const fiveStarReviews = allReviews
    .filter((review) => review.rating === 5)
    .slice(0, 10);

  return {
    totalReviews,
    averageRating,
    fiveStarReviews,
  };
}
