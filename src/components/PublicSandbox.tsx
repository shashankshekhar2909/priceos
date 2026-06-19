import React, { useState, useEffect } from "react";
import { Search, Sparkles, TrendingDown, Truck, Plus, ShoppingBag, ArrowRight, History, Play, AlertCircle, Check, Trash2, Cpu, HelpCircle, ArrowLeft, X } from "lucide-react";
import { Product, CanonicalProduct, CartItem, OptimizationResult } from "../types";
import { mockCanonicalProducts, mockAIModels } from "../data/mock-data";

export default function PublicSandbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct>(mockCanonicalProducts[0]);
  const [visibleProviders, setVisibleProviders] = useState<string[]>(["amazon", "flipkart", "blinkit", "zepto"]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    { id: "organic-avocados", quantity: 2 },
    { id: "airpods-pro-2", quantity: 1 }
  ]);
  const [cartConstraint, setCartConstraint] = useState<"MIN_COST" | "MIN_ETA">("MIN_COST");
  const [optimizedResult, setOptimizedResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // AI recommendations state
  const [aiRec, setAiRec] = useState<{ headline: string; text: string; loading: boolean }>({
    headline: "PriceOS AI Strategic Shopping Recommendation",
    text: "Select products and click 'Request AI Recommendation Strategy' below to synthesize custom advice on current listings.",
    loading: false
  });

  // AI model comparison state
  const [selectedAIModels, setSelectedAIModels] = useState<string[]>(["gemini-3.5-flash", "gpt-4o-mini", "llama-3.1-70b-groq"]);
  const [promptInput, setPromptInput] = useState("Compare retail prices of AirPods Pro Gen 2 and propose a savings ratio.");
  const [playgroundResults, setPlaygroundResults] = useState<any[]>([]);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);

  // Active product pricing filters with simulated fetching
  const [isSimulatingFetch, setIsSimulatingFetch] = useState(false);
  const [activeCrawlers, setActiveCrawlers] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CanonicalProduct[]>(mockCanonicalProducts);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(mockCanonicalProducts);
      setIsSimulatingFetch(false);
      return;
    }

    setIsSimulatingFetch(true);
    setActiveCrawlers(["Initializing local nodes...", "Configuring sandboxed DNS proxies..."]);

    const t1 = setTimeout(() => {
      setActiveCrawlers([
        "Amazon India (API): Initiating query...",
        "Blinkit (JSON-RPC): Fetching fresh stock levels...",
        "Zepto (Express-Proxy): Mapping deliverable coordinates..."
      ]);
    }, 180);

    const t2 = setTimeout(() => {
      setActiveCrawlers([
        "✅ Amazon India (API): 100% Crawled & Ingested",
        "✅ Blinkit (JSON-RPC): 100% Cached",
        "✅ Zepto (Express-Proxy): 100% Resolved",
        "⚙️ AI Canonical Correlator: Matching equivalent entries..."
      ]);
    }, 400);

    const t3 = setTimeout(() => {
      const results = mockCanonicalProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(results);
      setIsSimulatingFetch(false);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [searchQuery]);

  // Run initial calculations
  useEffect(() => {
    runCartOptimization();
  }, [cart, cartConstraint]);

  // Handle Add to cart
  const addToCart = (productId: string) => {
    const existing = cart.find(i => i.id === productId);
    if (existing) {
      setCart(cart.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { id: productId, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(i => i.id !== productId));
  };

  // Call Server-Side Cart Optimizer API
  const runCartOptimization = async () => {
    if (cart.length === 0) {
      setOptimizedResult(null);
      return;
    }
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/cart/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, constraint: cartConstraint })
      });
      const data = await response.json();
      if (data.success) {
        setOptimizedResult(data);
      }
    } catch (err) {
      console.error("Cart optimization error:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Call Server-Side Gemini Advisor API
  const requestAIRecommendation = async () => {
    setAiRec(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: selectedProduct.name,
          products: selectedProduct.priceSnapshots
        })
      });
      const data = await response.json();
      setAiRec({
        headline: data.headline || "PriceOS Strategic Report",
        text: data.suggestion,
        loading: false
      });
    } catch (err: any) {
      setAiRec({
        headline: "Optimization Pipeline Blocked",
        text: `Error requesting recommendations: ${err.message || "Failed to reach server."}`,
        loading: false
      });
    }
  };

  // Call Multi-Model LLM Playground API
  const executePlayground = async () => {
    if (!promptInput.trim() || selectedAIModels.length === 0) return;
    setIsRunningPlayground(true);
    try {
      const response = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          modelsConfig: selectedAIModels
        })
      });
      const data = await response.json();
      if (data.success) {
        setPlaygroundResults(data.results);
      }
    } catch (err) {
      console.error("Playground runner error:", err);
    } finally {
      setIsRunningPlayground(false);
    }
  };

  // Render provider colors
  const getProviderBadge = (providerId: string) => {
    switch (providerId) {
      case "blinkit": return { bg: "bg-amber-100 text-amber-850 border-amber-200", label: "⚡ Blinkit" };
      case "zepto": return { bg: "bg-purple-100 text-purple-850 border-purple-200", label: "🍇 Zepto" };
      case "instamart": return { bg: "bg-orange-100 text-orange-850 border-orange-200", label: "🍊 Instamart" };
      case "amazon": return { bg: "bg-blue-100 text-blue-800 border-blue-200", label: "📦 Amazon" };
      case "flipkart": return { bg: "bg-sky-100 text-sky-850 border-sky-200", label: "🛒 Flipkart" };
      case "croma": return { bg: "bg-teal-100 text-teal-850 border-teal-200", label: "🔌 Croma" };
      case "reliance": return { bg: "bg-rose-105 text-rose-850 border-rose-200", label: "🔴 Reliance" };
      default: return { bg: "bg-neutral-100 text-neutral-800 border-neutral-200", label: providerId };
    }
  };

  if (isComparisonOpen && selectedProduct) {
    return (
      <div className="bg-white border border-neutral-200/65 rounded-3xl p-6 md:p-8 animate-fade-in space-y-6" id="comparison-detailed-workspace">
        
        {/* Modal-style deep workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5" id="compare-workspace-header">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsComparisonOpen(false)}
              className="px-4 py-2 bg-neutral-900 border border-neutral-900 text-white rounded-xl hover:bg-emerald-555 hover:bg-emerald-500 font-mono text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              id="back-to-products-list-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </button>

            <div className="flex items-center gap-3">
              <img src={selectedProduct.imageUrl} className="w-12 h-12 object-cover rounded-xl border border-neutral-200" alt="" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-emerald-600 font-mono tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    {selectedProduct.brand} • {selectedProduct.category}
                  </span>
                </div>
                <h2 className="text-sm font-black text-neutral-900 mt-1 font-display truncate max-w-[280px]">
                  {selectedProduct.name}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex gap-2 font-mono text-[9px] text-neutral-400 uppercase flex-wrap">
            <div className="bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl">
              SKU: <span className="text-neutral-800 font-bold">{selectedProduct.sku}</span>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl">
              Base price: <span className="text-neutral-800 font-bold">₹{selectedProduct.basePriceRange.min.toLocaleString()} - ₹{selectedProduct.basePriceRange.max.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Workspace Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="compare-workspace-grid">
          
          {/* Left Column: Matrices list + specs table + trends line graph */}
          <div className="lg:col-span-7 flex flex-col gap-6" id="workspace-lhs-flow">
            
            {/* Direct Side-by-Side Snapshot comparison */}
            <div className="bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-2xl flex-1 flex flex-col justify-between" id="comparison-matrix-card">
              <div>
                <div className="mb-4">
                  <span className="text-[9px] font-extrabold tracking-wider text-emerald-600 uppercase font-mono">Current Live Mappings</span>
                  <h3 className="text-xs font-black text-neutral-900 mt-0.5 uppercase font-mono">Detailed Pricing Snapshots</h3>
                </div>

                <div className="space-y-2.5" id="provider-comparison-grid">
                  {Object.keys(selectedProduct.priceSnapshots).map(provId => {
                    const snap = selectedProduct.priceSnapshots[provId];
                    const badge = getProviderBadge(provId);
                    return (
                      <div
                        id={`comp-row-${provId}`}
                        key={provId}
                        className="p-3 bg-white border border-neutral-200 rounded-xl flex justify-between items-center gap-2 hover:border-neutral-300 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold font-mono text-neutral-500 w-6 h-6 flex items-center justify-center bg-white border border-neutral-200 rounded-lg">
                            {badge.label[0]}
                          </span>
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <p className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-[140px]">
                              Seller: {snap.seller || "Direct"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {snap.discountPercent > 0 && (
                              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold px-1.5 py-0.5 rounded font-mono">
                                -{snap.discountPercent}%
                              </span>
                            )}
                            <span className="text-xs font-extrabold font-mono text-neutral-900">
                              ₹{snap.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-mono text-neutral-400">
                            <Truck className="w-3 h-3 text-neutral-400" />
                            <span>{snap.deliveryEta}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specifications table */}
              <div className="border-t border-neutral-150 pt-4 mt-4">
                <h4 className="text-[9px] font-black uppercase text-neutral-400 font-mono tracking-wider mb-2">Canonical Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-600" id="canonical-specs-table">
                  {Object.keys(selectedProduct.specs).map(specKey => (
                    <div key={specKey} className="bg-white p-2 rounded-lg border border-neutral-205 truncate flex justify-between">
                      <span className="text-neutral-450 font-medium">{specKey}:</span>
                      <span className="text-neutral-805 font-bold truncate pl-2">{selectedProduct.specs[specKey]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Snapshot history trend graph */}
            <div className="bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-2xl" id="price-history-trends-card">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-xs font-black text-neutral-950 flex items-center gap-1.5 font-display uppercase font-mono tracking-wider">
                    <History className="w-4.5 h-4.5 text-emerald-555" /> 7-Day Ingested Price Trends
                  </h3>
                  <p className="text-[10px] text-neutral-405 font-mono">Elastic scale snapshots monitored daily</p>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">₹ Values</span>
              </div>

              <div className="flex gap-1.5 flex-wrap mb-4" id="chart-legend-buttons">
                {Object.keys(selectedProduct.priceSnapshots).map(provId => {
                  const bgBadge = getProviderBadge(provId);
                  const isVisible = visibleProviders.includes(provId);
                  return (
                    <button
                      key={provId}
                      onClick={() => {
                        if (isVisible) {
                          setVisibleProviders(visibleProviders.filter(p => p !== provId));
                        } else {
                          setVisibleProviders([...visibleProviders, provId]);
                        }
                      }}
                      className={`text-[9px] uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer font-mono font-bold ${
                        isVisible ? `${bgBadge.bg} border-emerald-500/20 opacity-100 font-black` : "bg-neutral-50 text-neutral-400 border-neutral-200 opacity-60"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {provId}
                    </button>
                  );
                })}
              </div>

              <div className="h-44 w-full relative pt-2" id="canvas-trend-graph">
                <svg className="w-full h-full" viewBox="0 0 400 160">
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1" />
                  <line x1="40" y1="55" x2="380" y2="55" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1" />
                  <line x1="40" y1="90" x2="380" y2="90" stroke="#f1f5f9" strokeDasharray="3,3" strokeWidth="1" />
                  <line x1="40" y1="125" x2="380" y2="125" stroke="#e2e8f0" strokeWidth="1" />

                  {(() => {
                    const history = selectedProduct.priceHistory;
                    const pointsCount = history.length;
                    const widthStep = 340 / (pointsCount - 1);
                    const minVal = Math.min(...history.flatMap(h => Object.values(h.prices))) * 0.95;
                    const maxVal = Math.max(...history.flatMap(h => Object.values(h.prices))) * 1.05;

                    const getX = (index: number) => 40 + (index * widthStep);
                    const getY = (val: number) => 125 - (((val - minVal) / (maxVal - minVal)) * 100);

                    const pColor = (pId: string) => {
                      if (pId === "amazon") return "#3b82f6";
                      if (pId === "flipkart") return "#0ea5e9";
                      if (pId === "blinkit") return "#eab308";
                      if (pId === "zepto") return "#a855f7";
                      if (pId === "croma") return "#06b6d4";
                      if (pId === "reliance") return "#ef4444";
                      return "#10b981";
                    };

                    return (
                      <>
                        {Object.keys(selectedProduct.priceSnapshots).map(provId => {
                          if (!visibleProviders.includes(provId)) return null;

                          let pathString = "";
                          history.forEach((histItem, idx) => {
                            const price = histItem.prices[provId] || selectedProduct.priceSnapshots[provId]?.price;
                            if (price) {
                              const prefix = idx === 0 ? "M" : "L";
                              pathString += `${prefix} ${getX(idx)} ${getY(price)} `;
                            }
                          });

                          return (
                            <g key={provId} id={`trend-line-${provId}`}>
                              <path
                                d={pathString}
                                fill="none"
                                stroke={pColor(provId)}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-300"
                              />
                              {history.map((histItem, idx) => {
                                const price = histItem.prices[provId];
                                if (!price) return null;
                                return (
                                  <circle
                                    key={idx}
                                    cx={getX(idx)}
                                    cy={getY(price)}
                                    r="3.5"
                                    fill="white"
                                    stroke={pColor(provId)}
                                    strokeWidth="2.5"
                                    className="cursor-pointer"
                                  >
                                    <title>{`${provId}: ₹${price}`}</title>
                                  </circle>
                                );
                              })}
                            </g>
                          );
                        })}

                        {history.map((histItem, idx) => (
                          <text
                            key={idx}
                            x={getX(idx)}
                            y="145"
                            fill="#94a3b8"
                            fontSize="8.5"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {histItem.timestamp}
                          </text>
                        ))}

                        <text x="35" y="24" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                          ₹{Math.round(maxVal).toLocaleString()}
                        </text>
                        <text x="35" y="128" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                          ₹{Math.round(minVal).toLocaleString()}
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

          </div>

          {/* Right Column: Split optimizer + Gemini AI recommendations + model playground */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="workspace-rhs-flow">
            
            {/* Cart Split Optimizer */}
            <div className="bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-2xl flex flex-col justify-between" id="cart-optimization-panel">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black text-neutral-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" /> Basket Split Optimizer
                  </h4>
                  <span className="text-[9px] font-extrabold px-2 rounded-full font-mono bg-emerald-100 text-emerald-800 border border-emerald-200/40">
                    {cart.length} Items Indexed
                  </span>
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto" id="cart-items-ledger">
                  {cart.map(item => {
                    const matchedProd = mockCanonicalProducts.find(p => p.id === item.id);
                    if (!matchedProd) return null;
                    return (
                      <div key={item.id} className="p-2.5 bg-white border border-neutral-200 rounded-xl flex justify-between items-center gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 truncate">
                          <img src={matchedProd.imageUrl} alt="" className="w-8 h-8 object-cover rounded-md border" />
                          <div className="truncate">
                            <h5 className="text-[11px] font-bold text-neutral-900 truncate max-w-[110px]">{matchedProd.name}</h5>
                            <p className="text-[9px] font-mono text-neutral-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-xs font-bold text-neutral-950">
                            ₹{matchedProd.basePriceRange.min.toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {cart.length === 0 && (
                    <div className="text-center py-6 text-neutral-400 text-xs font-mono bg-white rounded-xl border">Basket empty. Try adding items.</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setCartConstraint("MIN_COST")}
                    className={`py-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono border transition-all cursor-pointer ${
                      cartConstraint === "MIN_COST"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    Min Cost
                  </button>
                  <button
                    onClick={() => setCartConstraint("MIN_ETA")}
                    className={`py-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono border transition-all cursor-pointer ${
                      cartConstraint === "MIN_ETA"
                        ? "bg-purple-555 bg-purple-500 text-white border-purple-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    Min ETA
                  </button>
                </div>
              </div>

              {optimizedResult && (
                <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4" id="cart-optimization-payout">
                  <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                    <span className="text-neutral-500 uppercase">Baseline total:</span>
                    <span className="text-red-550 font-bold line-through">₹{optimizedResult.originalTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono mb-3">
                    <span className="text-emerald-700 uppercase font-bold">Split optimized:</span>
                    <span className="text-emerald-800 font-black text-sm">₹{optimizedResult.optimizedTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-1.5 space-y-2 max-h-36 overflow-y-auto">
                    {optimizedResult.packages.map((pkg, idx) => {
                      const badge = getProviderBadge(pkg.providerId);
                      return (
                        <div key={idx} className="flex justify-between text-[9px] font-mono bg-white p-2 rounded-xl border border-emerald-500/10">
                          <div>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase ${badge.bg}`}>{badge.label}</span>
                            <p className="text-neutral-455 truncate max-w-[120px] mt-1">{pkg.items[0]?.productName || "Package item"}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold block text-neutral-900">₹{pkg.subtotal.toLocaleString()}</span>
                            <span className="text-neutral-400 block text-[8px]">ETA: {pkg.eta}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 text-center bg-emerald-500 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold py-2.5 rounded-xl shadow-xs">
                    Saved ₹{optimizedResult.savingsTotal.toLocaleString()}!
                  </div>
                </div>
              )}
            </div>

            {/* AI Recommendations Panel */}
            <div className="bg-neutral-900 text-white border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between" id="ai-advisor-panel">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase font-mono tracking-widest text-emerald-400 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-450 animate-spin" /> PriceOS AI recommendations
                </div>

                <div className="bg-neutral-950/65 border border-neutral-800 rounded-2xl p-4 text-[10px] min-h-24 max-h-56 overflow-y-auto font-mono mb-4 leading-relaxed tracking-wide text-neutral-350" id="ai-recs-report">
                  <h4 className="font-bold text-white border-b border-neutral-850 pb-2 mb-2 font-display text-xs">{aiRec.headline}</h4>
                  {aiRec.loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-4 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                      <span className="text-[9px] uppercase tracking-wider mt-1">Generating strategic advisory...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{aiRec.text}</p>
                  )}
                </div>
              </div>

              <button
                id="request-ai-rec-strategy-btn"
                onClick={requestAIRecommendation}
                disabled={aiRec.loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-black py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" /> Analyze Price Matrix
              </button>
            </div>

            {/* LLM Model Playground Evaluation pane */}
            <div className="bg-white border border-neutral-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs" id="llm-compare-playground-card">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black text-neutral-900 uppercase font-mono tracking-wider">Model Playground Evaluation</h4>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-neutral-500 mb-2 p-1 bg-neutral-50 rounded-lg border border-neutral-205" id="playground-model-toggles">
                    {mockAIModels.map(mod => {
                      const isActive = selectedAIModels.includes(mod.id);
                      return (
                        <label key={mod.id} className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isActive}
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                            onChange={() => {
                              if (isActive) {
                                setSelectedAIModels(selectedAIModels.filter(m => m !== mod.id));
                              } else {
                                setSelectedAIModels([...selectedAIModels, mod.id]);
                              }
                            }}
                          />
                          <span className="truncate">{mod.name.split(" ").slice(-1).join(" ")}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="relative mb-3">
                    <textarea
                      id="playground-prompt-box"
                      className="w-full bg-neutral-50 border border-neutral-205 p-3 text-[10px] font-mono text-neutral-800 rounded-xl h-20 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white resize-none"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                    />
                    <button
                      id="playground-run-btn"
                      onClick={executePlayground}
                      disabled={isRunningPlayground || selectedAIModels.length === 0}
                      className="absolute right-2.5 bottom-2.5 bg-neutral-900 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase font-mono px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                    >
                      {isRunningPlayground ? "Running" : "Evaluate"}
                    </button>
                  </div>

                  {playgroundResults.length > 0 && (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1" id="playground-comparative-matrix">
                      {playgroundResults.map(res => (
                        <div key={res.modelId} className="bg-neutral-50 border border-neutral-200/60 p-3 rounded-xl font-mono text-[9px]">
                          <div className="flex justify-between items-center text-[8px] border-b border-neutral-200 pb-1.5 mb-1.5">
                            <span className="font-extrabold text-[#7c3aed] uppercase">{res.modelId}</span>
                            <div className="flex gap-2 text-neutral-400 font-bold">
                              <span>Lat: <strong className="text-neutral-700">{res.latency}ms</strong></span>
                              <span>Cost: <strong className="text-emerald-600">${res.cost.toFixed(6)}</strong></span>
                            </div>
                          </div>
                          <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{res.response}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6" id="public-main-search-and-compare-flow">
      
      {/* 1. INITIAL LANDING (searchQuery is empty): Show that we compare products explicitly */}
      {searchQuery.trim() === "" ? (
        <div className="bg-white border border-neutral-200/55 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden flex flex-col justify-center items-center shadow-xs" id="simple-init-landing-panel">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 border border-neutral-800 shadow-md">
            <Search className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight font-display max-w-xl">
            Unified Multi-Platform Product Comparison
          </h2>
          <p className="text-xs text-neutral-450 font-mono mt-3 max-w-lg leading-relaxed uppercase tracking-wider">
            Compare live prices of grocery, household essentials & electronics across active channels.
          </p>

          {/* Large landing search input bar centered */}
          <div className="w-full max-w-xl mt-8 relative" id="landing-centric-search">
            <input
              type="text"
              autoFocus
              placeholder="Search items, brands or category folders (e.g. AirPods, Avocados, milk)..."
              className="w-full pl-12 pr-28 py-4 bg-neutral-50 hover:bg-neutral-100/55 focus:bg-white border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-extrabold focus:outline-hidden focus:border-emerald-500 shadow-xs transition-all text-neutral-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-4.5" />
            <span className="absolute right-3 top-2.5 bg-neutral-900 text-white font-mono text-[9px] uppercase font-black tracking-wider py-2 px-3 rounded-xl select-none">
              Live Index
            </span>
          </div>

          {/* Actively compared platforms indicators */}
          <div className="mt-10 pt-8 border-t border-neutral-100 w-full max-w-xl flex flex-col items-center">
            <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 font-black mb-4">
              Actively Compared Channels & Crawlers
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-amber-50 text-amber-800 border border-amber-200/40 text-[10px] font-mono font-black py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                ⚡ Blinkit (Quick Delivery)
              </span>
              <span className="bg-purple-50 text-purple-800 border border-purple-200/40 text-[10px] font-mono font-black py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                🍇 Zepto (10 mins)
              </span>
              <span className="bg-blue-50 text-blue-800 border border-blue-200/40 text-[10px] font-mono font-black py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                📦 Amazon India (E-commerce)
              </span>
              <span className="bg-sky-50 text-sky-850 border border-sky-200/40 text-[10px] font-mono font-black py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                🛒 Flipkart (Retail)
              </span>
            </div>
          </div>

          {/* Quick-search pill click helpers */}
          <div className="flex flex-col items-center gap-2 mt-8">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Popular indexed shortcuts</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {["AirPods Pro", "Sony WH-1000XM5", "Organic Avocados", "Whole Milk"].map(chip => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="bg-white border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold text-neutral-600 hover:text-emerald-800 transition-all cursor-pointer whitespace-nowrap"
                >
                  🔍 {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5" id="results-dashboard-public">
          {/* 2. SEARCHED RESULTS GRID: Display comparison results directly in product cards */}
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xs font-black text-neutral-900 font-mono uppercase tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" /> Matches Found ({filteredProducts.length})
              </h2>
              <p className="text-[10px] text-neutral-405 font-mono mt-0.5">Unified catalog pricing from live crawler caches. Click Compare Details for deep metrics.</p>
            </div>
            
            {/* Inline Search bar refinement */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Modify search term..."
                className="w-full pl-9 pr-14 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 text-neutral-950 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-neutral-450 hover:text-neutral-900 text-[10px] font-mono font-bold uppercase"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Simulated API Crawler Fetching state loader or results display */}
          {isSimulatingFetch ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-md" id="simulated-api-crawler-box">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/15">
                  <div className="w-4.5 h-4.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <h4 className="text-xs font-black uppercase text-white font-mono tracking-wider">Scraping Multi-Provider APIs...</h4>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Dispatched real-time cloud crawlers to Blinkit, Zepto, and Amazon India nodes</p>
                </div>
              </div>

              {/* Progress Console logs */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850/40 font-mono text-[10px] text-emerald-400 space-y-1.5 shadow-inner">
                {activeCrawlers.map((crawlerLog, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span className="text-emerald-305">{crawlerLog}</span>
                  </div>
                ))}
              </div>

              {/* Bento Skeleton Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {[1, 2].map(n => (
                  <div key={n} className="bg-neutral-950/20 border border-neutral-800/40 rounded-3xl p-6 space-y-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800/80"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-neutral-800/80 rounded-md w-3/4"></div>
                        <div className="h-3 bg-neutral-850/80 rounded-md w-1/2"></div>
                      </div>
                    </div>
                    <div className="border-t border-neutral-850 my-4"></div>
                    <div className="space-y-2">
                      <div className="h-8 bg-neutral-800/70 rounded-xl w-full"></div>
                      <div className="h-8 bg-neutral-805/65 rounded-xl w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Comparison Grid of matching products */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="results-comparison-grid">
                {filteredProducts.map(product => {
                  const snapshotPrices = (Object.values(product.priceSnapshots) as any[]).map(s => s.price);
                  const lowestPrice = Math.min(...snapshotPrices);

                  return (
                    <div
                      key={product.id}
                      id={`product-card-${product.id}`}
                      className="bg-white border border-neutral-200 hover:border-emerald-400 rounded-3xl p-5 md:p-6 transition-all hover:shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Brand and category info */}
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className="text-[9px] font-bold uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-510 border border-neutral-200/50">
                            {product.brand}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {product.category}
                          </span>
                        </div>

                        <div className="flex gap-4">
                          <img src={product.imageUrl} className="w-16 h-16 object-cover rounded-2xl border border-neutral-200" alt="" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-black text-neutral-950 leading-snug line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1 font-mono italic">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-neutral-100 my-4"></div>

                        {/* Beautiful available platforms lists in CARD */}
                        <div className="space-y-2" id={`platform-comparison-card-rows-${product.id}`}>
                          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 font-mono block mb-2 pl-0.5">
                            Available Platform Pricing Matrix
                          </span>
                          
                          {Object.keys(product.priceSnapshots).map(provId => {
                            const snap = product.priceSnapshots[provId];
                            const badge = getProviderBadge(provId);
                            const isLowest = snap.price === lowestPrice;

                            return (
                              <div
                                key={provId}
                                className={`px-3 py-2.5 rounded-xl flex justify-between items-center text-[11px] font-mono border transition-all ${
                                  isLowest
                                    ? "bg-emerald-500/5 border-emerald-350"
                                    : "bg-neutral-50/50 border-neutral-200/50"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{badge.label[0]}</span>
                                  <span className="font-extrabold text-neutral-700">{badge.label}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isLowest && (
                                    <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100/70 border border-emerald-200/40 px-1.5 py-0.5 rounded font-mono">
                                      Lowest Price ★
                                    </span>
                                  )}
                                  <span className="font-black text-neutral-950">
                                    ₹{snap.price.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-neutral-400 font-semibold">
                                    ({snap.deliveryEta})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>

                      {/* Actions footer of Card */}
                      <div className="border-t border-neutral-100 pt-4 mt-5 grid grid-cols-2 gap-3" id="product-card-actions">
                        <button
                          id={`add-to-cart-btn-${product.id}`}
                          onClick={() => addToCart(product.id)}
                          className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" /> Basket Add
                        </button>
                        <button
                          id={`compare-products-deep-btn-${product.id}`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsComparisonOpen(true);
                          }}
                          className="py-2.5 bg-neutral-900 hover:bg-emerald-555 hover:bg-emerald-500 hover:text-neutral-950 text-white font-mono text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer tracking-wider select-none"
                        >
                          Compare Option ✦
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="bg-white border rounded-3xl p-12 text-center text-neutral-400 font-mono text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
                  No matched catalog records under token &apos;{searchQuery}&apos; found.
                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
}
