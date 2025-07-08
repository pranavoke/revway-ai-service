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
    const { productUrl, prompt, adStory } = await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log("📋 Section Planning - Starting structure planning");
    console.log(`📦 Product URL: ${productUrl}`);

    const systemPrompt = `You are a landing page structure expert. Create a comprehensive section plan for a product landing page.

Return sections in this exact format:
{
  "success": true,
  "total_sections": 5,
  "sections": [
    {
      "section_name": "Hero Section",
      "section_purpose": "Grab attention and introduce the product",
      "section_order": 1,
      "content_type": "hero"
    }
  ]
}`;

    const userPrompt = `Product URL: ${productUrl}
${prompt ? `Additional context: ${prompt}` : ""}
${adStory ? `Ad story: ${adStory}` : ""}

Create 4-6 sections for an effective product landing page. Include variety in content types.`;

    console.log("🤖 Calling OpenAI for section planning...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
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
      `✅ Section planning completed - ${
        parsed.total_sections || parsed.sections?.length || 0
      } sections`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Section planning error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Section Planning API is running",
    timestamp: new Date().toISOString(),
  });
}
