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
    const { category, price, currency } = await request.json();

    if (!category || !price || !currency) {
      return NextResponse.json(
        { error: "Product category, price, and currency are required" },
        { status: 400 }
      );
    }

    console.log("💰 Pricing Analysis");
    console.log(`📦 Product Category: ${category}`);
    console.log(`💵 Product Price: ${price}`);
    console.log(`💱 Currency: ${currency}`);

    const userPrompt = `You are a pricing analyst. Given the product category: "${category}", product price: ${price}, and currency: "${currency}", classify the price as "low", "medium", or "high" based on what is typical for the category in that currency/market.

    Consider market standards, typical price ranges, consumer expectations, and purchasing power for this category in the ${currency} market when making your classification.

    Return the classification in this exact JSON format:
    {
      "priceClassification": "low|medium|high",
      "reasoning": "Brief explanation of why this price falls into this category considering the currency and market context"
    }`;

    console.log("🤖 Calling OpenAI for pricing analysis...");

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
      `✅ Pricing analysis completed - ${parsed.priceClassification}`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Pricing analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Pricing Analysis API is running",
    timestamp: new Date().toISOString(),
  });
}
