import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { AIDA } from "../../../lib/data/Frameworks/AIDA";
export const DampnersType = {
  sections: [
    {
      type: "Ingredient Transparency",
      header: "What's inside and why it Works!",
      components: [
        {
          ingredient: "string",
          source: "string",
          benefit: "string",
          safety: "string",
        },
      ],
    },
    {
      type: "Effectiveness and Time to See Results",
      header: "What to expect and when",
      components: [
        {
          benefit: "string",
          timeline: "string (in weeks or months)",
        },
      ],
    },

    {
      type: "Suitability for Specific Skin Types and Conditions",
      header: "What to expect and when",
      components: [
        {
          Skin_Type: "string",
          Compatibility_Rating: "string",
        },
      ],
    },
    {
      type: "US v/s Them",
      header: "What makes us unique!",
      components: [
        {
          feature: "string",
          us: "string",
          them: "string",
        },
      ],
    },
  ],
};
export const DampnersZod = z.object({
  sections: z.array(
    z.object({
      type: z.enum([
        "Ingredient Transparency",
        "Effectiveness and Time to See Results",
        "Suitability for Specific Skin Types and Conditions",
      ]),
      header: z.string(),
      components: z.array(
        z.object({
          ingredient: z.string().optional(),
          source: z.string().optional(),
          benefit: z.string().optional(),
          safety: z.string().optional(),
          Skin_Type: z.string().optional(),
          Compatibility_Rating: z.string().optional(),
          timeline: z.string().optional(),
        })
      ),
    })
  ),
});
export const AIDAZod = z.object({
  LandingPage: z.literal("AIDA"),
  sections: z.array(
    z.object({
      type: z.enum(["Attention", "Interest", "Desire"]),
      components: z.object({
        header: z.string(),
        points: z
          .array(
            z.object({
              type: z.string(),
              header: z.object({
                type: z.string(),
              }),
              supportingText: z.object({
                type: z.string(),
              }),
            })
          )
          .optional(),
      }),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const { url, Ad, Audience, Framework, productDescription } =
      await request.json();

    if (!Ad) {
      return NextResponse.json({ error: "Ad is required" }, { status: 400 });
    }
    if (!Audience) {
      return NextResponse.json(
        { error: "Audience is required" },
        { status: 400 }
      );
    }
    const openai = new OpenAI();
    //     const prompt = `

    //   I am creating a ${JSON.stringify(Framework)} based Landing page .
    //   Here is the layout of the ${JSON.stringify(Framework)} :

    //   ${JSON.stringify(AIDA)}

    //   Ad Content: ${JSON.stringify(Ad)}
    //   Audience Segment: ${JSON.stringify(Audience)}

    //   Product Description: ${JSON.stringify(productDescription)}

    //   Each section and sub sections should engage the audience by linking as much as possible directly to the AD Content. Keep each point concise and impactful, emphasizing qualities that resonate with the primary selling points in the AD content. The objective of the Landing Page is to sell the product to the audience.

    // `;

    //     console.log("Prompt", prompt);

    //     const completion = await openai.chat.completions.create({
    //       messages: [
    //         {
    //           role: "user",
    //           content: prompt,
    //         },
    //       ],
    //       model: "gpt-4o-2024-08-06",
    //       temperature: 0.5,
    //     });

    //     const responseContent = completion.choices[0].message?.content || "";
    //     console.log("Response", responseContent);

    //     const prompt2 = `
    //     convert this into schema and change nothing .

    //      ${responseContent}

    //     `;

    //     const completionSchema = await openai.beta.chat.completions.parse({
    //       messages: [
    //         {
    //           role: "user",
    //           content: prompt2,
    //         },
    //       ],
    //       model: "gpt-4o-2024-08-06",
    //       temperature: 0.2,
    //       response_format: zodResponseFormat(AIDAZod, "LandingPage"),
    //     });
    //     const responseContentSchema =
    //       completionSchema.choices[0].message?.content || "";

    //     console.log("Response", responseContentSchema);
    //     const parsedResponse = JSON.parse(responseContentSchema);
    //     const validatedResponse = AIDAZod.parse(parsedResponse);
    //     console.log("Validated Response", validatedResponse);
    //   const prompt3 = `

    //   This is my AIDA based Landing Page.

    //   ${JSON.stringify(validatedResponse.LandingPage)}

    // Please tell me which of the following dampners are not covered in the landing page.

    //  ${JSON.stringify(DampnersType)}

    //   `;
    const landingPage = {
      LandingPage: "AIDA",
      sections: [
        {
          type: "Attention",
          components: {
            header:
              "Discover the Secret to Silky Soft Skin with Vilvah's Milk Body Lotion!",
            points: [],
          },
        },
        {
          type: "Interest",
          components: {
            header: "Why Choose Vilvah's Milk Body Lotion?",
            points: [
              {
                type: "Interest",
                header: { type: "Toddler-Friendly & Safe for All Ages" },
                supportingText: {
                  type: "Our lotion is gentle enough for toddlers yet effective for adults, ensuring safety and nourishment for everyone aged 2 and above.",
                },
              },
              {
                type: "Interest",
                header: { type: "Targets Problem Areas Effectively" },
                supportingText: {
                  type: "Say goodbye to rough knees, elbows, and back-acne with our targeted formula designed to combat dryness and skin aging.",
                },
              },
              {
                type: "Interest",
                header: { type: "Fast Absorbing & Lightweight" },
                supportingText: {
                  type: "Experience the non-greasy, fast-absorbing texture that leaves your skin feeling supple and hydrated for 48 hours.",
                },
              },
            ],
          },
        },
        {
          type: "Desire",
          components: {
            header: "Indulge in the Benefits of Our Premium Ingredients",
            points: [
              {
                type: "Desire",
                header: { type: "Intense Moisturization with Natural Oils" },
                supportingText: {
                  type: "Olive Squalane, Coconut Oil, and Jojoba Oil work together to mimic your skin’s natural oils, offering deep moisturization and enhanced texture.",
                },
              },
              {
                type: "Desire",
                header: { type: "Skin Firming & Barrier Protection" },
                supportingText: {
                  type: "Our blend of ceramides and oat milk helps maintain skin firmness and prevent moisture loss, keeping your skin healthy and protected.",
                },
              },
              {
                type: "Desire",
                header: { type: "No Cheap Fillers, Only Quality Ingredients" },
                supportingText: {
                  type: "Free from silicones, mineral oils, and petrolatums, our lotion is crafted with high-quality, plant-derived ingredients for maximum efficacy.",
                },
              },
            ],
          },
        },
      ],
    };
    const prompt3 = `
    
    This is product : ${JSON.stringify(url)}

   Please create this particular dampners section for the product .

    ${JSON.stringify(DampnersType.sections[3])}

    
    `;

    const dampners = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt3,
        },
      ],
      model: "gpt-4o-2024-08-06",
      temperature: 0.5,
    });

    const dampnersContent = dampners.choices[0].message?.content || "";
    console.log("Dampners", dampnersContent);

    return NextResponse.json(dampnersContent, { status: 200 });
  } catch (e: any) {
    console.error("getHeader API Error", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
