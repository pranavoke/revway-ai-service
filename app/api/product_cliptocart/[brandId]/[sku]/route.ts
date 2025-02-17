import { NextResponse } from "next/server";

interface Params {
  brandId: string;
  sku: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { brandId, sku } = await params;

    const url = `https://backend.cliptocart.com/product?brandId=${brandId}&sku=${sku}`;

    const externalResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-custom-header": "custom-header-value",
      },
    });

    if (!externalResponse.ok) {
      throw new Error(
        `Failed to fetch from external API: ${externalResponse.statusText}`
      );
    }

    const data = await externalResponse.json();

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching data:", error);

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
