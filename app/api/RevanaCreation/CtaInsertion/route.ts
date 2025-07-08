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

    console.log("🎯 CTA Insertion - Adding strategic call-to-actions");
    console.log(`📦 Product URL: ${productUrl}`);
    console.log(`📋 Sections to enhance: ${sections?.length || 0}`);

    const systemPrompt = `You are a CTA insertion expert. Add strategic call-to-action modules to landing page sections for maximum conversion.

Return the sections with CTAs in this exact format:
{
  "success": true,
  "total_sections": 5,
  "sections": [
    {
      "sectionTitle": "Section Name",
      "totalModules": 4,
      "moduleCounts": {"TEXT": 3, "LIST": 1},
      "modules": [
        {
          "type": "TEXT",
          "subtype": "HEADER",
          "content": "Section header"
        },
        {
          "type": "TEXT",
          "subtype": "CTA",
          "content": "Shop Now"
        }
      ]
    }
  ]
}`;

    const userPrompt = `Product URL: ${productUrl}

Current sections to add strategic CTAs to:
${JSON.stringify(sections, null, 2)}

Add strategic CTA modules to optimize conversions. Place CTAs at natural conversion points.`;

    console.log("🤖 Calling OpenAI for CTA insertion...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
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
      `✅ CTA insertion completed - ${
        parsed.total_sections || parsed.sections?.length || 0
      } sections`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ CTA insertion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "CTA Insertion API is running",
    timestamp: new Date().toISOString(),
  });
}
