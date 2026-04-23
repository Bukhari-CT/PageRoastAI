import 'server-only';
import { env } from '@/shared/config/env';

// Mock LLM Client wrapper for future SDK integration
export async function generateRoast(prompt: string) {
  if (!env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY) {
    throw new Error("An LLM API key (ANTHROPIC_API_KEY or OPENAI_API_KEY) is missing. Please add it to your environment variables to use LLM features.");
  }
  // Replace with Anthropic/OpenAI SDK logic
  return { text: "This is a mock roast response." };
}

export async function streamResponse(prompt: string) {
  if (!env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY) {
    throw new Error("An LLM API key (ANTHROPIC_API_KEY or OPENAI_API_KEY) is missing. Please add it to your environment variables to use LLM features.");
  }
  // Replace with streaming implementation
  return null;
}
