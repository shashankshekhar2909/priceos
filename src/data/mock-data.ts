/**
 * High-fidelity simulated baseline datasets for PriceOS
 */

import { Provider, ProviderType, CanonicalProduct, AIModelDetails, MatchingTask, Alert } from "../types";

export const mockProviders: Provider[] = [
  { id: "blinkit", name: "Blinkit", type: ProviderType.QUICK_COMMERCE, logo: "⚡", enabled: true, activeConnectors: 1420 },
  { id: "zepto", name: "Zepto", type: ProviderType.QUICK_COMMERCE, logo: "🍇", enabled: true, activeConnectors: 1105 },
  { id: "instamart", name: "Instamart", type: ProviderType.QUICK_COMMERCE, logo: "🍊", enabled: false, activeConnectors: 1250 },
  { id: "amazon", name: "Amazon India", type: ProviderType.ECOMMERCE, logo: "📦", enabled: true, activeConnectors: 54100 },
  { id: "flipkart", name: "Flipkart", type: ProviderType.ECOMMERCE, logo: "🛒", enabled: true, activeConnectors: 38200 },
  { id: "croma", name: "Croma Retail", type: ProviderType.RETAIL, logo: "🔌", enabled: true, activeConnectors: 8500 },
  { id: "reliance", name: "Reliance Digital", type: ProviderType.RETAIL, logo: "🔴", enabled: true, activeConnectors: 9100 },
  { id: "openai", name: "OpenAI API", type: ProviderType.AI_MODELS, logo: "🤖", enabled: true, activeConnectors: 4 },
  { id: "gemini", name: "Google Gemini", type: ProviderType.AI_MODELS, logo: "✦", enabled: true, activeConnectors: 4 },
  { id: "anthropic", name: "Anthropic Claude", type: ProviderType.AI_MODELS, logo: "✍", enabled: true, activeConnectors: 3 },
  { id: "groq", name: "Groq Cloud", type: ProviderType.AI_MODELS, logo: "🏎", enabled: true, activeConnectors: 2 }
];

export const mockAIModels: AIModelDetails[] = [
  {
    id: "gemini-3.5-flash",
    providerId: "gemini",
    name: "Google Gemini 3.5 Flash",
    costPerMillionPrompt: 0.075,
    costPerMillionCompletion: 0.30,
    contextWindow: "1M",
    vision: true,
    toolCalling: true,
    structuredOutput: true,
    reasoning: false,
    avgLatency: 180,
    accuracy: 91.5
  },
  {
    id: "gemini-3.1-pro-preview",
    providerId: "gemini",
    name: "Google Gemini 3.1 Pro (Preview)",
    costPerMillionPrompt: 1.25,
    costPerMillionCompletion: 5.00,
    contextWindow: "2M",
    vision: true,
    toolCalling: true,
    structuredOutput: true,
    reasoning: true,
    avgLatency: 540,
    accuracy: 96.2
  },
  {
    id: "gpt-4o-mini",
    providerId: "openai",
    name: "OpenAI GPT-4o Mini",
    costPerMillionPrompt: 0.150,
    costPerMillionCompletion: 0.60,
    contextWindow: "128K",
    vision: true,
    toolCalling: true,
    structuredOutput: true,
    reasoning: false,
    avgLatency: 220,
    accuracy: 89.0
  },
  {
    id: "gpt-4o",
    providerId: "openai",
    name: "OpenAI GPT-4o Standard",
    costPerMillionPrompt: 2.50,
    costPerMillionCompletion: 10.00,
    contextWindow: "128K",
    vision: true,
    toolCalling: true,
    structuredOutput: true,
    reasoning: false,
    avgLatency: 450,
    accuracy: 94.8
  },
  {
    id: "claude-3-5-sonnet",
    providerId: "anthropic",
    name: "Claude 3.5 Sonnet v2",
    costPerMillionPrompt: 3.00,
    costPerMillionCompletion: 15.00,
    contextWindow: "200K",
    vision: true,
    toolCalling: true,
    structuredOutput: true,
    reasoning: false,
    avgLatency: 610,
    accuracy: 95.8
  },
  {
    id: "llama-3.1-70b-groq",
    providerId: "groq",
    name: "LLaMA 3.1 70B (Groq Powered)",
    costPerMillionPrompt: 0.59,
    costPerMillionCompletion: 0.79,
    contextWindow: "128K",
    vision: false,
    toolCalling: true,
    structuredOutput: true,
    reasoning: false,
    avgLatency: 95,
    accuracy: 86.5
  }
];

