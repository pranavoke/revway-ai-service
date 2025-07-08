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
    const { productUrl } = await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log("🎯 Category Determination ");
    console.log(`📦 Product URL: ${productUrl}`);

    const userPrompt = `Product URL: ${productUrl}
    Identify the category of the product based on the product URL.
    Return the category in this exact JSON format:
    {
      "category": "Category Name"
    }
   `;

    console.log("🤖 Calling OpenAI for style determination...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.5,
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
    console.log(`✅ Category determination completed - ${parsed.category}`);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Category determination error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Category Determination API is running",
    timestamp: new Date().toISOString(),
  });
}
