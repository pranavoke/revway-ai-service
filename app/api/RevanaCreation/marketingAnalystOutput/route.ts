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
    const {
      product_category,
      product_category_attributes,
      price_point,
      ad_story,
      lp_style,
    } = await request.json();

    if (
      !product_category ||
      !product_category_attributes ||
      !price_point ||
      !ad_story ||
      !lp_style
    ) {
      return NextResponse.json(
        {
          error:
            "Product category, category attributes, price point, ad story, and lp_style are required",
        },
        { status: 400 }
      );
    }

    console.log("🏗️ Landing Page Structure Analysis");
    console.log(`📦 Product Category: ${product_category}`);
    console.log(`📊 Category Attributes:`, product_category_attributes);
    console.log(`💰 Price Point: ${price_point}`);
    console.log(`🎨 LP Style: ${lp_style}`);
    console.log(`📖 Ad Story: ${ad_story.substring(0, 100)}...`);

    const userPrompt = `You are an expert marketing analyst tasked with determining the optimal landing page structure based on the following inputs:

- Product Category: ${product_category}
- Product Category Attributes:
   * Visual Complexity: ${
     product_category_attributes.visualComplexity ||
     product_category_attributes["Visual Complexity"]
   }
   * Decision Complexity: ${
     product_category_attributes.decisionComplexity ||
     product_category_attributes["Decision Complexity"]
   }
   * Emotional Purchase Factor: ${
     product_category_attributes.emotionalPurchaseFactor ||
     product_category_attributes["Emotional Purchase Factor"]
   }
   * Familiarity: ${
     product_category_attributes.familiarity ||
     product_category_attributes["Familiarity"]
   }
- Price Point: ${price_point}
- Ad Story: ${ad_story}
- lp_style: ${lp_style}

LP Style Definitions:
- pdp_style means for quick conversion with minimal persuasion
- regular_lp means balanced persuasion and explanation
- advertorial means deep storytelling and education for complex purchases

Based on these inputs, determine the following landing page structure elements:

1. Visual Density (visual_density): low / medium / high
   Consider visual complexity, ad story's emotional/visual richness

2. Cognitive Depth (cognitive_depth): shallow / moderate / deep
   Consider decision complexity, familiarity, ad story depth, and lp_style.

3. Content Length (content_length): short_form / mid_form / long_form
   Base this primarily on lp_style and refine based on visual_density:
     - For regular_lp, shift content length shorter if visual_density is high, longer if low.
     - For pdp_style and advertorial, keep content length fixed.

4. Expected Section Range (expected_section_range):
   - 6-7 for pdp_style
   - 7-8 for regular_lp
   - 10+ for advertorial

Return the analysis in this exact JSON format:
{
  "visual_density": "low|medium|high",
  "cognitive_depth": "shallow|moderate|deep",
  "content_length": "short_form|mid_form|long_form",
  "expected_section_range": "6-7|7-8|10+",
  "reasoning": {
    "visual_density_analysis": "Explanation of how visual complexity and ad story influenced visual density decision",
    "cognitive_depth_analysis": "Explanation of how decision complexity, familiarity, ad story depth, and lp_style influenced cognitive depth",
    "content_length_analysis": "Explanation of how lp_style and visual_density influenced content length decision",
    "section_range_analysis": "Explanation of how lp_style determined the expected section range"
  },
  "recommendations": {
    "visual_elements": "Specific recommendations for visual elements based on visual_density",
    "content_strategy": "Specific recommendations for content strategy based on cognitive_depth and content_length",
    "structure_guidance": "Specific recommendations for page structure based on expected_section_range"
  }
}`;

    console.log("🤖 Calling OpenAI for landing page structure analysis...");

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
    console.log("✅ Landing page structure analysis completed");

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Landing page structure analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Landing Page Structure Analysis API is running",
    timestamp: new Date().toISOString(),
    description:
      "Determines optimal landing page structure (visual density, cognitive depth, content length, section range) based on product category, attributes, price point, ad story, and lp_style",
    inputFields: {
      product_category: "string",
      product_category_attributes: {
        visualComplexity: "low|medium|high",
        decisionComplexity: "low|medium|high",
        emotionalPurchaseFactor: "low|medium|high",
        familiarity: "low|medium|high",
      },
      price_point: "low|medium|high",
      ad_story: "string",
      lp_style: "pdp_style|regular_lp|advertorial",
    },
    outputFields: {
      visual_density: "low|medium|high",
      cognitive_depth: "shallow|moderate|deep",
      content_length: "short_form|mid_form|long_form",
      expected_section_range: "6-7|7-8|10+",
    },
  });
}
