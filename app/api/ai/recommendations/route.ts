import { getGeminiClient, GEMINI_FAST } from "@/lib/gemini";

export async function POST(request: Request) {
  const { query, products } = await request.json();
  const ai = getGeminiClient();

  if (!ai) {
    return Response.json({
      success: true,
      simulated: true,
      headline: "AI Not Configured",
      suggestion:
        "Add your Gemini API key in **Admin → API Keys** to enable real AI recommendations.",
    });
  }

  try {
    const prompt = `You are PriceOS AI, an expert Indian shopping advisor.

Product: "${query}"
Live pricing: ${JSON.stringify(products, null, 2)}

Give a concise, actionable shopping recommendation in markdown. Include:
1. Best price and where to buy (name provider + exact ₹)
2. Quick-commerce vs e-commerce tradeoff (speed vs cost)
3. Final recommendation with savings estimate

Be specific. Under 200 words. Use **bold** for key numbers and provider names.`;

    const response = await ai.models.generateContent({ model: GEMINI_FAST, contents: prompt });
    return Response.json({
      success: true,
      simulated: false,
      headline: "PriceOS AI Shopping Recommendation",
      suggestion: response.text,
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
