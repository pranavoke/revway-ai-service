import { NextRequest, NextResponse } from "next/server";
import getScrapeData from "@/lib/api_functions/getScrapeData";
import getFrameworkType from "@/lib/api_functions/getFrameworkType";


export async function POST(request: NextRequest) {
  try {
    const { Url, Ad, Audience, Popularity, Familiarity } = await request.json();
    console.log("Master", Url, Ad, Audience, Popularity, Familiarity);

    if (!Url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    const scrapeData = await getScrapeData(Url);

    const Framework = await getFrameworkType(Url, Ad, Popularity, Familiarity);

    console.log("Master", Framework);

    return NextResponse.json({ scrapeData, Framework });
  } catch (error) {
    console.error("API Route Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
