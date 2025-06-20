// lib/prompts/masterApi.ts
/**
 * Prompt functions for Master API
 * These prompts handle the orchestration and combination of different API responses
 * ALL PROMPTS ARE EXTRACTED AS-IS FROM ORIGINAL CODE WITHOUT MODIFICATIONS
 */

interface MainProduct {
  id: number;
  title: string;
  description: string;
  productUrl: string;
  imageUrl: string;
  finalPrice: number;
  totalRating: number;
}

interface ProductSections {
  intro: {
    header: string;
    paragraph: string;
  };
  collection: {
    header: string;
    products: Array<{
      id: number;
      title: string;
      description: string;
      productUrl: string;
      imageUrl: string;
      finalPrice: number;
      totalRating: number;
    }>;
  };
  pair_it_with?: {
    header: string;
    text: string;
    product: {
      id: number;
      title: string;
      productUrl: string;
      imageUrl: string;
      finalPrice: number;
    };
  };
}

/**
 * EXACT prompt conversion function from Master API
 * Converts product sections to landing page prompt format - EXACT AS-IS
 */
export function getMasterLandingPagePrompt(
  mainProduct: MainProduct,
  sections: ProductSections,
  extraPrompt?: string,
  adStory?: string
): string {
  let prompt = `Create a comprehensive landing page for the product "${mainProduct.title}".`;

  // Add user's custom instructions if provided
  if (extraPrompt) {
    prompt += `\n\nCustom Instructions: ${extraPrompt}`;
  }

  // Add ad story if provided
  if (adStory) {
    prompt += `\n\nAd Story: ${adStory}`;
  }

  prompt += `
  
  MAIN PRODUCT DETAILS:
  - Title: ${mainProduct.title}
  - Description: ${mainProduct.description}
  - Price: ₹${mainProduct.finalPrice}
  - Rating: ${mainProduct.totalRating}
  - Product URL: ${mainProduct.productUrl}
  
  EXISTING SECTIONS (already created separately):
  
  1. INTRO SECTION:
     Header: ${sections.intro.header}
     Content: ${sections.intro.paragraph}
  
  2. COLLECTION SECTION (${sections.collection.header}):
     Products to feature:`;

  sections.collection.products.forEach((product, index) => {
    prompt += `
     ${index + 1}. ${product.title} - ${product.description} (₹${
      product.finalPrice
    })`;
  });

  if (sections.pair_it_with) {
    prompt += `
  
  3. PAIR IT WITH SECTION:
     Header: ${sections.pair_it_with.header}
     Content: ${sections.pair_it_with.text}
     Recommended Product: ${sections.pair_it_with.product.title} (₹${sections.pair_it_with.product.finalPrice})`;
  }

  prompt += `
  
  Create additional sections that would naturally complement this product and enhance the landing page experience. Let your creativity flow to build the most compelling product page possible. The above sections are already handled, so focus on creating other valuable sections that would help convert visitors into customers . Also create only content sections here we are not required to create Footers or any such kind of boilerplate sections`;

  return prompt;
}
