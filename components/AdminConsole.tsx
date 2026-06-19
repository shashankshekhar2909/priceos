"use client";

import React, { useState, useEffect } from "react";
import {
  Layers, ShieldCheck, RefreshCw, Monitor, ToggleLeft, ToggleRight,
  Key, Database, Trash2, Plus, Cpu, Loader2, Play,
} from "lucide-react";
import type { Provider, MatchingTask, Alert, CanonicalProduct } from "@/types";
import { mockProviders } from "@/data/mock-data";

export default function AdminConsole() {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [matchingTasks] = useState<MatchingTask[]>([]);
  const [alerts] = useState<Alert[]>([]);
  const [productsList, setProductsList] = useState<CanonicalProduct[]>([]);

  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [isSavingSecrets, setIsSavingSecrets] = useState(false);
  const [secretsMsg, setSecretsMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [keyStatus, setKeyStatus] = useState({ geminiConfigured: false, groqConfigured: false });

  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [playgroundPrompt, setPlaygroundPrompt] = useState("Compare the cost per million tokens of Gemini 2.5 Flash vs GPT-4o and recommend which to use for a price comparison chatbot.");
  const [playgroundResults, setPlaygroundResults] = useState<any[]>([]);
  const [isRunningPlayground, setIsRunningPlayground] = useState(false);

  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Electronics");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [amazonPrice, setAmazonPrice] = useState("");
  const [zeptoPrice, setZeptoPrice] = useState("");
  const [blinkitPrice, setBlinkitPrice] = useState("");
  const [prodMsg, setProdMsg] = useState("");

  const [scraperLogs, setScraperLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] PriceOS Admin Console initialized.`,
    `[${new Date().toLocaleTimeString()}] Gemini AI search engine: ready.`,
    `[${new Date().toLocaleTimeString()}] Provider connectors loaded: ${mockProviders.length} providers.`,
  ]);
  const [newLogInput, setNewLogInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"PLAYGROUND" | "PROVIDERS" | "SCRAPERS" | "ALERTS" | "SECRETS" | "PRODUCTS">("PLAYGROUND");

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setKeyStatus(d)).catch(() => {});
    fetch("/api/models").then(r => r.json()).then(d => {
      setAvailableModels(d.models || []);
      const available = (d.models || []).filter((m: any) => m.available).map((m: any) => m.id);
      setSelectedModels(available.slice(0, 2));
    }).catch(() => {});
  }, []);

  const refreshKeyStatus = () => {
    fetch("/api/stats").then(r => r.json()).then(d => setKeyStatus(d)).catch(() => {});
    fetch("/api/models").then(r => r.json()).then(d => setAvailableModels(d.models || [])).catch(() => {});
  };

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    addLog(`Provider "${id}" ${providers.find(p => p.id === id)?.enabled ? "disabled" : "enabled"}.`);
  };

  const addLog = (msg: string) => {
    setScraperLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 99)]);
  };

  const triggerScrapeTest = () => {
    if (!newLogInput.trim()) return;
    addLog(`TEST: ${newLogInput}`);
    setNewLogInput("");
  };

  const saveSecrets = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecrets(true);
    setSecretsMsg(null);
    try {
      const resp = await fetch("/api/secrets/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiKey, groqKey }),
      });
      const data = await resp.json();
      if (data.success) {
        setSecretsMsg({ text: "Keys saved & encrypted. Applied immediately.", ok: true });
        setKeyStatus({ geminiConfigured: data.geminiConfigured, groqConfigured: data.groqConfigured });
        setGeminiKey("");
        setGroqKey("");
        addLog(`Secrets updated. Gemini: ${data.geminiConfigured ? "✓" : "✗"}  Groq: ${data.groqConfigured ? "✓" : "✗"}`);
        setAvailableModels(prev => prev.map(m => ({
          ...m,
          available: m.provider === "gemini" ? data.geminiConfigured : m.provider === "groq" ? data.groqConfigured : m.available,
        })));
      } else {
        setSecretsMsg({ text: "Save failed. Check server logs.", ok: false });
      }
    } catch {
      setSecretsMsg({ text: "Network error saving secrets.", ok: false });
    } finally {
      setIsSavingSecrets(false);
      setTimeout(() => setSecretsMsg(null), 5000);
    }
  };

  const revokeKey = async (provider: string) => {
    try {
      const resp = await fetch(`/api/admin/keys/${provider}`, { method: "DELETE" });
      const data = await resp.json();
      if (data.success) {
        setKeyStatus({ geminiConfigured: data.geminiConfigured, groqConfigured: data.groqConfigured });
        addLog(`Key revoked: ${provider}`);
        setSecretsMsg({ text: `${provider} key revoked.`, ok: true });
        setTimeout(() => setSecretsMsg(null), 3000);
      }
    } catch {
      setSecretsMsg({ text: "Revoke failed.", ok: false });
    }
  };

  const executePlayground = async () => {
    if (!playgroundPrompt.trim() || selectedModels.length === 0) return;
    setIsRunningPlayground(true);
    setPlaygroundResults([]);
    addLog(`Playground: running prompt across ${selectedModels.length} model(s).`);
    try {
      const resp = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: playgroundPrompt, modelsConfig: selectedModels }),
      });
      const data = await resp.json();
      if (data.success) {
        setPlaygroundResults(data.results);
        addLog(`Playground: completed. ${data.results.filter((r: any) => r.ok).length}/${data.results.length} models succeeded.`);
      }
    } catch (err: any) {
      addLog(`Playground error: ${err.message}`);
    } finally {
      setIsRunningPlayground(false);
    }
  };

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) { setProdMsg("Name and SKU are required."); return; }
    const ap = parseFloat(amazonPrice) || 0;
    const zp = parseFloat(zeptoPrice) || 0;
    const bp = parseFloat(blinkitPrice) || 0;
    const now = new Date().toISOString();
    const newProduct: CanonicalProduct = {
      id: newProdSku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      sku: newProdSku.toUpperCase(),
      name: newProdName,
      brand: newProdBrand || "Generic",
      category: newProdCategory,
      description: newProdDesc || `${newProdName} catalog entry`,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80",
      basePriceRange: { min: Math.min(...[ap, zp, bp].filter(Boolean)) || ap, max: Math.max(ap, zp, bp) || ap },
      mappings: [{ productId: `${newProdSku}-amazon`, providerId: "amazon" }],
      priceSnapshots: {
        ...(ap ? { amazon: { price: ap, discountPercent: 0, timestamp: now, inStock: true, deliveryEta: "Next Day", seller: "Direct" } } : {}),
        ...(bp ? { blinkit: { price: bp, discountPercent: 0, timestamp: now, inStock: true, deliveryEta: "12 mins", seller: "Blinkit Store" } } : {}),
        ...(zp ? { zepto: { price: zp, discountPercent: 0, timestamp: now, inStock: true, deliveryEta: "9 mins", seller: "Zepto Store" } } : {}),
      },
      priceHistory: [{ timestamp: now.slice(5, 10), prices: { ...(ap ? { amazon: ap } : {}), ...(bp ? { blinkit: bp } : {}), ...(zp ? { zepto: zp } : {}) } }],
      specs: { "Origin": "Domestic", "Quality": "Standard" },
    };
    setProductsList(prev => [...prev, newProduct]);
    addLog(`Catalog: added "${newProdName}" (SKU: ${newProdSku.toUpperCase()}).`);
    setNewProdName(""); setNewProdSku(""); setNewProdBrand(""); setNewProdDesc("");
    setAmazonPrice(""); setZeptoPrice(""); setBlinkitPrice("");
    setProdMsg("Product added to catalog.");
    setTimeout(() => setProdMsg(""), 4000);
  };

  const TAB_BTN = (id: typeof activeTab, label: string, badge?: string) => (
    <button onClick={() => setActiveTab(id)}
      className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${activeTab === id ? "bg-neutral-900 border-neutral-900 text-white shadow-xs" : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"}`}>
      <span>{label}</span>
      {badge && <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === id ? "bg-white/10 text-white" : "bg-neutral-200 text-neutral-700"}`}>{badge}</span>}
    </button>
  );

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-6 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Core Ops Infrastructure Console
          </span>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight mt-0.5">PriceOS Backend Systems</h1>
        </div>
        <div className="flex gap-3 font-mono text-[10px] text-neutral-500 uppercase flex-wrap items-center">
          <div className="bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            Gemini: <span className={`font-extrabold ${keyStatus.geminiConfigured ? "text-emerald-600" : "text-red-500"}`}>{keyStatus.geminiConfigured ? "● Active" : "○ Not set"}</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            Groq: <span className={`font-extrabold ${keyStatus.groqConfigured ? "text-emerald-600" : "text-neutral-400"}`}>{keyStatus.groqConfigured ? "● Active" : "○ Not set"}</span>
          </div>
          <button onClick={() => { setIsRefreshing(true); setTimeout(() => { setIsRefreshing(false); refreshKeyStatus(); addLog("State sync completed."); }, 600); }}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all">
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} /> Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 flex flex-col gap-2">
          {TAB_BTN("PLAYGROUND", "🤖 LLM Playground", `${availableModels.filter(m => m.available).length} Live`)}
          {TAB_BTN("PROVIDERS", "🔌 Provider Dials", `${providers.length}`)}
          {TAB_BTN("SCRAPERS", "📜 Crawl Logs")}
          {TAB_BTN("ALERTS", "🚨 Alert Dispatches", `${alerts.length}`)}
          {TAB_BTN("PRODUCTS", "📦 Catalog", `${productsList.length}`)}
          {TAB_BTN("SECRETS", "🔒 API Keys")}
        </div>

        <div className="md:col-span-9 bg-neutral-50/40 rounded-3xl border border-neutral-200 p-6 min-h-[420px]">

          {/* LLM PLAYGROUND */}
          {activeTab === "PLAYGROUND" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1"><Cpu className="w-4 h-4 text-emerald-600" /> Multi-Model LLM Playground</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Run prompts across configured AI models. Compare responses, latency, and cost side-by-side.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableModels.map(model => {
                  const isSelected = selectedModels.includes(model.id);
                  return (
                    <label key={model.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all select-none ${isSelected ? "bg-emerald-50 border-emerald-300" : "bg-white border-neutral-200 hover:border-neutral-300"} ${!model.available ? "opacity-50" : ""}`}>
                      <input type="checkbox" checked={isSelected} className="rounded border-neutral-300 text-emerald-600"
                        onChange={() => setSelectedModels(prev => isSelected ? prev.filter(m => m !== model.id) : [...prev, model.id])} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-neutral-900 font-mono truncate">{model.name}</p>
                        <p className="text-[9px] text-neutral-400 font-mono">
                          {model.available ? <span className="text-emerald-600 font-bold">● Live</span> : <span className="text-neutral-400">○ Not configured</span>}
                          {" · "}${model.costPMInput}/1M in
                        </p>
                      </div>
                    </label>
                  );
                })}
                {availableModels.length === 0 && <div className="col-span-3 text-[10px] font-mono text-neutral-400 py-4 text-center">Loading models...</div>}
              </div>
              <div className="relative">
                <textarea
                  className="w-full bg-white border border-neutral-200 p-4 text-[11px] font-mono text-neutral-800 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 resize-none"
                  value={playgroundPrompt}
                  onChange={e => setPlaygroundPrompt(e.target.value)}
                  placeholder="Enter your prompt..."
                />
                <button onClick={executePlayground} disabled={isRunningPlayground || selectedModels.length === 0}
                  className="absolute right-3 bottom-3 bg-neutral-900 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase font-mono px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50">
                  {isRunningPlayground ? <><Loader2 className="w-3 h-3 animate-spin" /> Running</> : <><Play className="w-3 h-3" /> Evaluate</>}
                </button>
              </div>
              {isRunningPlayground && (
                <div className="space-y-2">
                  {selectedModels.map(m => (
                    <div key={m} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 animate-pulse">
                      <div className="text-[9px] font-mono font-black text-purple-600 uppercase mb-2">{m}</div>
                      <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              )}
              {!isRunningPlayground && playgroundResults.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {playgroundResults.map(res => (
                    <div key={res.modelId} className={`bg-white border rounded-xl p-4 font-mono text-[10px] ${res.ok ? "border-neutral-200" : "border-amber-200 bg-amber-50/30"}`}>
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-2">
                        <span className="font-extrabold text-purple-700 uppercase text-[9px]">{res.modelId}</span>
                        <div className="flex gap-3 text-neutral-400 font-bold text-[9px]">
                          <span>Lat: <strong className="text-neutral-700">{res.latency}ms</strong></span>
                          <span>Tokens: <strong className="text-neutral-700">{res.tokens}</strong></span>
                          <span>Cost: <strong className="text-emerald-600">${res.cost.toFixed(6)}</strong></span>
                        </div>
                      </div>
                      <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{res.response}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROVIDERS */}
          {activeTab === "PROVIDERS" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1"><Layers className="w-4 h-4 text-emerald-600" /> Scraper Connector Routing</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Enable/disable crawler threads targeting provider sites.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {providers.map(p => (
                  <div key={p.id} className={`bg-white border rounded-2xl p-4 flex justify-between items-center transition-all ${p.enabled ? "border-emerald-300 shadow-xs" : "border-neutral-200"}`}>
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-2xl w-10 h-10 flex items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200">{p.logo}</span>
                      <div className="truncate">
                        <h4 className="text-xs font-extrabold text-neutral-900 truncate">{p.name}</h4>
                        <p className="text-[9px] font-mono text-neutral-400 uppercase mt-0.5">{p.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-neutral-400 hidden sm:block"><strong className="text-neutral-700">{p.activeConnectors.toLocaleString()}</strong> SKUs</span>
                      <button onClick={() => toggleProvider(p.id)} className="cursor-pointer transition-all">
                        {p.enabled ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-neutral-300" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCRAPER LOGS */}
          {activeTab === "SCRAPERS" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1"><Monitor className="w-4 h-4 text-emerald-600" /> Crawl Dispatcher Stream</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Live execution traces from crawler nodes.</p>
              </div>
              <div className="flex gap-2.5">
                <input type="text" placeholder="Inject log trace..."
                  className="flex-1 bg-white border border-neutral-200 px-4 py-2.5 text-xs font-mono rounded-xl focus:outline-none text-neutral-900"
                  value={newLogInput} onChange={e => setNewLogInput(e.target.value)} onKeyDown={e => e.key === "Enter" && triggerScrapeTest()} />
                <button onClick={triggerScrapeTest} className="bg-neutral-900 text-white text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-500 font-mono font-bold transition-all cursor-pointer">Inject</button>
              </div>
              <div className="bg-neutral-950 rounded-2xl p-5 font-mono text-[10px] text-emerald-400 border border-neutral-900 min-h-60 max-h-72 overflow-y-auto space-y-2 leading-relaxed shadow-inner">
                {scraperLogs.map((log, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span className={log.includes("error") || log.includes("✗") ? "text-rose-400" : log.includes("✓") || log.includes("completed") ? "text-emerald-300 font-bold" : "text-emerald-400"}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALERTS */}
          {activeTab === "ALERTS" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1"><Monitor className="w-4 h-4 text-emerald-600" /> Active Subscriber Alert Targets</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Price-drop alerts from users. Real alert creation coming in Phase 4.</p>
              </div>
              <div className="text-center py-12 text-neutral-400 font-mono text-xs bg-white rounded-2xl border border-neutral-200">No active alerts. Users will create alerts from the public platform once alert creation is enabled.</div>
            </div>
          )}

          {/* CATALOG */}
          {activeTab === "PRODUCTS" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1"><Database className="w-4 h-4 text-emerald-600" /> Catalog Management</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Manually create canonical product listings.</p>
              </div>
              <form onSubmit={addProduct} className="bg-neutral-100/50 p-5 rounded-2xl border border-neutral-200/50 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider font-mono text-neutral-400 block border-b pb-2">Add New Product SKU</span>
                {prodMsg && <div className={`p-3 rounded-xl text-xs font-mono font-bold border ${prodMsg.includes("added") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>{prodMsg}</div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {([["Product Name *", newProdName, setNewProdName, "e.g. Organic Strawberries"], ["SKU Code *", newProdSku, setNewProdSku, "e.g. STRAW-ORG-01"], ["Brand", newProdBrand, setNewProdBrand, "e.g. Driscoll's"]] as [string, string, (v: string) => void, string][]).map(([label, val, setter, ph]) => (
                    <div key={label} className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">{label}</label>
                      <input type="text" placeholder={ph} className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none text-neutral-900 font-mono" value={val} onChange={e => setter(e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Category</label>
                    <select className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none text-neutral-900" value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)}>
                      {["Electronics", "Grocery", "Fashion", "Household", "Beauty", "Sports"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {([["Amazon ₹", amazonPrice, setAmazonPrice], ["Zepto ₹", zeptoPrice, setZeptoPrice], ["Blinkit ₹", blinkitPrice, setBlinkitPrice]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
                    <div key={label} className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">{label}</label>
                      <input type="number" placeholder="0" className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none text-neutral-900" value={val} onChange={e => setter(e.target.value)} />
                    </div>
                  ))}
                </div>
                <button type="submit" className="w-full py-3 bg-neutral-900 hover:bg-emerald-500 text-white hover:text-neutral-950 font-mono text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add to Catalog
                </button>
              </form>
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider font-mono text-neutral-400 block">Active Catalog ({productsList.length})</span>
                {productsList.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 font-mono text-xs bg-white rounded-2xl border">No products in catalog. Add above or wait for crawler pipeline.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productsList.map(prod => {
                      const prices = Object.values(prod.priceSnapshots).map((s: any) => s.price);
                      return (
                        <div key={prod.id} className="bg-white border rounded-2xl p-4 flex justify-between items-center gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={prod.imageUrl} className="w-10 h-10 object-cover rounded-xl border" alt="" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-neutral-900 truncate">{prod.name}</h4>
                              <div className="flex gap-2 items-center mt-1">
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 uppercase font-black">{prod.sku}</span>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">₹{Math.min(...prices)}–₹{Math.max(...prices)}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => { setProductsList(prev => prev.filter(p => p.id !== prod.id)); addLog(`Catalog: removed "${prod.sku}".`); }}
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 flex items-center justify-center cursor-pointer shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API KEYS */}
          {activeTab === "SECRETS" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1"><Key className="w-4 h-4 text-emerald-600" /> API Key Configuration</h3>
                <p className="text-[11px] text-neutral-500 font-mono">Keys are encrypted with AES-256-GCM and persisted to disk. They survive server restarts.</p>
              </div>
              <form onSubmit={saveSecrets} className="bg-neutral-900 text-white rounded-3xl p-6 border border-neutral-800 space-y-5 shadow-md">
                {secretsMsg && <div className={`px-4 py-3 rounded-xl text-xs font-mono font-bold border ${secretsMsg.ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{secretsMsg.text}</div>}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase font-black">GEMINI_API_KEY</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${keyStatus.geminiConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-700 text-neutral-400"}`}>
                        {keyStatus.geminiConfigured ? "● Active" : "○ Not set"}
                      </span>
                      {keyStatus.geminiConfigured && (
                        <button type="button" onClick={() => revokeKey("gemini")} className="text-[9px] font-mono text-red-400 hover:text-red-300 border border-red-500/20 px-2 py-0.5 rounded cursor-pointer">Revoke</button>
                      )}
                    </div>
                  </div>
                  <input type="password" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                    placeholder="AIzaSy..." value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
                  <p className="text-[9px] text-neutral-500 font-mono">Powers product search, AI recommendations, and cart optimization.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase font-black">GROQ_API_KEY</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${keyStatus.groqConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-700 text-neutral-400"}`}>
                        {keyStatus.groqConfigured ? "● Active" : "○ Not set"}
                      </span>
                      {keyStatus.groqConfigured && (
                        <button type="button" onClick={() => revokeKey("groq")} className="text-[9px] font-mono text-red-400 hover:text-red-300 border border-red-500/20 px-2 py-0.5 rounded cursor-pointer">Revoke</button>
                      )}
                    </div>
                  </div>
                  <input type="password" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                    placeholder="gsk_..." value={groqKey} onChange={e => setGroqKey(e.target.value)} />
                  <p className="text-[9px] text-neutral-500 font-mono">Enables LLaMA 3.1 70B via Groq in the LLM Playground.</p>
                </div>

                <div className="bg-neutral-950/50 rounded-xl p-4 border border-neutral-800 text-[9px] font-mono text-neutral-500 space-y-1">
                  <p className="font-bold text-neutral-400 mb-2">Keys are AES-256-GCM encrypted on disk. For env-based config:</p>
                  <p>GEMINI_API_KEY=your_key · GROQ_API_KEY=your_key · MASTER_SECRET=strong_secret</p>
                </div>

                <button type="submit" disabled={isSavingSecrets}
                  className="w-full py-3 bg-emerald-500 text-neutral-950 font-mono text-[11px] font-black uppercase rounded-xl transition-all hover:bg-emerald-400 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
                  {isSavingSecrets ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save & Encrypt Keys"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
