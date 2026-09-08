"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, UserCircle } from "lucide-react";
import { useSidebar } from "@/lib/SidebarContext";
import { useProfile } from "@/lib/ProfileContext";
import GoogleTranslate from "./GoogleTranslate";

const SEARCHABLE_PAGES = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/advisor", label: "Business Advisor" },
    { href: "/financial-planner", label: "Financial Planner" },
    { href: "/schemes", label: "Schemes & Support" },
    { href: "/market-insights", label: "Market Insights" },
    { href: "/reports", label: "My Reports" },
    { href: "/profile", label: "Profile & Settings" },
    { href: "/help", label: "Help & Resources" },
];

export default function TopBar() {
    const { collapsed } = useSidebar();
    const { profile } = useProfile();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const results = query.trim()
        ? SEARCHABLE_PAGES.filter((p) => p.label.toLowerCase().includes(query.trim().toLowerCase()))
        : [];

    // Ctrl/Cmd+K focuses the search box, matching the shortcut hint shown
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (e.key === "Escape") {
                inputRef.current?.blur();
                setOpen(false);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const goTo = (href: string) => {
        router.push(href);
        setQuery("");
        setOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-3 md:px-6 gap-2 md:gap-4 transition-all duration-200 ${collapsed ? "md:left-16" : "md:left-64"
                }`}
        >
            <div className="relative flex-1 max-w-[140px] sm:max-w-xs md:max-w-md">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)} // allow click on result before closing
                    placeholder="Search…"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 sm:pr-14 py-2 outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                />
                <kbd className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
                    Ctrl K
                </kbd>

                {open && results.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
                        {results.map((r) => (
                            <button
                                key={r.href}
                                onMouseDown={() => goTo(r.href)}
                                className="w-full text-left text-sm px-3 py-2 hover:bg-slate-50 text-slate-700"
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <GoogleTranslate />
                <div className="hidden sm:block w-px h-5 bg-slate-200" />
                <button className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                    <Bell className="h-4 w-4" />
                </button>
                <Link href="/profile" title="Profile & Settings" className="shrink-0">
                    {profile.firstName ? (
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium hover:bg-emerald-200 transition-colors">
                            {(profile.firstName[0] + (profile.lastName?.[0] ?? "")).toUpperCase()}
                        </div>
                    ) : (
                        <UserCircle className="h-8 w-8 text-slate-300 hover:text-slate-400 transition-colors" />
                    )}
                </Link>
            </div>
        </header>
    );
}
