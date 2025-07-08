# RevanaCreation API System

A comprehensive 7-step AI-powered landing page creation pipeline that transforms product information and campaign specifications into production-ready landing pages.

## 🚀 Overview

The RevanaCreation API system consists of 7 specialized APIs orchestrated by a Master API to create optimal landing pages:
1. **Category Determination** - 
1. **Style Determination** - Determines the best LP style (PDP-style/Regular LP/Advertorial)
2. **Section Planning** - Plans page structure with psychological triggers
3. **Content Generation** - Creates compelling content for each section
4. **Module Mapping** - Converts content into UI modules
5. **Layout Composition** - Arranges modules for optimal flow
6. **CTA Insertion** - Places strategic CTAs and offers
7. **Rendering** - Generates production-ready code

## 📡 API Endpoints

### Master API

```
POST /api/RevanaCreation
GET /api/RevanaCreation (health check)
```

### Individual APIs

```
POST /api/RevanaCreation/StyleDetermination
POST /api/RevanaCreation/SectionPlanning
POST /api/RevanaCreation/ContentGeneration
POST /api/RevanaCreation/ModuleMapping
POST /api/RevanaCreation/LayoutComposition
POST /api/RevanaCreation/CtaInsertion
POST /api/RevanaCreation/Rendering
```

## 🎯 Master API Usage

### Request Format

```typescript
{
  "productUrl": "https://example.com/product-url",
  "productCategory": "Electronics",
  "adStyle": "Professional and trustworthy",
  "adNarrative": "Detailed story about the product and its benefits...",
  "pricePoint": 199.99,
  "campaignSpecifics": {
    "primaryOffer": "20% off for limited time",
    "secondaryOffers": ["Free shipping", "30-day guarantee"],
    "urgencyLevel": "medium",
    "targetAction": "Purchase",
    "guarantees": ["Money-back guarantee", "Quality assurance"],
    "bonuses": ["Free setup guide", "Premium support"]
  },
  "renderingOptions": {
    "format": "react",
    "styling": "tailwind",
    "optimization": "conversion"
  },
  "brandingSpecs": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "accent": "#F59E0B"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": {
      "small": "0.5rem",
      "medium": "1rem",
      "large": "2rem"
    },
    "breakpoints": {
      "mobile": "768px",
      "tablet": "1024px",
      "desktop": "1280px"
    }
  },
  "deploymentTarget": "production",
  "additionalContext": "Optional additional context"
}
```

### Response Format

```typescript
{
  "success": true,
  "pipeline_results": {
    "style_determination": { /* Style analysis results */ },
    "section_planning": { /* Section structure plan */ },
    "content_generation": [ /* Content for each section */ ],
    "module_mapping": [ /* UI modules for each section */ ],
    "layout_composition": { /* Final layout structure */ },
    "cta_insertion": { /* CTA placement strategy */ },
    "rendering": { /* Generated code and deployment info */ }
  },
  "final_landing_page": {
    "title": "Product Name - Landing Page",
    "url": "https://example.com/landing/product-sku",
    "metadata": {
      "style": "Regular LP",
      "total_sections": 8,
      "total_modules": 24,
      "total_ctas": 6,
      "performance_score": 85
    }
  },
  "execution_summary": {
    "total_processing_time": 45000,
    "api_calls_made": 15,
    "optimization_applied": [
      "Regular LP styling",
      "conversion optimization",
      "medium urgency level",
      "6 strategic CTAs"
    ],
    "recommendations": [
      "Monitor conversion performance",
      "A/B test CTA placements"
    ]
  }
}
```

## 📋 Supported Features

### LP Styles

- **PDP-style**: Product detail page approach for complex/high-value products
- **Regular LP**: Balanced benefit-driven approach for mid-range products
- **Advertorial**: Story-driven educational approach for problem-solving products

### Section Purposes (Psychological Triggers)

- Hook, Build Desire, Build Trust, Educate
- Overcome Objections, Social Proof, Scarcity/Urgency
- Convert, Nurture, Specify, Compare, Guarantee

### Module Types

- **TEXT**: HEADER, PARAGRAPH, BULLET_LIST, CTA, QUOTE, STAT
- **MEDIA**: HERO_IMAGE, IMAGE_GALLERY, VIDEO, ICON_GRID
- **INTERACTIVE**: FORM, BUTTON_GROUP, TABS, ACCORDION
- **LAYOUT**: TWO_COLUMN, THREE_COLUMN, CARD_GRID, BANNER
- **SPECIALIZED**: TESTIMONIAL_SLIDER, FEATURE_COMPARISON, PRICING_TABLE

### Rendering Options

