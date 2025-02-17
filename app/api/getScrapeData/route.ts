import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import ScrapeDataModel, { IScrapeData } from "@/models/ScrapeData";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    console.log(url);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await connectToDB();

    let existingData = await ScrapeDataModel.findOne({ url });
    console.log(existingData);

    if (existingData) {
      return NextResponse.json(existingData);
    }

    const FLASK_API_URL =
      process.env.FLASK_API_URL || "http://localhost:8000/scrape";

    const response = await axios.post<IScrapeData>(FLASK_API_URL, { url });

    const newData = new ScrapeDataModel({
      url,
      images: response.data.images,
      accordion: response.data.accordion,
      text: response.data.text,
    });

    await newData.save();
    console.log(newData);
    return NextResponse.json(newData);
  } catch (error) {
    console.error("API Route Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
