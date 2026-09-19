"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CommunityProblem,
    subscribeToProblems,
    createProblem,
    relativeTime,
} from "@/lib/community";
import { MessageCircle, CheckCircle2, Plus, X, Loader2, Users } from "lucide-react";

// This page talks to Firebase (a browser-only client SDK) the moment it
// loads, so it can't be pre-rendered at build time — force it to render
// fresh in the browser instead of Next trying to statically export it
// (which fails when Firebase env vars aren't present during the build).
export const dynamic = "force-dynamic";

// Kept in sync with app/advisor/page.tsx's BUSINESS_CATEGORIES by hand —
// if that list changes, update this one too.
const CATEGORIES = ["Dairy", "Retail", "Textiles", "Food Processing", "Handicrafts", "Services", "Other"];

export default function CommunityPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [problems, setProblems] = useState<CommunityProblem[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        setProblems(null);
        setLoadError(null);
        const unsubscribe = subscribeToProblems(
            activeCategory,
            (data) => setProblems(data),
            () => setLoadError("Couldn't load the community board right now. Please try again in a moment.")
        );
        return unsubscribe;
    }, [activeCategory]);

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Users className="h-6 w-6 text-emerald-600" /> Community
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Post a problem you&apos;re facing — other business owners who&apos;ve dealt with the same
                        thing can share how they solved it.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2.5 whitespace-nowrap transition-colors"
                >
                    <Plus className="h-4 w-4" /> Post a Problem
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
                {["All", ...CATEGORIES].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${activeCategory === cat
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loadError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-4 mb-4">{loadError}</div>}

            {problems === null && !loadError && (
                <div className="flex items-center justify-center py-16 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            )}

            {problems !== null && problems.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <p className="text-sm text-slate-500 mb-4">
                        No problems posted {activeCategory !== "All" ? `in ${activeCategory} ` : ""}yet — be the first.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-sm text-emerald-600 font-medium hover:underline"
                    >
                        Post a Problem
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {problems?.map((p) => (
                    <Link
                        key={p.id}
                        href={`/community/${p.id}`}
                        className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                                {p.category}
                            </span>
                            {p.status === "solved" && (
                                <span className="flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1">
                                    <CheckCircle2 className="h-3 w-3" /> Solved
                                </span>
                            )}
                            {p.location && <span className="text-[11px] text-slate-400">{p.location}</span>}
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>
                                {p.authorName} · {relativeTime(p.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" /> {p.solutionCount}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {showForm && <PostProblemModal onClose={() => setShowForm(false)} />}
        </div>
    );
}

function PostProblemModal({ onClose }: { onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            setError("Please add a title and description.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await createProblem({ title, description, category, location });
            onClose();
        } catch {
            setError("Couldn't post right now. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Post a Problem</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Business Type</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Problem Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Milk spoiling before I can sell it"
                            maxLength={150}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            Describe the problem <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            maxLength={2000}
                            placeholder="What's happening, what have you tried, what do you need help with?"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Location (optional)</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Bachhrawan, Uttar Pradesh"
                            maxLength={100}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Post Problem
                    </button>
                </div>
            </div>
        </div>
    );
}
