// lib/prompts.ts
/**
 * Custom prompt for dynamically analyzing a website and generating appropriate landing page sections
 */
export const dynamicLandingPagePrompt = `
Analyze the provided URL and create a comprehensive landing page structure tailored specifically to this website's content and purpose.

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

Structure the response as a JSON object with clear section delineation.
`;

/**
 * Prompt for detailed module creation with improved content segregation
 */
export const moduleCreationPrompt = `
You are an expert in converting landing page content into clean, well-structured modules. Your goal is to properly segregate different content types within a section.

Focus on these module types:

1. TEXT modules:
   - HEADER: Section main title
   - SUB_HEADER: Secondary titles
   - PARAGRAPH: Text paragraphs
  

2. LIST modules:
   - BULLET_POINTS: Simple bullet lists
   - BULLET_POINTS_WITH_SUPPORTING_TEXT: Bullet points with title and supporting text

3. TESTIMONIAL modules:
   - TESTIMONIAL: Customer quotes

4. MEDIA modules:
   - IMAGE: Image content
   - VIDEO: Video content

5. TABLE modules:
   - TABLE_1: Three-column table
   - TABLE_2: Two-column table

IMPORTANT RULES:
1. NEVER combine different content types in a single module
2. If content has a paragraph followed by bullet points, create TWO separate modules
3. Look for natural breaks in the content and create logical separations
4. If bullet points have a "Title: Supporting text" structure, use BULLET_POINTS_WITH_SUPPORTING_TEXT
5. If media is mentioned, create appropriate MEDIA modules
6. If structured data is present, use TABLE modules
7. Each module should represent ONE type of content only

The most important principle: Properly segregate different content types into separate modules.
`;

/**
 * Example of proper content segregation for reference
 */
export const contentSegregationExample = `
Original content:
"Our product is designed with three core values in mind:
- Quality: We use only the finest materials
- Durability: Built to last for years
- Sustainability: Environmentally friendly production
 What we learned ? 
  Better Quality 
  Beter Durability 
  Better sustainability
Contact us today to learn more about our commitment to excellence."

WRONG way to structure (combined into one module):
[{
  "type": "TEXT",
  "subtype": "PARAGRAPH",
  "content": "Our product is designed with three core values in mind:\\n- Quality: We use only the finest materials\\n- Durability: Built to last for years\\n- Sustainability: Environmentally friendly production\\nWhat we learned  ? 
  Better Quality 
  Beter Durability 
  Better sustainability Contact us today to learn more about our commitment to excellence.

  "
}]

CORRECT way to structure (properly segregated):
[{
  "type": "TEXT",
  "subtype": "PARAGRAPH",
  "content": "Our product is designed with three core values in mind:"
}, {
  "type": "LIST",
  "subtype": "BULLET_POINTS_WITH_SUPPORTING_TEXT",
  "content": [
  {point:"Quality",
  supporting_text:"We use only the finest materials"},
   {point:"Durability",
  supporting_text:"Built to last for years"},
   {point:"Sustainability",
  supporting_text:"Environmentally friendly production"},
  
  ]
},
 {
  "type": "LIST",
  "subtype": "BULLET_POINTS_WITH_SUPPORTING_TEXT",
  "content": [
  {point:"Quality",
  supporting_text:"We use only the finest materials"},
   {point:"Durability",
  supporting_text:"Built to last for years"},
   {point:"Sustainability",
  supporting_text:"Environmentally friendly production"},
  
  ]
},
{
  "type": "TEXT",
  "subtype": "SUB_HEADER",
  "content": " What we learned ?"
},
 {
  "type": "LIST",
  "subtype": "BULLET_POINTS",
  "content": [
  " Better Quality",
  "Beter Durability  ",
   "Better sustainability "
  ]
},
{
  "type": "TEXT",
  "subtype": "PARAGRAPH",
  "content": "Contact us today to learn more about our commitment to excellence."
}]
`;
