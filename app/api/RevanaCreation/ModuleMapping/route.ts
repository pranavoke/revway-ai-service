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
    const { productUrl, contentBlocks } = await request.json();

    if (!productUrl || !contentBlocks) {
      return NextResponse.json(
        { error: "Product URL and content blocks are required" },
        { status: 400 }
      );
    }

    console.log("🔧 Module Mapping - Converting content to modules");
    console.log(`📦 Product URL: ${productUrl}`);
    console.log(`📋 Content blocks to convert: ${contentBlocks?.length || 0}`);

    const systemPrompt = `You are a module mapping expert. Convert content blocks into structured UI modules using ONLY the existing module types.

EXACT MODULE TYPES (use only these):

1. TEXT Modules:
   - HEADER: Main section titles
   - SUB_HEADER: Secondary titles  
   - PARAGRAPH: Body text content
   - CTA: Call-to-action text
   - SHOP_NOW: Product purchase CTAs

2. LIST Modules:
   - BULLET_POINTS: Simple bullet lists
   - BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with explanations

3. TESTIMONIAL Modules:
   - TESTIMONIAL_1: Customer reviews/testimonials

4. MEDIA Modules:
   - IMAGE: Single images
   - VIDEO: Video content
   - IMAGE_CAROUSEL: Multiple images

5. TABLE Modules:
   - TABLE_1: Three-column tables
   - TABLE_2: Two-column tables

CRITICAL FIELD MAPPINGS:
- TEXT type → uses 'content' field 
- LIST type → uses 'bulletPoints' field
- TESTIMONIAL type → uses 'testimonials' field
- MEDIA type → uses 'mediaList' field
- TABLE type → uses 'table' field

Return modules in this exact format:
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

Content blocks to convert to modules:
${JSON.stringify(contentBlocks, null, 2)}

Convert each content block into appropriate modules. Create a HEADER module for each section, then convert the content appropriately.`;

    console.log("🤖 Calling OpenAI for module mapping...");

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
      `✅ Module mapping completed - ${
        parsed.total_sections || parsed.sections?.length || 0
      } sections`
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Module mapping error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Module Mapping API is running",
    timestamp: new Date().toISOString(),
  });
}
