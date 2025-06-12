// lib/prompts/landingPage.ts
/**
 * Prompt functions for create-landing-page API
 * These prompts handle dynamic landing page structure and module creation
 * ALL PROMPTS ARE EXTRACTED AS-IS FROM ORIGINAL CODE WITHOUT MODIFICATIONS
 */

interface LandingPageAnalysisData {
  url: string;
  prompt?: string;
}

interface ModuleCreationData {
  sectionTitle: string;
  sectionData: any;
}

/**
 * EXACT prompts from create-landing-page API for dynamic landing page generation
 * Returns system and user prompts for analyzing URL and creating structure
 */
export function getDynamicLandingPagePrompts(data: LandingPageAnalysisData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: `Analyze the provided URL and create a comprehensive landing page structure tailored specifically to this website's content and purpose.
  
  Your task is to:
  
  1. Determine the optimal number of sections needed for an effective landing page
  2. Create compelling, conversion-focused content for each section
  3. Ensure the overall flow tells a cohesive story and guides visitors toward the desired action . 
  4. We only need sections which are about the product and important , here we don't need sections like footer , customer support etc . 
  
  There are no fixed section templates or predefined types. Instead, examine the URL to determine:
  - The main purpose of the website
  - The target audience
  - Key pain points and solutions
  - Unique selling propositions
  - Most important conversion actions
  
  Then, create a landing page structure with the exact sections needed to effectively market this specific offering.
  
  For each section, provide:
  - A compelling, benefit-focused heading
  - Descriptive content that addresses customer pain points and solutions
  - Appropriate content structure (paragraph, bullet points, etc.)
  
  Structure the response as a JSON object with clear section delineation.`,
    userPrompt: `URL: ${data.url}
        ${data.prompt ? `Additional Instructions: ${data.prompt}` : ""}
        
        Analyze this URL and create a comprehensive landing page structure with appropriate sections.
        Determine the number and types of sections based on the URL's content and purpose.
        
        The response should be a JSON object with the following structure:
        {
          "title": "Landing Page Title",
          "sections": [
            {
              "title": "Section Title",
              "description": "Detailed section content or array of bullet points"
            }
          ]
        }`,
  };
}

/**
 * EXACT prompts from create-landing-page API for module creation
 * Returns system and user prompts for converting sections to modules
 */
export function getModuleCreationPrompts(data: ModuleCreationData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: `You are an expert landing page content formatter. Your task is to convert section content into well-structured modules.
  
  Focus on these module types:
  
  1. TEXT modules:
     - HEADER: Section main title
     - SUB_HEADER: Secondary titles
     - PARAGRAPH: Text paragraphs
     - PAIR_IT_WITH: Product recommendation (content: null, products: array)
     - GRID: Product collection (content: null, products: array)
  
  2. LIST modules (use 'bulletPoints' field):
     - BULLET_POINTS: Simple bullet lists
     - BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with title and supporting text
  
  3. TESTIMONIAL modules (use 'testimonials' field):
     - TESTIMONIAL_1: All customer reviews in one module. Each testimonial must have: subject, body, reviewerName, rating.
  
  4. MEDIA modules (use 'mediaList' field):
     - IMAGE: Single image content
     - IMAGE_CAROUSEL: Multiple images (use if more than one image)
     - VIDEO: Video content
  
  5. TABLE modules (use 'table' field):
     - TABLE_1: Two-column table
     - TABLE_2: Three-column table
  
     CRITICAL FIELD MAPPINGS:
  - TEXT type → uses 'content' field 
  - LIST type → uses 'bulletPoints' field
  - TESTIMONIAL type → uses 'testimonials' field (see structure below)
  - MEDIA type → uses 'mediaList' field
  - TABLE type → uses 'table' field
  
  Never use 'content' field for non-TEXT types.
  
  TESTIMONIAL structure example:
  {
    "type": "TESTIMONIAL",
    "subtype": "TESTIMONIAL_1",
    "testimonials": [
      {
        "subject": "Short summary or headline",
        "body": "Full testimonial text",
        "reviewerName": "Customer name",
        "rating": 5
      }
    ]
  }
  
  CRITICAL INSTRUCTIONS:
  1. Always return a JSON object with a "modules" array
  2. Create separate modules for different content types
  3. Include BOTH the header AND the content from the description
  4. If description is a string, create a PARAGRAPH module
  5. If description is an array, create appropriate LIST modules
  6. For testimonials, extract individual reviews into a single TESTIMONIAL_1 module with the above structure
  7. For tables, use TABLE_1 for 2 columns, TABLE_2 for 3 columns (check the number of columns in the data)
  8. For media, use IMAGE_CAROUSEL if more than one image, otherwise IMAGE. For video, use VIDEO.
  
  Response format must be: {"modules": [...]}`,
    userPrompt: `Section Title: ${data.sectionTitle}
  Section Content: ${JSON.stringify(data.sectionData)}
  
  Convert this section into appropriate modules. You MUST:
  1. Create a HEADER module for the title
  2. Create appropriate content modules for the description
  3. Return the response in this exact format: {"modules": [...]}
  
  CORRECT way to structure (properly segregated):
  [{
    "type": "TEXT",
    "subtype": "PARAGRAPH",
    "content": "Our product is designed with three core values in mind:"
  }, {
    "type": "LIST",
    "subtype": "BULLET_POINTS_WITH_SUPPORTING_TEXT",
    "bulletPoints": [
      {"point": "Quality", "supportingText": "We use only the finest materials"},
      {"point": "Durability", "supportingText": "Built to last for years"},
      {"point": "Sustainability", "supportingText": "Environmentally friendly production"}
    ]
  }, {
    "type": "TEXT",
    "subtype": "SUB_HEADER",
    "content": "What we learned?"
  }, {
    "type": "LIST",
    "subtype": "BULLET_POINTS",
    "bulletPoints": [
      {"point": "Better Quality", "supportingText": null},
      {"point": "Better Durability", "supportingText": null},
      {"point": "Better sustainability", "supportingText": null}
    ]
  }, {
    "type": "TEXT",
    "subtype": "PARAGRAPH",
    "content": "Contact us today to learn more about our commitment to excellence."
  }, {
    "type": "TESTIMONIAL",
    "subtype": "TESTIMONIAL_1",
    "testimonials": [
      {"subject": "Great product!", "body": "I loved using this product, it really helped me a lot.", "reviewerName": "Jane Doe", "rating": 5}
    ]
  }, {
    "type": "MEDIA",
    "subtype": "IMAGE_CAROUSEL",
    "mediaList": [
      {"url": "image1.jpg"},
      {"url": "image2.jpg"}
    ]
  }, {
    "type": "TABLE",
    "subtype": "TABLE_1",
    "table": [["Feature", "Value"], ["Color", "Red"]]
  }, {
    "type": "TABLE",
    "subtype": "TABLE_2",
    "table": [["Feature", "Value", "Notes"], ["Color", "Red", "Popular"]]
  }]`,
  };
}
