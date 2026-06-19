import { loadKeys, saveKeys } from "@/lib/keys";
import { getGeminiClient } from "@/lib/gemini";
import { getGroqKey } from "@/lib/groq";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const store = loadKeys();

  if (!store[provider]) {
    return Response.json({ success: false, error: "Key not found" }, { status: 404 });
  }

  delete store[provider];
  saveKeys(store);

  return Response.json({
    success: true,
    geminiConfigured: !!getGeminiClient(),
    groqConfigured: !!getGroqKey(),
  });
}
