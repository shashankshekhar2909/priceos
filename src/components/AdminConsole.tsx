import React, { useState } from "react";
import { Layers, ShieldCheck, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Monitor, ToggleLeft, ToggleRight, ListTodo, Send, Mail, Disc, Key, Database, Trash2, Plus } from "lucide-react";
import { Provider, MatchingTask, Alert, CanonicalProduct, PriceSnapshot } from "../types";
import { mockProviders, mockMatchingTasks, mockUserAlerts, mockCanonicalProducts } from "../data/mock-data";

export default function AdminConsole() {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [matchingTasks, setMatchingTasks] = useState<MatchingTask[]>(mockMatchingTasks);
  const [alerts, setAlerts] = useState<Alert[]>(mockUserAlerts);
  const [productsList, setProductsList] = useState<CanonicalProduct[]>(mockCanonicalProducts);
  
  // Secrets state management
  const [geminiKey, setGeminiKey] = useState("AIzaSyCh-Z879Sdfuynw8U_mockKey");
  const [firebaseId, setFirebaseId] = useState("gen-lang-client-0198159235");
  const [defuddleToken, setDefuddleToken] = useState("defuddle_sec_prod_90832");
  const [isSavingSecrets, setIsSavingSecrets] = useState(false);
  const [ secretsSuccessMsg, setSecretsSuccessMsg] = useState("");

  // New product form states
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Electronics");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [amazonPrice, setAmazonPrice] = useState("1490");
  const [zeptoPrice, setZeptoPrice] = useState("1520");
  const [blinkitPrice, setBlinkitPrice] = useState("1510");
  const [prodMsg, setProdMsg] = useState("");
  
  // Real scraper log simulator state
  const [scraperLogs, setScraperLogs] = useState<string[]>([
    "[04:00:10] CRON dispatched: crawl-dispatch-queue triggered.",
    "[04:00:12] Blinkit Connector: Scraping Category 'Electronics'. Mapped 45 listings.",
    "[04:00:15] Amazon Crawler: Executed Playwright Headless Worker. Proxy rotated (IP: 142.250.190.46).",
    "[04:00:19] Similarity Matcher: Ingested 112 raw snapshots. Enqueued to catalog-matching-queue.",
    "[04:00:22] LLM Verifier: Invoked Gemini 3.5-flash agent on candidate AirPods Pro. Verification completed.",
    "[04:00:25] Alert Engine: Price threshold matched subscriber_id_941038 on AirPods Pro 2. Dispatching telegram notify..."
  ]);
  const [newLogInput, setNewLogInput] = useState("");

  // System stats state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"PROVIDERS" | "MATCHER" | "SCRAPERS" | "ALERTS" | "SECRETS" | "PRODUCTS">("MATCHER");

  // Toggle Provider Enabled State
  const toggleProvider = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    setScraperLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Provider settings updated: ${id} toggled.`,
      ...prev
    ]);
  };

  // Approve Matching Link
  const approveMatch = (taskId: string) => {
    setMatchingTasks(matchingTasks.map(t => t.id === taskId ? { ...t, status: "APPROVED" } : t));
    const approvedTask = matchingTasks.find(t => t.id === taskId);
    if (approvedTask) {
      setScraperLogs(prev => [
        `[${new Date().toLocaleTimeString()}] MATCH APPROVED: Merged "${approvedTask.sourceProduct.name}" and "${approvedTask.candidateProduct.name}" into canonical SKU structure. DB synced.`,
        ...prev
      ]);
    }
  };

  // Reject Matching Link
  const rejectMatch = (taskId: string) => {
    setMatchingTasks(matchingTasks.filter(t => t.id !== taskId));
    const rejectedTask = matchingTasks.find(t => t.id === taskId);
    if (rejectedTask) {
      setScraperLogs(prev => [
        `[${new Date().toLocaleTimeString()}] MATCH DECLINED: Cancelled equivalence link between ${rejectedTask.sourceProduct.provider} and ${rejectedTask.candidateProduct.provider}.`,
        ...prev
      ]);
    }
  };

  // Add customized scraper test trigger
  const triggerScrapeTest = () => {
    if (!newLogInput.trim()) return;
    setScraperLogs(prev => [
      `[${new Date().toLocaleTimeString()}] TEST TRIGGER: ${newLogInput}`,
      ...prev
    ]);
    setNewLogInput("");
  };

  return (
    <div className="bg-white bento-card rounded-3xl border border-neutral-200/50 p-6 md:p-8" id="admin-management-container">
      {/* Header telemetry metrics banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-6 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-555" /> Core Ops Infrastructure Console
          </span>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight font-display mt-0.5">PriceOS Backend Systems</h1>
        </div>
        
        {/* Dynamic Microservice Health Telemetry Bar */}
        <div className="flex gap-3 font-mono text-[10px] text-neutral-450 uppercase flex-wrap" id="telemetry-bar">
          <div className="bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl">
            Status: <span className="font-extrabold text-emerald-600">● Live Operations</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 px-3.5 py-2 rounded-xl">
            Pipelines: <span className="font-extrabold text-neutral-800">14 Active</span>
          </div>
          <button
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => {
                setIsRefreshing(false);
                setScraperLogs(prev => [`[${new Date().toLocaleTimeString()}] Sync completed. Telemetry check healthy.`, ...prev]);
              }, 600);
            }}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-150 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} /> Sync State
          </button>
        </div>
      </div>

      {/* Admin Tabbed Workspace layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="admin-tabs-workspace">
        {/* Left hand sub navigation Menu */}
        <div className="md:col-span-3 flex flex-col gap-2" id="admin-left-navbar">
          <button
            onClick={() => setActiveTab("MATCHER")}
            className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${
              activeTab === "MATCHER"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>💍 Matcher Pipeline</span>
            <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black">
              {matchingTasks.filter(t => t.status === "PENDING").length} Review
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PROVIDERS")}
            className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${
              activeTab === "PROVIDERS"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>🔌 Provider Dials</span>
            <span className="text-[9px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
              {providers.length} Managed
            </span>
          </button>

          <button
            onClick={() => setActiveTab("SCRAPERS")}
            className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${
              activeTab === "SCRAPERS"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>📜 Crawl Stream Logs</span>
            <span className="text-[9px] font-bold text-neutral-400">Live</span>
          </button>

          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${
              activeTab === "ALERTS"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>🚨 Alert Dispatches</span>
            <span className="text-[9px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
              {alerts.length} Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PRODUCTS")}
            className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${
              activeTab === "PRODUCTS"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>📦 Catalog Products</span>
            <span className="text-[9px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
              {productsList.length} Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab("SECRETS")}
            className={`p-3.5 rounded-2xl text-[11px] font-extrabold font-mono uppercase tracking-wider text-left flex items-center justify-between transition-all cursor-pointer border ${
              activeTab === "SECRETS"
                ? "bg-neutral-900 border-neutral-900 text-white shadow-xs"
                : "bg-neutral-50/80 border-neutral-150 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>🔒 Configure Secrets</span>
            <span className="text-[9px] font-bold text-emerald-600 font-mono">Secure</span>
          </button>
        </div>

        {/* Right hand dynamic Console pane content */}
        <div className="md:col-span-9 bg-neutral-50/40 rounded-3xl border border-neutral-200 p-6 min-h-[420px]" id="admin-main-pane">
          
          {/* TAB 1: Product Matcher Pipeline Review */}
          {activeTab === "MATCHER" && (
            <div className="space-y-4" id="matcher-pipeline-console">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 font-display mb-1">
                  <Monitor className="w-4 h-4 text-emerald-600" /> Canonical Product Matching Engine (PME)
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono">
                  Review equivalent product items indexed from different vendors. Verify similarity merges beneath canonical SKU structures.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {matchingTasks.map(task => {
                  const isApproved = task.status === "APPROVED";
                  return (
                    <div
                      key={task.id}
                      id={`matching-task-row-${task.id}`}
                      className={`border rounded-2xl p-4 md:p-5 bg-white transition-all shadow-xs ${
                        isApproved ? "border-emerald-300 bg-emerald-50/15" : "border-neutral-200"
                      }`}
                    >
                      {/* Left and Right mapping comparison layout */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-4">
                        <div className="md:col-span-4 flex items-center gap-3">
                          <img src={task.sourceProduct.imageUrl} alt="" className="w-11 h-11 object-cover rounded-xl border" />
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-wider py-0.5 px-2 bg-amber-100 text-amber-850 rounded-full font-mono">
                              {task.sourceProduct.provider}
                            </span>
                            <h4 className="text-11px font-bold text-neutral-900 truncate max-w-[140px] mt-1">{task.sourceProduct.name}</h4>
                            <span className="text-[10px] text-neutral-500 font-mono font-bold">₹{task.sourceProduct.price.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Central Match Score Gauge */}
                        <div className="md:col-span-4 text-center border-y md:border-y-0 md:border-x border-neutral-150 py-2 md:py-0">
                          <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full ${
                            task.similarityScore >= 0.9 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            Similarity: {(task.similarityScore * 100).toFixed(0)}% Match
                          </span>
                          <span className="text-[8px] text-neutral-400 block mt-2 uppercase font-mono font-bold">LLM Verified Matrix</span>
                        </div>

                        <div className="md:col-span-4 flex items-center gap-3">
                          <img src={task.candidateProduct.imageUrl} alt="" className="w-11 h-11 object-cover rounded-xl border" />
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-wider py-0.5 px-2 bg-blue-105 text-blue-800 rounded-full font-mono">
                              {task.candidateProduct.provider}
                            </span>
                            <h4 className="text-11px font-bold text-neutral-900 truncate max-w-[140px] mt-1">{task.candidateProduct.name}</h4>
                            <span className="text-[10px] text-neutral-500 font-mono font-bold">₹{task.candidateProduct.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Matching pipeline Logs details */}
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/50 text-[10px] font-mono text-neutral-500 space-y-1.5">
                        {task.normalizationLogs.map((log, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <span className="text-emerald-500 font-black">✓</span> {log}
                          </div>
                        ))}
                      </div>

                      {/* Approval Controls */}
                      <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-neutral-100">
                        {isApproved ? (
                          <div className="text-emerald-700 font-mono text-xs font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-fade-in">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> Linked to Canonical Cluster successfully
                          </div>
                        ) : (
                          <>
                            <button
                              id={`reject-match-btn-${task.id}`}
                              onClick={() => rejectMatch(task.id)}
                              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-mono text-xs font-bold rounded-xl cursor-pointer transition-all border border-transparent"
                            >
                              Deny Mapping
                            </button>
                            <button
                              id={`approve-match-btn-${task.id}`}
                              onClick={() => approveMatch(task.id)}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-mono text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 border border-transparent tracking-wide"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve Canonical Link
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {matchingTasks.length === 0 && (
                  <div className="text-center py-10 text-neutral-400 text-xs font-mono">No matching reviews pending on PME router index gates.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Managed Provider Dials */}
          {activeTab === "PROVIDERS" && (
            <div className="space-y-4" id="provider-dials-console">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 font-display mb-1">
                  <Layers className="w-4 h-4 text-emerald-600" /> Scraper Connectors Routing
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono">
                  Dynamically enable/disable crawler threads targeting external provider sites. Change crawler dial variables smoothly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {providers.map(p => (
                  <div
                    key={p.id}
                    id={`prov-dial-card-${p.id}`}
                    className={`bg-white border rounded-2xl p-4 flex justify-between items-center transition-all ${
                      p.enabled ? "border-emerald-300 shadow-xs" : "border-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-2xl font-bold font-mono text-neutral-700 w-10 h-10 flex items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200">
                        {p.logo}
                      </span>
                      <div className="truncate">
                        <h4 className="text-xs font-extrabold text-neutral-900 truncate">{p.name}</h4>
                        <p className="text-[9px] font-mono text-neutral-400 truncate uppercase mt-0.5">
                          {p.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3.5">
                      <div className="text-[9px] font-mono text-neutral-450 hidden sm:block">
                        <span className="font-extrabold text-neutral-700">{p.activeConnectors.toLocaleString()}</span> SKU items
                      </div>
                      <button
                        id={`toggle-provider-btn-${p.id}`}
                        onClick={() => toggleProvider(p.id)}
                        className="p-1 text-neutral-400 hover:text-emerald-500 cursor-pointer transition-all"
                      >
                        {p.enabled ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-neutral-300" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Scrapers Log Stream */}
          {activeTab === "SCRAPERS" && (
            <div className="space-y-4" id="scrapers-stream-console">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 font-display mb-1">
                  <Monitor className="w-4 h-4 text-emerald-600" /> Distributed Crawl Dispatcher Stream (Kafka/Redis)
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono">
                  Live streaming execution traces from node-agents performing background headless selectors validations.
                </p>
              </div>

              {/* Scraper action test trigger */}
              <div className="flex gap-2.5">
                <input
                  id="scraper-test-input"
                  type="text"
                  placeholder="Inject critical system trace (e.g., 'Flipkart price drops matched')..."
                  className="flex-1 bg-white border border-neutral-200 px-4 py-2.5 text-xs font-mono rounded-xl focus:outline-hidden text-neutral-900 focus:ring-2 focus:ring-emerald-500/20"
                  value={newLogInput}
                  onChange={(e) => setNewLogInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && triggerScrapeTest()}
                />
                <button
                  id="scraper-test-inject-btn"
                  onClick={triggerScrapeTest}
                  className="bg-neutral-900 text-white text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-500 font-mono font-bold tracking-wide transition-all cursor-pointer"
                >
                  Inject Log
                </button>
              </div>

              {/* Ingest terminal */}
              <div className="bg-neutral-950 rounded-2xl p-5 font-mono text-[10px] text-emerald-400 border border-neutral-900 min-h-60 max-h-72 overflow-y-auto space-y-2.5 leading-relaxed shadow-inner">
                {scraperLogs.map((log, index) => (
                  <div key={index} className="flex gap-2.5 items-start">
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span className={log.includes("APPROVED") ? "text-emerald-305 font-black uppercase text-xs" : log.includes("failed") || log.includes("Error") ? "text-rose-455 font-bold" : "text-emerald-400"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: User alert notifications */}
          {activeTab === "ALERTS" && (
            <div className="space-y-4" id="alerts-matrix-console">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 font-display mb-1">
                  <Monitor className="w-4 h-4 text-emerald-600" /> Active Subscriber Alert Targets
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono">
                  Monitor drop thresholds registered by active users. Notifications trigger automatically when crawl snapshots breach targets.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {alerts.map(al => (
                  <div key={al.id} className="bg-white border border-neutral-200/60 rounded-2xl p-4 flex justify-between items-center gap-4 hover:border-neutral-305 transition-all shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={al.imageUrl} alt="" className="w-10 h-10 object-cover rounded-xl border border-neutral-200" />
                      <div>
                        <h4 className="text-xs font-extrabold text-neutral-900 truncate max-w-[150px]">{al.productName}</h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 uppercase font-bold">
                            {al.channel}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-450 truncate max-w-[155px] font-semibold">{al.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-black block text-emerald-700 uppercase bg-emerald-50 border border-emerald-100/45 rounded-lg px-2.5 py-1">
                        Drop Below ₹{al.targetPrice.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setScraperLogs(prev => [
                            `[${new Date().toLocaleTimeString()}] TEST TRIGGER: Forcing mock signal alert ${al.id} matched. Dispatched notification to ${al.destination} successfully.`,
                            ...prev
                          ]);
                        }}
                        className="text-[9px] font-extrabold font-mono uppercase mt-2 bg-neutral-900 text-white rounded-lg px-2.5 py-1 hover:bg-emerald-500 transition-all cursor-pointer select-none inline-block text-center tracking-wider"
                      >
                        Fire Signal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MANAGED CATALOG PRODUCTS */}
          {activeTab === "PRODUCTS" && (
            <div className="space-y-6" id="products-catalog-console">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 font-display mb-1">
                  <Database className="w-4 h-4 text-emerald-600" /> Firebase Catalog Management (Products)
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono">
                  Create, configure, and synchronize canonical listings mapped to modern Firebase Firestore models.
                </p>
              </div>

              {/* Add product form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newProdName.trim() || !newProdSku.trim()) {
                  setProdMsg("Please fill name and SKU fields.");
                  return;
                }
                const amazonP = parseFloat(amazonPrice) || 0;
                const zeptoP = parseFloat(zeptoPrice) || 0;
                const blinkitP = parseFloat(blinkitPrice) || 0;
                
                const newProduct: CanonicalProduct = {
                  id: newProdSku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                  sku: newProdSku.toUpperCase(),
                  name: newProdName,
                  brand: newProdBrand || "Generic",
                  category: newProdCategory,
                  description: newProdDesc || `${newProdName} canonical catalog entry`,
                  imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=80",
                  basePriceRange: {
                    min: Math.min(amazonP, zeptoP, blinkitP) || amazonP,
                    max: Math.max(amazonP, zeptoP, blinkitP) || amazonP
                  },
                  mappings: [
                    { productId: `${newProdSku}-amazon`, providerId: "amazon" },
                    { productId: `${newProdSku}-blinkit`, providerId: "blinkit" },
                    { productId: `${newProdSku}-zepto`, providerId: "zepto" }
                  ],
                  priceSnapshots: {
                    amazon: { price: amazonP, discountPercent: 0, timestamp: new Date().toISOString(), inStock: true, deliveryEta: "Next Day" },
                    blinkit: { price: blinkitP, discountPercent: 0, timestamp: new Date().toISOString(), inStock: true, deliveryEta: "12 mins" },
                    zepto: { price: zeptoP, discountPercent: 0, timestamp: new Date().toISOString(), inStock: true, deliveryEta: "9 mins" }
                  },
                  priceHistory: [
                    {
                      timestamp: new Date().toISOString(),
                      prices: {
                        amazon: amazonP,
                        blinkit: blinkitP,
                        zepto: zeptoP
                      }
                    }
                  ],
                  specs: { "Origin": "Domestic Source", "Quality Rating": "Premium Mapped" }
                };

                mockCanonicalProducts.push(newProduct);
                setProductsList([...mockCanonicalProducts]);
                setScraperLogs(prev => [
                  `[${new Date().toLocaleTimeString()}] FIRESTORE SYNC: Successfully stored canonical product "${newProdName}" (SKU: ${newProdSku}) & synchronized live multi-provider snapshots to Firebase Firestore.`,
                  ...prev
                ]);
                
                setNewProdName("");
                setNewProdSku("");
                setNewProdBrand("");
                setNewProdDesc("");
                setProdMsg("Product catalog item successfully published to live sandbox!");
                setTimeout(() => setProdMsg(""), 4000);
              }} className="bg-neutral-100/50 p-5 rounded-2xl border border-neutral-200/50 space-y-4" id="add-product-admin-form">
                <span className="text-[9px] font-black uppercase tracking-wider font-mono text-neutral-400 block border-b pb-2">Add New Product SKU Profile</span>
                
                {prodMsg && (
                  <div className={`p-3 rounded-xl text-xs font-mono font-bold ${prodMsg.includes("success") ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
                    {prodMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Strawberries"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden text-neutral-900"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">SKU Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. STRAW-ORG-01"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden text-neutral-900"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Driscoll's"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden text-neutral-900"
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Category</label>
                    <select
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-hidden text-neutral-900"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Grocery">Grocery</option>
                      <option value="Household">Household</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Amazon Price (₹)</label>
                    <input
                      type="number"
                      placeholder="180"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden text-neutral-900"
                      value={amazonPrice}
                      onChange={(e) => setAmazonPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Zepto Price (₹)</label>
                    <input
                      type="number"
                      placeholder="195"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden text-neutral-900"
                      value={zeptoPrice}
                      onChange={(e) => setZeptoPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Blinkit Price (₹)</label>
                    <input
                      type="number"
                      placeholder="190"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden text-neutral-900"
                      value={blinkitPrice}
                      onChange={(e) => setBlinkitPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase block">Description / Specs summary</label>
                  <input
                    type="text"
                    placeholder="Brief overview of features, weight, packaging units..."
                    className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-hidden text-neutral-900"
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-900 hover:bg-emerald-500 text-white hover:text-neutral-950 font-mono text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Publish SKU to Mock Firebase DB
                </button>
              </form>

              {/* Products list detail */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider font-mono text-neutral-400 block">Active Live Products Directory ({productsList.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productsList.map(prod => {
                    const prices = Object.values(prod.priceSnapshots).map((s: any) => s.price);
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);
                    return (
                      <div key={prod.id} className="bg-white border rounded-2xl p-4 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={prod.imageUrl} className="w-10 h-10 object-cover rounded-xl border border-neutral-200 flex-shrink-0" alt="" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-neutral-900 truncate">{prod.name}</h4>
                            <div className="flex gap-2.5 items-center mt-1">
                              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 uppercase font-black">{prod.sku}</span>
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">₹{minP}-₹{maxP}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const idx = mockCanonicalProducts.findIndex(p => p.id === prod.id);
                            if (idx !== -1) {
                              const removed = mockCanonicalProducts[idx];
                              mockCanonicalProducts.splice(idx, 1);
                              setProductsList([...mockCanonicalProducts]);
                              setScraperLogs(prev => [
                                `[${new Date().toLocaleTimeString()}] CATALOG UPDATE: Pruned canonical SKU ID "${removed.sku}" from Firebase Firestore tables.`,
                                ...prev
                              ]);
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 flex items-center justify-center cursor-pointer transition-all shrink-0"
                          title="Delete Listing From DB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONFIGURE SECRETS (LOCK AND KEY) */}
          {activeTab === "SECRETS" && (
            <div className="space-y-6" id="sys-secrets-console">
              <div>
                <h3 className="text-xs font-black text-neutral-950 uppercase font-mono tracking-wider flex items-center gap-1.5 font-display mb-1">
                  <Key className="w-4 h-4 text-emerald-600" /> Administrative Cryptographic Secrets Drawer
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono">
                  Modify secure keys, rotating crawlers, proxy lists, and external tokens securely. These values never leak to public view containers.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setIsSavingSecrets(true);
                setSecretsSuccessMsg("");
                setTimeout(() => {
                  setIsSavingSecrets(false);
                  setSecretsSuccessMsg("All credentials stored inside administrative Secrets env bucket!");
                  setScraperLogs(prev => [
                    `[${new Date().toLocaleTimeString()}] CREDENTIAL CORRELATION: Reloaded TLS workspace config. Loaded GEMINI_API_KEY from secure compartment.`,
                    ...prev
                  ]);
                  setTimeout(() => setSecretsSuccessMsg(""), 5000);
                }, 800);
              }} className="bg-neutral-900 text-white rounded-3xl p-6 border border-neutral-800 space-y-4 shadow-md" id="admin-secrets-form">
                
                {secretsSuccessMsg && (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-555/20 px-4 py-3 rounded-xl text-xs font-mono font-bold animate-pulse">
                    🔓 {secretsSuccessMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-450 uppercase block font-black">GEMINI_API_KEY (Server Side Secret)</label>
                  <input
                    type="password"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-[#10b981] focus:outline-hidden focus:border-emerald-500"
                    placeholder="Enter Google GenAI Access Secret..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <p className="text-[9px] text-neutral-500 font-mono">Used to authorize LLM validation models and trigger AI shopping insights.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-450 uppercase block font-black">FIREBASE_PROJECT_ID (Active Product Connection)</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-[#10b981] focus:outline-hidden focus:border-emerald-500"
                    placeholder="gen-lang-client-..."
                    value={firebaseId}
                    onChange={(e) => setFirebaseId(e.target.value)}
                  />
                  <p className="text-[9px] text-neutral-500 font-mono">Correlated Firestore project ID. Provisioned as gen-lang-client-0198159235.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-450 uppercase block font-black">DEFUDDLE_SCRAPER_TOKEN (Integrations Key)</label>
                  <input
                    type="password"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-[#10b981] focus:outline-hidden focus:border-emerald-500"
                    placeholder="Enter integrated scraper credentials..."
                    value={defuddleToken}
                    onChange={(e) => setDefuddleToken(e.target.value)}
                  />
                  <p className="text-[9px] text-neutral-500 font-mono">Authorized token for Defuddle proxy scraping services.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSecrets}
                  className="w-full py-3 bg-emerald-500 text-neutral-950 font-mono text-[11px] font-black uppercase rounded-xl transition-all hover:bg-emerald-400 cursor-pointer flex items-center justify-center gap-1"
                >
                  {isSavingSecrets ? "Writing securely..." : "Save Cryptographic Secrets Overrides"}
                </button>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
