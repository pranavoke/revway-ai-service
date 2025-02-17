import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const ReviewResponseSchema = z.object({
  reviews: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const { Reviews } = await request.json();

    const TEMPLATE = `
      Give me top reviews from the Reviews Set .Reviews which talk about the  benefits of the product should be ranked higher . Consider Reviews between 10 to 40 words ! . 
     
      Reviews : ${JSON.stringify(Reviews)}
    `;

    console.log("Generated Prompt: ", TEMPLATE);

    const openai = new OpenAI();

    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: TEMPLATE,
        },
      ],
      model: "gpt-4o-2024-08-06",
      temperature: 0.2,
      response_format: zodResponseFormat(
        ReviewResponseSchema,
        "ReviewResponse"
      ),
    });

    const responseContent = completion.choices[0].message?.content || "";

    const parsedResponse = JSON.parse(responseContent);

    const validatedResponse = ReviewResponseSchema.parse(parsedResponse);

    return NextResponse.json(validatedResponse);
  } catch (e: any) {
    console.error("API Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
