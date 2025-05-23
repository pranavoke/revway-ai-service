import { NextRequest, NextResponse } from "next/server";
import {
  formatAllSectionsToModules,
  flattenModules,
} from "@/utils/moduleParser";
import { FormatModulesRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FormatModulesRequest;

    // Validate request body
    if (
      !body.sections ||
      !Array.isArray(body.sections) ||
      body.sections.length === 0
    ) {
      return NextResponse.json(
        { error: "Sections array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Format sections into modules
    const modulesBySection = await formatAllSectionsToModules(body.sections);

    // Flatten modules into a single array
    const allModules = flattenModules(modulesBySection);

    return NextResponse.json({
      modulesBySection,
      modules: allModules,
    });
  } catch (error) {
    console.error("Error formatting sections to modules:", error);

    return NextResponse.json(
      { error: "Failed to format sections into modules" },
      { status: 500 }
    );
  }
}
