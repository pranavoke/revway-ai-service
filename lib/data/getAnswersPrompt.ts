import { getAnswers } from "@/app/api/getAiGenAnswers/route";
export function getAnswerprocessPrompt(inputData: getAnswers) {
  const sectionPrompts: Record<string, string> = {
    reasons: ` Give me the 6 reasons why someone should buy this product. `,
    ingridients: ` Give me the key ingredients of this product.  `,
  };
  const prompt = sectionPrompts[inputData.type];
  return JSON.stringify(prompt);
}
