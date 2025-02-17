import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export const ContentBlockSchema = z.object({
  section_name: z.string(),
  contentBlocks: z.array(
    z.union([
      z.object({
        type: z.literal("landingpage_tagline"),
        content: z.string(),
      }),
      z.object({
        type: z.literal("header"),
        content: z.string(),
      }),
      z.object({
        type: z.literal("section_subheader"),
        content: z.string(),
      }),
      z.object({
        type: z.literal("paragraph"),
        content: z.string(),
      }),
      z.object({
        type: z.literal("bullets"),
        content: z.array(
          z.object({
            bulletPoint: z.string().optional(),
            supportingText: z.string().optional(),
          })
        ),
      }),
      z.object({
        type: z.literal("testimonials"),
        content: z.array(
          z.object({
            author: z.string().optional(),
            quote: z.string(),
          })
        ),
      }),
      z.object({
        type: z.literal("table"),
        content: z.object({
          headers: z.array(z.string()),
          rows: z.array(z.array(z.string())),
        }),
      }),
    ])
  ),
});

export const SectionSchema = z.object({
  sections: z.array(ContentBlockSchema),
});
type ContentBlock =
  | { type: "landingpage_tagline"; content: string }
  | { type: "header"; content: string }
  | { type: "section_subheader"; content: string }
  | { type: "paragraph"; content: string }
  | {
      type: "bullets";
      content: { bulletPoint: string; supportingText: string }[];
    }
  | { type: "testimonials"; content: { author: string; quote: string }[] }
  | { type: "table"; content: { headers: string[]; rows: string[][] } };

type Section = {
  section_name: string;
  contentBlocks: ContentBlock[];
};

// Utility function to count words
function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

// Function to calculate word count
function calculateContentWordCount(sections: Section[]): number {
  let totalWordCount = 0;

  sections.forEach((section) => {
    section.contentBlocks.forEach((contentBlock) => {
      switch (contentBlock.type) {
        case "landingpage_tagline":
        case "header":
        case "section_subheader":
        case "paragraph":
          totalWordCount += countWords(contentBlock.content);
          break;

        case "bullets":
          contentBlock.content.forEach((bullet) => {
            if (bullet.bulletPoint) {
              totalWordCount += countWords(bullet.bulletPoint);
            }
            if (bullet.supportingText) {
              totalWordCount += countWords(bullet.supportingText);
            }
          });
          break;

        case "testimonials":
          contentBlock.content.forEach((testimonial) => {
            if (testimonial.author) {
              totalWordCount += countWords(testimonial.author);
            }
            if (testimonial.quote) {
              totalWordCount += countWords(testimonial.quote);
            }
          });
          break;

        case "table":
          contentBlock.content.headers.forEach((header) => {
            totalWordCount += countWords(header);
          });
          contentBlock.content.rows.forEach((row) => {
            row.forEach((cell) => {
              totalWordCount += countWords(cell);
            });
          });
          break;

        default:
          console.warn(`Unknown content block type: ${contentBlock}`);
          break;
      }
    });
  });

  return totalWordCount;
}
const LandingPage = `Your Hair Deserves the Best – Discover Vilvah’s Hair Growth Oil!
Are you ready to transform your hair care routine? Say goodbye to lifeless locks and hello to thick, long, and strong hair with Vilvah’s Hair Growth Oil! Powered by the goodness of nature, this revolutionary formula nourishes your scalp, strengthens your strands, and promotes natural hair growth with every use.

Why Choose Vilvah Hair Growth Oil?
🌿 Nature-Powered Formula
Our Hair Growth Oil combines the best of natural ingredients, carefully chosen to deliver visible results:

Pumpkin Seed Oil: Packed with nutrients to boost hair growth naturally.
Kalonji Oil: Energizes and stimulates your hair follicles for healthier growth.
Castor Oil: Strengthens your hair, reducing breakage and split ends.
💧 Lightweight & Non-Greasy
Perfect for all hair types, Vilvah’s Hair Growth Oil is easily absorbed, leaving no residue behind – just silky, nourished hair!

💖 Proven Benefits with Regular Use

Accelerates hair growth.
Improves thickness and volume.
Repairs and revitalizes damaged hair.
How to Use?
Warm a small amount of oil between your palms.
Gently massage it into your scalp and hair, focusing on the roots.
Leave it overnight or for at least 2 hours before washing.
Repeat 2–3 times a week for best results.
Special Offer – Buy Now for Only ₹650!
Elevate your hair care game with Vilvah Hair Growth Oil, priced at an irresistible ₹650. Start your journey to healthier hair today!

📦 Fast Shipping
🛡️ Secure Payments
💯 Satisfaction Guaranteed

Shop Now and Embrace Your Best Hair Yet!
👉 Click Here to Buy

Don't wait – your dream hair is just one step away!

Customer Testimonials
🌟 "I've been using Vilvah Hair Growth Oil for a month, and my hair has never felt this thick and soft!" – Aditi
🌟 "The natural ingredients make all the difference. My hair fall reduced drastically!" – Rajeev
🌟 "I love how non-sticky it is. My hair feels amazing!" – Sneha

Frequently Asked Questions
Q: Is this suitable for all hair types?
A: Absolutely! Vilvah Hair Growth Oil works wonders on all hair types, including curly, straight, and chemically treated hair.

Q: How soon can I see results?
A: With regular use, most users see visible improvement in hair growth and texture within 4–6 weeks.

Q: Does it have any artificial additives?
A: No, our formula is 100% natural, free from harmful chemicals, and cruelty-free.

Transform your hair care routine and let nature work its magic. Order Vilvah Hair Growth Oil now!`;

