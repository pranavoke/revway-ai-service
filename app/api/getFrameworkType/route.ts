import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import FrameWorks from "@/lib/data/Framework";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import axios from "axios";

const FrameworkType = z.object({
  FrameWorkType: z.string(),
});
export async function POST(request: NextRequest) {
  try {
    const { url, Ad, Audience } = await request.json();

    if (!Ad) {
      return NextResponse.json({ error: "Ad is required" }, { status: 400 });
    }
    const FW = [];
    for (const F of FrameWorks) {
      FW.push(F.Type);
    }

    const openai = new OpenAI();
    const prompt = `
        We want to create a Landing Page for a Product . 
        Product : ${url}

        Let me know wether we should generate ${JSON.stringify(
          FW
        )}  , the decision to choose the type of Landing page should be based on the following factors :
    
        1. Familarity with Product Category . 

  
        You can determine the product category from the URL .
       
    `;

    console.log(prompt);

    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o-2024-08-06",
      temperature: 0.8,
      response_format: zodResponseFormat(FrameworkType, "Framework"),
    });
    const responseContent = completion.choices[0].message?.content || "";
    console.log(responseContent);
    const parsedResponse = JSON.parse(responseContent);
    const F1 = FrameworkType.parse(parsedResponse).FrameWorkType;

    const prompt2 = `
        We want to create a Landing Page for a Product . 
        Product : ${url}
        This is the Ad of the product : ${Ad}

        Let me know wether we should generate ${JSON.stringify(
          FW
        )}  , the decision to choose the type of Landing page should be based on the following factors :
    
        1. Familarity with Product Category . 

  
        You can determine the product category from the URL .
       
    `;

    console.log(prompt2);

    const completion2 = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "user",
          content: prompt2,
        },
      ],
      model: "gpt-4o-2024-08-06",
      temperature: 0.8,
      response_format: zodResponseFormat(FrameworkType, "Framework"),
    });
    const responseContent2 = completion2.choices[0].message?.content || "";
    console.log(responseContent);
    const parsedResponse2 = JSON.parse(responseContent2);
    const F2 = FrameworkType.parse(parsedResponse2).FrameWorkType;
    console.log(F1, F2);
    let Framework;
    let Layout1;
    let Layout2;
    if (F1 === "Regular Landing Page" && F2 === "Regular Landing Page") {
      Framework = F1;
      Layout1 = await getLayoutType(Ad, Framework);
      Layout2 = await getLayoutType(Ad, F2);
      console.log(Layout1, Layout2);
    } else if (F1 === "Regular Landing Page" && F2 !== "Regular Landing Page") {
      Layout1 = await getLayoutType(Ad, F1);
      Layout2 = await getLayoutType(Ad, F2);
      console.log(Layout1, Layout2);
    } else if (F1 !== "Regular Landing Page") {
      Layout1 = await getLayoutType(Ad, F1);
      Layout2 = await getLayoutType(Ad, F1);
    }

    console.log(Layout1.LayoutType, Layout2.LayoutType);
    return NextResponse.json(
      { Framework: Framework, Layout: Layout1.LayoutType },
      {
        status: 200,
      }
    );
  } catch (e: any) {
    console.error("Framework API Error", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function getLayoutType(
  Ad: string,

  FrameWorkType: string
): Promise<any> {
  console.log("getFrameworkType", Ad, FrameWorkType);
  const response = await axios.post<any>(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/getLayoutType`,
    {
      Ad: Ad,
      FrameWorkType: FrameWorkType,
    }
  );

  return response.data;
}


