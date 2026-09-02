"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/lib/BusinessContext";
import { saveReport } from "@/lib/reportsStorage";
import { Loader2 } from "lucide-react";

const STEPS = ["Basic Details", "Business Info", "Financial Details", "Review"];

const BUSINESS_CATEGORIES = [
  "Dairy", "Retail", "Textiles", "Food Processing", "Handicrafts", "Services", "Other",
];

const STATES = [
  "Bihar", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Maharashtra",
  "Tamil Nadu", "West Bengal", "Gujarat", "Karnataka", "Other",
];

export default function AdvisorPage() {
  const router = useRouter();
  const { setBusinessDetails, setFeasibilityReport, setFinancialPlan, setReportLoading, reportLoading } =
    useBusiness();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    location: "",
    state: "Bihar",
    businessCategory: "Dairy",
    marginCapital: "",
    experience: "Some Experience",
    motivation: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.location.trim() && form.state;
    if (step === 1) return form.businessCategory && form.experience;
    if (step === 2) return form.marginCapital && Number(form.marginCapital) > 0;
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setReportLoading(true);

    const details = {
      location: form.location,
      state: form.state,
      businessCategory: form.businessCategory,
      marginCapital: Number(form.marginCapital),
      experience: form.experience,
      motivation: form.motivation,
    };
    setBusinessDetails(details);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setFinancialPlan(data.financialPlan);
      setFeasibilityReport(data.feasibilityReport ?? null);

      if (data.warning) setError(data.warning);

      // Save to "My Reports" history — only if the AI report actually
      // generated successfully (a partial/failed report isn't worth keeping).
      if (data.feasibilityReport) {
        saveReport(details, data.feasibilityReport, data.financialPlan);
      }

      router.push("/report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Start Your Business Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">Tell us about your idea and we&apos;ll guide you better</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs mt-1.5 ${i <= step ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-emerald-600" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Your Location (Village / Town)">
              <input
                className="input"
                placeholder="e.g. Sitamarhi"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </Field>
            <Field label="State">
              <select className="input" value={form.state} onChange={(e) => update("state", e.target.value)}>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="Business Type / Category">
              <select
                className="input"
                value={form.businessCategory}
                onChange={(e) => update("businessCategory", e.target.value)}
              >
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Experience in this field">
              <select className="input" value={form.experience} onChange={(e) => update("experience", e.target.value)}>
                <option>No Experience</option>
                <option>Some Experience</option>
                <option>Experienced</option>
              </select>
            </Field>
            <Field label="Why do you want to start this business?">
              <textarea
                className="input min-h-[100px]"
                placeholder="e.g. To earn better income and contribute to local dairy supply"
                value={form.motivation}
                onChange={(e) => update("motivation", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Available Margin Capital (₹)">
              <input
                className="input"
                type="number"
                placeholder="e.g. 100000"
                value={form.marginCapital}
                onChange={(e) => update("marginCapital", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                This is typically 10% of your total project cost. We&apos;ll calculate your loan
                eligibility and scheme match automatically.
              </p>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <ReviewRow label="Location" value={`${form.location}, ${form.state}`} />
            <ReviewRow label="Business Type" value={form.businessCategory} />
            <ReviewRow label="Experience" value={form.experience} />
            <ReviewRow label="Margin Capital" value={`₹${form.marginCapital}`} />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            className="text-sm text-slate-500 font-medium px-4 py-2 disabled:opacity-0"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
            >
              Next Step →
            </button>
          ) : (
            <button
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              disabled={reportLoading}
              onClick={handleSubmit}
            >
              {reportLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {reportLoading ? "Generating Report..." : "Generate My Report"}
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
