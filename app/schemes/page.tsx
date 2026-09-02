const SCHEMES = [
  {
    name: "PMEGP Scheme",
    desc: "Credit-linked subsidy for setting up new micro-enterprises. Implemented by KVIC, Ministry of MSME.",
    rows: [
      { label: "Subsidy", value: "15% – 35% of project cost" },
      { label: "Max Project Cost", value: "₹50L (Mfg) / ₹20L (Service)" },
    ],
    note: "General category: 15% urban / 25% rural. SC/ST/Women/NE/special category: 25% urban / 35% rural.",
    applyUrl: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
  },
  {
    name: "Mudra Loan (PMMY)",
    desc: "Collateral-free loans for non-farm micro/small enterprises, in four tiers by business stage.",
    rows: [
      { label: "Loan Tiers", value: "Shishu ≤₹50K · Kishor ≤₹5L" },
      { label: "", value: "Tarun ≤₹10L · Tarun Plus ≤₹20L" },
    ],
    note: "Tarun Plus (₹10L–₹20L) requires a clean repayment record on a prior Tarun loan.",
    applyUrl: "https://www.udyamimitra.in/",
  },
  {
    name: "Stand-Up India Scheme",
    desc: "Bank loans for SC/ST and women entrepreneurs starting a new (greenfield) enterprise.",
    rows: [
      { label: "Loan Amount", value: "₹10L – ₹1 Crore" },
      { label: "Tenure", value: "7 years + 18mo moratorium" },
    ],
    note: "Interest rate = bank's MCLR + up to 3% + tenor premium (typically ~9-12% p.a.). Rates vary by bank — confirm before applying.",
    applyUrl: "https://www.standupmitra.in/",
  },
  {
    name: "Kisan Credit Card (KCC)",
    desc: "Working-capital credit for farming and allied activities, including dairy, poultry, and fisheries.",
    rows: [
      { label: "Interest Rate", value: "~4% effective (with subvention)" },
      { label: "Limit", value: "Up to ₹3L at subsidized rate" },
    ],
    note: "Subsidized rate applies only for prompt repayment. Available at nationalized banks, RRBs, and cooperative banks.",
    applyUrl: "https://www.myscheme.gov.in/schemes/kcc",
  },
];

export default function SchemesPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Schemes & Support</h1>
      <p className="text-sm text-slate-500 mb-6">Government schemes that you may be eligible for</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCHEMES.map((s) => (
          <div key={s.name} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
            <h3 className="font-semibold text-sm mb-2 leading-snug">{s.name}</h3>
            <p className="text-xs text-slate-500 mb-4 flex-1">{s.desc}</p>

            {s.rows.map((r, i) => (
              <div key={i} className="mb-1.5">
                {r.label && <div className="text-xs text-slate-400">{r.label}</div>}
                <div className="text-sm font-medium">{r.value}</div>
              </div>
            ))}

            <p className="text-[11px] text-slate-400 mt-2 mb-4 leading-snug">{s.note}</p>

            <a
              href={s.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg py-2 text-center hover:bg-emerald-50 transition-colors"
            >
              Apply Now →
            </a>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Note: Scheme terms change periodically and vary by bank/state. This page reflects
        publicly available information as of 2026 — always verify current terms on the
        official portal before applying.
      </p>
    </div>
  );
}
