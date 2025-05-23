// utils/moduleParser.ts
import { Module, LandingPageSection } from "../lib/types";
import { formatSectionToModules } from "../lib/openai";

/**
 * Format all sections into modules
 *
 * @param sections Array of landing page sections
 * @returns A mapping of sections with their formatted modules
 */
export async function formatAllSectionsToModules(
  sections: LandingPageSection[]
): Promise<{ [key: string]: Module[] }> {
  const modulesBySection: { [key: string]: Module[] } = {};

  // Process each section in parallel for efficiency
  await Promise.all(
    sections.map(async (section) => {
      try {
        const modules = await formatSectionToModules(section);
        // Use the section title as key for easy lookup
        modulesBySection[section.title] = modules;
      } catch (error) {
        console.error(`Error formatting section "${section.title}":`, error);
        modulesBySection[section.title] = []; // Provide empty array on error
      }
    })
  );

  return modulesBySection;
}

/**
 * Validate a module structure to ensure it conforms to our expected format
 *
 * @param module The module to validate
 * @returns boolean indicating if the module is valid
 */
export function validateModule(module: any): boolean {
  // Basic validation - ensure required fields exist
  if (!module.type || !module.subtype || !module.content) {
    return false;
  }

  // Additional validation could be implemented here based on type/subtype

  return true;
}

/**
 * Flatten all modules from multiple sections into a single array
 *
 * @param modulesBySection Mapping of sections to their modules
 * @returns Array of all modules
 */
export function flattenModules(modulesBySection: {
  [key: string]: Module[];
}): Module[] {
  let allModules: Module[] = [];

  Object.values(modulesBySection).forEach((modules) => {
    // Filter out any invalid modules
    const validModules = (modules as Module[]).filter(validateModule);
    allModules = [...allModules, ...validModules];
  });

  return allModules;
}
