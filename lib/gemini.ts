import { GoogleGenAI } from "@google/genai";
import { resolveKey } from "./keys";

export const GEMINI_FAST = "gemini-2.5-flash";
export const GEMINI_PRO = "gemini-2.5-pro";

export function getGeminiClient(): GoogleGenAI | null {
  const key = resolveKey("gemini", "GEMINI_API_KEY");
  if (!key || key === "MY_GEMINI_API_KEY") return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: { headers: { "User-Agent": "priceos/1.0" } },
  });
}
