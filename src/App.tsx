import React, { useState } from "react";
import { Sparkles, LayoutDashboard, Settings, Cpu, Network, Info, ArrowUpRight, Github, ExternalLink, HelpCircle, X } from "lucide-react";
import PublicSandbox from "./components/PublicSandbox";
import AdminConsole from "./components/AdminConsole";

export default function App() {
  const [activeTab, setActiveTab] = useState<"PUBLIC" | "ADMIN">("PUBLIC");
  const [showConfigAlert, setShowConfigAlert] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123" || passcode === "1234") {
      setIsAdminUnlocked(true);
      setShowUnlockModal(false);
      setPasscode("");
      setPasscodeError("");
      setActiveTab("ADMIN");
    } else {
      setPasscodeError("Invalid cryptographic passcode. Try 'admin123' or '1234'.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col font-sans antialiased text-gray-800" id="priceos-app-root">
      
      {/* GLOBAL HEADER BAR */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-50 shadow-xs" id="global-header-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Identity Branding logo */}
          <div className="flex items-center gap-3 select-none">
            <span className="w-10 h-10 rounded-2xl bg-emerald-555 flex items-center justify-center font-black text-white text-lg font-mono tracking-tighter shadow-md">
              P_
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white font-display uppercase">PriceOS</h1>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                  v1.2.0-beta
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Enterprise Price Intelligence & Comparison Hub</p>
            </div>
          </div>

          {/* Tri-Pillar Main Core Navigation Buttons - Styled in a sleek bento tab capsule */}
          <div className="flex flex-wrap items-center bg-neutral-950 p-1 rounded-2xl border border-neutral-800 gap-1.5" id="nav-tabs-controls">
            <button
              id="switch-public-tab-btn"
              onClick={() => setActiveTab("PUBLIC")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "PUBLIC"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Public Platform
            </button>
            
            {isAdminUnlocked && (
              <button
                id="switch-admin-tab-btn"
                onClick={() => setActiveTab("ADMIN")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 animate-fade-in ${
                  activeTab === "ADMIN"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Admin Control
              </button>
            )}

            {/* Subtle administrative security latch */}
            <div className="pl-2 border-l border-neutral-800 flex items-center">
              {isAdminUnlocked ? (
                <button
                  id="lock-admin-console-btn"
                  onClick={() => {
                    setIsAdminUnlocked(false);
                    setActiveTab("PUBLIC");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase text-red-400 hover:bg-neutral-900 border border-red-500/10 flex items-center gap-1 cursor-pointer transition-all"
                  title="Lock Admin Workspace"
                >
                  Lock Session 🔒
                </button>
              ) : (
                <button
                  id="trigger-unlock-modal-btn"
                  onClick={() => {
                    setPasscode("");
                    setPasscodeError("");
                    setShowUnlockModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase text-neutral-520 hover:text-white hover:bg-neutral-900 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Administrative Portal Authorization"
                >
                  <Settings className="w-3.5 h-3.5" /> Admin Access 🔑
                </button>
              )}
            </div>
          </div>

          {/* Top telemetry states */}
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-neutral-400 font-medium" id="header-telem-indicators">
            <span className="flex items-center gap-1.5 bg-neutral-950/50 px-3 py-1.5 rounded-full border border-neutral-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              CRAWLING ACTIVE
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-950/50 px-3 py-1.5 rounded-full border border-neutral-800">
              TYPESENSE: ACTIVE
            </span>
          </div>

        </div>
      </header>

      {/* ADMIN UNLOCK PASSCODE MODAL DIALOG */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6.5 max-w-sm w-full border border-neutral-200 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowUnlockModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Settings className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-neutral-950 font-mono tracking-wider">Ops Authorization</h3>
                <p className="text-[10px] text-[#059669] font-mono font-bold mt-0.5">PriceOS Authentication Latch</p>
              </div>
            </div>
            
            <p className="text-[11px] text-neutral-450 font-mono mb-4 leading-relaxed">
              To reveal Administrative Controls, prove staff authorization by providing the console password.
            </p>

            <form onSubmit={handleUnlock} className="space-y-3.5">
              <div>
                <label className="text-[9px] font-mono uppercase font-black text-neutral-510 block mb-1">Enter PIN / Passcode</label>
                <input
                  id="admin-passcode-field"
                  type="password"
                  autoFocus
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-center text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:bg-white text-neutral-900"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>

              {passcodeError && (
                <p className="text-[10px] font-mono text-red-550 border border-red-100 bg-red-50/50 px-2.5 py-1.5 rounded-lg">
                  {passcodeError}
                </p>
              )}

              <div className="text-[9px] font-mono text-neutral-400 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/55 flex justify-between">
                <span>Demo Passcode:</span>
                <span className="font-extrabold text-neutral-800 text-[10px] bg-white px-2 py-0.5 rounded border">admin123</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="w-full bg-neutral-50 hover:bg-neutral-105 border border-neutral-200 text-neutral-700 font-mono text-[10px] font-bold py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-emerald-500 text-white font-mono text-[10px] font-black py-2.5 rounded-xl cursor-pointer transition-all tracking-wider uppercase"
                >
                  Authorize Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STATISTICS SUBHEADER BAR - Structured as a beautiful Bento Row */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto" id="quick-indicators-bar">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white bento-card p-5 rounded-2xl border border-neutral-200/50 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">Indexed Providers</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-extrabold text-neutral-900 font-display">11 Channels</span>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono rounded-full font-bold">+1 SaaS</span>
            </div>
          </div>
          <div className="bg-white bento-card p-5 rounded-2xl border border-neutral-200/50 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">Catalog Listings</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-extrabold text-neutral-900 font-display">112.4K SKUs</span>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 font-mono rounded-full font-bold">Auto-Matched</span>
            </div>
          </div>
          <div className="bg-white bento-card p-5 rounded-2xl border border-neutral-200/50 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">Index Latency</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-extrabold text-neutral-900 font-display">0.85 ms</span>
              <span className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 font-mono rounded-full font-bold">Typesense</span>
            </div>
          </div>
          <div className="bg-white bento-card p-5 rounded-2xl border border-neutral-200/50 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">Price Alerts Active</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-extrabold text-neutral-900 font-display">42,410 active</span>
              <span className="text-[9px] text-purple-600 bg-purple-50 px-2 py-0.5 font-mono rounded-full font-bold">Realtime</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL/MODERN NOTIFICATION DIALOG INSTEAD OF PROMPTED WINDOW ALERT */}
      {showConfigAlert && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-neutral-250 shadow-xl relative animate-in fade-in duration-200">
            <button 
              onClick={() => setShowConfigAlert(false)}
              className="absolute top-4 right-4 text-neutral-450 hover:text-neutral-850"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-neutral-900 font-display">Configure Real Credentials</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-mono">
              To configure production API keys or DB parameters in a self-hosted workspace, edit the <code className="bg-neutral-100 text-[#d946ef] rounded px-1">.env</code> configurations and deploy service containers mapped in <code className="bg-neutral-100 text-[#d946ef] rounded px-1">/infrastructure/docker</code> as detailed in the <strong className="text-neutral-905">Architecture Docs</strong> tab.
            </p>
            <button
              onClick={() => setShowConfigAlert(false)}
              className="mt-5 w-full bg-neutral-900 hover:bg-neutral-850 text-white font-mono text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Acknowledge Spec
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER CONTENT VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12" id="priceos-viewport">
        {activeTab === "PUBLIC" && (
          <div id="public-view-wrapper" className="space-y-6">
            {/* Quick Informative Hero banner explaining the Sandbox workspace */}
            <div className="bg-neutral-900 text-white rounded-3xl p-6.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-neutral-800 shadow-sm relative overflow-hidden" id="info-welcome-hero-banner">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="relative z-10 flex-1">
                <span className="text-[9px] font-bold font-mono tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase border border-emerald-505/20">
                  Live Interactive Demo Workspace
                </span>
                <h2 className="text-xl font-black mt-3 text-white font-display">Welcome to PriceOS Consumer Portal</h2>
                <p className="text-xs text-neutral-400 mt-2 max-w-3xl leading-relaxed">
                  Search across multi-provider categories including E-Commerce (Amazon) and Quick-Commerce (Blinkit/Zepto). 
                  Track daily metrics, compare models structure, optimize composite cart baskets, and trigger real-time AI recommendation guides.
                </p>
              </div>
            </div>
            
            <PublicSandbox />
          </div>
        )}

        {activeTab === "ADMIN" && (
          <div id="admin-view-wrapper">
            <AdminConsole />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-neutral-200/60 py-6 text-center text-[10px] text-neutral-400 font-mono tracking-wider mt-auto" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span>© 2026 PriceOS Workspace Monorepo Platform. All specs configured.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-neutral-400 uppercase font-bold hover:text-neutral-600 transition-colors cursor-pointer">Security Protocol TLS v2.4</span>
            <span className="text-neutral-450 text-[10px] uppercase font-bold hover:text-neutral-600 transition-colors cursor-pointer flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> Workspace Repository
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
