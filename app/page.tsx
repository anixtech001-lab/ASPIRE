"use client";

import Link from "next/link";
import {
  Sprout,
  ArrowRight,
  PlayCircle,
  Sparkles,
  Landmark,
  Coins,
  Leaf,
  Bell,
  ClipboardList,
  Database,
  MapPin,
  TrendingUp,
  Languages,
  FileText,
  Shield,
  Gauge,
  Wallet,
  CalendarClock,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#preview" },
  { label: "About", href: "#about" },
];

// Honest, verifiable facts about what we've actually built — NOT fabricated
// usage/traction numbers (we have no live users yet). A landing page for a
// hackathon submission should never claim metrics that aren't true.
const STATS = [
  { icon: Landmark, value: "4", label: "Government Schemes Covered" },
  { icon: Languages, value: "13", label: "Languages Supported" },
  { icon: Gauge, value: "100%", label: "Deterministic Financial Math" },
  { icon: MapPin, value: "₹50L", label: "Max Project Coverage (PMEGP)" },
];

const FEATURES = [
  {
    icon: ClipboardList,
    color: "bg-emerald-50 text-emerald-600",
    title: "Business Feasibility Report",
    desc: "Get hyper-local market analysis, SWOT, threats, competitor mapping and pricing strategy.",
  },
  {
    icon: Database,
    color: "bg-blue-50 text-blue-600",
    title: "Financial Calculator",
    desc: "Calculate project cost, loan amount, EMI and get the right scheme for your business.",
  },
  {
    icon: MapPin,
    color: "bg-amber-50 text-amber-600",
    title: "Scheme Guidance",
    desc: "Discover and apply for government schemes with simple, ranked, step-by-step support.",
  },
  {
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-600",
    title: "Market Insights",
    desc: "Understand demand, competition and pricing for your business and location.",
  },
  {
    icon: FileText,
    color: "bg-sky-50 text-sky-600",
    title: "Reports & History",
    desc: "Save your plans and access them anytime from your dashboard, or export as PDF.",
  },
  {
    icon: Shield,
    color: "bg-violet-50 text-violet-600",
    title: "Multi-Language Support",
    desc: "Get the whole platform in your preferred Indian language, powered by translation.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Sprout className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="font-bold text-lg" translate="no">ASPIRE</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-emerald-600 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full px-3 py-1.5 mb-5">
              🏆 SIH 2026 · PS 26091
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" translate="no">
              ASPIRE
            </h1>
            <p className="text-2xl md:text-3xl font-semibold leading-snug mb-5">
              AI-driven Support for <span className="text-emerald-600">Project Investment</span> and{" "}
              <span className="text-emerald-600">Rural Entrepreneurship</span>
            </p>
            <p className="text-slate-500 mb-8 max-w-lg">
              Get personalized business feasibility reports, financial planning and scheme
              guidance — all in one place. Build a smarter, safer future for your rural business.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/advisor"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-3 rounded-lg transition-colors"
              >
                Start Your Plan <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#preview"
                className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 font-medium px-5 py-3 rounded-lg transition-colors"
              >
                <PlayCircle className="h-4 w-4" /> See How It Works
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" /> AI Powered Insights
              </span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-emerald-500" /> Government Schemes
              </span>
              <span className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-500" /> Financial Planning
              </span>
              <span className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-emerald-500" /> Rural Focused
              </span>
            </div>
          </div>

          {/* Product preview mockup — illustrative UI screenshot, not live data */}
          <div id="preview" className="relative">
            <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white flex scroll-mt-24">
              <div className="w-36 bg-[#0E2A1E] text-white p-3 hidden sm:block">
                <div className="flex items-center gap-1.5 mb-4 px-1">
                  <Sprout className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold" translate="no">ASPIRE</span>
                </div>
                {["Dashboard", "Business Advisor", "Financial Planner", "Schemes & Support", "Market Insights", "My Reports"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`text-[10px] px-2 py-1.5 rounded mb-1 ${i === 0 ? "bg-emerald-600 font-medium" : "text-white/60"}`}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
              <div className="flex-1 p-4">
                <p className="text-xs text-slate-400 mb-3">Good morning, Farmer! Let&apos;s build your next big opportunity.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <MiniPreviewStat icon={Gauge} label="Feasibility" value="78/100" />
                  <MiniPreviewStat icon={Wallet} label="Project Cost" value="₹8,50,000" />
                  <MiniPreviewStat icon={TrendingUp} label="Financing" value="₹6,50,000" />
                  <MiniPreviewStat icon={CalendarClock} label="Quarterly EMI" value="₹18,420" />
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-[10px] font-semibold text-slate-500 mb-1">Top Recommendation</div>
                  <div className="text-xs font-semibold mb-1">Dairy — Recommended</div>
                  <div className="text-[10px] text-slate-400">
                    Strong local demand, good profit margins, government support available.
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block absolute -bottom-6 -right-6 w-48 bg-white rounded-xl border border-slate-200 shadow-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-[10px] font-semibold">Your AI Assistant</span>
              </div>
              <p className="text-[9px] text-slate-400 mb-2">Ask anything about business, finance or schemes.</p>
              <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-[9px]">Best business options for my area?</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar — real, defensible facts about the product */}
      <section className="bg-emerald-50/60 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full px-3 py-1.5 mb-4">
          <Bell className="h-3 w-3" /> Why ASPIRE?
        </div>
        <h2 className="text-3xl font-bold mb-3 max-w-xl">
          Everything You Need to Build and Grow Your Rural Business
        </h2>
        <p className="text-slate-500 max-w-xl mb-8">
          From local market insights to financial structuring, ASPIRE provides end-to-end
          support for informed and confident decisions.
        </p>
        <Link
          href="/advisor"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mb-10"
        >
          Explore All Features <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:-translate-y-0.5 transition-all">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Footer */}
      <section id="about" className="bg-[#0E2A1E] text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to plan your business the smart way?</h2>
          <p className="text-white/60 max-w-lg mx-auto mb-6">
            Built for SIH 2026, Problem Statement 26091 — Ministry of Social Justice and
            Empowerment. No login required to get started.
          </p>
          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Start Your Plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
          ASPIRE — AI-driven Support for Project Investment and Rural Entrepreneurship
        </div>
      </section>
    </div>
  );
}

function MiniPreviewStat({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <Icon className="h-3 w-3 text-emerald-600 mb-1" />
      <div className="text-[9px] text-slate-400">{label}</div>
      <div className="text-[10px] font-semibold">{value}</div>
    </div>
  );
}
