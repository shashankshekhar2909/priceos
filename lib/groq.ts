import { resolveKey } from "./keys";

export function getGroqKey(): string {
  return resolveKey("groq", "GROQ_API_KEY");
}

export async function callGroq(
  modelId: string,
  prompt: string
): Promise<{ text: string; tokens: number }> {
  const modelMap: Record<string, string> = {
    "llama-3.1-70b-groq": "llama-3.1-70b-versatile",
    "llama-3.3-70b-groq": "llama-3.3-70b-versatile",
  };
  const realModel = modelMap[modelId] || "llama-3.1-70b-versatile";
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getGroqKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: realModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    }),
  });
  if (!resp.ok) throw new Error(`Groq ${resp.status}: ${resp.statusText}`);
  const data = (await resp.json()) as any;
  return {
    text: data.choices?.[0]?.message?.content || "No response",
    tokens: data.usage?.total_tokens || 0,
  };
}
