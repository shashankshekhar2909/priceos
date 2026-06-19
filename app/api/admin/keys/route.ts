import { loadKeys, saveKeys, storeKey } from "@/lib/keys";
import { getGeminiClient } from "@/lib/gemini";
import { getGroqKey } from "@/lib/groq";

export async function GET() {
  const store = loadKeys();
  const keys = Object.values(store).map((k) => ({
    id: k.id,
    provider: k.provider,
    label: k.label,
    last4: k.last4,
    addedAt: k.addedAt,
    active: k.active,
  }));
  return Response.json({ success: true, keys });
}

export async function POST(request: Request) {
  const { provider, value, label } = await request.json();
  if (!provider || !value?.trim()) {
    return Response.json({ success: false, error: "provider and value required" }, { status: 400 });
  }

  const entry = storeKey(provider, value, label);

  return Response.json({
    success: true,
    key: {
      id: entry.id,
      provider: entry.provider,
      label: entry.label,
      last4: entry.last4,
      addedAt: entry.addedAt,
      active: entry.active,
    },
    geminiConfigured: !!getGeminiClient(),
    groqConfigured: !!getGroqKey(),
  });
}
