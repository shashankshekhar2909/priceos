"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Settings, X } from "lucide-react";
import PublicSandbox from "./PublicSandbox";
import AdminConsole from "./AdminConsole";

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState<"PUBLIC" | "ADMIN">("PUBLIC");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [stats, setStats] = useState({ providers: 11, geminiConfigured: false, groqConfigured: false });

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123" || passcode === "1234") {
      setIsAdminUnlocked(true);
      setShowUnlockModal(false);
      setPasscode("");
      setPasscodeError("");
      setActiveTab("ADMIN");
    } else {
      setPasscodeError("Wrong passcode.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col font-sans antialiased text-gray-800">

      {/* HEADER */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

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

          <div className="flex flex-wrap items-center bg-neutral-950 p-1 rounded-2xl border border-neutral-800 gap-1.5">
            <button
              onClick={() => setActiveTab("PUBLIC")}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "PUBLIC" ? "bg-emerald-500 text-white shadow-xs" : "text-neutral-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Public Platform
            </button>

            {isAdminUnlocked && (
              <button
                onClick={() => setActiveTab("ADMIN")}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === "ADMIN" ? "bg-emerald-500 text-white shadow-xs" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Admin Control
              </button>
            )}

            <div className="pl-2 border-l border-neutral-800 flex items-center">
              {isAdminUnlocked ? (
                <button
                  onClick={() => { setIsAdminUnlocked(false); setActiveTab("PUBLIC"); }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase text-red-400 hover:bg-neutral-900 border border-red-500/10 flex items-center gap-1 cursor-pointer transition-all"
                >
                  Lock Session 🔒
                </button>
              ) : (
                <button
                  onClick={() => { setPasscode(""); setPasscodeError(""); setShowUnlockModal(true); }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Settings className="w-3.5 h-3.5" /> Admin Access 🔑
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-neutral-400 font-medium">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${stats.geminiConfigured ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-neutral-950/50 border-neutral-800"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats.geminiConfigured ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`}></span>
              GEMINI {stats.geminiConfigured ? "LIVE" : "NOT SET"}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${stats.groqConfigured ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-neutral-950/50 border-neutral-800"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats.groqConfigured ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`}></span>
              GROQ {stats.groqConfigured ? "LIVE" : "NOT SET"}
            </span>
          </div>
        </div>
      </header>

      {/* UNLOCK MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200 shadow-2xl relative">
            <button onClick={() => setShowUnlockModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-neutral-950 font-mono tracking-wider">Admin Authorization</h3>
                <p className="text-[10px] text-emerald-600 font-mono font-bold mt-0.5">PriceOS Authentication Latch</p>
              </div>
            </div>
            <form onSubmit={handleUnlock} className="space-y-3.5">
              <div>
                <label className="text-[9px] font-mono uppercase font-black text-neutral-500 block mb-1">Passcode</label>
                <input
                  type="password"
                  autoFocus
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white text-neutral-900"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                />
              </div>
              {passcodeError && (
                <p className="text-[10px] font-mono text-red-600 border border-red-100 bg-red-50 px-2.5 py-1.5 rounded-lg">{passcodeError}</p>
              )}
              <div className="text-[9px] font-mono text-neutral-400 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 flex justify-between">
                <span>Demo Passcode:</span>
                <span className="font-extrabold text-neutral-800 text-[10px] bg-white px-2 py-0.5 rounded border">admin123</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button type="button" onClick={() => setShowUnlockModal(false)}
                  className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono text-[10px] font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="w-full bg-neutral-900 hover:bg-emerald-500 text-white font-mono text-[10px] font-black py-2.5 rounded-xl cursor-pointer transition-all tracking-wider uppercase">
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVIDER CHANNEL BAR */}
      <section className="py-5 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "⚡ Blinkit",          url: "https://blinkit.com",         type: "Quick Commerce", cls: "border-amber-200   bg-amber-50   text-amber-800"   },
            { label: "🍇 Zepto",             url: "https://zepto.com",           type: "Quick Commerce", cls: "border-purple-200  bg-purple-50  text-purple-800"  },
            { label: "📦 Amazon India",      url: "https://amazon.in",           type: "E-Commerce",     cls: "border-blue-200   bg-blue-50   text-blue-800"     },
            { label: "🛒 Flipkart",          url: "https://flipkart.com",        type: "E-Commerce",     cls: "border-sky-200    bg-sky-50    text-sky-800"      },
            { label: "👗 Myntra",            url: "https://myntra.com",          type: "Fashion",        cls: "border-pink-200   bg-pink-50   text-pink-800"     },
            { label: "🔌 Croma",             url: "https://croma.com",           type: "Retail",         cls: "border-teal-200   bg-teal-50   text-teal-800"     },
            { label: "🔴 Reliance Digital",  url: "https://reliancedigital.in",  type: "Retail",         cls: "border-rose-200   bg-rose-50   text-rose-800"     },
          ].map(({ label, url, type, cls }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className={`bento-card flex flex-col gap-1 p-3 rounded-2xl border text-center hover:opacity-90 transition-all group ${cls}`}>
              <span className="text-[11px] font-black font-mono">{label}</span>
              <span className="text-[8px] font-mono uppercase opacity-60">{type}</span>
            </a>
          ))}
        </div>
      </section>

      {/* MAIN */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "PUBLIC" && (
          <div className="space-y-6">
            <div className="bg-neutral-900 text-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-neutral-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="relative z-10 flex-1">
                <span className="text-[9px] font-bold font-mono tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase border border-emerald-500/20">
                  Live Interactive Demo
                </span>
                <h2 className="text-xl font-black mt-3 text-white font-display">PriceOS Consumer Portal</h2>
                <p className="text-xs text-neutral-400 mt-2 max-w-3xl leading-relaxed">
                  Search across Blinkit, Zepto, Amazon, Flipkart, Myntra, Croma & Reliance Digital. AI-powered price comparison, 7-day history, basket split optimizer.
                </p>
              </div>
            </div>
            <PublicSandbox />
          </div>
        )}
        {activeTab === "ADMIN" && <AdminConsole />}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-neutral-200/60 py-6 text-center text-[10px] text-neutral-400 font-mono tracking-wider mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 PriceOS · Price Intelligence Platform</span>
          <span className="text-neutral-400 uppercase font-bold">v1.2.0-beta · Next.js 15 · Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
