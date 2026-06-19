import { getGeminiClient } from "@/lib/gemini";
import { getGroqKey } from "@/lib/groq";

export async function GET() {
  const geminiOk = !!getGeminiClient();
  const groqOk = !!getGroqKey();

  return Response.json({
    models: [
      { id: "gemini-2.5-flash",   name: "Gemini 2.5 Flash",      provider: "gemini",    available: geminiOk, costPMInput: 0.075, costPMOutput: 0.30,  contextWindow: "1M",   vision: true,  toolCalling: true,  structuredOutput: true,  reasoning: false, avgLatency: 180, accuracy: 91.5 },
      { id: "gemini-2.5-pro",     name: "Gemini 2.5 Pro",        provider: "gemini",    available: geminiOk, costPMInput: 1.25,  costPMOutput: 5.00,  contextWindow: "2M",   vision: true,  toolCalling: true,  structuredOutput: true,  reasoning: true,  avgLatency: 540, accuracy: 96.2 },
      { id: "gpt-4o-mini",        name: "GPT-4o Mini",           provider: "openai",    available: false,    costPMInput: 0.15,  costPMOutput: 0.60,  contextWindow: "128K", vision: true,  toolCalling: true,  structuredOutput: true,  reasoning: false, avgLatency: 220, accuracy: 89.0 },
      { id: "gpt-4o",             name: "GPT-4o",                provider: "openai",    available: false,    costPMInput: 2.50,  costPMOutput: 10.00, contextWindow: "128K", vision: true,  toolCalling: true,  structuredOutput: true,  reasoning: false, avgLatency: 450, accuracy: 94.8 },
      { id: "claude-sonnet-4-6",  name: "Claude Sonnet 4.6",     provider: "anthropic", available: false,    costPMInput: 3.00,  costPMOutput: 15.00, contextWindow: "200K", vision: true,  toolCalling: true,  structuredOutput: true,  reasoning: false, avgLatency: 610, accuracy: 95.8 },
      { id: "llama-3.1-70b-groq", name: "LLaMA 3.1 70B (Groq)", provider: "groq",      available: groqOk,   costPMInput: 0.59,  costPMOutput: 0.79,  contextWindow: "128K", vision: false, toolCalling: true,  structuredOutput: true,  reasoning: false, avgLatency: 95,  accuracy: 86.5 },
    ],
  });
}
