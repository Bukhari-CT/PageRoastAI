import 'server-only';
import { env } from '@/shared/config/env';

// Mock LLM Client wrapper for future SDK integration
export async function generateRoast(prompt: string) {
  // Replace with Anthropic/OpenAI SDK logic
  return { text: "This is a mock roast response." };
}

export async function streamResponse(prompt: string) {
  // Replace with streaming implementation
  return null;
}