export const mockCanonicalProducts: CanonicalProduct[] = [
  {
    id: "airpods-pro-2",
    sku: "APPLE-APP2-USBC",
    name: "Apple AirPods Pro (2nd Generation) USB-C",
    brand: "Apple",
    category: "Electronics",
    description: "Apple AirPods Pro featuring Active Noise Cancellation, Adaptive Audio, Transparency mode, and MagSafe Charging Case (USB-C).",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    basePriceRange: { min: 18990, max: 24900 },
    mappings: [
      { productId: "amazon-app2", providerId: "amazon" },
      { productId: "flipkart-app2", providerId: "flipkart" },
      { productId: "croma-app2", providerId: "croma" },
      { productId: "blinkit-app2", providerId: "blinkit" }
    ],
    specs: {
      "Noise Cancellation": "Active Active Noise Cancellation (up to 2x more)",
      "Charging Connection": "USB-C MagSafe Case",
      "Battery Life": "Up to 6 hours listening time with single charge",
      "Water Resistance": "IP54 Dust, sweat, and water resistant"
    },
    priceSnapshots: {
      amazon: { price: 18990, discountPercent: 24, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "Noon Tomorrow", seller: "Appario Retail" },
      flipkart: { price: 19490, discountPercent: 22, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "Next Day", seller: "SuperComNet" },
      croma: { price: 21990, discountPercent: 12, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "Pick Up Today", seller: "Croma Store" },
      blinkit: { price: 24900, discountPercent: 0, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "12 Mins", seller: "QuickStore Delhi" }
    },
    priceHistory: [
      { timestamp: "06-12", prices: { amazon: 21900, flipkart: 22400, croma: 22900, blinkit: 24900 } },
      { timestamp: "06-13", prices: { amazon: 21500, flipkart: 21900, croma: 22900, blinkit: 24900 } },
      { timestamp: "06-14", prices: { amazon: 19990, flipkart: 20500, croma: 22490, blinkit: 24900 } },
      { timestamp: "06-15", prices: { amazon: 19990, flipkart: 19990, croma: 22490, blinkit: 24900 } },
      { timestamp: "06-16", prices: { amazon: 19200, flipkart: 19490, croma: 21990, blinkit: 24900 } },
      { timestamp: "06-17", prices: { amazon: 18990, flipkart: 19490, croma: 21990, blinkit: 24900 } },
      { timestamp: "06-18", prices: { amazon: 18990, flipkart: 19490, croma: 21990, blinkit: 24900 } }
    ]
  },
  {
    id: "sony-wh1000xm5",
    sku: "SONY-WH5-BLACK",
    name: "Sony WH-1000XM5 Noise Cancelling Headphones",
    brand: "Sony",
    category: "Electronics",
    description: "Sony WH-1000XM5 wireless over-ear noise-cancelling headphones featuring 30-hour battery life, master processor, and premium hand-free mic array.",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    basePriceRange: { min: 25990, max: 29990 },
    mappings: [
      { productId: "amazon-sonywh5", providerId: "amazon" },
      { productId: "flipkart-sonywh5", providerId: "flipkart" },
      { productId: "reliance-sonywh5", providerId: "reliance" }
    ],
    specs: {
      "Battery Life": "Up to 30 hours",
      "Charging": "Quick Charge via USB-C (3 mins = 3 hours)",
      "Co-Processors": "V1 & QN1 integrated processors",
      "Driver Size": "30mm specially designed unit"
    },
    priceSnapshots: {
      amazon: { price: 25990, discountPercent: 13, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "Same Day Evening", seller: "Cloudtail Retail" },
      flipkart: { price: 26490, discountPercent: 11, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "Next Day", seller: "OmniTechS" },
      reliance: { price: 29990, discountPercent: 0, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "Pick Up in 2 Hours", seller: "Reliance Digital" }
    },
    priceHistory: [
      { timestamp: "06-12", prices: { amazon: 27900, flipkart: 28500, reliance: 29990 } },
      { timestamp: "06-13", prices: { amazon: 27900, flipkart: 27900, reliance: 29990 } },
      { timestamp: "06-14", prices: { amazon: 26900, flipkart: 27900, reliance: 29990 } },
      { timestamp: "06-15", prices: { amazon: 26900, flipkart: 26900, reliance: 29990 } },
      { timestamp: "06-16", prices: { amazon: 25990, flipkart: 26490, reliance: 29990 } },
      { timestamp: "06-17", prices: { amazon: 25990, flipkart: 26490, reliance: 29990 } },
      { timestamp: "06-18", prices: { amazon: 25990, flipkart: 26490, reliance: 29990 } }
    ]
  },
  {
    id: "organic-avocados",
    sku: "GROC-ORG-AVO",
    name: "Organic Fresh Hass Avocados (Pack of 2)",
    brand: "FreshPick",
    category: "Grocery",
    description: "Premium grade ready-to-eat buttery soft Hass avocados, freshly imported, packed with essential monounsaturated fats.",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    basePriceRange: { min: 149, max: 249 },
    mappings: [
      { productId: "blinkit-avo", providerId: "blinkit" },
      { productId: "zepto-avo", providerId: "zepto" },
      { productId: "instamart-avo", providerId: "instamart" }
    ],
    specs: {
      "Pack Size": "2 Pcs Selection",
      "Ripeness": "Ready to eat in 24 hours",
      "Type": "Hass Class A"
    },
    priceSnapshots: {
      blinkit: { price: 149, discountPercent: 40, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "12 mins", seller: "DailyGrocers" },
      zepto: { price: 169, discountPercent: 32, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "8 mins", seller: "ZeptoStore" },
      instamart: { price: 249, discountPercent: 0, timestamp: "2026-06-18T18:00:00Z", inStock: false, deliveryEta: "Out Of Stock", seller: "SwiggyStore" }
    },
    priceHistory: [
      { timestamp: "06-12", prices: { blinkit: 199, zepto: 189, instamart: 249 } },
      { timestamp: "06-13", prices: { blinkit: 189, zepto: 189, instamart: 249 } },
      { timestamp: "06-14", prices: { blinkit: 179, zepto: 179, instamart: 249 } },
      { timestamp: "06-15", prices: { blinkit: 179, zepto: 169, instamart: 249 } },
      { timestamp: "06-16", prices: { blinkit: 169, zepto: 169, instamart: 249 } },
      { timestamp: "06-17", prices: { blinkit: 149, zepto: 169, instamart: 249 } },
      { timestamp: "06-18", prices: { blinkit: 149, zepto: 169, instamart: 249 } }
    ]
  },
  {
    id: "organic-milk",
    sku: "GROC-ORG-MILK",
    name: "Organic Whole Milk (1 Litre Tetra Pack)",
    brand: "Amul / Mother Dairy",
    category: "Grocery",
    description: "Premium pasteurized whole milk processed under sterile safety protocols. Rich in natural vitamins.",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    basePriceRange: { min: 72, max: 95 },
    mappings: [
      { productId: "blinkit-milk", providerId: "blinkit" },
      { productId: "zepto-milk", providerId: "zepto" },
      { productId: "instamart-milk", providerId: "instamart" }
    ],
    specs: {
      "Volume": "1 Litre",
      "Type": "Full Cream Whole Milk",
      "Packaging": "Aseptic Tetra Pack"
    },
    priceSnapshots: {
      blinkit: { price: 74, discountPercent: 12, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "10 mins", seller: "DailyGrocers" },
      zepto: { price: 72, discountPercent: 15, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "8 mins", seller: "ZeptoStore" },
      instamart: { price: 85, discountPercent: 0, timestamp: "2026-06-18T18:00:00Z", inStock: true, deliveryEta: "15 mins", seller: "SwiggyStore" }
    },
    priceHistory: [
      { timestamp: "06-12", prices: { blinkit: 82, zepto: 80, instamart: 85 } },
      { timestamp: "06-13", prices: { blinkit: 82, zepto: 80, instamart: 85 } },
      { timestamp: "06-14", prices: { blinkit: 78, zepto: 78, instamart: 85 } },
      { timestamp: "06-15", prices: { blinkit: 78, zepto: 75, instamart: 85 } },
      { timestamp: "06-16", prices: { blinkit: 74, zepto: 72, instamart: 85 } },
      { timestamp: "06-17", prices: { blinkit: 74, zepto: 72, instamart: 85 } },
      { timestamp: "06-18", prices: { blinkit: 74, zepto: 72, instamart: 85 } }
    ]
  }
];

