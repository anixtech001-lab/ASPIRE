const SCHEMES = [
  {
    name: "PMEGP Scheme",
    desc: "Credit linked subsidy scheme for setting up micro enterprises.",
    subsidyLabel: "Subsidy",
    subsidyValue: "15% - 35%",
    benefitLabel: "Benefit",
    benefitValue: "Up to ₹25 Lakhs",
  },
  {
    name: "Dairy Entrepreneurship Development Scheme",
    desc: "Support for setting up dairy based enterprises.",
    subsidyLabel: "Subsidy",
    subsidyValue: "25%",
    benefitLabel: "Benefit",
    benefitValue: "Up to ₹10 Lakhs",
  },
  {
    name: "Stand Up India Scheme",
    desc: "Bank loans between ₹10 lakh to ₹1 crore for SC/ST & Women.",
    subsidyLabel: "Loan Amount",
    subsidyValue: "₹10L - ₹1Cr",
    benefitLabel: "Purpose",
    benefitValue: "Greenfield Enterprise",
  },
  {
    name: "Mudra Loan",
    desc: "Collateral free loans for micro enterprises.",
    subsidyLabel: "Loan Amount",
    subsidyValue: "Up to ₹10 Lakhs",
    benefitLabel: "Purpose",
    benefitValue: "Business Development",
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

            <div className="mb-1.5">
              <div className="text-xs text-slate-400">{s.subsidyLabel}</div>
              <div className="text-sm font-medium">{s.subsidyValue}</div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-slate-400">{s.benefitLabel}</div>
              <div className="text-sm font-medium">{s.benefitValue}</div>
            </div>

            <button className="text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg py-2 hover:bg-emerald-50 transition-colors">
              Apply Now →
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Note: Scheme eligibility depends on government norms. Please verify details before applying.
      </p>
    </div>
  );
}
