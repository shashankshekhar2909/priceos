import { getGeminiClient, GEMINI_FAST } from "@/lib/gemini";

export async function POST(request: Request) {
  const { query } = await request.json();
  if (!query?.trim()) return Response.json({ success: true, products: [] });

  const ai = getGeminiClient();
  if (!ai) {
    return Response.json(
      { success: false, error: "Gemini not configured. Add GEMINI_API_KEY in Admin → API Keys." },
      { status: 503 }
    );
  }

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const prompt = `You are PriceOS, an Indian price intelligence system (June 2026).

Search query: "${query}"

Return a JSON array of 2-4 canonical products matching this query. These are real products sold in India.

Required JSON shape per product:
{
  "id": "kebab-case-id",
  "sku": "BRAND-MODEL-CODE",
  "name": "Full Product Name",
  "brand": "Brand",
  "category": "Electronics|Grocery|Fashion|HomeAppliances|Beauty|Sports",
  "description": "2-sentence description.",
  "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60",
  "basePriceRange": { "min": 0, "max": 0 },
  "mappings": [{ "productId": "prov-sku", "providerId": "amazon" }],
  "specs": { "Key1": "Value1", "Key2": "Value2", "Key3": "Value3", "Key4": "Value4" },
  "priceSnapshots": {
    "amazon": { "price": 0, "discountPercent": 10, "timestamp": "${new Date().toISOString()}", "inStock": true, "deliveryEta": "Tomorrow", "seller": "Seller Name", "buyUrl": "https://amazon.in/s?k=${encodeURIComponent(query)}" }
  },
  "priceHistory": [
    { "timestamp": "${dates[0]}", "prices": { "amazon": 0 } },
    { "timestamp": "${dates[1]}", "prices": { "amazon": 0 } },
    { "timestamp": "${dates[2]}", "prices": { "amazon": 0 } },
    { "timestamp": "${dates[3]}", "prices": { "amazon": 0 } },
    { "timestamp": "${dates[4]}", "prices": { "amazon": 0 } },
    { "timestamp": "${dates[5]}", "prices": { "amazon": 0 } },
    { "timestamp": "${dates[6]}", "prices": { "amazon": 0 } }
  ]
}

Provider rules:
- Electronics (phones/laptops/headphones/TVs/cameras): amazon, flipkart, and 1-2 of: croma, reliance
- Grocery (fruits/vegetables/dairy/staples): blinkit, zepto, and optionally instamart
- Fashion: myntra, amazon, flipkart
- buyUrl per provider: amazon.in, flipkart.com, blinkit.com, zepto.in, myntra.com, croma.com, reliancedigital.in

Pricing (realistic 2026 Indian market INR):
- Quick commerce (blinkit/zepto): fastest but +10-25% for electronics, competitive for groceries
- E-commerce (amazon/flipkart): best prices, next-day delivery
- Retail (croma/reliance): MRP or small discount, immediate pickup
- priceHistory: 7 days realistic ±3-5% daily fluctuation

Image URL (use real Unsplash IDs):
- Headphones: photo-1546435770-a3e426bf472b
- Earbuds: photo-1600294037681-c80b4cb5b434
- Phone: photo-1511707171634-5f897ff02aa9
- Laptop: photo-1496181133206-80ce9b88a853
- TV: photo-1593359677879-a4bb92f829d1
- Fruits: photo-1519996529931-28324d5a630e
- Milk/dairy: photo-1550583724-b2692b85b150
- Grocery: photo-1540420773420-3366772f4999
- Shoes: photo-1542291026-7eec264c27ff
- Fashion: photo-1523381210434-271e8be1f52b

Return ONLY valid JSON array. No markdown. No explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FAST,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const text = (response.text || "[]")
      .trim()
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const products = JSON.parse(text);
    return Response.json({ success: true, products: Array.isArray(products) ? products : [] });
  } catch (err: any) {
    console.error("Search error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
