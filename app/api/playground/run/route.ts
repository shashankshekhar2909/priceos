import { getGeminiClient, GEMINI_FAST, GEMINI_PRO } from "@/lib/gemini";
import { getGroqKey, callGroq } from "@/lib/groq";

export async function POST(request: Request) {
  const { prompt, modelsConfig } = await request.json();
  const ai = getGeminiClient();
  const results = [];

  for (const modelId of modelsConfig as string[]) {
    const start = Date.now();
    const inputTokens = Math.floor((prompt?.length || 0) / 4) + 20;

    if (modelId.startsWith("gemini") && ai) {
      try {
        const realModel = modelId.includes("pro") ? GEMINI_PRO : GEMINI_FAST;
        const genResp = await ai.models.generateContent({ model: realModel, contents: prompt });
        const text = genResp.text || "No response";
        const latency = Date.now() - start;
        const pCost = modelId.includes("pro") ? 1.25 : 0.075;
        const cCost = modelId.includes("pro") ? 5.0 : 0.3;
        const cost = ((inputTokens * pCost + Math.floor(text.length / 4) * cCost) / 1_000_000);
        results.push({
          modelId, ok: true, response: text, latency,
          tokens: inputTokens + Math.floor(text.length / 4),
          cost: Number(cost.toFixed(6)),
        });
        continue;
      } catch (err: any) {
        results.push({ modelId, ok: false, response: `Gemini error: ${err.message}`, latency: Date.now() - start, tokens: 0, cost: 0 });
        continue;
      }
    }

    if ((modelId.includes("llama") || modelId.includes("groq")) && getGroqKey()) {
      try {
        const { text, tokens } = await callGroq(modelId, prompt);
        const latency = Date.now() - start;
        results.push({ modelId, ok: true, response: text, latency, tokens, cost: Number((tokens * 0.59 / 1_000_000).toFixed(6)) });
      } catch (err: any) {
        results.push({ modelId, ok: false, response: `Groq error: ${err.message}`, latency: Date.now() - start, tokens: 0, cost: 0 });
      }
      continue;
    }

    if (modelId.includes("llama") || modelId.includes("groq")) {
      results.push({ modelId, ok: false, response: "Groq API key not configured. Add it in Admin → API Keys.", latency: 0, tokens: 0, cost: 0 });
      continue;
    }

    const latencies: Record<string, number> = { "gpt-4o-mini": 520, "gpt-4o": 850, "claude-sonnet-4-6": 680 };
    const providerName = modelId.includes("gpt") ? "OpenAI" : "Anthropic";
    results.push({
      modelId, ok: false,
      response: `[${providerName} key not configured. Add it in Admin → API Keys to get real responses from ${modelId}.]`,
      latency: latencies[modelId] || 400, tokens: inputTokens, cost: 0,
    });
  }

  return Response.json({ success: true, results });
}