export const mockMatchingTasks: MatchingTask[] = [
  {
    id: "task-1",
    sourceProduct: { id: "a-101", name: "Apple AirPods Pro USB C 2nd", brand: "Apple", provider: "Blinkit", price: 24900, imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100" },
    candidateProduct: { id: "amz-904", name: "Apple AirPods Pro (2nd Generation) MagSafe Case (USB-C)", brand: "Apple", provider: "Amazon India", price: 18990, imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100" },
    similarityScore: 0.94,
    status: "PENDING",
    normalizationLogs: [
      "Extracted brand: 'Apple'",
      "Sanitized symbols: Stripped '(2nd Generation)' and trailing space",
      "Calculated phonetic soundex of product key descriptions",
      "Cosine Jaccard similarity threshold matched [Score: 0.94]",
      "Status pushed to manual administrative validation ledger"
    ]
  },
  {
    id: "task-2",
    sourceProduct: { id: "z-302", name: "Hass Avocado Imported 2pc", brand: "FreshPick", provider: "Zepto", price: 169, imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100" },
    candidateProduct: { id: "bli-804", name: "Organic Hass Fruit Avocados Pack of 2", brand: "FreshPick", provider: "Blinkit", price: 149, imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100" },
    similarityScore: 0.88,
    status: "PENDING",
    normalizationLogs: [
      "Mapped categories to equivalent hierarchy 'Fresh Vegetables & Fruits'",
      "Token 'Fruit' in candidate mapped to standard 'Fresh Produce'",
      "Calculated Levenshtein Distance [Score: 0.88]",
      "Requires manual approval due to token layout divergence"
    ]
  },
  {
    id: "task-3",
    sourceProduct: { id: "cro-404", name: "Sony WH XM5 Black OverEar Wireless", brand: "Sony", provider: "Croma Retail", price: 29990, imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100" },
    candidateProduct: { id: "amz-112", name: "Sony WH-1000XM5 Active Noise Cancelling Headphones (Midnight Black)", brand: "Sony", provider: "Amazon India", price: 25990, imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100" },
    similarityScore: 0.96,
    status: "PENDING",
    normalizationLogs: [
      "Recognized synonymous string WH XM5 = WH-1000XM5",
      "Normalizing model suffix indexes... success",
      "Calculated token similarity [Score: 0.96]",
      "Auto-classification pending administrator approval limit"
    ]
  }
];

export const mockUserAlerts: Alert[] = [
  {
    id: "alert-101",
    productId: "airpods-pro-2",
    productName: "Apple AirPods Pro (2nd Generation) USB-C",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200",
    targetPrice: 18500,
    condition: "BELOW_PRICE",
    channel: "TELEGRAM",
    destination: "@priceos_subscriber_bot_id_941038",
    active: true,
    createdAt: "2026-06-18T10:30:00Z"
  },
  {
    id: "alert-102",
    productId: "organic-avocados",
    productName: "Organic Fresh Hass Avocados (Pack of 2)",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200",
    targetPrice: 155,
    condition: "PRICE_DROP_PERCENT",
    conditionValue: 15,
    channel: "EMAIL",
    destination: "subscriber@gmail.com",
    active: true,
    createdAt: "2026-06-17T09:12:00Z"
  }
];
