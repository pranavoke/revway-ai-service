import { SectionProps } from "@/components/Section";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export const ContentBlockSchema = z.object({
  type: z.enum([
    "header",
    "subheader",
    "paragraph",
    "bulletPoints",
    "testimonials",
    "table",
    "image",
    "video",
    "cta",
    "button",
  ]),
  content: z.string().optional(),
  bullets: z
    .array(
      z.object({
        bulletPoint: z.string(),
        supportingText: z.string(),
      })
    )
    .optional(),
  testimonials: z
    .array(
      z.object({
        author: z.string().optional(),
        quote: z.string(),
      })
    )
    .optional(),
  table: z
    .object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })
    .optional(),
  image: z
    .object({
      url: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
  video: z
    .object({
      url: z.string(),
      title: z.string().optional(),
    })
    .optional(),
  cta: z
    .object({
      text: z.string(),
      url: z.string(),
    })
    .optional(),
  button: z
    .object({
      text: z.string(),
      url: z.string(),
    })
    .optional(),
});

export const SectionSchema = z.object({
  contentBlocks: z.array(ContentBlockSchema),
});

const LandingPage = `Here’s a professionally written advertorial landing page for your ad content, designed to attract attention, provide information, and drive conversions.

🌟 Transform Your Curls with Vilvah’s Goat Milk Shampoo 🌟

❤️ Curls deserve the best care!
Experience a revolution in hair care with Vilvah's Goat Milk Shampoo – now at an irresistible FLAT 20% OFF!

Why You’ll Love It:
🌱 Zero Chemicals: Because your hair deserves pure, natural nourishment.
✨ 5x Less Frizz in Just 1 Wash: See the difference after the first use.
💃 Bounce & Shine: Enjoy defined, bouncy curls in just a few washes!
Your Journey to Perfect Curls Starts Here
Healthy hair isn’t just about appearance; it’s about long-term care. Vilvah’s Goat Milk Shampoo is packed with the goodness of goat milk, designed to hydrate, strengthen, and transform your curls with every wash.

What Makes Goat Milk So Special?
Deep hydration for dry, frizzy hair
Rich in vitamins and nutrients for scalp health
Gentle cleansing without stripping natural oils
Don’t Miss Out – Give Your Hair the Love It Deserves
This is your chance to invest in your curls! With FLAT 20% OFF, there’s no better time to make the switch to a healthier, chemical-free hair care routine.

🛒 Shop Now

Rave Reviews from Happy Customers
"My curls have never felt this soft and manageable! Truly a game-changer." – Priya R.
"Frizz-free and bouncy – just like they promised. Absolutely in love!" – Sneha T.

What Are You Waiting For?
Your dream curls are just one wash away. Order Now and save big while making your hair healthier, shinier, and frizz-free.

🎉 Buy Now – FLAT 20% OFF

💌 Limited time offer. Grab yours before it’s gone!`;

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

    const CreatingIndexesPrompt = `

    ${LandingPage}

    Can you give me index for the content in terms of section, sub-section, sub-sub-section whenever applicable and name the index?
  
    Provide with numbered index and you should index every thing . 
    like 1 , 1.1 , 1.1.1 and so on . 
    `;

    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: CreatingIndexesPrompt,
        },
      ],
      model: "gpt-4o-2024-08-06",
    });

    const CreatingIndexesPromptresponse =
      completion.choices[0].message?.content || "";
    console.log(
      "CreatingIndexesPrompt Response",
      CreatingIndexesPromptresponse
    );

    const FillingTheIndexesPrompt = ` 
    This is my landing page : ${LandingPage}

    Can you fit the content into these indexes and give me the revise content . Do not change the content just fit it into the indexes .Add the whole content as it is but with indexes .

    ${CreatingIndexesPromptresponse}
    
    `;

    const completion2 = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: FillingTheIndexesPrompt,
        },
      ],
      model: "gpt-4o-2024-08-06",
    });

    const FillingTheIndexesPromptresponse =
      completion2.choices[0].message?.content || "";

    console.log(
      "FillingTheIndexesPrompt Response",
      FillingTheIndexesPromptresponse
    );

    const ClassificationPrompt = `
    This is my Full Landing page content : ${FillingTheIndexesPromptresponse}


    I am giving you a content in indexed format. Can you give the classification in the content based on the following- 

        | "header"
        | "subheader"
        | "paragraph"
        | "bulletPointsWithHeader" :{
            "bullet_header" : "string",
            "supportingText" : "string"
        }
        | "testimonials"
        | "table"
        | "image"
        | "video"
        | "cta" 
        | "button"

        Here are some indexes definition : 

        Header / SubHeader:
        A single line that acts as a title or label for a section, sub-section, sub-sub-section
        No accompanying line break between the header and the text following it.

        Paragraph:
        Composed of one or more sentences without line breaks between them.

        bulletPoints with supporting text : [
          Supporting text refers to any text that provides additional context or information to the bullet points. in case there is no supporting text return empty string for supporting text . length of bullet points can by anythng .

        ]
     

        give full content as it is but mention the classification of each content block.
    

    
    `;
    const completion3 = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: ClassificationPrompt,
        },
      ],
      model: "gpt-4o-2024-08-06",
    });

    const ClassificationPromptresponse =
      completion3.choices[0].message?.content || "";

    console.log(ClassificationPromptresponse);

    const FinalSchemaPrompt = `
    

    This is my classified content : ${ClassificationPromptresponse}

    This is the Indexed content of a website . Convert this into a schema format which can be passed to a component . Ignore all those content which you won't add into the website . 
   
    bulletPoints with supporting text : [
          Supporting text refers to any text that provides additional context or information to the bullet points. in case there is no supporting text return empty string for supporting text . length of bullet points can by anythng .

        ]
    
    

    `;

    const completion4 = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: FinalSchemaPrompt,
        },
      ],
      model: "gpt-4o-2024-08-06",
      response_format: zodResponseFormat(SectionSchema, "contentBlocks"),
    });

    const FinalSchemaPromptresponse =
      completion4.choices[0].message?.content || "";

    const ParseFinalSchema = JSON.parse(FinalSchemaPromptresponse);
    const ValidatedFinalSchema = SectionSchema.parse(ParseFinalSchema);

    const section = { sections: ValidatedFinalSchema };
    console.log("FinalSchemaPrompt Response", JSON.stringify(section));

    return NextResponse.json("section", { status: 200 });
  } catch (e: any) {
    console.error("Automatsion API Error", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
