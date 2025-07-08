'use client';

import { useState } from 'react';

type TabType = 'category' | 'currency' | 'pricing' | 'marketing' | 'strategist' | 'structure';

interface CategoryResult {
  category: string;
}

interface CurrencyResult {
  currency: string;
}

interface PricingResult {
  priceClassification: string;
  reasoning: string;
}

interface MarketingResult {
  visualComplexity: string;
  decisionComplexity: string;
  emotionalPurchaseFactor: string;
  familiarity: string;
  reasoning: {
    visualComplexity: string;
    decisionComplexity: string;
    emotionalPurchaseFactor: string;
    familiarity: string;
  };
}

interface StrategistResult {
  recommendedLandingPageStyle: string;
  confidence: string;
  reasoning: {
    productAttributesAnalysis: string;
    pricePointAnalysis: string;
    adStoryAnalysis: string;
    overallRationale: string;
  };
  alternativeConsiderations: string;
}

interface StructureResult {
  visual_density: string;
  cognitive_depth: string;
  content_length: string;
  expected_section_range: string;
  reasoning: {
    visual_density_analysis: string;
    cognitive_depth_analysis: string;
    content_length_analysis: string;
    section_range_analysis: string;
  };
  recommendations: {
    visual_elements: string;
    content_strategy: string;
    structure_guidance: string;
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('category');
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState<{[key: string]: boolean}>({});
  
  // Category form state
  const [categoryUrl, setCategoryUrl] = useState('');
  const [categoryResult, setCategoryResult] = useState<CategoryResult | null>(null);
  
  // Currency form state
  const [currencyUrl, setCurrencyUrl] = useState('');
  const [currencyResult, setCurrencyResult] = useState<CurrencyResult | null>(null);
  
  // Pricing form state
  const [pricingCategory, setPricingCategory] = useState('');
  const [pricingAmount, setPricingAmount] = useState('');
  const [pricingCurrency, setPricingCurrency] = useState('');
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  
  // Marketing form state
  const [marketingCategory, setMarketingCategory] = useState('');
  const [marketingResult, setMarketingResult] = useState<MarketingResult | null>(null);
  
  // Strategist form state
  const [strategistVisualComplexity, setStrategistVisualComplexity] = useState('');
  const [strategistDecisionComplexity, setStrategistDecisionComplexity] = useState('');
  const [strategistEmotionalFactor, setStrategistEmotionalFactor] = useState('');
  const [strategistFamiliarity, setStrategistFamiliarity] = useState('');
  const [strategistPricePoint, setStrategistPricePoint] = useState('');
  const [strategistAdStory, setStrategistAdStory] = useState('');
  const [strategistResult, setStrategistResult] = useState<StrategistResult | null>(null);
  
  // Structure form state
  const [structureProductCategory, setStructureProductCategory] = useState('');
  const [structureVisualComplexity, setStructureVisualComplexity] = useState('');
  const [structureDecisionComplexity, setStructureDecisionComplexity] = useState('');
  const [structureEmotionalFactor, setStructureEmotionalFactor] = useState('');
  const [structureFamiliarity, setStructureFamiliarity] = useState('');
  const [structurePricePoint, setStructurePricePoint] = useState('');
  const [structureAdStory, setStructureAdStory] = useState('');
  const [structureLpStyle, setStructureLpStyle] = useState('');
  const [structureResult, setStructureResult] = useState<StructureResult | null>(null);

  const togglePrompt = (tab: string) => {
    setShowPrompt(prev => ({
      ...prev,
      [tab]: !prev[tab]
    }));
  };

  const getPromptTemplate = (tab: TabType, values: any = {}) => {
    switch (tab) {
      case 'category':
        return `Product URL: ${values.productUrl || '{productUrl}'}
Identify the category of the product based on the product URL.
Return the category in this exact JSON format:
{
  "category": "Category Name"
}`;
      case 'currency':
        return `Product URL: ${values.productUrl || '{productUrl}'}
Identify the currency of the product based on the product URL.
Return the currency in this exact JSON format:
{
  "currency": "Currency Name"
}`;
      case 'pricing':
        return `You are a pricing analyst. Given the product category: "${values.category || '{category}'}", product price: ${values.price || '{price}'}, and currency: "${values.currency || '{currency}'}", classify the price as "low", "medium", or "high" based on what is typical for the category in that currency/market.

Consider market standards, typical price ranges, consumer expectations, and purchasing power for this category in the ${values.currency || '{currency}'} market when making your classification.

Return the classification in this exact JSON format:
{
  "priceClassification": "low|medium|high",
  "reasoning": "Brief explanation of why this price falls into this category considering the currency and market context"
}`;
      case 'marketing':
        return `You are an expert marketing analyst. For the product category: "${values.category || '{category}'}", please provide the following attribute ratings on a scale of "low", "medium", or "high":

1. Visual Complexity — How visually expressive or imagery-heavy products in this category typically are.
2. Decision Complexity — How involved or complex the purchase decision usually is
3. Emotional Purchase Factor — How emotionally driven the purchase typically is versus rational.
4. Familiarity — How familiar most buyers are with this product type.

Consider typical consumer behavior, market standards, and purchasing patterns for this category when making your ratings.

Return the analysis in this exact JSON format:
{
  "visualComplexity": "low|medium|high",
  "decisionComplexity": "low|medium|high", 
  "emotionalPurchaseFactor": "low|medium|high",
  "familiarity": "low|medium|high",
  "reasoning": {
    "visualComplexity": "Brief explanation for visual complexity rating",
    "decisionComplexity": "Brief explanation for decision complexity rating",
    "emotionalPurchaseFactor": "Brief explanation for emotional purchase factor rating",
    "familiarity": "Brief explanation for familiarity rating"
  }
}`;
      case 'strategist':
        return `You are an expert marketing strategist. Based on the inputs below, determine the most appropriate landing page style for a product and its associated ad story.

Input Fields:
{
  "product_category_attributes": {
    "Visual Complexity": "${values.visualComplexity || '{visualComplexity}'}",
    "Decision Complexity": "${values.decisionComplexity || '{decisionComplexity}'}",
    "Emotional Purchase Factor": "${values.emotionalPurchaseFactor || '{emotionalPurchaseFactor}'}",
    "Familiarity": "${values.familiarity || '{familiarity}'}"
  },
  "price_point": "${values.pricePoint || '{pricePoint}'}",
  "ad_story": "${values.adStory || '{adStory}'}"
}

Landing Page Style Definitions (Purpose-Focused):
- pdp_style — Designed to support quick purchase decisions by focusing on essential information and fast conversion. Minimal persuasion or education needed.
- regular_lp — Balances product explanation and persuasive storytelling to inform and convince moderately engaged buyers.
- advertorial — Deeply engages users through storytelling, emotional connection, and detailed education for complex or high-consideration purchases.

Return the recommendation in this exact JSON format:
{
  "recommendedLandingPageStyle": "pdp_style|regular_lp|advertorial",
  "confidence": "high|medium|low",
  "reasoning": {
    "productAttributesAnalysis": "Analysis of how product attributes influenced the decision (50% weight)",
    "pricePointAnalysis": "Analysis of how price point influenced the decision (30% weight)",
    "adStoryAnalysis": "Analysis of how ad story influenced the decision (20% weight)",
    "overallRationale": "Summary of the decision-making process and why this style was chosen"
  },
  "alternativeConsiderations": "Brief note on other styles that were considered and why they were not chosen"
}`;
      case 'structure':
        return `You are an expert marketing analyst tasked with determining the optimal landing page structure based on the following inputs:

- Product Category: ${values.productCategory || '{productCategory}'}
- Product Category Attributes:
   * Visual Complexity: ${values.visualComplexity || '{visualComplexity}'}
   * Decision Complexity: ${values.decisionComplexity || '{decisionComplexity}'}
   * Emotional Purchase Factor: ${values.emotionalPurchaseFactor || '{emotionalPurchaseFactor}'}
   * Familiarity: ${values.familiarity || '{familiarity}'}
- Price Point: ${values.pricePoint || '{pricePoint}'}
- Ad Story: ${values.adStory || '{adStory}'}
- lp_style: ${values.lpStyle || '{lpStyle}'}

LP Style Definitions:
- pdp_style means for quick conversion with minimal persuasion
- regular_lp means balanced persuasion and explanation
- advertorial means deep storytelling and education for complex purchases

Based on these inputs, determine the following landing page structure elements:

1. Visual Density (visual_density): low / medium / high
2. Cognitive Depth (cognitive_depth): shallow / moderate / deep
3. Content Length (content_length): short_form / mid_form / long_form
4. Expected Section Range (expected_section_range): 6-7 / 7-8 / 10+

Return the analysis in this exact JSON format:
{
  "visual_density": "low|medium|high",
  "cognitive_depth": "shallow|moderate|deep",
  "content_length": "short_form|mid_form|long_form",
  "expected_section_range": "6-7|7-8|10+",
  "reasoning": {
    "visual_density_analysis": "Explanation of how visual complexity and ad story influenced visual density decision",
    "cognitive_depth_analysis": "Explanation of how decision complexity, familiarity, ad story depth, and lp_style influenced cognitive depth",
    "content_length_analysis": "Explanation of how lp_style and visual_density influenced content length decision",
    "section_range_analysis": "Explanation of how lp_style determined the expected section range"
  },
  "recommendations": {
    "visual_elements": "Specific recommendations for visual elements based on visual_density",
    "content_strategy": "Specific recommendations for content strategy based on cognitive_depth and content_length",
    "structure_guidance": "Specific recommendations for page structure based on expected_section_range"
  }
}`;
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/RevanaCreation/CategoryDetermination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productUrl: categoryUrl }),
      });
      const data = await response.json();
      setCategoryResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/RevanaCreation/CurrencyDetermination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productUrl: currencyUrl }),
      });
      const data = await response.json();
      setCurrencyResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/RevanaCreation/PricingAnalyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          category: pricingCategory, 
          price: pricingAmount,
          currency: pricingCurrency 
        }),
      });
      const data = await response.json();
      setPricingResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/RevanaCreation/marketingAnalyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          category: marketingCategory
        }),
      });
      const data = await response.json();
      setMarketingResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/RevanaCreation/MarketingStrategist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          product_category_attributes: {
            visualComplexity: strategistVisualComplexity,
            decisionComplexity: strategistDecisionComplexity,
            emotionalPurchaseFactor: strategistEmotionalFactor,
            familiarity: strategistFamiliarity
          },
          price_point: strategistPricePoint,
          ad_story: strategistAdStory
        }),
      });
      const data = await response.json();
      setStrategistResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/RevanaCreation/marketingAnalystOutput', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          product_category: structureProductCategory,
          product_category_attributes: {
            visualComplexity: structureVisualComplexity,
            decisionComplexity: structureDecisionComplexity,
            emotionalPurchaseFactor: structureEmotionalFactor,
            familiarity: structureFamiliarity
          },
          price_point: structurePricePoint,
          ad_story: structureAdStory,
          lp_style: structureLpStyle
        }),
      });
      const data = await response.json();
      setStructureResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'category':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Category Determination</h2>
              <p className="text-gray-600 mb-4">Enter a product URL to determine its category</p>
            </div>
            
            {/* Prompt Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => togglePrompt('category')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900"
              >
                <span>View Prompt Template</span>
                <span className="text-sm">{showPrompt.category ? '▼' : '▶'}</span>
              </button>
              {showPrompt.category && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Variables:</strong> {'{productUrl}'}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {getPromptTemplate('category', { productUrl: categoryUrl })}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="categoryUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <input
                  type="url"
                  id="categoryUrl"
                  value={categoryUrl}
                  onChange={(e) => setCategoryUrl(e.target.value)}
                  required
                  placeholder="https://example.com/product"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Determine Category'}
              </button>
            </form>
            {categoryResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(categoryResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'currency':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Currency Determination</h2>
              <p className="text-gray-600 mb-4">Enter a product URL to determine its currency</p>
            </div>
            
            {/* Prompt Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => togglePrompt('currency')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900"
              >
                <span>View Prompt Template</span>
                <span className="text-sm">{showPrompt.currency ? '▼' : '▶'}</span>
              </button>
              {showPrompt.currency && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Variables:</strong> {'{productUrl}'}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {getPromptTemplate('currency', { productUrl: currencyUrl })}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleCurrencySubmit} className="space-y-4">
              <div>
                <label htmlFor="currencyUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <input
                  type="url"
                  id="currencyUrl"
                  value={currencyUrl}
                  onChange={(e) => setCurrencyUrl(e.target.value)}
                  required
                  placeholder="https://example.com/product"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Determine Currency'}
              </button>
            </form>
            {currencyResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(currencyResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pricing Analysis</h2>
              <p className="text-gray-600 mb-4">Enter product category, price, and currency for analysis</p>
            </div>
            
            {/* Prompt Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => togglePrompt('pricing')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900"
              >
                <span>View Prompt Template</span>
                <span className="text-sm">{showPrompt.pricing ? '▼' : '▶'}</span>
              </button>
              {showPrompt.pricing && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Variables:</strong> {'{category}'}, {'{price}'}, {'{currency}'}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {getPromptTemplate('pricing', { category: pricingCategory, price: pricingAmount, currency: pricingCurrency })}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handlePricingSubmit} className="space-y-4">
              <div>
                <label htmlFor="pricingCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <input
                  type="text"
                  id="pricingCategory"
                  value={pricingCategory}
                  onChange={(e) => setPricingCategory(e.target.value)}
                  required
                  placeholder="e.g., Electronics, Clothing, Home & Garden"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                              </div>
                <div>
                  <label htmlFor="pricingAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    id="pricingAmount"
                    value={pricingAmount}
                    onChange={(e) => setPricingAmount(e.target.value)}
                    required
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="pricingCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    id="pricingCurrency"
                    value={pricingCurrency}
                    onChange={(e) => setPricingCurrency(e.target.value)}
                    required
                    placeholder="e.g., USD, EUR, GBP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Pricing'}
              </button>
            </form>
            {pricingResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(pricingResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'marketing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Marketing Analysis</h2>
              <p className="text-gray-600 mb-4">Enter a product category to analyze marketing attributes</p>
            </div>
            
            {/* Prompt Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => togglePrompt('marketing')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900"
              >
                <span>View Prompt Template</span>
                <span className="text-sm">{showPrompt.marketing ? '▼' : '▶'}</span>
              </button>
              {showPrompt.marketing && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Variables:</strong> {'{category}'}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {getPromptTemplate('marketing', { category: marketingCategory })}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleMarketingSubmit} className="space-y-4">
              <div>
                <label htmlFor="marketingCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <input
                  type="text"
                  id="marketingCategory"
                  value={marketingCategory}
                  onChange={(e) => setMarketingCategory(e.target.value)}
                  required
                  placeholder="e.g., Electronics, Clothing, Home & Garden"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Marketing Attributes'}
              </button>
            </form>
            {marketingResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(marketingResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'strategist':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Marketing Strategist</h2>
              <p className="text-gray-600 mb-4">Determine the best landing page style based on product attributes, price point, and ad story</p>
            </div>
            
            {/* Prompt Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => togglePrompt('strategist')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900"
              >
                <span>View Prompt Template</span>
                <span className="text-sm">{showPrompt.strategist ? '▼' : '▶'}</span>
              </button>
              {showPrompt.strategist && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Variables:</strong> {'{visualComplexity}'}, {'{decisionComplexity}'}, {'{emotionalPurchaseFactor}'}, {'{familiarity}'}, {'{pricePoint}'}, {'{adStory}'}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {getPromptTemplate('strategist', { 
                      visualComplexity: strategistVisualComplexity,
                      decisionComplexity: strategistDecisionComplexity,
                      emotionalPurchaseFactor: strategistEmotionalFactor,
                      familiarity: strategistFamiliarity,
                      pricePoint: strategistPricePoint,
                      adStory: strategistAdStory
                    })}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleStrategistSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="strategistVisualComplexity" className="block text-sm font-medium text-gray-700 mb-2">
                    Visual Complexity
                  </label>
                  <select
                    id="strategistVisualComplexity"
                    value={strategistVisualComplexity}
                    onChange={(e) => setStrategistVisualComplexity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="strategistDecisionComplexity" className="block text-sm font-medium text-gray-700 mb-2">
                    Decision Complexity
                  </label>
                  <select
                    id="strategistDecisionComplexity"
                    value={strategistDecisionComplexity}
                    onChange={(e) => setStrategistDecisionComplexity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="strategistEmotionalFactor" className="block text-sm font-medium text-gray-700 mb-2">
                    Emotional Purchase Factor
                  </label>
                  <select
                    id="strategistEmotionalFactor"
                    value={strategistEmotionalFactor}
                    onChange={(e) => setStrategistEmotionalFactor(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="strategistFamiliarity" className="block text-sm font-medium text-gray-700 mb-2">
                    Familiarity
                  </label>
                  <select
                    id="strategistFamiliarity"
                    value={strategistFamiliarity}
                    onChange={(e) => setStrategistFamiliarity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="strategistPricePoint" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Point
                </label>
                <select
                  id="strategistPricePoint"
                  value={strategistPricePoint}
                  onChange={(e) => setStrategistPricePoint(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="strategistAdStory" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Story
                </label>
                <textarea
                  id="strategistAdStory"
                  value={strategistAdStory}
                  onChange={(e) => setStrategistAdStory(e.target.value)}
                  required
                  rows={4}
                  placeholder="Enter the ad story or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Get Landing Page Recommendation'}
              </button>
            </form>
            {strategistResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(strategistResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      case 'structure':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Landing Page Structure Analysis</h2>
              <p className="text-gray-600 mb-4">Determine optimal landing page structure based on comprehensive product and marketing inputs</p>
            </div>
            
            {/* Prompt Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => togglePrompt('structure')}
                className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900"
              >
                <span>View Prompt Template</span>
                <span className="text-sm">{showPrompt.structure ? '▼' : '▶'}</span>
              </button>
              {showPrompt.structure && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Variables:</strong> {'{productCategory}'}, {'{visualComplexity}'}, {'{decisionComplexity}'}, {'{emotionalPurchaseFactor}'}, {'{familiarity}'}, {'{pricePoint}'}, {'{adStory}'}, {'{lpStyle}'}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {getPromptTemplate('structure', { 
                      productCategory: structureProductCategory,
                      visualComplexity: structureVisualComplexity,
                      decisionComplexity: structureDecisionComplexity,
                      emotionalPurchaseFactor: structureEmotionalFactor,
                      familiarity: structureFamiliarity,
                      pricePoint: structurePricePoint,
                      adStory: structureAdStory,
                      lpStyle: structureLpStyle
                    })}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleStructureSubmit} className="space-y-4">
              <div>
                <label htmlFor="structureProductCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <input
                  type="text"
                  id="structureProductCategory"
                  value={structureProductCategory}
                  onChange={(e) => setStructureProductCategory(e.target.value)}
                  required
                  placeholder="e.g., Electronics, Clothing, Home & Garden"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="structureVisualComplexity" className="block text-sm font-medium text-gray-700 mb-2">
                    Visual Complexity
                  </label>
                  <select
                    id="structureVisualComplexity"
                    value={structureVisualComplexity}
                    onChange={(e) => setStructureVisualComplexity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="structureDecisionComplexity" className="block text-sm font-medium text-gray-700 mb-2">
                    Decision Complexity
                  </label>
                  <select
                    id="structureDecisionComplexity"
                    value={structureDecisionComplexity}
                    onChange={(e) => setStructureDecisionComplexity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="structureEmotionalFactor" className="block text-sm font-medium text-gray-700 mb-2">
                    Emotional Purchase Factor
                  </label>
                  <select
                    id="structureEmotionalFactor"
                    value={structureEmotionalFactor}
                    onChange={(e) => setStructureEmotionalFactor(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="structureFamiliarity" className="block text-sm font-medium text-gray-700 mb-2">
                    Familiarity
                  </label>
                  <select
                    id="structureFamiliarity"
                    value={structureFamiliarity}
                    onChange={(e) => setStructureFamiliarity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="structurePricePoint" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Point
                  </label>
                  <select
                    id="structurePricePoint"
                    value={structurePricePoint}
                    onChange={(e) => setStructurePricePoint(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="structureLpStyle" className="block text-sm font-medium text-gray-700 mb-2">
                    Landing Page Style
                  </label>
                  <select
                    id="structureLpStyle"
                    value={structureLpStyle}
                    onChange={(e) => setStructureLpStyle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="pdp_style">PDP Style</option>
                    <option value="regular_lp">Regular LP</option>
                    <option value="advertorial">Advertorial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="structureAdStory" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Story
                </label>
                <textarea
                  id="structureAdStory"
                  value={structureAdStory}
                  onChange={(e) => setStructureAdStory(e.target.value)}
                  required
                  rows={4}
                  placeholder="Enter the ad story or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Landing Page Structure'}
              </button>
            </form>
            {structureResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(structureResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Revana API Testing Suite
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('category')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'category'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Category Determination
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'currency'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Currency Determination
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'pricing'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pricing Analysis
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'marketing'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Marketing Analysis
          </button>
          <button
            onClick={() => setActiveTab('strategist')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'strategist'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Marketing Strategist
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'structure'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Structure Analysis
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
