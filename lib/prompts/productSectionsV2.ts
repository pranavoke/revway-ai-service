// lib/prompts/productSectionsV3.ts - SEPARATE PAIR AND COLLECTION PROMPTS
/**
 * Separate prompt functions for improved pair and collection flows
 * Clean separation of concerns with complete product data schemas
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
  additionalPrompt?: string;
}

// SEPARATE PAIR PRODUCT SELECTION DATA
interface AIPairProductData {
  mainProduct: Product;
  productList: Array<{
    url: string;
    title: string;
    description: string;
    price: number;
    rating: number;
  }>;
  additionalPrompt?: string;
}

// SEPARATE COLLECTION PRODUCT SELECTION DATA
interface AICollectionProductData {
  mainProduct: Product;
  productList: Array<{
    url: string;
    title: string;
    description: string;
    price: number;
    rating: number;
  }>;
  pairProduct?: {
    title: string;
    description: string;
    price: number;
  } | null;
  additionalPrompt?: string;
}

interface CustomerLovePromptData {
  productTitle: string;
  productDescription: string;
  additionalPrompt?: string;
}

/**
 * Product introduction prompt (unchanged)
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
 * Pair it with content generation prompt (unchanged)
 */
export function getProductPairItWithSectionPrompt(data: PairItWithPromptData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are a skilled marketing copywriter specializing in product descriptions and cross-selling content. Keep responses concise and engaging. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `Create a compelling cross-sell section explaining why "${
      data.pairProductTitle
    }" should be bought with "${data.mainProductTitle}".
              
              Main Product: ${data.mainProductTitle} - ${
      data.mainProductDescription
    }
              Complementary Product: ${data.pairProductTitle} - ${
      data.pairProductDescription
    }
               ${
                 data.additionalPrompt
                   ? `Additional Context which should be considered while selecting products: ${data.additionalPrompt}`
                   : ""
               }
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
 * NEW: SEPARATE AI PAIR PRODUCT SELECTION PROMPT
 * Focus: Find the BEST single complementary product
 */
export function getAIPairProductPrompt(data: AIPairProductData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are an expert e-commerce product analyst specializing in finding the PERFECT complementary product for cross-selling. Your goal is to find the ONE best product that customers would want to buy together with the main product. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `
            Find the BEST single complementary product for the main product.
      
            MAIN PRODUCT:
            Title: ${data.mainProduct.title}
            Description: ${data.mainProduct.description}
            Price: ₹${data.mainProduct.finalPrice}
            Category: Extract from description
      
            AVAILABLE PRODUCTS FOR PAIRING:
            ${JSON.stringify(data.productList, null, 2)}
            
            ${
              data.additionalPrompt
                ? `Additional Context: ${data.additionalPrompt}`
                : ""
            }
      
            SELECTION CRITERIA (in priority order):
            1. **Complementary Functionality** - Products that work together (e.g., body wash + lotion, shampoo + conditioner)
            2. **Same Routine/Usage** - Products used in the same context or routine
            3. **Similar Target Audience** - Appeals to the same customer needs
            4. **Price Compatibility** - Price range that makes sense together
            5. **Category Synergy** - Related product categories
            6. **Customer Journey** - Natural next step in customer's purchase journey
      
            REQUIREMENTS:
            - Select EXACTLY ONE product URL from the available list
            - Choose the product with the HIGHEST complementary value
            - Focus on products customers would naturally buy together
            - Avoid random recommendations - must have clear synergy
            - Consider if main product is skincare -> pair with related skincare
            - Consider if main product is haircare -> pair with related haircare
      
            RESPONSE FORMAT:
            {
              "pairProduct": "EXACT_URL_FROM_AVAILABLE_LIST",
              "reasoning": "explanation of why this is the perfect complement in less the 15 words strictly "
            }
            
            CRITICAL: pairProduct MUST be an exact URL from the available products list above.
          `,
  };
}

/**
 * NEW: SEPARATE AI COLLECTION PRODUCTS SELECTION PROMPT
 * Focus: Find diverse collection products (excluding pair product)
 */
export function getAIProductCollectionPrompt(data: AICollectionProductData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are an expert e-commerce product analyst specializing in creating diverse product collections that appeal to the same customer base. Your goal is to recommend 4 products that offer variety while maintaining customer interest. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `
            Create a diverse "You Might Also Like" collection for the main product.
      
            MAIN PRODUCT:
            Title: ${data.mainProduct.title}
            Description: ${data.mainProduct.description}
            Price: ₹${data.mainProduct.finalPrice}
      
            ${
              data.pairProduct
                ? `PAIR PRODUCT (EXCLUDED FROM COLLECTION):
            Title: ${data.pairProduct.title}
            Description: ${data.pairProduct.description}
            Price: ₹${data.pairProduct.price}
            
            NOTE: Do not include the pair product in collection - it has its own section.`
                : ""
            }
      
            AVAILABLE PRODUCTS FOR COLLECTION:
            ${JSON.stringify(data.productList, null, 2)}
            
            ${
              data.additionalPrompt
                ? `Additional Context: ${data.additionalPrompt}`
                : ""
            }
      
            COLLECTION STRATEGY:
            1. **Diverse Price Points** - Include products at different price levels
            2. **Variety of Functions** - Mix of different product types/uses
            3. **Same Target Audience** - All should appeal to buyers of main product
            4. **Discovery Factor** - Help customers discover new products
            5. **Brand Ecosystem** - Create a complete product ecosystem
            6. **Purchase Timing** - Products they might buy next or separately
      
            SELECTION REQUIREMENTS:
            - Select EXACTLY 4 products from available list
            - Ensure variety in product types and price points
            - All products should appeal to the same customer persona
            - Include both higher and lower priced options
            - Focus on discovery and cross-category appeal
            - Avoid direct competitors to the main product
            - Create a balanced mix that encourages exploration
      
            RESPONSE FORMAT:
            {
              "collectionProducts": ["url1", "url2", "url3", "url4"],
              "reasoning": "Brief explanation of the collection strategy and why these 4 products work well together (2-3 sentences)"
            }
            
            CRITICAL: All URLs MUST be exact matches from the available products list above.
          `,
  };
}

/**
 * NEW: Generate "Why Customers Love Us" section with 5 testimonials
 */
export function getCustomerLoveSectionPrompt(data: CustomerLovePromptData): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt:
      "You are a skilled marketing copywriter specializing in product testimonials and social proof content. Keep responses concise and engaging. Always return pure JSON without any markdown code blocks or formatting.",
    userPrompt: `Create a compelling "Why Customers Love Us" section with 5 testimonials for "${
      data.productTitle
    }".
            
            Product Description: ${data.productDescription}
            ${
              data.additionalPrompt
                ? `Additional Context: ${data.additionalPrompt}`
                : ""
            }
            
            Generate:
            1. A compelling section header (4-6 words)
            2. EXACTLY 5 testimonials that:
               - Have unique, realistic Indian names
               - Focus on different benefits/features
               - Include specific results or experiences
               - Are 15-20 words each
               - Have 5-star ratings
            
            Return the response as a pure JSON object without any markdown formatting:
            {
              "header": "Your header here",
              "testimonials": [
                {
                  "subject": "Compelling headline",
                  "body": "Detailed review",
                  "reviewerName": "Indian Name",
                  "rating": 5
                }
              ]
            }`,
  };
}