- **Formats**: HTML, React, Vue, Angular
- **Styling**: CSS, Tailwind, Styled-Components, Emotion
- **Optimization**: Speed, SEO, Accessibility, Conversion
- **Deployment**: Production, Staging, Preview

## 🔧 Individual API Usage

Each API can be used independently for specific use cases:

### Style Determination

```typescript
POST /api/RevanaCreation/StyleDetermination
{
  "productCategory": "Electronics",
  "pricePoint": 199.99,
  "adStyle": "Professional and trustworthy"
}
```

### Section Planning

```typescript
POST /api/RevanaCreation/SectionPlanning
{
  "lpStyle": "Regular LP",
  "adNarrative": "Your ad story...",
  "productCategory": "Electronics",
  "pricePoint": 199.99
}
```

### Content Generation

```typescript
POST /api/RevanaCreation/ContentGeneration
{
  "productCategory": "Electronics",
  "adStyle": "Professional",
  "lpStyle": "Regular LP",
  "sectionPurpose": "Hook",
  "sectionName": "Hero Section",
  "productData": { /* Product object */ }
}
```

## 🛠️ Technical Implementation

### Prompt Architecture

All prompts are centralized in `/lib/prompts/revanaCreation/`:

- `styledetermination.ts` - Style analysis prompts
- `sectionplanning.ts` - Section structure prompts
- `contentgeneration.ts` - Content creation prompts
- `modulemapping.ts` - UI module mapping prompts
- `layoutcomposition.ts` - Layout arrangement prompts
- `ctainsertion.ts` - CTA placement prompts
- `rendering.ts` - Code generation prompts

### Type Safety

Comprehensive TypeScript types in `/lib/types/revanaCreation.ts`:

- Request/Response interfaces for all APIs
- Error handling types
- Utility types for type safety

### Error Handling

Standardized error responses with:

- Error codes for easy debugging
- Specific recommendations
- API step identification
- Debug information in development

## 📊 Performance Considerations

### Processing Time

- Individual APIs: 1-5 seconds each
- Full pipeline: 30-60 seconds depending on complexity
- Parallel processing where possible

### API Call Optimization

- Efficient prompt design to minimize token usage
- Structured JSON responses for reliable parsing
- Comprehensive error handling and recovery

### Scalability

- Modular architecture allows independent scaling
- Stateless design for horizontal scaling
- Caching opportunities at each step

## 🔍 Debugging & Monitoring

### Health Checks

Each API includes a GET endpoint for health monitoring:

```
GET /api/RevanaCreation/StyleDetermination
GET /api/RevanaCreation/SectionPlanning
# ... etc
```

### Logging

Comprehensive logging throughout the pipeline:

- Processing time tracking
- Step-by-step progress logging
- Error tracking with context
- Performance metrics

### Development Mode

Enhanced debugging in development:

- Detailed error information
- Request/response logging
- AI response parsing details

## 🚀 Getting Started

1. **Environment Setup**

   ```env
   OPENAI_API_KEY=your-openai-api-key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. **Test Individual APIs**

   ```bash
   # Health check
   curl GET http://localhost:3000/api/RevanaCreation

   # Style determination
   curl -X POST http://localhost:3000/api/RevanaCreation/StyleDetermination \
     -H "Content-Type: application/json" \
     -d '{"productCategory":"Electronics","pricePoint":199,"adStyle":"Professional"}'
   ```

3. **Full Pipeline Test**
   ```bash
   curl -X POST http://localhost:3000/api/RevanaCreation \
     -H "Content-Type: application/json" \
     -d @sample-request.json
   ```

## 📈 Best Practices

### Input Optimization

- Provide detailed ad narratives for better content generation
- Use specific product categories for accurate style determination
- Include comprehensive branding specifications

### Performance Optimization

- Use appropriate urgency levels for your campaign
- Choose rendering options that match your deployment needs
- Provide relevant additional context

### Error Handling

- Always check the `success` field in responses
- Follow the recommendations in error responses
- Monitor processing times for performance optimization

## 🔧 Customization

### Adding New LP Styles

1. Update type definitions in `revanaCreation.ts`
2. Add style logic to style determination prompt
3. Update section planning guidelines
4. Test across all pipeline steps

### Adding New Module Types

1. Define module in module mapping prompt
2. Update layout composition logic
3. Add rendering support for new module
4. Update type definitions

### Adding New Psychological Triggers

1. Add to section planning prompt
2. Update content generation guidelines
3. Test content quality and relevance

## 📝 License & Usage

This API system is designed for internal use within the RevWay platform. Ensure proper API key management and rate limiting for production usage.
