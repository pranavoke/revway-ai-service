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

    console.log("🎨 Layout Composition - Organizing module layout");
    console.log(`📦 Product URL: ${productUrl}`);
    console.log(`📋 Sections to layout: ${sections?.length || 0}`);

    const systemPrompt = `You are a layout composition expert. Organize modules into an optimal layout for maximum conversion.

Return the layout in this exact format:
{
  "success": true,
  "total_sections": 5,
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

Current sections to optimize layout for:
${JSON.stringify(sections, null, 2)}

Organize the modules into an optimal layout for conversion. Ensure proper visual hierarchy and flow.`;

    console.log("🤖 Calling OpenAI for layout composition...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
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
    console.log(
      `✅ Layout composition completed - ${
        parsed.total_sections || parsed.sections?.length || 0
      } sections`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Layout composition error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Layout Composition API is running",
    timestamp: new Date().toISOString(),
  });
}
