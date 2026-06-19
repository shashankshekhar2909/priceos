import { getGeminiClient, GEMINI_FAST } from "@/lib/gemini";
import type { CanonicalProduct } from "@/types";

interface CartItem { id: string; quantity: number; }

function simpleSplit(
  items: CartItem[],
  products: Record<string, CanonicalProduct>,
  constraint: string
) {
  const pkgMap: Record<string, any> = {};
  let originalTotal = 0;
  let optimizedTotal = 0;

  for (const item of items) {
    const prod = products?.[item.id];
    if (!prod) continue;
    const entries = Object.entries(prod.priceSnapshots) as [string, any][];
    if (!entries.length) continue;

    const sorted = [...entries].sort((a, b) =>
      constraint === "MIN_ETA"
        ? (a[1].deliveryEta || "").localeCompare(b[1].deliveryEta || "")
        : a[1].price - b[1].price
    );
    const [bestProv, bestSnap] = sorted[0];
    originalTotal += Math.max(...entries.map(([, s]) => s.price)) * item.quantity;
    optimizedTotal += bestSnap.price * item.quantity;

    if (!pkgMap[bestProv]) {
      pkgMap[bestProv] = {
        providerId: bestProv,
        items: [],
        subtotal: 0,
        deliveryFee: ["amazon", "flipkart", "myntra"].includes(bestProv) ? 0 : 20,
        eta: bestSnap.deliveryEta,
      };
    }
    pkgMap[bestProv].items.push({
      productId: item.id,
      productName: prod.name,
      price: bestSnap.price,
      quantity: item.quantity,
    });
    pkgMap[bestProv].subtotal += bestSnap.price * item.quantity;
  }

  const packages = Object.values(pkgMap);
  const delivery = packages.reduce((s: number, p: any) => s + p.deliveryFee, 0);
  return {
    packages,
    originalTotal,
    optimizedTotal: optimizedTotal + delivery,
    savingsTotal: Math.max(0, originalTotal - optimizedTotal - delivery),
  };
}

export async function POST(request: Request) {
  const { items, constraint, products } = await request.json();
  if (!items?.length) {
    return Response.json({ success: true, packages: [], originalTotal: 0, optimizedTotal: 0, savingsTotal: 0 });
  }

  const ai = getGeminiClient();
  if (!ai || !products) {
    return Response.json({ success: true, ...simpleSplit(items, products || {}, constraint) });
  }

  try {
    const cartItems = items
      .filter((i: CartItem) => products[i.id])
      .map((i: CartItem) => ({
        id: i.id,
        quantity: i.quantity,
        name: products[i.id].name,
        priceSnapshots: products[i.id].priceSnapshots,
      }));

    const prompt = `Optimize this cart for ${constraint === "MIN_ETA" ? "FASTEST delivery" : "MINIMUM cost"}.
Cart: ${JSON.stringify(cartItems)}
Return JSON: {"packages":[{"providerId":"...","items":[{"productId":"...","productName":"...","price":0,"quantity":1}],"subtotal":0,"deliveryFee":0,"eta":"..."}],"originalTotal":0,"optimizedTotal":0,"savingsTotal":0}
Rules: amazon/flipkart/myntra deliveryFee=0, blinkit/zepto/instamart deliveryFee=15-25. Return ONLY JSON.`;

    const response = await ai.models.generateContent({
      model: GEMINI_FAST,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const text = (response.text || "{}")
      .trim()
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    return Response.json({ success: true, ...JSON.parse(text) });
  } catch {
    return Response.json({ success: true, ...simpleSplit(items, products, constraint) });
  }
}
