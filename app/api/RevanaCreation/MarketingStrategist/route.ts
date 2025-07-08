import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to clean and parse JSON
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
    console.error("Error parsing JSON:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { product_category_attributes, price_point, ad_story } =
      await request.json();

    if (!product_category_attributes || !price_point || !ad_story) {
      return NextResponse.json(
        {
          error:
            "Product category attributes, price point, and ad story are required",
        },
        { status: 400 }
      );
    }

    console.log("🎯 Marketing Strategy Analysis");
    console.log(`📊 Product Attributes:`, product_category_attributes);
    console.log(`💰 Price Point: ${price_point}`);
    console.log(`📖 Ad Story: ${ad_story.substring(0, 100)}...`);

    const userPrompt = `You are an expert marketing strategist. Based on the inputs below, determine the most appropriate landing page style for a product and its associated ad story.

Input Fields:
{
  "product_category_attributes": {
    "Visual Complexity": "${
      product_category_attributes.visualComplexity ||
      product_category_attributes["Visual Complexity"]
    }",
    "Decision Complexity": "${
      product_category_attributes.decisionComplexity ||
      product_category_attributes["Decision Complexity"]
    }",
    "Emotional Purchase Factor": "${
      product_category_attributes.emotionalPurchaseFactor ||
      product_category_attributes["Emotional Purchase Factor"]
    }",
    "Familiarity": "${
      product_category_attributes.familiarity ||
      product_category_attributes["Familiarity"]
    }"
  },
  "price_point": "${price_point}",
  "ad_story": "${ad_story}"
}

Landing Page Style Definitions (Purpose-Focused):
- pdp_style — Designed to support quick purchase decisions by focusing on essential information and fast conversion. Minimal persuasion or education needed.
- regular_lp — Balances product explanation and persuasive storytelling to inform and convince moderately engaged buyers.
- advertorial — Deeply engages users through storytelling, emotional connection, and detailed education for complex or high-consideration purchases.

Decision Criteria and Weightage:
- Assign 50% weight to product_category_attributes with emphasis on Decision Complexity and Familiarity (these have more influence than Visual Complexity or Emotional Purchase Factor).
- Assign 30% weight to price_point (higher price favors deeper, more detailed LP styles).
- Assign 20% weight to ad_story_summary (emotional storytelling can increase depth but should not override product or price factors).

Decision Guidance:
Product Category Attributes:
- Low Decision Complexity + High Familiarity → favors pdp_style (simple, fast conversion pages).
- Medium Decision Complexity or Medium Familiarity → favors regular_lp (balanced explanation and persuasion).
- High Decision Complexity or Low Familiarity → favors advertorial (deep engagement, storytelling).

Price Point:
- Low price → favors pdp_style.
- Medium price → supports regular_lp.
- High price → supports advertorial.

Ad Story:
- Functional/offer-driven → favors pdp_style.
- Moderately emotional/explanatory → supports regular_lp.
- Strong emotional storytelling → favors advertorial.

Handling Conflicting Attributes:
- If attributes conflict (e.g., high Visual Complexity but low Decision Complexity):
  - Give equal weightage to decision complexity and familiarity.
  - When still ambiguous, default to simpler style (pdp_style) to avoid over-complication.
  - Use price_point and ad_story as tie-breakers to potentially increase LP depth.

Return the recommendation in this exact JSON format:
{
  "recommendedLandingPageStyle": "pdp_style|regular_lp|advertorial",
  "confidence": "high|medium|low",
  "reasoning": {
    "productAttributesAnalysis": "Analysis of how product attributes influenced the decision (50% weight)",
    "pricePointAnalysis": "Analysis of how price point influenced the decision (30% weight)",
    "adStoryAnalysis": "Analysis of how ad story influenced the decision (20% weight)",
    "overallRationale": "Summary of the decision-making process and why this style was chosen"
  },
  "alternativeConsiderations": "Brief note on other styles that were considered and why they were not chosen"
}`;

    console.log("🤖 Calling OpenAI for marketing strategy analysis...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = cleanAndParseJSON(response);
    console.log(
      `✅ Marketing strategy analysis completed - ${parsed.recommendedLandingPageStyle}`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Marketing strategy analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Marketing Strategy API is running",
    timestamp: new Date().toISOString(),
    description:
      "Determines the most appropriate landing page style (pdp_style, regular_lp, or advertorial) based on product category attributes, price point, and ad story",
    inputFields: {
      product_category_attributes: {
        visualComplexity: "low|medium|high",
        decisionComplexity: "low|medium|high",
        emotionalPurchaseFactor: "low|medium|high",
        familiarity: "low|medium|high",
      },
      price_point: "low|medium|high",
      ad_story: "string",
    },
  });
}
