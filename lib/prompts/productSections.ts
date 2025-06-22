// lib/prompts/productSections.ts
/**
 * Prompt functions for ProductMappingSections API
 * These prompts handle product-specific content generation
 * ALL PROMPTS ARE EXTRACTED AS-IS FROM ORIGINAL CODE WITHOUT MODIFICATIONS
 */

interface Product {
  id: number;
  title: string;
  description: string;
  productUrl: string;
  imageUrl: string;
  finalPrice: number;
  totalRating: number;
  sku: string;
}

interface ProductIntroPromptData {
  productTitle: string;
  productDescription: string;
  additionalPrompt?: string;
}

interface PairItWithPromptData {
  mainProductTitle: string;
  mainProductDescription: string;
  pairProductTitle: string;
  pairProductDescription: string;
}

interface AIProductMatchingData {
  mainProduct: Product;
  productList: Array<{
    url: string;
    title: string;
    description: string;
    price: number;
    rating: number;
  }>;
}

/**
 * EXACT prompt from ProductMappingSections API for product introduction
 * Returns system and user prompts for generating intro sections
 */
export function getProductIntroSectionPrompt(data: ProductIntroPromptData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are a skilled marketing copywriter specializing in product descriptions and cross-selling content. Keep responses concise and engaging. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `Create an engaging product introduction for "${
      data.productTitle
    }".
        
        Product Description: ${data.productDescription}
        ${
          data.additionalPrompt
            ? `Additional Context: ${data.additionalPrompt}`
            : ""
        }
        
        Generate:
        1. A compelling page header (5-8 words)
        2. An engaging paragraph that highlights the key benefits between 15-20 words strictly
        
        Return the response as a pure JSON object without any markdown formatting:
        {
          "header": "Your header here",
          "paragraph": "Your paragraph here"
        }`,
  };
}

/**
 * EXACT prompt from ProductMappingSections API for pair it with section
 * Returns system and user prompts for cross-sell content
 */
export function getProductPairItWithSectionPrompt(data: PairItWithPromptData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are a skilled marketing copywriter specializing in product descriptions and cross-selling content. Keep responses concise and engaging. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `Create a compelling cross-sell section explaining why "${data.pairProductTitle}" should be bought with "${data.mainProductTitle}".
          
          Main Product: ${data.mainProductTitle} - ${data.mainProductDescription}
          Complementary Product: ${data.pairProductTitle} - ${data.pairProductDescription}
          
          Objective: Show how buying both products together maximizes benefits compared to buying only the main product.
          
          Generate:
          1. A punchy, eye-catching header (4-6 words)
          2. Short persuasive text (2-3 sentences) explaining the combined benefits
          
          Return the response as a pure JSON object without any markdown formatting:
          {
            "header": "Your header here",
            "text": "Your text here"
          }`,
  };
}

/**
 * EXACT prompt from ProductMappingSections API for AI product matching
 * Returns system and user prompts for product recommendations
 */
export function getAIProductMatchingPrompt(data: AIProductMatchingData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are an expert e-commerce product analyst who specializes in cross-selling and product recommendations. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `
        Analyze the main product and suggest the best complementary products for cross-selling and collection.
  
        MAIN PRODUCT:
        Title: ${data.mainProduct.title}
        Description: ${data.mainProduct.description}
        Price: ₹${data.mainProduct.finalPrice}
  
        AVAILABLE PRODUCTS:
        ${JSON.stringify(data.productList, null, 2)}
  
        TASK:
        1. Select 1 product that would be PERFECT to pair with the main product (for cross-selling)
        2. Select products for a "You might also like" collection
        3. Consider factors like:
           - Complementary functionality
           - Similar target audience
           - Price compatibility
           - Product synergy
           - Customer journey enhancement
  
        REQUIREMENTS:
        - The pair product should enhance or complement the main product's benefits
        - Collection products should appeal to the same customer but offer variety
        - Avoid selecting the same product for both pair and collection
        - Consider different price points for collection diversity
        - Return ONLY the JSON object, no markdown formatting, no code blocks
  
        Return the response as a pure JSON object without any markdown formatting:
        {
          "pairProduct": "complete_product_url_here",
          "collectionProducts": ["url1", "url2", "url3", "url4"],
          "reasoning": "Brief explanation of why these products were selected"
        }
      `,
  };
}
