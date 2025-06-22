// lib/prompts/htmlToModules.ts
/**
 * Prompt functions for html-to-modules API
 * These prompts handle HTML section analysis and module classification
 * ALL PROMPTS ARE EXTRACTED AS-IS FROM ORIGINAL CODE WITHOUT MODIFICATIONS
 */ 

interface HtmlToModulesData {
  cleanHtml: string;
}

/**
 * EXACT prompt from html-to-modules API for classifying HTML into modules
 * Returns system and user prompts for HTML analysis and module generation
 * Updated to match Master API module structure exactly
 */
export function getHtmlToModulesClassificationPrompt(data: HtmlToModulesData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are a helpful assistant that classifies HTML into structured modules according to specific guidelines.",
    userPrompt: `HTML to Modules Conversion Task
  
  Context
  You are tasked with analyzing an HTML section and breaking it down into structured modules according to our predefined module system. Each section should be classified into appropriate module types and subtypes.
  
  Module Types
  The following are the available module types and their subtypes:
  
  TEXT Modules
  
  HEADER: Usually Section Opener .
  SUB_HEADER: Secondary title text
  PARAGRAPH: Standard paragraph text
  CTA: Call to Action buttons or links
  SHOP_NOW: Shopping-specific call to action
  PAGE_HEADER: Main page title
  BANNER: Banner text, typically prominent
  
  
  MEDIA Modules
  
  VIDEO: Video content with link
  IMAGE_CAROUSEL: Image with the link 
  
  
  LIST Modules
  
  BULLET_POINTS: Simple bullet point list
  BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with additional explanatory text
  
  
  TESTIMONIAL Modules
  
  TESTIMONIAL_1: Customer or user testimonial

  
  TABLE Modules
  
  TABLE_2: Two-column table
  TABLE_1: Three-column table
  
  
  Your Task
  
  Analyze the provided HTML section
  Identify all distinct modules within the section
  For each identified module:
  1.Determine the primary module type (TEXT, MEDIA, LIST, TESTIMONIAL, TABLE)
  2.Identify the appropriate subtype
  3.The most important of all "Want the exact content no rubbish at all"
  
  CRITICAL FIELD MAPPINGS (MUST FOLLOW EXACTLY):
  - TEXT type → uses 'content' field 
  - LIST type → uses 'bulletPoints' field (array of objects with point and supportingText)
  - TESTIMONIAL type → uses 'testimonials' field (array of objects with subject, body, reviewerName, rating)
  - MEDIA type → uses 'mediaList' field (array of objects with url, alt, etc.)
  - TABLE type → uses 'table' field (2D array for TABLE_1 and TABLE_2)
   Final Module Schema
1. TEXT Modules
json
{
  "type": "TEXT",
  "subtype": "HEADER" | "SUB_HEADER" | "PARAGRAPH" |
CTA |
SHOP_NOW  |
PAGE_HEADER |
BANNER |",
  "content": "string content here" // null for PAIR_IT_WITH and GRID subtypes
}
When subtype is PAIR_IT_WITH or GRID, add:
json
{
  "type": "TEXT",
  "subtype": "PAIR_IT_WITH",
  "content": null,
  "products": [{ single product object multiple product in grid }]
}
2. LIST Modules
json
{
  "type": "LIST",
  "subtype": "BULLET_POINTS" | "BULLET_POINTS_WITH_SUPPORTING_TEXT | BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS   | BULLET_POINTS_WITH_ICONS       * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_IMAGES  |     * BULLET_POINTS_WITH_SUPPORTING_TEXT_AND_ICONS_2 
",
  "bulletPoints": [
    {
      "point": "Main text",
      "supportingText": "" 
	 “Icon”: “”// Empty string for simple bullets
    }
  ]
}
3. TESTIMONIAL Modules
json
{
  "type": "TESTIMONIAL",
  "subtype": "TESTIMONIAL_1",
  "testimonials": [
   {"subject": "Great product!", "body": "I loved using this product, it really helped me a lot.", "reviewerName": "INDIAN NAMES", "rating": 5}

  ]
}
4. MEDIA Modules
json
{
  "type": "MEDIA",
  "subtype": "IMAGE_CAROUSEL" | "VIDEO",
  "mediaList": [
    {
      "link": "media URL",
      "extension": "jpg",
      "type": "image"
    }
  ]
}
5. TABLE Modules
json
{
  "type": "TABLE",
  "subtype": "TABLE_2 -- for 2 col table" | "TABLE_1 -- for >3 col table",
  "table": {
    "headers": ["Column 1", "Column 2"],
    "rows": [["Row 1 Col 1", "Row 1 Col 2"]]
  }
}

  Important Notes
      1. Pay attention to the semantic purpose of elements rather than just their HTML tags
      2. Some elements may contain multiple modules nested within them
      3. When in doubt about a module type, choose the one that best represents the user's intent also Stick to the modules given 
      4. Provide rationale for any ambiguous classifications
      5. MUST use the correct field names: bulletPoints for LIST, testimonials for TESTIMONIAL, mediaList for MEDIA, table for TABLE
      6. For testimonials, always include subject, body, reviewerName, and rating fields
      7. For bullet points, always use objects with point and supportingText (can be null)
  
  HTML : ${data.cleanHtml}`,
  };
}
