// lib/prompts/index.ts
/**
 * Centralized export for all prompt functions
 * This file serves as the main entry point for all prompts used across the application
 */

// Product Sections API Prompts
export {
  getProductIntroSectionPrompt,
  getProductPairItWithSectionPrompt,
  getAIProductMatchingPrompt,
} from "./productSections";

// Landing Page API Prompts
export {
  getDynamicLandingPagePrompts,
  getModuleCreationPrompts,
} from "./landingPage";

// Master API Prompts
export { getMasterLandingPagePrompt } from "./masterApi";

// HTML to Modules API Prompts
export { getHtmlToModulesClassificationPrompt } from "./htmlToModules";
