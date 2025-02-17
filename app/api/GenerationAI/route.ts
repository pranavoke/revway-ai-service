import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { sectionPrompts } from "@/lib/data/SectionsPrompts";
import { fetchProduct } from "@/lib/fetchClipToCart";
const questionTitles: Record<string, string> = {
  q1: "What would the Landing Page be about?",
  q2_single: "Please share the product URL?",
  q3_framework: "Choose the Relevant Framework",
  q4_problem_solution:
    "Would you want this for specific Audience Profile (By demography, Gender, Age, Location etc.)",
  q5_problem_solution_specific_audience: "Please share about audience profile",
  q6_problem_solution: "Select Your Audience Familiarity with the Problem",
  q7_problem_solution_alternative_solutions:
    "Please share what could be called as Alternative solutions?",
  q4_transformation: "Who is the Satisfied user?",
  q5_transformation_story: "How many Stories?",
  q6_transformation: "Persona of the Satisfied user?",
  q7_transformation: "Familiarity of Satisfied user?",
  q4_expert_recommended: "Who is the Expert?",
  q5_expert_recommended: "Expert Profile",
  q4_myth_busting: "What broad misconception you want to address?",
  q5_myth_busting: "Enter the myth you want to address",
  q4_reasons_why: "Share 3-5 reasons",
  q5_reasons_why: "Share the Header",
  q4_ingredient_based: "How many Key Ingredients?",
  q5_ingredient_based: "Share list of Key Ingredients",
};

const sectionFinders: Record<string, string[]> = {
  "Audience used competitive product before or using now": [
    "Frustration with Competitive Products",
    "How the Product solves the problems",
    "Benefits (Why choose)",
    "Why better than competitors?",
  ],
  "Audience used Alternative Solutions before or are using now": [
    "Frustration with Alternative Solutions",
    "How the Product solves the problems",
    "Benefits (Why choose)",
    "Why better than Alternative Solutions?",
  ],
  "Audience thinks the problem is important but never used any solutions": [
    "How the Product solves the problems",
    "Benefits (Why choose)",
  ],
  "Keeping it Genric": [
    "How the Product solves the problems",
    "Benefits (Why choose)",
  ],
  "Audience is aware of Problem but does not think it is important": [
    "Potential Worsening of the Problems",
    "How the Product solves the problems",
    "Benefits (Why choose)",
  ],
  "Used competitive products before": [
    "Challenge faced (including frustration with competitive products)",
    "Transformation post product use",
    "Benefits (Why choose)",
  ],
  "Used Alternative solutions before": [
    "Challenge faced (including frustration with Alternative Solutions)",
    "Transformation post product use",
    "Benefits (Why choose)",
  ],
  "Never used anything before": [
    "Challenge faced",
    "Transformation post product use",
    "Benefits (Why choose)",
  ],
  Influencer: ["Why the Expert Recommend", "Benefits (Why choose)"],
  Dermatologist: ["Why the Expert Recommend", "Benefits (Why choose)"],
  Doctor: ["Why the Expert Recommend", "Benefits (Why choose)"],
};

