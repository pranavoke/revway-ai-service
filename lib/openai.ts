// lib/openai.ts
import OpenAI from "openai";

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a landing page structure based on the provided URL and optional prompt
 *
 * @param url The URL to create a landing page for
 * @param prompt Optional prompt to guide the landing page generation
 * @returns Landing page data with sections
 */
export async function generateLandingPage(url: string, prompt?: string) {
  const systemPrompt = `You are a landing page content creator. You need to analyze the provided URL and create a comprehensive landing page structure with sections determined by the content and purpose of the URL. 
  
  Do not use predefined section types, but instead dynamically determine the most appropriate sections based on the URL's content and purpose.
  
  Return a JSON object with the following structure:
  {
    "title": "Landing Page Title",
    "sections": [
      {
        "title": "Section Title",
        "description": "Detailed section content"
      }
    ]
  }
  
  Include as many sections as needed to create a complete and effective landing page. You decide the number, order, and content of sections based on your analysis.
  
  Keep sections focused, clear, and persuasive. Use language appropriate for a landing page.`;

  const userPrompt = prompt
    ? `URL: ${url}\nCustom Instructions: ${prompt}\n\nCreate a comprehensive landing page structure based on this information. Determine the appropriate number and types of sections needed.`
    : `URL: ${url}\n\nCreate a comprehensive landing page structure based on this URL. Determine the appropriate number and types of sections needed.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const resultContent = completion.choices[0].message.content || "{}";

    try {
      const result = JSON.parse(resultContent);

      // Validate that the result has the expected structure
      if (!result.title) {
        result.title = "Landing Page";
      }

      if (
        !result.sections ||
        !Array.isArray(result.sections) ||
        result.sections.length === 0
      ) {
        result.sections = [
          {
            title: "Main Section",
            description:
              "This is the main content section of the landing page.",
          },
        ];
      }

      return result;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      // Return a default structure if parsing fails
      return {
        title: "Landing Page",
        sections: [
          {
            title: "Main Section",
            description:
              "This is the main content section of the landing page.",
          },
        ],
      };
    }
  } catch (apiError) {
    console.error("OpenAI API error:", apiError);
  }
}

/**
 * Format a section into appropriate modules
 *
 * @param section The section to format into modules
 * @returns An array of modules
 */
export async function formatSectionToModules(section: any) {
  // Handle different description formats
  let description = section.description;
  if (Array.isArray(description)) {
    // If description is an array, convert it to a string
    description = description.join("\n\n");
  } else if (typeof description !== "string") {
    // If description is neither a string nor an array, convert to string
    description = JSON.stringify(description);
  }

  // Pre-process the content to identify segments (paragraphs, bullet points, etc.)
  const segments = parseContentSegments(description);

  // If automatic segmentation found multiple content types, create modules without AI
  if (segments.length > 1) {
    return createModulesFromSegments(section.title, segments);
  }

  // For simpler content or when segmentation isn't clear, use AI to create modules
  const systemPrompt = `You are a content formatter that converts landing page sections into structured modules.
  
  The available module types are:
  
  TEXT Modules:
  - HEADER: Main section title
  - SUB_HEADER: Secondary title text
  - PARAGRAPH: Standard paragraph text
  - CTA: Call to Action buttons or links
  - SHOP_NOW: Shopping-specific call to action
  
  MEDIA Modules:
  - VIDEO: Video content with link
  - IMAGE: Image with the link
  
  LIST Modules:
  - BULLET_POINTS: Simple bullet point list
  - BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with title and supporting text
  
  TESTIMONIAL Modules:
  - TESTIMONIAL: Customer or user testimonial
  
  TABLE Modules:
  - TABLE_1: Three-column table
  - TABLE_2: Two-column table
  
  Analyze the content and separate it into logical modules. For example, if a paragraph contains bullet points,
  split it into a PARAGRAPH module followed by a BULLET_POINTS module.
  
  If the bullet points have a clear title and supporting text structure (e.g., "Quality: High-grade materials"),
  use BULLET_POINTS_WITH_SUPPORTING_TEXT.
  
  If there are images or videos mentioned, create appropriate MEDIA modules.
  
  If there's structured data that would fit in a table, use TABLE modules.
  
  Your response must be a valid JSON array of module objects.`;

  const userPrompt = `Section Title: ${section.title}
  Section Description:
  
  ${description}
  
  Convert this section into simple, well-segregated modules. Split the content into logical parts (paragraphs, lists, etc.).
  
  Return a JSON array of module objects like this:
  [
    {
      "type": "TEXT",
      "subtype": "HEADER",
      "content": "Section Title"
    },
    {
      "type": "TEXT",
      "subtype": "PARAGRAPH",
      "content": "First paragraph content"
    },
    {
      "type": "LIST",
      "subtype": "BULLET_POINTS",
      "content": ["Bullet point 1", "Bullet point 2"]
    },
    {
      "type": "TEXT",
      "subtype": "PARAGRAPH",
      "content": "Concluding paragraph"
    }
  ]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const resultContent = completion.choices[0].message.content || "{}";

    try {
      const parsedResponse = JSON.parse(resultContent);

      // Check if response is already an array
      if (Array.isArray(parsedResponse)) {
        return parsedResponse;
      }

      // Check if response has a modules property
      if (parsedResponse.modules && Array.isArray(parsedResponse.modules)) {
        return parsedResponse.modules;
      }

      // Look for any array property in the response
      const arrayProps = Object.keys(parsedResponse).filter((key) =>
        Array.isArray(parsedResponse[key])
      );

      if (arrayProps.length > 0) {
        return parsedResponse[arrayProps[0]];
      }

      // If we can't find an array, use our content segmentation approach
      return createModulesFromSegments(section.title, segments);
    } catch (parseError) {
      console.error("Error parsing modules response:", parseError);
      // Use our content segmentation approach if parsing fails
      return createModulesFromSegments(section.title, segments);
    }
  } catch (apiError) {
    console.error("OpenAI API error while formatting modules:", apiError);
    // Use our content segmentation approach if API call fails
    return createModulesFromSegments(section.title, segments);
  }
}

