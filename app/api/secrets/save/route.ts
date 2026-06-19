import { loadKeys, saveKeys } from "@/lib/keys";
import { encryptValue } from "@/lib/encryption";
import { getGeminiClient } from "@/lib/gemini";
import { getGroqKey } from "@/lib/groq";
import type { StoredKey } from "@/lib/keys";

export async function POST(request: Request) {
  const { geminiKey, groqKey } = await request.json();
  const store = loadKeys();

  if (geminiKey?.trim()) {
    const { ciphertext, iv } = encryptValue(geminiKey.trim());
    store["gemini"] = {
      id: `gemini-${Date.now()}`,
      provider: "gemini",
      label: "Gemini API Key",
      ciphertext,
      iv,
      last4: geminiKey.trim().slice(-4),
      addedAt: new Date().toISOString(),
      active: true,
    } satisfies StoredKey;
  }

  if (groqKey?.trim()) {
    const { ciphertext, iv } = encryptValue(groqKey.trim());
    store["groq"] = {
      id: `groq-${Date.now()}`,
      provider: "groq",
      label: "Groq API Key",
      ciphertext,
      iv,
      last4: groqKey.trim().slice(-4),
      addedAt: new Date().toISOString(),
      active: true,
    } satisfies StoredKey;
  }

  saveKeys(store);

  return Response.json({
    success: true,
    geminiConfigured: !!getGeminiClient(),
    groqConfigured: !!getGroqKey(),
  });
}
