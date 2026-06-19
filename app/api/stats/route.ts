import { getGeminiClient } from "@/lib/gemini";
import { getGroqKey } from "@/lib/groq";

export async function GET() {
  return Response.json({
    providers: 11,
    geminiConfigured: !!getGeminiClient(),
    groqConfigured: !!getGroqKey(),
  });
}
