import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Landing page styles configuration
const landingPageStyles = {
  "PDP-style Landing Page": {
    definition:
      "A compact page designed for users who are close to making a decision. It provides only the most necessary information required for confirmation — in a structured, minimal format.",
    primaryPurpose:
      "Enable fast decision-making by reducing friction and cognitive load.",
    guidelines: [
      "1–2 brief sections",
      "Use clear, direct language",
      "Focus on clarity over persuasion",
      "Minimal narrative or background context",
    ],
  },
  "Regular Landing Page": {
    definition:
      "A balanced landing page that delivers moderate context and reasoning to help users understand the offering and feel confident to buy.",
    primaryPurpose:
      "Move a moderately interested user from consideration to commitment by offering enough information.",
    guidelines: [
      "2–3 sections",
      "Moderate detail per section",
      "Combination of facts, soft persuasion, and user-oriented reasoning",
    ],
  },
  "Advertorial-style Landing Page": {
    definition:
      "A long-form, editorial-style experience designed to capture attention, create curiosity, and build emotional resonance through progressive storytelling.",
    primaryPurpose:
      "Turn low-awareness or cold users into interested, emotionally engaged prospects through relatable narratives and immersive flow.",
    guidelines: [
      "4–5 sections",
      "Section length can vary, narrative transitions are important",
      "Allow use of metaphors, analogies, progressive storytelling, or contrast",
    ],
  },
};

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
    const { finalPrice, adStory, product_category, currency } =
      await request.json();

    if (!finalPrice) {
      return NextResponse.json(
        { error: "Product URL is required" },
        { status: 400 }
      );
    }

    console.log("🎯 Style Determination - Applying visual styles");
    console.log(`📦 Product URL: ${finalPrice}`);
    console.log(`📋 Product Category: ${product_category}`);
    console.log(`📖 Ad Story: ${adStory}`);

    const userPrompt = `
    The product is a ${finalPrice} ${currency} product.
    Product Category: ${product_category}
    Ad Story: ${adStory}

    Give me what should be the style of the landing page. Here are the 3 available styles:

    ${Object.entries(landingPageStyles)
      .map(
        ([styleName, styleConfig], index) => `
    ${index + 1}. ${styleName}
    Definition: ${styleConfig.definition}
    
    Primary Purpose: ${styleConfig.primaryPurpose}
    
    Guidelines:
    ${styleConfig.guidelines
      .map((guideline) => `• ${guideline}`)
      .join("\n    ")}
    `
      )
      .join("\n")}

    Please analyze the product information and recommend the most appropriate style with reasoning.

    Return the style in this exact JSON format:
    {
      "style": "Style Name"
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
    console.log(
      `✅ Style determination completed - ${
        parsed.total_sections || parsed.sections?.length || 0
      } sections`
    );

    // Extract the full style object based on the recommended style
    const recommendedStyleName = parsed.style;

    // Type guard to check if the style exists in our configuration
    const isValidStyle = (
      style: string
    ): style is keyof typeof landingPageStyles => {
      return style in landingPageStyles;
    };

    if (!isValidStyle(recommendedStyleName)) {
      console.error(
        `❌ Style "${recommendedStyleName}" not found in landingPageStyles`
      );
      return NextResponse.json(
        { error: `Invalid style recommendation: ${recommendedStyleName}` },
        { status: 400 }
      );
    }

    const styleConfig = landingPageStyles[recommendedStyleName];

    // Return the complete style object with the recommendation
    const result = {
      style: recommendedStyleName,
      styleConfig: styleConfig,
      reasoning: parsed.reasoning || "No reasoning provided",
    };

    console.log(
      `✅ Style determination completed - Recommended: ${recommendedStyleName}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Style determination error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Style Determination API is running",
    timestamp: new Date().toISOString(),
  });
}
