import { NextRequest, NextResponse } from "next/server";
import getLandingPage from "@/lib/api_functions/getLandingPage";
import getFrameworkType from "@/lib/api_functions/getFrameworkType";
export async function POST(request: NextRequest) {
  try {
    const { Ad, Audience, url } = await request.json();

    if (!Ad) {
      return NextResponse.json({ error: "Ad is required" }, { status: 400 });
    }
    // const FrameworkType = await getFrameworkType(url, Ad, Audience);
    // console.log(FrameworkType);
    const LandingPage = await getLandingPage(url, Ad, Audience, "FrameworkType");
    console.log(LandingPage);
    return NextResponse.json("FrameworkType", { status: 200 });
  } catch (e: any) {
    console.error("blog API Error", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
