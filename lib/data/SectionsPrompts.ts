import { Input } from "@/app/api/sectionGenerationAI/route";
export function processPrompt(inputData: Input) {
  const sectionPrompts: Record<string, string> = {
    Problem_Solution: `
    Create a section listing consumer problems and how the product is solving the problems. This section will be included in a landing page with the objective of product sale.
     
    Provided layout for the section : [ "Header", "List of Bullet Points with supporting text"]

    Some Instructions : 
    1.⁠ ⁠Header should be punchy and eye catching
    2.⁠ ⁠Each bullet point should be less than 7 words
    3.⁠ ⁠Each supporting text should be less than 20 words  

    `,

    // 2) Frustration with Competitive Products
    Frustration_with_Competitive_Products: `
    Create a section highlighting problems that cosumers face with competitive products.This section will be included in a landing page with the objective of product sale.

    Provided layout for the section :[ Header, Text, Bullet Point] ; 

    1. Header should be punchy and eye catching
    2. Text should be less than 20 words
    3. Each bullet point should be less than 15 words

    Consider these Audience details while creating the Section : 

    Location :${JSON.stringify(inputData.audience?.location)}
    Age : ${JSON.stringify(inputData.audience?.age)}
    Gender : ${JSON.stringify(inputData.audience?.gender)}
    Demography : ${JSON.stringify(inputData.audience?.demography)}
    `,

    // 3) Frustration with Alternative Solutions
    Frustration_with_Alternative_Solutions: `

      Create a section highlighting problems that cosumers face with Alternate Solutions 
      ${JSON.stringify(
        inputData.alternativeSolutions
      )}. This section will be included in a landing page with the objective of product sale. 


      Provided layout for the section :[ Header, Text, Bullet Point]

      1. Header should be punchy and eye catching
      2. Text should be less than 20 words
      3. Each bullet point should be less than 15 words

  
      Consider these Audience details while creating the Section : 
      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}

      
    `,

    // 4) Problem worsening in future
    Problem_worsening_in_future: `
      Create a section highlighting how current consumer problems may worsen in the future. This section will be included in a landing page with the objective of product sale.
      
      Provided layout for the section :[ Header, Text, Bullet Point] . 

      1. Header should be punchy and eye catching
      2. Text should be less than 20 words
      3. Each bullet point should be less than 15 words
    
      Consider these Audience details while creating the Section : 
      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}


    `,

    // 5) Benefits (Why choose)
    Benefits_Why_choose: `
    Create a section highlighting why one should buy the product. This section will be included in a landing page with the objective of product sale.
     
    Provided layout for the section :[  Header ,"List of Bullet Points with supporting text"]

    1. Header should be punchy and eye catching
    2. Each bullet point should be less than 7 words
    3. Each supporting text should be less than 20 words
    
      Consider these Audience details while creating the Section : 
      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}

    `,

    // 6) Why better than competitors?
    Why_better_than_competitors: `  
      Create a section why the the product is better than competitor? Cover both input and output superiority. This section will be included in a landing page with the objective of product sale.

      Provided layout for the section :["Header" , Table("Feature", "Our Product", "Competitor")]
    
      1. Header should be punchy and eye catching
      2. Each item in Row 1 of the table should be less than 5 words
      3. Each item in Column 1 of the table from Row 2 should be less than 7 words
      4. All other items should be less than 15 words

      Consider these Audience details while creating the Section : 
      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}

    `,

    Why_better_than_Alternative_Solutions: `

    Create a section why the the product is better than alternate solutions ${JSON.stringify(
      inputData.alternativeSolutions
    )}. This section will be included in a landing page with the objective of product sale.
    
    Provided layout for the section :["Header",Table( "Feature", "Our Product", "Alternative Solution")]

    1. Header should be punchy and eye catching
    2. Each item in Row 1 of the table should be less than 5 words
    3. Each item in Column 1 of the table from Row 2 should be less than 7 words
    4. All other items should be less than 15 words

      Consider these Audience details while creating the Section : 
      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}
    `,

    // 8) Challenge faced
    Challenge_faced: `
      Create a section highlighting challenges faced before using the product. This section will be included in a landing page with the objective of product sale.

      Provided layout for the section :["Header", "Text", "Testimonials"]

      1. Header should be punchy and eye catching
      2. Text should be less than 20 words
      3. Testimonial should be less than 20 words

      Details of Satisfied Users : 

      ${JSON.stringify(inputData.satisfiedUsers)}

      Consider these Audience details while creating the Section : 
      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}


      
    `,
    Transformation_Experienced: `
     
    CCreate a section highlighting what the user experienced after using the product. This section will be included in a landing page with the objective of product sale.

    Provided layout for the section :  ["Header", "Text", "Bullet Points", "Testimonials"]

     1. Header should be punchy and eye catching
     2. Text should be less than 20 words
     3. Each bullet point should be less than 15 words
     4. Testimonial should be less than 20 words

      Consider these Audience details while creating the Section : 

      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}
    `,

    // 10) Why Expert Recommend
    Why_Expert_Recommend: `
  
      Create a section highlighting why the expert recommends the product. This section will be included in a landing page with the objective of product sale.

      Details of the Experts : 
      ${JSON.stringify(inputData.experts)}
  
      Provided layout for the section : [ Header, Expert Intro , Text , Bullet Points]

      1. Header should be punchy and eye catching
      2. Text should be less than 10 words
      3. Each bullet point should be less than 15 words

      Consider these Audience details while creating the Section : 

      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}


    `,

    // 11) Ingredient Detail
    Ingredient_Detail: `
     
      Create 3 subsections 1) The Science 2) Key Benefits 3) Sourcing. This section will be included in a landing page with the objective of product sale.

      Provided layout for the section : ["Name", "The Science", "Text", "Key Benefits"]

      1. Header should be name of the Ingredient
      2. Sub-Header should name of the sub-sections
      3. Text should be less than 20 words
      4. Each bullet point should be less than 15 words

      Details of the Ingridients : 

      ${JSON.stringify(inputData.keyIngridients)};


      Consider these Audience details while creating the Section : 

      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}

    `,

    // 12) Reason to Buy
    Reason_to_Buy: `
    There is a reason given why someone should by the product. Create a section expanding the reason and supporting the reason with details

      Layout:
        - Generic Layout

      Here are some reasons to buy the product : 

      ${JSON.stringify(inputData.reasonToBuy)};


      Consider these Audience details while creating the Section : 

      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}
  
     
    `,

    // 13) Busting the Myths
    Busting_the_Myths: `
      There is a broad myth given on why people don’t buy. Create a section by generating sub myths related to the broad myth and bust the sub myths with specific details. This section will be included in a landing page with the objective of product sale.

      Provided layout for the section : ["Header", Table("Myth","Fact")]

      1. Each Text should be less than 15 words

      Myths about the product : 

      ${JSON.stringify(inputData.myths)};


      Consider these Audience details while creating the Section : 

      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}

    `,

    // 14) Ingredients
    Ingredients: `
      Create a section by mentioning key Ingredients and their function benefiting the consumer.This section will be included in a landing page with the objective of product sale.

     Provided layout for the section :["Header", "Bullet Point", "Supporting Text"]

     1. Header should be punchy and eye catching.
     2. Name of each bullet point should be Ingredient name.
     3. Each supporting text should be less than 10 words .

    `,

    // 15) Callouts for Offers/Free Shipping
    "Callouts for Offers/Free Shipping": `
      Make it strictly according to the layout:
      Layout:
        - Text
  
      Present any special offers or deals, highlighting free shipping or discounts.
    `,

    // 16) Callouts for Warranty/Refund Timeline/Delivery Timeline
    "Callouts for Warranty/Refund Timeline/Delivery Timeline": `
      Make it strictly according to the layout:
      Layout:
        - Text
  
      Present details about warranty, refund timelines, or delivery timelines in a concise manner.
    `,

    // 17) Product Snippet
    "Product Snippet": `
      Make it strictly according to the layout:
      Layout:
        - Defined
  
      A short, punchy product overview block (title, short description, price, etc.).
    `,

    // 18) Shop Now
    "Shop Now": `
      Make it strictly according to the layout:
      Layout:
        - Defined
  
      A call-to-action section prompting immediate purchase (e.g., "Buy Now" with a button).
    `,

    Pair_it_with: `
       Create a section why Product 2 should be bought along with Product 1 ? The objective should be to showcase maximizing benefits of Product 1 , When both Product 2 and Product 1 i bought vs Only Product 1 bought standalone . 

      Provided layout for the section :["Header", "Text"] . 

      1. Header should be punchy and eye catching
      2. the length of the text should be short . 
     
    `,

    // 20) CTA
    CTA: `
      Make it strictly according to the layout:
      Layout:
        - Text
  
      Craft a compelling call-to-action statement or button text.
    `,

    // 21) Recent Reviews
    "Recent Reviews": `
      Make it strictly according to the layout:
      Layout:
        - Defined
  
      Showcase fresh, up-to-date reviews of the product, including star ratings or short quotes.
    `,

    // 22) Banner
    Banner: `
      Make it strictly according to the layout:
      Layout:
        - Text
  
      A prominent banner section with minimal text to catch attention.
    `,

    // 23) Meet the Brand
    "Meet the Brand": `
      Make it strictly according to the layout:
      Layout:
        1) Image+Text+Testimonial
        2) Text+Text
  
      Introduce the brand’s background story, mission, and any relevant testimonials.
    `,

    // 24) Brand Credibility
    "Brand Credibility": `
      Make it strictly according to the layout:
      Layout:
        1) Text+Text
  
      Build trust by showcasing brand strengths, certifications, awards, or expertise.
    `,

    // 25) Customers Love
    Customers_Love: `
     Display 10 reviews or short quotes praising the product.
     
      Consider these Audience details while creating the Section : 

      Location :${JSON.stringify(inputData.audience?.location)}
      Age : ${JSON.stringify(inputData.audience?.age)}
      Gender : ${JSON.stringify(inputData.audience?.gender)}
      Demography : ${JSON.stringify(inputData.audience?.demography)}
      
    `,

    // 26) Suggested Routine
    Suggested_Routine: `
      
      Create a section that gives possible routines of using the product. The routine can be by time of the day, convenience or season. This section will be included in a landing page with the objective of product sale.

      Provided layout for the section: ["Header", "Bullet Point", "Supporting Text"] . 

      1. Header should be punchy and eye catching
      2. Each bullet point should be less than 5 words
      3. Each supporting text should be less than 20 words

    `,

    Usage_Guide: `
      Create a section that gives in steps of how to use the product. The routine can be by time of the day, convenience or season. This section will be included in a landing page with the objective of product sale.

      Provided layout for the section: ["Header", "Bullet Point", "Supporting Text"] . 

      1. Header should be punchy and eye catching. 
      2. Each bullet point should be less than 5 words. 
      3. Each supporting text should be less than 20 words.
    `,

    // 28) Grid Collections
    "Grid Collections": `
      Make it strictly according to the layout:
      Layout:
        - Defined
  
      A product collection showcase in a grid layout, typically with brief descriptions.
    `,

    // 29) Results Timeline
    Results_Timeline: `
      Create a section that gives expected benefits of using the product on various timeline.This section will be included in a landing page with the objective of product sale.

      Provided layout for the section: ["Header", "Bullet Point", "Supporting Text"] . 

      1. Header should be punchy and eye catching
      2. Name of each bullet point should be timeline milestone
      3. Each supporting text should be less than 20 words 


    `,

    // 30) Product Credibility
    "Product Credibility": `
      Make it strictly according to the layout:
      Layout:
        1) Defined
        2) Text
  
      Highlight aspects that validate the product’s trustworthiness (awards, endorsements, stats).
    `,

    // 31) Intro Visual
    "Intro Visual": `
      This is a placeholder for an introductory visual or hero image/video—no strict text layout required.
    `,

    // 32) Custom Section
    "Custom Section": `
      This is a generic placeholder for any custom content not covered by the other layouts.
    `,

    // 33) Intro Visual Custom Combo
    "Intro Visual Custom Combo": `
      A special hero or intro visual for a combo product—no strict text layout required.
    `,

    // 34) Intro Visual Combo Product
    "Intro Visual Combo Product": `
      Another specialized visual introduction for a combo product—no strict text layout required.
    `,

    // 35) Inside Combo
    "Inside Combo": `
      A quick listing of what’s included in the combo, possibly with brief descriptions—no strict text layout required.
    `,

    // 36) Product Brief
    Product_Brief: `
      Create a section highlighting key benefits and ingredients of the product. This section will be included in a landing page with the objective of Product sale.

       Provided layout for the section: ["Header", "Text"] . 

       1. Header should be name of the Product
       2. Sub-Header catchy highlighting benefit of the product in less than 8 words
       3. Text should be less than 30 word . 


    `,

    Why_Choose_Combo: `
      
      Create a section briefly highlighting why one should buy the combo. This section will be included in a landing page with the objective of Product sale.

       Provided layout for the section: ["Header", "Bullet Point", "Supporting Text"] . 

       1. Header should be punchy and eye catching
       2. Each bullet point should be less than 5 words
       3. Each supporting text should be less than 15 words

       Purpose for buying the combo : ${JSON.stringify(inputData.purpose)}

    `,

    // 38) Customers Love Combo
    Customers_Love_Combo: `
      Display 10 reviews or short quotes praising the combo.

      Purpose for buying the combo : ${JSON.stringify(inputData.purpose)}
    `,

    // 39) Usage Guide Combo
    Usage_Guide_Combo: `
      Create a section that gives in steps of how to use the Combo. This section will be included in a landing page with the objective of Product sale.

      Provided layout for the section: ["Header", "Bullet Point", "Supporting Text"] . 

      1. Header should be punchy and eye catching
      2. Each bullet point should be less than 5 words
      3. Each supporting text should be less than 15 words

    `,

    // 40) Shop Now Combo
    "Shop Now Combo": `
      A CTA section prompting immediate purchase of the combo—no strict text layout required.
    `,
  };
  const prompt = sectionPrompts[inputData.sectionFinder];
  return JSON.stringify(prompt);
}