export async function POST(request: NextRequest) {
  try {
    const { url, Ad, Audience, Framework } = await request.json();

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

    const GenerateLandingPagePrompt = `

      I am giving you a URL of a Product : ${url} ,
      Ad : ${Ad} ,
      Audience : ${Audience} ,
      Framework : ${Framework.Framework} ,
      Layout : ${Framework.Layout[0]} ,

      Generate a detailed Landing Page for this Product .

      `;

    const completionP = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: GenerateLandingPagePrompt,
        },
      ],
      temperature: 1,
      model: "gpt-4o",
    });

    const GenerateLandingPagePromptResponse =
      completionP.choices[0].message?.content || "";

    console.log(
      "CreatingLabelsPrompt Response",
      GenerateLandingPagePromptResponse
    );

    const CreatingLabelsPrompt = `

      Landing Page : ${GenerateLandingPagePromptResponse}

     Divide in different sections as section X , X being the no. and then
     Label the content provided by you by following these tags . If any tag is missing do not insert one .Also there can be multiple tags in each section .  insert the tag infront of the content
     Do not modify or change the content .

      "Landing page headline"
      "section header": this introduces a new section . This defines the new section ,
      "paragraph",
      "section subheader" : this come when we want to label the data but not as bold as header
      "bullets(main label) :{bulletpoints(label) , supporting text(label)} "
      "testimonials",
      "table",
      "image",
      "video",
      "cta",
      "button",

      bulletPoints :
        Here we want to label those with bullet points which are crisp short everything else goes to Supporting text . if you can't find crisp bullet points add them in supporting texts .
        in case there is no supporting text add empty string for supporting text . length of bullet points can by anythng .

      `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: CreatingLabelsPrompt,
        },
      ],
      temperature: 1,
      model: "gpt-4o",
    });

    const CreatingLabelsPromptResponse =
      completion.choices[0].message?.content || "";

    console.log("CreatingLabelsPrompt Response", CreatingLabelsPromptResponse);

    const RemovingContentPrompt = `

      ${CreatingLabelsPromptResponse}

      If you find any of these following things can you please remove from raw content . Also do not modify any content .

      1. Offer
      2. CTA
      3.  Customer Reviews
      4. Contact details , Email none is required .
      5. Images
      6. Videos
      7. Any Section related to Conclusion or Summarry of the blog .
      8. Any section that encourages user to visit website , social media pages etc .

      `;

    const completion3 = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: RemovingContentPrompt,
        },
      ],
      temperature: 1,
      model: "gpt-4o",
    });

    const RemovingContentPromptResponse =
      completion3.choices[0].message?.content || "";

    console.log(
      "RemovingContentPrompt Response",
      RemovingContentPromptResponse
    );
    const FinalSchemaPrompt = `

      This is my Landing page raw content : ${RemovingContentPromptResponse}

      This is the Full detailed content of a website with Labels in it. Convert this into a schema format which can be passed to a React component . Ignore all those content which you won't add into the website .

      Each section can constitue of these optional things :
      section name : section X , X being the no. already provided .Mandatory
     "Landing page headline"
     "section header": this introduces a section,
     "paragraph",
     "section subheader" :this come inside the section ,when we want to highlight the data but not as bold as header
      "bulletPoints",
      "testimonials",
      "table",

      `;

    const completion2 = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: FinalSchemaPrompt,
        },
      ],
      model: "gpt-4o",
      temperature: 1,
      response_format: zodResponseFormat(SectionSchema, "contentBlocks"),
    });

    const FinalSchemaPromptresponse =
      completion2.choices[0].message?.content || "";

    const ParseFinalSchema = JSON.parse(FinalSchemaPromptresponse);
    let ValidatedFinalSchema = SectionSchema.parse(ParseFinalSchema);

    const totalWordCount = calculateContentWordCount(
      ValidatedFinalSchema.sections as any
    );
    console.log("Total Word Count", totalWordCount);
    if (totalWordCount > 400) {
      const p = `We want to create the landing page to be of 200 to 300 words the current landing page generated as below is  ${totalWordCount} no. of words . The no. of words used in the landing page .
      ${JSON.stringify(ValidatedFinalSchema)}
      constraints
      the structure of landing page remain exactly same as it is .

      the ocntext of the  LP should not be altered

      you should priortise to keep important information as much as possible .

      All headers should be as crisp and short as possible with out losing it’s meaning .

      other element you may choose to alter their lengths based on your judgement .`;

      const completion4 = await openai.beta.chat.completions.parse({
        messages: [
          {
            role: "user",
            content: p,
          },
        ],
        temperature: 1,
        model: "gpt-4o",
        response_format: zodResponseFormat(SectionSchema, "contentBlocks"),
      });
      const Finalresponse = completion4.choices[0].message?.content || "";

      const ParseFinalRes = JSON.parse(Finalresponse);
      ValidatedFinalSchema = SectionSchema.parse(ParseFinalRes);
    }
    const section = { sections: ValidatedFinalSchema };
    console.log("FinalSchemaPrompt Response", JSON.stringify(section));

    return NextResponse.json("section", { status: 200 });
  } catch (e: any) {
    console.error("Automatsion API Error", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
