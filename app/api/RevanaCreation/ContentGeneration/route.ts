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
    const { productUrl, prompt, adStory, sectionPlan } = await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log("✍️ Content Generation - Starting content creation");
    console.log(`📦 Product URL: ${productUrl}`);
    console.log(`📋 Sections to generate: ${sectionPlan?.length || 0}`);

    const systemPrompt = `You are a content generation expert. Create engaging, conversion-focused content for landing page sections.

Return content in this exact format:
{
  "success": true,
  "total_content_blocks": 5,
  "contentBlocks": [
    {
      "section_name": "Hero Section",
      "section_order": 1,
      "content": {
        "header": "Main compelling headline",
        "subheader": "Supporting value proposition",
        "body": "Detailed content that converts"
      }
    }
  ]
}`;

    const userPrompt = `Product URL: ${productUrl}
${prompt ? `Additional context: ${prompt}` : ""}
${adStory ? `Ad story: ${adStory}` : ""}

Section Plan to create content for:
${JSON.stringify(sectionPlan, null, 2)}

Create compelling, conversion-focused content for each planned section. Make it engaging and persuasive.`;

    console.log("🤖 Calling OpenAI for content generation...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
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
      `✅ Content generation completed - ${
        parsed.total_content_blocks || parsed.contentBlocks?.length || 0
      } content blocks`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Content generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Content Generation API is running",
    timestamp: new Date().toISOString(),
  });
}