/**
 * Parse section content into different content segments
 *
 * @param content The content to parse
 * @returns Array of content segments with their types
 */
function parseContentSegments(
  content: string
): Array<{ type: string; content: string | string[] }> {
  const segments: Array<{ type: string; content: string | string[] }> = [];

  // Split content by double newlines to separate paragraphs
  const parts = content.split(/\n\s*\n/).filter((part) => part.trim() !== "");

  for (const part of parts) {
    const trimmedPart = part.trim();

    // Check if this part is a list of bullet points
    if (trimmedPart.match(/^[-*•]\s+.+(\n[-*•]\s+.+)+$/m)) {
      // Extract bullet points
      const bulletPoints = trimmedPart
        .split("\n")
        .filter((line) => line.trim().match(/^[-*•]\s+/))
        .map((line) => line.replace(/^[-*•]\s+/, "").trim());

      segments.push({
        type: "BULLET_POINTS",
        content: bulletPoints,
      });
    }
    // Check if this part contains a list with a paragraph before it
    else if (trimmedPart.includes("\n") && trimmedPart.match(/\n[-*•]\s+/)) {
      // Split into paragraph and list
      const lines = trimmedPart.split("\n");
      let paragraphLines: string[] = [];
      let bulletPointLines: string[] = [];

      for (const line of lines) {
        if (line.trim().match(/^[-*•]\s+/)) {
          bulletPointLines.push(line);
        } else {
          paragraphLines.push(line);
        }
      }

      // Add paragraph if it exists
      if (paragraphLines.length > 0) {
        segments.push({
          type: "PARAGRAPH",
          content: paragraphLines.join("\n").trim(),
        });
      }

      // Add bullet points
      if (bulletPointLines.length > 0) {
        const bulletPoints = bulletPointLines.map((line) =>
          line.replace(/^[-*•]\s+/, "").trim()
        );

        segments.push({
          type: "BULLET_POINTS",
          content: bulletPoints,
        });
      }
    }
    // Check if it looks like a testimonial
    else if (
      trimmedPart.includes('"') &&
      (trimmedPart.includes("- ") || trimmedPart.includes('"—'))
    ) {
      segments.push({
        type: "TESTIMONIAL",
        content: trimmedPart,
      });
    }
    // Default to paragraph
    else {
      segments.push({
        type: "PARAGRAPH",
        content: trimmedPart,
      });
    }
  }

  return segments;
}

/**
 * Create modules from content segments
 *
 * @param title Section title
 * @param segments Content segments
 * @returns Array of modules
 */
function createModulesFromSegments(
  title: string,
  segments: Array<{ type: string; content: string | string[] }>
): any[] {
  const modules: any[] = [
    {
      type: "TEXT",
      subtype: "HEADER",
      content: title,
    },
  ];

  for (const segment of segments) {
    if (segment.type === "PARAGRAPH") {
      modules.push({
        type: "TEXT",
        subtype: "PARAGRAPH",
        content: segment.content,
      });
    } else if (segment.type === "BULLET_POINTS") {
      modules.push({
        type: "LIST",
        subtype: "BULLET_POINTS",
        content: segment.content,
      });
    } else if (segment.type === "TESTIMONIAL") {
      // Extract testimonial components
      const content = segment.content as string;
      const quoteMatch = content.match(/"([^"]+)"/);
      const authorMatch = content.match(/[-—]\s*([^,]+)/);

      if (quoteMatch) {
        modules.push({
          type: "TESTIMONIAL",
          subtype: "TESTIMONIAL",
          content: {
            quote: quoteMatch[1],
            author: authorMatch ? authorMatch[1].trim() : "Happy Customer",
          },
        });
      } else {
        // Fallback to paragraph if can't extract quote
        modules.push({
          type: "TEXT",
          subtype: "PARAGRAPH",
          content: content,
        });
      }
    }
  }

  // Check if we should add a CTA based on the title
  if (
    title.toLowerCase().includes("order") ||
    title.toLowerCase().includes("buy") ||
    title.toLowerCase().includes("get") ||
    title.toLowerCase().includes("shop") ||
    title.toLowerCase().includes("special offer") ||
    title.toLowerCase().includes("today")
  ) {
    modules.push({
      type: "TEXT",
      subtype: "CTA",
      content: {
        text: "Shop Now",
        url: "/shop",
      },
    });
  }

  return modules;
}

/**
 * Create default modules for a section
 *
 * @param title Section title
 * @param description Section description
 * @returns Default modules array
 */
function createDefaultModules(title: string, description: string) {
  // Parse segments and create modules based on them
  const segments = parseContentSegments(description);
  return createModulesFromSegments(title, segments);
}
