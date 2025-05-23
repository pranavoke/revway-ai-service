// app/api/generate-dynamic-landing-page/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateLandingPage } from "@/lib/openai";
import {
  formatAllSectionsToModules,
  flattenModules,
} from "@/utils/moduleParser";
import { LandingPageSection, Module } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Step 1: Generate dynamic landing page structure
    let landingPageData: { title: string; sections: LandingPageSection[] };
    try {
      landingPageData = await generateLandingPage(body.url, body.prompt);

      // Validate that sections exists and is an array
      if (
        !landingPageData.sections ||
        !Array.isArray(landingPageData.sections) ||
        landingPageData.sections.length === 0
      ) {
        console.error(
          "Invalid response format: sections is missing or not an array",
          landingPageData
        );

        // Create a default structure if sections is missing
        landingPageData = {
          title: landingPageData.title || "Landing Page",
          sections: [
            {
              title: "Main Section",
              description:
                "This is the main content section of the landing page.",
            },
          ],
        };
      }
    } catch (error) {
      console.error("Error generating landing page structure:", error);
      return NextResponse.json(
        { error: "Failed to generate landing page structure" },
        { status: 500 }
      );
    }

    // Step 2: Format all sections into modules
    let modulesBySection;
    try {
      modulesBySection = await formatAllSectionsToModules(
        landingPageData.sections
      );
    } catch (error) {
      console.error("Error formatting sections into modules:", error);
      return NextResponse.json(
        { error: "Failed to format sections into modules" },
        { status: 500 }
      );
    }

    // Step 3: Create a flat array of all modules
    const allModules = flattenModules(modulesBySection);

    // Return the complete result
    return NextResponse.json({
      title: landingPageData.title,
      sections: landingPageData.sections,
      modulesBySection,
      modules: allModules,
    });
  } catch (error) {
    console.error("Error generating dynamic landing page:", error);

    return NextResponse.json(
      { error: "Failed to generate dynamic landing page" },
      { status: 500 }
    );
  }
}
