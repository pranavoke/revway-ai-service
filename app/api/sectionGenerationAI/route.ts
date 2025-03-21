import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { processPrompt } from "@/lib/data/SectionsPrompts";

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

interface Expert {
  expertName: string;
  expertProfile: string;
  aboutExpert: string;
}
interface SatisfiedUser {
  personaOfUser: string;
  familarityOfUser: string;
}
interface KeyIngridients {
  ingridient: string;
  aboutIngridient: string;
}

interface Audience {
  demography: string;
  location: string;
  gender: string;
  age: string;
}
export interface Input {
  url: string;
  brandId: string;
  sectionFinder: string;
  supportedProducts?: string;
  competativeProducts?: string[];
  framework?: string;
  alternativeSolutions?: string[];

  audience?: Audience;
  reasonToBuy?: string[];
  myths?: string[];
  experts?: Expert[];

  keyIngridients?: KeyIngridients[];

  satisfiedUsers?: SatisfiedUser[];

  purpose?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputData: Input = body.inputPayload;

    if (!inputData) {
      return NextResponse.json(
        { error: "input data is required" },
        { status: 400 }
      );
    }

    const sectionKey = inputData.sectionFinder;
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

    const generatedSections: Record<string, string> = {};

    let promptTemplate = processPrompt(inputData);
    let finalPrompt = `
   
    ${JSON.parse(promptTemplate)} 

    Strictly follow the Layout provided , no extra information required . 

    Product url : ${product_url}

    here is the product Details : 
    ${JSON.stringify(product_details.productSections)}
    `;
    console.log(inputData.supportedProducts);
    if (inputData.sectionFinder == "Pair_it_with") {
      const product = inputData.supportedProducts!;

      const sku_supportedProduct = getSkuFromUrl(product);

      let supportedProduct = await fetch(
        new URL(
          `/api/product_cliptocart?brandId=${inputData.brandId}&sku=${sku_supportedProduct}`,
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        ).toString()
      );

      if (!supportedProduct.ok) {
        throw new Error(
          `HTTP error! status . error in fetching product response : ${supportedProduct.status}`
        );
      }

      const supportedProductResponse = await supportedProduct.json();
      let productPrompt = `
        Product 2  url : ${product}

        here is the Product 2 Details : 
        ${JSON.stringify(supportedProductResponse)}
        
        `;
      finalPrompt = finalPrompt + productPrompt;
    }

    const responseText = await callGPTWithPrompt(finalPrompt);
    generatedSections[sectionKey] = responseText;
    let parsedResponse;
    if (inputData.sectionFinder === "LandingPage_Title") {
      const sechema_completionLandingPage =
        await openai.chat.completions.create({
          model: "gpt-4o-2024-08-06",
          temperature: 0.7,
          messages: [
            {
              role: "user",
              content: `You are a helpful assistant who returns JSON strictly following the provided schema. if the full information is not provided pass empty in particular fields .You do not need to Add / Modify / Delete content just generate JSON , ${JSON.stringify(
                responseText
              )},
  
            Strictly follow the instructions . 
            
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
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        header: { type: "string" },
                      },
                      required: ["header"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["sections"],
                additionalProperties: false,
              },
            },
          },
        });

      const sechema_completionLandingPage_response =
        sechema_completionLandingPage.choices[0].message?.content || "";
      parsedResponse = JSON.parse(sechema_completionLandingPage_response);
    } else {
      const schema_completion = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `You are a helpful assistant who returns JSON strictly following the provided schema. if the full information is not provided pass empty in particular fields .You do not need to Add / Modify / Delete content just generate JSON , ${JSON.stringify(
              responseText
            )},
      
            Strictly follow the instructions . 
            
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
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sectionType: { type: "string" },
                      header: { type: "string" },
                      subHeader: { type: "string" },
                      text: { type: "string" },
                      bulletPoints: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            badgeLink: { type: "string" },
                            point: { type: "string" },
                            supportingText: { type: "string" },
                          },
                          required: ["badgeLink", "point", "supportingText"],
                          additionalProperties: false,
                        },
                      },
                      mediaCarouselModule: {
                        type: "object",
                        properties: {
                          text: { type: "string" },
                          mediaCarousel: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                mediaLink: { type: "string" },
                                text: { type: "string" },
                                type: { type: "string" },
                              },
                              required: ["mediaLink", "text", "type"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["text", "mediaCarousel"],
                        additionalProperties: false,
                      },
                      testimonials: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            badgeLink: { type: "string" },
                            testimonialText: { type: "string" },
                            reviewerName: { type: "string" },
                          },
                          required: [
                            "badgeLink",
                            "testimonialText",
                            "reviewerName",
                          ],
                          additionalProperties: false,
                        },
                      },
                      tableModule: {
                        type: "object",
                        properties: {
                          rows: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                cells: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      content: { type: "string" },
                                    },
                                    required: ["content"],
                                    additionalProperties: false,
                                  },
                                },
                              },
                              required: ["cells"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["rows"],
                        additionalProperties: false,
                      },
                    },
                    required: [
                      "sectionType",
                      "header",
                      "subHeader",
                      "text",
                      "bulletPoints",
                      "mediaCarouselModule",
                      "testimonials",
                      "tableModule",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["sections"],
              additionalProperties: false,
            },
          },
        },
      });
      const schema_response =
        schema_completion.choices[0].message?.content || "";
      parsedResponse = JSON.parse(schema_response);
      console.log(parsedResponse);
    }
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
