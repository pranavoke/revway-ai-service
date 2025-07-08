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
    const { category } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: "Product category is required" },
        { status: 400 }
      );
    }

    console.log("🎯 Marketing Analysis");
    console.log(`📦 Product Category: ${category}`);

    const userPrompt = `You are an expert marketing analyst. For the product category: "${category}", please provide the following attribute ratings on a scale of "low", "medium", or "high":

1. Visual Complexity — How visually expressive or imagery-heavy products in this category typically are.
2. Decision Complexity — How involved or complex the purchase decision usually is
3. Emotional Purchase Factor — How emotionally driven the purchase typically is versus rational.
4. Familiarity — How familiar most buyers are with this product type.

Consider typical consumer behavior, market standards, and purchasing patterns for this category when making your ratings.

Return the analysis in this exact JSON format:
{
  "visualComplexity": "low|medium|high",
  "decisionComplexity": "low|medium|high", 
  "emotionalPurchaseFactor": "low|medium|high",
  "familiarity": "low|medium|high",
  "reasoning": {
    "visualComplexity": "Brief explanation for visual complexity rating",
    "decisionComplexity": "Brief explanation for decision complexity rating",
    "emotionalPurchaseFactor": "Brief explanation for emotional purchase factor rating",
    "familiarity": "Brief explanation for familiarity rating"
  }
}`;

    console.log("🤖 Calling OpenAI for marketing analysis...");

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
    console.log("✅ Marketing analysis completed");

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Marketing analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Marketing Analysis API is running",
    timestamp: new Date().toISOString(),
    description:
      "Analyzes product categories across 4 key marketing attributes: Visual Complexity, Decision Complexity, Emotional Purchase Factor, and Familiarity",
  });
}
