import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getAnswerprocessPrompt } from "@/lib/data/getAnswersPrompt";

function getSkuFromUrl(url: string): string {
  const { pathname } = new URL(url);
  const pathParts = pathname.split("/");
  const nonEmptyParts = pathParts.filter(Boolean);
  const sku = nonEmptyParts[nonEmptyParts.length - 1] || "";
  return sku;
}

const openai = new OpenAI();

async function callGPTWithPrompt(prompt: string): Promise<string> {
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
export interface getAnswers {
  url: string;
  brandId: string;
  type: string;
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputData: getAnswers = body;
    if (!inputData) {
      return NextResponse.json(
        { error: "input data is required" },
        { status: 400 }
      );
    }

    const product_url = inputData.url;
    const sku = getSkuFromUrl(product_url);
    console.log(sku);

    const productResponse = await fetch(
      new URL(
        `/api/product_cliptocart?brandId=${inputData.brandId}&sku=${sku}`,
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      ).toString()
    );

    if (!productResponse.ok) {
      throw new Error(
        `HTTP error! status . error in fetching product response : ${productResponse.status}`
      );
    }

    const product_details = await productResponse.json();
    console.log(product_details);

    let promptTemplate = getAnswerprocessPrompt(inputData);
    let finalPrompt = `
   
    ${JSON.parse(promptTemplate)} 

    Strictly follow the Layout provided , no extra information required . 

    Product url : ${product_url}

    here is the product Details : 
    ${JSON.stringify(product_details.productSections)}
    `;

    const responseText = await callGPTWithPrompt(finalPrompt);

    const sechema_completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `You are a helpful assistant who returns JSON strictly following the provided schema. You just need to return the answers in an array format .You do not need to Add / Modify / Delete content just generate my web page section JSON , ${JSON.stringify(
            responseText
          )},
          
          Also Remove any * (single stars) , ** (double stars) characters if present in a zero relevance context . 
          `,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "web_page_sections_array",
          strict: true,
          schema: {
            type: "object",
            properties: {
              answerResponse: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["answerResponse"],
            additionalProperties: false,
          },
        },
      },
    });
    const schema_response =
      sechema_completion.choices[0].message?.content || "";
    let parsedResponse = JSON.parse(schema_response);
    console.log(parsedResponse);
    return NextResponse.json(
      {
        parsedResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in POST handler:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
