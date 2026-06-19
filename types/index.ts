export enum ProviderType {
  QUICK_COMMERCE = "QUICK_COMMERCE",
  ECOMMERCE = "ECOMMERCE",
  RETAIL = "RETAIL",
  SAAS = "SAAS",
  AI_MODELS = "AI_MODELS",
  CUSTOM = "CUSTOM",
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
  timestamp: string;
  inStock: boolean;
  deliveryEta: string;
  seller?: string;
  buyUrl?: string;
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
  id: string;
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
