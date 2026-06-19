/**
 * PriceOS Shared Type Definitions
 */

export enum ProviderType {
  QUICK_COMMERCE = "QUICK_COMMERCE",
  ECOMMERCE = "ECOMMERCE",
  RETAIL = "RETAIL",
  SAAS = "SAAS",
  AI_MODELS = "AI_MODELS",
  CUSTOM = "CUSTOM"
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  logo: string;
  enabled: boolean;
  activeConnectors: number;
}

export interface PriceSnapshot {
  price: number;
  discountPercent: number;
  timestamp: string; // ISO String
  inStock: boolean;
  deliveryEta: string; // e.g. "10 mins", "Next Day"
  seller?: string;
}

export interface Product {
  id: string;
  externalId: string;
  providerId: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  url: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  inStock: boolean;
  deliveryEta: string;
  specs: Record<string, string>;
  lastUpdated: string;
}

export interface CanonicalProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  basePriceRange: { min: number; max: number };
  mappings: { productId: string; providerId: string }[];
  priceSnapshots: { [providerId: string]: PriceSnapshot };
  priceHistory: { timestamp: string; prices: { [providerId: string]: number } }[];
  specs: Record<string, string>;
}

export interface AIModelDetails {
  id: string;
  providerId: string;
  name: string;
  costPerMillionPrompt: number;
  costPerMillionCompletion: number;
  contextWindow: string;
  vision: boolean;
  toolCalling: boolean;
  structuredOutput: boolean;
  reasoning: boolean;
  avgLatency: number; // ms
  accuracy: number; // index 0-100
}

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  targetPrice: number;
  condition: "BELOW_PRICE" | "BACK_IN_STOCK" | "PRICE_DROP_PERCENT";
  conditionValue?: number;
  channel: "EMAIL" | "TELEGRAM" | "WEB_PUSH";
  destination: string;
  active: boolean;
  createdAt: string;
}

export interface MatchingTask {
  id: string;
  sourceProduct: {
    id: string;
    name: string;
    brand: string;
    provider: string;
    price: number;
    imageUrl: string;
  };
  candidateProduct: {
    id: string;
    name: string;
    brand: string;
    provider: string;
    price: number;
    imageUrl: string;
  };
  similarityScore: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  normalizationLogs: string[];
}

export interface CartItem {
  id: string; // SKU or canonical product id
  quantity: number;
}

export interface OptimizedCartPackage {
  providerId: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  eta: string;
}

export interface OptimizationResult {
  packages: OptimizedCartPackage[];
  originalTotal: number;
  optimizedTotal: number;
  savingsTotal: number;
}
