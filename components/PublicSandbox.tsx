"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Sparkles, Truck, Plus, ShoppingBag, History, AlertCircle, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import type { CanonicalProduct, CartItem, OptimizationResult } from "@/types";

export default function PublicSandbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CanonicalProduct[]>([]);
  const [productCache, setProductCache] = useState<Record<string, CanonicalProduct>>({});
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [crawlerMessages, setCrawlerMessages] = useState<string[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [visibleProviders, setVisibleProviders] = useState<string[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartConstraint, setCartConstraint] = useState<"MIN_COST" | "MIN_ETA">("MIN_COST");
  const [optimizedResult, setOptimizedResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [aiRec, setAiRec] = useState<{ headline: string; text: string; loading: boolean }>({
    headline: "PriceOS AI Recommendation",
    text: "Select a product and click 'Analyze Price Matrix' to get AI-powered shopping advice.",
    loading: false,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoadingSearch(true);
    setSearchError("");
    setSearchResults([]);
    setCrawlerMessages(["Initializing provider nodes...", "Configuring DNS proxies..."]);

    const t1 = setTimeout(() => {
      setCrawlerMessages([
        "Amazon India: fetching product listings...",
        "Blinkit: resolving stock & pricing...",
        "Zepto: mapping delivery coordinates...",
        "Flipkart: scanning catalog index...",
      ]);
    }, 300);

    const t2 = setTimeout(() => {
      setCrawlerMessages(prev => [
        ...prev.map(m => `✅ ${m.replace("...", " — done")}`),
        "⚙️ AI Canonical Correlator: matching equivalents...",
      ]);
    }, 700);

    try {
      const resp = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: abortRef.current.signal,
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        setSearchError(data.error || "Search failed. Check your Gemini API key in Admin.");
        setSearchResults([]);
      } else {
        const products: CanonicalProduct[] = data.products || [];
        setSearchResults(products);
        setProductCache(prev => {
          const next = { ...prev };
          products.forEach(p => { next[p.id] = p; });
          return next;
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setSearchError("Connection error. Is the server running?");
      }
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsLoadingSearch(false);
      setCrawlerMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoadingSearch(false);
      setSearchError("");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(searchQuery), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, performSearch]);

  useEffect(() => {
    if (selectedProduct) setVisibleProviders(Object.keys(selectedProduct.priceSnapshots));
  }, [selectedProduct]);

  useEffect(() => { runCartOptimization(); }, [cart, cartConstraint]);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      return existing
        ? prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const runCartOptimization = async () => {
    if (cart.length === 0) { setOptimizedResult(null); return; }
    setIsOptimizing(true);
    try {
      const cartProducts: Record<string, CanonicalProduct> = {};
      cart.forEach(item => { if (productCache[item.id]) cartProducts[item.id] = productCache[item.id]; });

      const resp = await fetch("/api/cart/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, constraint: cartConstraint, products: cartProducts }),
      });
      const data = await resp.json();
      if (data.success) setOptimizedResult(data);
    } catch (err) {
      console.error("Cart optimize error:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const requestAIRecommendation = async () => {
    if (!selectedProduct) return;
    setAiRec(prev => ({ ...prev, loading: true }));
    try {
      const resp = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: selectedProduct.name, products: selectedProduct.priceSnapshots }),
      });
      const data = await resp.json();
      setAiRec({ headline: data.headline || "PriceOS AI Report", text: data.suggestion, loading: false });
    } catch (err: any) {
      setAiRec({ headline: "Error", text: `Could not fetch recommendation: ${err.message}`, loading: false });
    }
  };

  const getProviderBadge = (providerId: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      blinkit:   { bg: "bg-amber-100 text-amber-800 border-amber-200",   label: "⚡ Blinkit"   },
      zepto:     { bg: "bg-purple-100 text-purple-800 border-purple-200", label: "🍇 Zepto"    },
      instamart: { bg: "bg-orange-100 text-orange-800 border-orange-200", label: "🍊 Instamart" },
      amazon:    { bg: "bg-blue-100 text-blue-800 border-blue-200",       label: "📦 Amazon"   },
      flipkart:  { bg: "bg-sky-100 text-sky-800 border-sky-200",         label: "🛒 Flipkart"  },
      croma:     { bg: "bg-teal-100 text-teal-800 border-teal-200",      label: "🔌 Croma"    },
      reliance:  { bg: "bg-rose-100 text-rose-800 border-rose-200",      label: "🔴 Reliance"  },
      myntra:    { bg: "bg-pink-100 text-pink-800 border-pink-200",      label: "👗 Myntra"   },
    };
    return map[providerId] || { bg: "bg-neutral-100 text-neutral-800 border-neutral-200", label: providerId };
  };

  const pColor = (pId: string) => {
    const colors: Record<string, string> = {
      amazon: "#3b82f6", flipkart: "#0ea5e9", blinkit: "#eab308",
      zepto: "#a855f7", croma: "#06b6d4", reliance: "#ef4444", myntra: "#ec4899",
    };
    return colors[pId] || "#10b981";
  };

  // ── COMPARISON DETAIL VIEW ──────────────────────────────────────────────
  if (isComparisonOpen && selectedProduct) {
    const history = selectedProduct.priceHistory || [];
    const pointsCount = history.length;
    const allPrices = history.flatMap(h => Object.values(h.prices));
    const minVal = allPrices.length ? Math.min(...allPrices) * 0.95 : 0;
    const maxVal = allPrices.length ? Math.max(...allPrices) * 1.05 : 1;
    const widthStep = pointsCount > 1 ? 340 / (pointsCount - 1) : 0;
    const getX = (i: number) => 40 + i * widthStep;
    const getY = (v: number) => 125 - ((v - minVal) / (maxVal - minVal || 1)) * 100;

    return (
      <div className="bg-white border border-neutral-200/65 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsComparisonOpen(false)}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-emerald-500 font-mono text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </button>
            <div className="flex items-center gap-3">
              <img src={selectedProduct.imageUrl} className="w-12 h-12 object-cover rounded-xl border border-neutral-200" alt="" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60"; }} />
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-600 font-mono tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {selectedProduct.brand} • {selectedProduct.category}
                </span>
                <h2 className="text-sm font-black text-neutral-900 mt-1 truncate max-w-[280px]">{selectedProduct.name}</h2>
              </div>
            </div>
          </div>
          <div className="flex gap-2 font-mono text-[9px] text-neutral-400 uppercase flex-wrap">
            <div className="bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl">SKU: <span className="text-neutral-800 font-bold">{selectedProduct.sku}</span></div>
            <div className="bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl">Base: <span className="text-neutral-800 font-bold">₹{selectedProduct.basePriceRange.min.toLocaleString()} – ₹{selectedProduct.basePriceRange.max.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-2xl">
              <span className="text-[9px] font-extrabold tracking-wider text-emerald-600 uppercase font-mono">Current Live Mappings</span>
              <h3 className="text-xs font-black text-neutral-900 mt-0.5 uppercase font-mono mb-4">Detailed Pricing Snapshots</h3>
              <div className="space-y-2.5">
                {Object.entries(selectedProduct.priceSnapshots).map(([provId, snap]) => {
                  const badge = getProviderBadge(provId);
                  const snapAny = snap as any;
                  return (
                    <div key={provId} className="p-3 bg-white border border-neutral-200 rounded-xl flex justify-between items-center gap-2 shadow-sm hover:border-neutral-300 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-lg w-6 h-6 flex items-center justify-center bg-white border border-neutral-200 rounded-lg">{badge.label[0]}</span>
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono border ${badge.bg}`}>{badge.label}</span>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Seller: {snapAny.seller || "Direct"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {snapAny.discountPercent > 0 && (
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-bold px-1.5 py-0.5 rounded font-mono">-{snapAny.discountPercent}%</span>
                          )}
                          <span className="text-xs font-extrabold font-mono text-neutral-900">₹{snapAny.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-mono text-neutral-400">
                          <Truck className="w-3 h-3" /><span>{snapAny.deliveryEta}</span>
                        </div>
                        {snapAny.buyUrl && (
                          <a href={snapAny.buyUrl} target="_blank" rel="noopener noreferrer"
                            className="text-[9px] font-mono text-emerald-600 hover:text-emerald-700 underline mt-0.5 block">
                            Buy →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-neutral-100 pt-4 mt-4">
                <h4 className="text-[9px] font-black uppercase text-neutral-400 font-mono tracking-wider mb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-600">
                  {Object.entries(selectedProduct.specs).map(([k, v]) => (
                    <div key={k} className="bg-white p-2 rounded-lg border border-neutral-200 flex justify-between gap-2">
                      <span className="text-neutral-500 font-medium truncate">{k}:</span>
                      <span className="text-neutral-800 font-bold truncate pl-1">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xs font-black text-neutral-950 flex items-center gap-1.5 uppercase font-mono tracking-wider"><History className="w-4 h-4 text-emerald-500" /> 7-Day Price Trends</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">Daily snapshots from live crawlers</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {Object.keys(selectedProduct.priceSnapshots).map(provId => {
                    const badge = getProviderBadge(provId);
                    const isVisible = visibleProviders.includes(provId);
                    return (
                      <button key={provId} onClick={() => setVisibleProviders(prev => isVisible ? prev.filter(p => p !== provId) : [...prev, provId])}
                        className={`text-[9px] uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer font-mono font-bold ${isVisible ? badge.bg : "bg-neutral-50 text-neutral-400 border-neutral-200 opacity-60"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{provId}
                      </button>
                    );
                  })}
                </div>
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 400 160">
                    {[20, 55, 90, 125].map(y => <line key={y} x1="40" y1={y} x2="380" y2={y} stroke={y === 125 ? "#e2e8f0" : "#f1f5f9"} strokeDasharray={y === 125 ? "0" : "3,3"} strokeWidth="1" />)}
                    {Object.keys(selectedProduct.priceSnapshots).map(provId => {
                      if (!visibleProviders.includes(provId)) return null;
                      let pathStr = "";
                      history.forEach((h, i) => {
                        const price = h.prices[provId];
                        if (price) pathStr += `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(price)} `;
                      });
                      return (
                        <g key={provId}>
                          <path d={pathStr} fill="none" stroke={pColor(provId)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {history.map((h, i) => h.prices[provId] ? (
                            <circle key={i} cx={getX(i)} cy={getY(h.prices[provId])} r="3.5" fill="white" stroke={pColor(provId)} strokeWidth="2.5"><title>{provId}: ₹{h.prices[provId]}</title></circle>
                          ) : null)}
                        </g>
                      );
                    })}
                    {history.map((h, i) => <text key={i} x={getX(i)} y="145" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" textAnchor="middle">{h.timestamp}</text>)}
                    <text x="35" y="24" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">₹{Math.round(maxVal).toLocaleString()}</text>
                    <text x="35" y="128" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">₹{Math.round(minVal).toLocaleString()}</text>
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-black text-neutral-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Basket Split Optimizer
                </h4>
                <span className="text-[9px] font-extrabold px-2 rounded-full font-mono bg-emerald-100 text-emerald-800 border border-emerald-200/40">{cart.length} Items</span>
              </div>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.map(item => {
                  const prod = productCache[item.id];
                  if (!prod) return null;
                  return (
                    <div key={item.id} className="p-2.5 bg-white border border-neutral-200 rounded-xl flex justify-between items-center gap-2 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <img src={prod.imageUrl} alt="" className="w-8 h-8 object-cover rounded-md border" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60"; }} />
                        <div className="truncate">
                          <h5 className="text-[11px] font-bold text-neutral-900 truncate max-w-[110px]">{prod.name}</h5>
                          <p className="text-[9px] font-mono text-neutral-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-neutral-950">₹{prod.basePriceRange.min.toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
                {cart.length === 0 && <div className="text-center py-6 text-neutral-400 text-xs font-mono bg-white rounded-xl border">Basket empty. Add items from search results.</div>}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setCartConstraint("MIN_COST")} className={`py-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono border transition-all cursor-pointer ${cartConstraint === "MIN_COST" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"}`}>Min Cost</button>
                <button onClick={() => setCartConstraint("MIN_ETA")} className={`py-2 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono border transition-all cursor-pointer ${cartConstraint === "MIN_ETA" ? "bg-purple-500 text-white border-purple-500" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"}`}>Min ETA</button>
              </div>
              {isOptimizing && <div className="text-center py-3 text-[10px] font-mono text-neutral-400 flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing split...</div>}
              {optimizedResult && !isOptimizing && (
                <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4">
                  <div className="flex justify-between text-[10px] font-mono mb-1"><span className="text-neutral-500 uppercase">Baseline:</span><span className="text-red-500 font-bold line-through">₹{optimizedResult.originalTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[10px] font-mono mb-3"><span className="text-emerald-700 uppercase font-bold">Optimized:</span><span className="text-emerald-800 font-black text-sm">₹{optimizedResult.optimizedTotal.toLocaleString()}</span></div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {optimizedResult.packages.map((pkg, i) => {
                      const badge = getProviderBadge(pkg.providerId);
                      return (
                        <div key={i} className="flex justify-between text-[9px] font-mono bg-white p-2 rounded-xl border border-emerald-500/10">
                          <div><span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase border ${badge.bg}`}>{badge.label}</span><p className="text-neutral-400 truncate max-w-[120px] mt-1">{pkg.items[0]?.productName}</p></div>
                          <div className="text-right"><span className="font-extrabold block text-neutral-900">₹{pkg.subtotal.toLocaleString()}</span><span className="text-neutral-400 text-[8px]">ETA: {pkg.eta}</span></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center bg-emerald-500 text-white font-mono text-[10px] uppercase tracking-wider font-extrabold py-2.5 rounded-xl">Saved ₹{optimizedResult.savingsTotal.toLocaleString()}!</div>
                </div>
              )}
            </div>

            <div className="bg-neutral-900 text-white border border-neutral-800 p-5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase font-mono tracking-widest text-emerald-400 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" /> PriceOS AI Recommendations
              </div>
              <div className="bg-neutral-950/65 border border-neutral-800 rounded-2xl p-4 text-[10px] min-h-24 max-h-56 overflow-y-auto font-mono mb-4 leading-relaxed text-neutral-300">
                <h4 className="font-bold text-white border-b border-neutral-700 pb-2 mb-2 text-xs">{aiRec.headline}</h4>
                {aiRec.loading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-4 text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[9px] uppercase tracking-wider">Generating advisory...</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{aiRec.text}</p>
                )}
              </div>
              <button onClick={requestAIRecommendation} disabled={aiRec.loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-black py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider disabled:opacity-60">
                <Sparkles className="w-4 h-4" /> Analyze Price Matrix
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN SEARCH VIEW ───────────────────────────────────────────────────
  const hasQuery = searchQuery.trim() !== "";

  return (
    <div className="space-y-6">
      {!hasQuery ? (
        <div className="bg-white border border-neutral-200/55 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden flex flex-col justify-center items-center shadow-xs">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 border border-neutral-800 shadow-md">
            <Search className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight max-w-xl">Unified Multi-Platform Price Comparison</h2>
          <p className="text-xs text-neutral-400 font-mono mt-3 max-w-lg leading-relaxed uppercase tracking-wider">Compare live prices across Quick-Commerce & E-Commerce — powered by Gemini AI</p>
          <div className="w-full max-w-xl mt-8 relative">
            <input type="text" autoFocus placeholder="Search any product (e.g. AirPods, milk, Sony headphones)..."
              className="w-full pl-12 pr-28 py-4 bg-neutral-50 hover:bg-neutral-100/55 focus:bg-white border-2 border-neutral-200 rounded-2xl text-xs md:text-sm font-extrabold focus:outline-none focus:border-emerald-500 shadow-xs transition-all text-neutral-900"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-4" />
            <span className="absolute right-3 top-2.5 bg-neutral-900 text-white font-mono text-[9px] uppercase font-black tracking-wider py-2 px-3 rounded-xl select-none">Gemini AI</span>
          </div>
          <div className="mt-10 pt-8 border-t border-neutral-100 w-full max-w-xl">
            <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 font-black mb-4 block">Shop on these channels</span>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                ["⚡ Blinkit", "bg-amber-50 text-amber-800 border-amber-200/40", "https://blinkit.com"],
                ["🍇 Zepto", "bg-purple-50 text-purple-800 border-purple-200/40", "https://zepto.com"],
                ["📦 Amazon India", "bg-blue-50 text-blue-800 border-blue-200/40", "https://amazon.in"],
                ["🛒 Flipkart", "bg-sky-50 text-sky-800 border-sky-200/40", "https://flipkart.com"],
                ["👗 Myntra", "bg-pink-50 text-pink-800 border-pink-200/40", "https://myntra.com"],
                ["🔌 Croma", "bg-teal-50 text-teal-800 border-teal-200/40", "https://croma.com"],
                ["🔴 Reliance Digital", "bg-rose-50 text-rose-800 border-rose-200/40", "https://reliancedigital.in"],
              ].map(([label, cls, url]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  className={`border text-[10px] font-mono font-black py-1.5 px-3.5 rounded-full hover:opacity-80 transition-opacity ${cls}`}>
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 mt-8">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Popular searches</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {["AirPods Pro", "Sony WH-1000XM5", "Organic Avocados", "Whole Milk", "Nike Running Shoes"].map(chip => (
                <button key={chip} onClick={() => setSearchQuery(chip)}
                  className="bg-white border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold text-neutral-600 hover:text-emerald-800 transition-all cursor-pointer whitespace-nowrap">
                  🔍 {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xs font-black text-neutral-900 font-mono uppercase tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                {isLoadingSearch ? "Searching..." : `${searchResults.length} Results`}
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Gemini AI fetching live pricing. Click Compare for deep analysis.</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <input type="text" placeholder="Refine search..."
                className="w-full pl-9 pr-14 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 text-neutral-950 font-bold"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-900 text-[10px] font-mono font-bold uppercase">Clear</button>}
            </div>
          </div>

          {isLoadingSearch && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/15">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span><h4 className="text-xs font-black uppercase text-white font-mono tracking-wider">Gemini AI Searching...</h4></div>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Real-time product intelligence from Indian markets</p>
                </div>
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-[10px] text-emerald-400 space-y-1.5">
                {crawlerMessages.map((msg, i) => <div key={i} className="flex gap-2.5"><span className="text-neutral-600">&gt;</span><span>{msg}</span></div>)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {[1, 2].map(n => (
                  <div key={n} className="bg-neutral-950/20 border border-neutral-800/40 rounded-3xl p-6 space-y-4 animate-pulse">
                    <div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-neutral-800/80"></div><div className="flex-1 space-y-2"><div className="h-3.5 bg-neutral-800/80 rounded-md w-3/4"></div><div className="h-3 bg-neutral-800/80 rounded-md w-1/2"></div></div></div>
                    <div className="space-y-2"><div className="h-8 bg-neutral-800/70 rounded-xl"></div><div className="h-8 bg-neutral-800/70 rounded-xl"></div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoadingSearch && searchError && (
            <div className="bg-white border border-red-200 rounded-3xl p-8 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
              <p className="text-xs font-mono text-red-600 font-bold">{searchError}</p>
              <p className="text-[10px] font-mono text-neutral-400 mt-2">Configure your Gemini API key in Admin → Configure Secrets</p>
            </div>
          )}

          {!isLoadingSearch && !searchError && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map(product => {
                  const prices = Object.values(product.priceSnapshots).map((s: any) => s.price);
                  const lowestPrice = Math.min(...prices);
                  return (
                    <div key={product.id} className="bg-white border border-neutral-200 hover:border-emerald-400 rounded-3xl p-5 md:p-6 transition-all hover:shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className="text-[9px] font-bold uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/50">{product.brand}</span>
                          <span className="text-[9px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{product.category}</span>
                        </div>
                        <div className="flex gap-4">
                          <img src={product.imageUrl} className="w-16 h-16 object-cover rounded-2xl border border-neutral-200 flex-shrink-0" alt="" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60"; }} />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-black text-neutral-950 leading-snug line-clamp-2">{product.name}</h3>
                            <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1 font-mono italic">{product.description}</p>
                          </div>
                        </div>
                        <div className="border-t border-neutral-100 my-4"></div>
                        <div className="space-y-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 font-mono block mb-2">Available Platform Pricing</span>
                          {Object.entries(product.priceSnapshots).map(([provId, snap]) => {
                            const badge = getProviderBadge(provId);
                            const snapAny = snap as any;
                            const isLowest = snapAny.price === lowestPrice;
                            return (
                              <div key={provId} className={`px-3 py-2.5 rounded-xl flex justify-between items-center text-[11px] font-mono border transition-all ${isLowest ? "bg-emerald-500/5 border-emerald-300" : "bg-neutral-50/50 border-neutral-200/50"}`}>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{badge.label[0]}</span>
                                  <span className="font-extrabold text-neutral-700">{badge.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isLowest && <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100/70 border border-emerald-200/40 px-1.5 py-0.5 rounded font-mono">Lowest ★</span>}
                                  <span className="font-black text-neutral-950">₹{snapAny.price.toLocaleString()}</span>
                                  <span className="text-[9px] text-neutral-400">({snapAny.deliveryEta})</span>
                                  {snapAny.buyUrl && (
                                    <a href={snapAny.buyUrl} target="_blank" rel="noopener noreferrer"
                                      className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold">Buy →</a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="border-t border-neutral-100 pt-4 mt-5 grid grid-cols-2 gap-3">
                        <button onClick={() => addToCart(product.id)} className="py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer">
                          <Plus className="w-3.5 h-3.5" /> Add to Basket
                        </button>
                        <button onClick={() => { setSelectedProduct(product); setIsComparisonOpen(true); setAiRec({ headline: "PriceOS AI Recommendation", text: "Click 'Analyze Price Matrix' for AI-powered advice on this product.", loading: false }); }}
                          className="py-2.5 bg-neutral-900 hover:bg-emerald-500 hover:text-neutral-950 text-white font-mono text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer tracking-wider">
                          Compare ✦
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {searchResults.length === 0 && !isLoadingSearch && (
                <div className="bg-white border rounded-3xl p-12 text-center text-neutral-400 font-mono text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
                  No results for &quot;{searchQuery}&quot;. Try a different search term.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
