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
    const { productUrl, sections } = await request.json();

    if (!productUrl || !sections) {
      return NextResponse.json(
        { error: "Product URL and sections are required" },
        { status: 400 }
      );
    }

    console.log("🚀 Final Rendering - Creating final landing page");
    console.log(`📦 Product URL: ${productUrl}`);
    console.log(`📋 Sections to finalize: ${sections?.length || 0}`);

    const systemPrompt = `You are a landing page rendering expert. Create a final landing page with an engaging title and optimized sections.

Return the final landing page in this exact format (CRITICAL - must match MasterApiV2 output):
{
  "success": true,
  "title": "Compelling Product Landing Page Title",
  "sections": [
    {
      "sectionTitle": "Section Name",
      "totalModules": 3,
      "moduleCounts": {"TEXT": 2, "LIST": 1},
      "modules": [
        {
          "type": "TEXT",
          "subtype": "HEADER",
          "content": "Section header"
        }
      ]
    }
  ]
}`;

    const userPrompt = `Product URL: ${productUrl}

Final sections to render:
${JSON.stringify(sections, null, 2)}

Create a final landing page with:
1. A compelling, SEO-friendly title for the entire landing page
2. Optimized sections with proper module organization
3. Final quality checks and improvements`;

    console.log("🤖 Calling OpenAI for final rendering...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
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
    console.log(`✅ Final rendering completed - "${parsed.title}"`);
    console.log(`📊 Final sections: ${parsed.sections?.length || 0}`);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Final rendering error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Rendering API is running",
    timestamp: new Date().toISOString(),
  });
}
