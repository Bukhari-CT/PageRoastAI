// Strongly typed prompt templates
export interface RoastPromptData {
  industry: string;
  tone: "harsh" | "funny" | "constructive";
  targetUrl: string;
}

export function buildRoastPrompt(data: RoastPromptData): string {
  return `You are a CRO expert. Roast this landing page for ${data.targetUrl} in a ${data.tone} tone. The industry is ${data.industry}.`;
}