const sectionLayouts: Record<string, string[]> = {
  "How the Product solves the problems": [
    "Header",
    "List of Bullet Point (Problem and then solution)",
  ],
  "Frustration with Competitive Products": ["Header", "Text", "Bullet Points"],
  "Frustration with Alternative Solutions": ["Header", "Text", "Bullet Points"],
  "Problem worsening in future": ["Header", "Text", "Bullet Points"],
  "Benefits (Why choose)": [
    "Header",
    "List of Bullet Point (Benefit and supporting text)",
  ],
  "Why better than competitors?": [
    "Header",
    "Feature",
    "Our Product",
    "Competitor",
  ],
  "Why better than Alternative Solutions?": [
    "Header",
    "Feature",
    "Our Product",
    "Alternative Solution",
  ],
  "Challenge faced (including frustration with competitive products)": [
    "Header",
    "Text",
    "Testimonials",
  ],
  "Challenge faced (including frustration with Alternative Solutions)": [
    "Header",
    "Text",
    "Testimonials",
  ],
  "Challenge faced": ["Header", "Text", "Testimonials"],
  "Transformation Experienced": [
    "Header",
    "Text",
    "Bullet Points",
    "Testimonials",
  ],
  "Why Expert Recommend": ["Header", "Expert Intro", "Text", "Bullet Points"],
  "Ingredient Spotlight": [
    "Name",
    "The Science",
    "Text",
    "Key Benefits",
    "Bullet Points",
  ],
  "Reason to Buy": ["Generic Layout"],
  "Busting the Myths": ["Header", "Myth1", "Fact1", "Myth2", "Fact2"],
  "Ingredients Section": [
    "Header",
    "Ingredient1",
    "Benefit1",
    "Ingredient2",
    "Benefit3",
  ],
  "Testimonials Section": [
    "Header",
    "Challenge (Text)",
    "Intro",
    "Testimonials",
  ],
  "Testimonial Snippet": ["Intro", "Testimonials"],
  "Callouts for Offers/Free Shipping/others": ["Text"],
  "Product Introduction": ["Hero Product Section (Image/Price/Description)"],
  "Brand Credibility": [
    "Credibility 1",
    "Credibility 2",
    "Credibility 3",
    "Credibility 4",
  ],
  "Meet the Brand": [
    "Header",
    "Credibility 1",
    "Credibility 2",
    "Credibility 3",
    "Founder Intro",
  ],
  "Why customers Love": ["Reviews"],
  CTA: ["CTA Name"],
  "Suggested Routine": ["Routine 1", "Routine 2", "Routine 3"],
  "Usage Guide": ["Step 1", "Step 2", "Step 3"],
  "Shop Now": ["CTA Name"],
  "Grid Collections": ["Add Collections"],
  "Use it with": ["Product ID"],
  "Media (Video)": ["Add"],
  "Media (Images)": ["Add"],
  "Results Timeline": ["Header", "Bullet points with Text [Timeline->Results]"],
  "Recent Reviews": ["Product Section"],
  "Generic Layout": [],
  "Layout 1": ["Header", "Text", "Bullet Point"],
  "Layout 2": ["Header", "Text", "Bullet Points with supporting text"],
  "Layout 3": ["Header", "Bullet Points with supporting text"],
};

export function getSkuFromUrl(url: string): string {
  const { pathname } = new URL(url);
  console.log(pathname);
  const pathParts = pathname.split("/");
  const nonEmptyParts = pathParts.filter(Boolean);
  const sku = nonEmptyParts[nonEmptyParts.length - 1] || "";
  console.log(sku);
  return sku;
}

type InputData = Record<string, string>;

function mapIdsToTitles(data: InputData): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in data) {
    const title = questionTitles[key] || key;
    result[title] = data[key];
  }

  return result;
}

async function callGPTWithPrompt(prompt: string): Promise<string> {
  const openai = new OpenAI();
  console.log(prompt);
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o-2024-08-06",
    temperature: 0.7,
  });
  const result = completion.choices[0].message?.content || "";
  console.log(result);
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { inputData } = await request.json();

    if (!inputData) {
      return NextResponse.json(
        { error: "input data is required" },
        { status: 400 }
      );
    }
    const mappedData = mapIdsToTitles(inputData);
    console.log("Mapped Data", mappedData);

    if (mappedData["SectionFinder"] === "Keeping it Genric") {
      const keysToKeep = [
        "What would the Landing Page be about?",
        "Please share the product URL?",
        "Choose the Relevant Framework",
      ];

      for (const key of Object.keys(mappedData)) {
        if (!keysToKeep.includes(key)) {
          delete mappedData[key];
        }
      }
    }

    const sectionKey = inputData.SectionFinder || "";
    console.log(sectionKey);
    const product_url = mappedData["Please share the product URL?"];
    console.log(product_url);
    const sku = getSkuFromUrl(product_url);
    const product_details = await fetchProduct("42", sku);
    console.log(product_details.productSections);
    const sections = sectionFinders[sectionKey] || [];
    console.log(sections);
    const generatedSections: Record<string, string> = {};

    for (const section of sections) {
      let promptTemplate = sectionPrompts[section];
      const newPrompt = `${promptTemplate} 
      here is the product Details : 
    ${JSON.stringify(product_details.productSections)}
      `;
      const responseText = await callGPTWithPrompt(newPrompt);
      generatedSections[section] = responseText;
    }
    return NextResponse.json(
      {
        mappedData,
        sections,
        generatedSections,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in POST handler:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
