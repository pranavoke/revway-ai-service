import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import FrameWorks from "@/lib/data/Framework";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const LayoutType = z.object({
  LayoutType: z.array(z.string()),
});
export async function POST(request: NextRequest) {
  try {
    const { Ad, FrameWorkType } = await request.json();

    if (!Ad) {
      return NextResponse.json({ error: "Ad is required" }, { status: 400 });
    }
    let FrameWork;
    for (const F of FrameWorks) {
      if (F.Type === FrameWorkType) {
        FrameWork = F.Layout;
      }
    }
    const openai = new OpenAI();
    const prompt = `
          I am giving you an Ad let me know which type of framework is best suited for this particular Ad . 
          Ad = ${Ad}
          
          Only return the names of the Framework that is best suited for the Ad. Best suited first . 
        
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
      response_format: zodResponseFormat(LayoutType, "Layouts"),
    });
    const responseContent = completion.choices[0].message?.content || "";
    const parsedResponse = JSON.parse(responseContent);
    const Layout = LayoutType.parse(parsedResponse);

    console.log(Layout);
    return NextResponse.json(Layout, { status: 200 });
  } catch (e: any) {
    console.error("Framework API Error", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
