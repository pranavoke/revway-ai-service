import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { adStory, productUrl, prompt } = body;

    // Validate required inputs
    if (!adStory || !productUrl) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: ad, productUrl, and content are required",
        },
        { status: 400 }
      );
    }

    // Construct your prompt using the inputs
    const DESprompt = `I'm building a landing page for a product based on the given product URL.
You are provided with:

The product URL : ${productUrl}

Additional Client information : ${prompt}

An ad story : ${adStory}

I have already defined 5 sections for the landing page:

Intro section - This section incudes a product picture along with a header that is the header of entire landing page
Why Customers Love Us – this section includes customer testimonials in sync with the ad story
Shop Now – CTA for user to buy the product
Pair It With – CTA for user to buy a complementary product with a reason why to buy in pair
Collections – Curated collections products in sync with ad story and audience

Based on the ad story, identify 3 key *New* landing page sections that would 1) expand on the ad story and continue the ad narrative and 2) do not duplicate the purpose mentioned in the 5 sections already added and 3) the sections to be identified must be highly relevant to the ad story
For each section, define:
Purpose – What role this section plays in the landing page
Content Focus – What type of content is best suited for this section
Theme – The specific idea, promise, or message from the ad this section is based on

Choose sections that are most relevant to the ad’s core message and arrange them in order of importance.

Return in JSON format with the following structure : 
{
  "new_sections": [
    {
   
      "purpose": "",
      "content_focus": "",
      "theme": ""
    },
    ..similarly for other 2 sections
  ]
} `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: DESprompt,
        },
      ],
      response_format: { type: "json_object" },

      temperature: 0.9,
    });

    // Extract the response
    const aiResponse = completion.choices[0]?.message?.content;

    console.log("aiResponse", aiResponse);
    if (!aiResponse) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Attempt to parse the AI response so the client receives proper JSON
    let parsedResponse: any = null;

    try {
      // First try direct parsing
      parsedResponse = JSON.parse(aiResponse);
    } catch (err) {
      // If direct parsing fails, attempt to extract the first JSON object within the string
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (_) {
          parsedResponse = null;
        }
      }
    }

    if (parsedResponse) {
      // Return the parsed JSON directly (most desirable output)
      return NextResponse.json(parsedResponse);
    }

    // Fallback: return the raw string response and usage details
    return NextResponse.json({
      response: aiResponse,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("DirectEnhancedSections API Error:", error);

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "OpenAI API rate limit exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    message: "DirectEnhancedSections API endpoint is running",
    timestamp: new Date().toISOString(),
  });
}
