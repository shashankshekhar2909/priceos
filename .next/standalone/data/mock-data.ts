import { Provider, ProviderType } from "@/types";

export const mockProviders: Provider[] = [
  { id: "blinkit",   name: "Blinkit",          type: ProviderType.QUICK_COMMERCE, logo: "⚡", enabled: true,  activeConnectors: 1420  },
  { id: "zepto",     name: "Zepto",             type: ProviderType.QUICK_COMMERCE, logo: "🍇", enabled: true,  activeConnectors: 1105  },
  { id: "instamart", name: "Instamart",         type: ProviderType.QUICK_COMMERCE, logo: "🍊", enabled: false, activeConnectors: 1250  },
  { id: "amazon",    name: "Amazon India",      type: ProviderType.ECOMMERCE,      logo: "📦", enabled: true,  activeConnectors: 54100 },
  { id: "flipkart",  name: "Flipkart",          type: ProviderType.ECOMMERCE,      logo: "🛒", enabled: true,  activeConnectors: 38200 },
  { id: "myntra",    name: "Myntra",            type: ProviderType.ECOMMERCE,      logo: "👗", enabled: true,  activeConnectors: 12400 },
  { id: "croma",     name: "Croma Retail",      type: ProviderType.RETAIL,         logo: "🔌", enabled: true,  activeConnectors: 8500  },
  { id: "reliance",  name: "Reliance Digital",  type: ProviderType.RETAIL,         logo: "🔴", enabled: true,  activeConnectors: 9100  },
  { id: "openai",    name: "OpenAI API",        type: ProviderType.AI_MODELS,      logo: "🤖", enabled: false, activeConnectors: 4     },
  { id: "gemini",    name: "Google Gemini",     type: ProviderType.AI_MODELS,      logo: "✦",  enabled: true,  activeConnectors: 4     },
  { id: "groq",      name: "Groq Cloud",        type: ProviderType.AI_MODELS,      logo: "🏎", enabled: false, activeConnectors: 2     },
];
