"use client";

import { useState, useEffect } from "react";
import { useProfile, UserProfile, EMPTY_PROFILE } from "@/lib/ProfileContext";
import { Check } from "lucide-react";

const EDUCATION_OPTIONS = [
    "Prefer not to say",
    "No formal education",
    "Primary school",
    "Secondary / High school",
    "Graduate",
    "Post-graduate",
    "Other",
];

export default function ProfilePage() {
    const { profile, setProfile, hydrated } = useProfile();
    const [form, setForm] = useState<UserProfile>(EMPTY_PROFILE);
    const [saved, setSaved] = useState(false);

    // Sync local form state once the saved profile has loaded from storage
    useEffect(() => {
        if (hydrated) setForm(profile);
    }, [hydrated, profile]);

    const update = (field: keyof UserProfile, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        setProfile(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-1">Profile & Settings</h1>
            <p className="text-sm text-slate-500 mb-6">
                Everything here is optional — fill in what&apos;s useful to you, skip the rest. It only
                helps personalize your experience and is never required to use ASPIRE.
            </p>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="First Name">
                        <input className="input" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="e.g. Ramesh" />
                    </Field>
                    <Field label="Last Name / Surname">
                        <input className="input" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="e.g. Kumar" />
                    </Field>
                </div>

                <Field label="Location">
                    <input className="input" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Bachhrawan, Uttar Pradesh" />
                </Field>

                <Field label="Business Name">
                    <input className="input" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g. Kumar Dairy Farm" />
                </Field>

                <Field label="Bio">
                    <textarea
                        className="input min-h-[90px]"
                        value={form.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        placeholder="A little about yourself and what you're building…"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Education">
                        <select className="input" value={form.education} onChange={(e) => update("education", e.target.value)}>
                            <option value="">Select (optional)</option>
                            {EDUCATION_OPTIONS.map((o) => (
                                <option key={o} value={o}>
                                    {o}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Years of Business Experience">
                        <input className="input" value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="e.g. 3 years" />
                    </Field>
                </div>

                <Field label="Phone Number">
                    <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 98765 43210" />
                </Field>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={handleSave}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Save Profile
                    </button>
                    {saved && (
                        <span className="text-sm text-emerald-600 flex items-center gap-1.5">
                            <Check className="h-4 w-4" /> Saved
                        </span>
                    )}
                </div>
            </div>

            <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.6rem 0.85rem;
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
