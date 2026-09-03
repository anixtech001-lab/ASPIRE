"use client";

import { Bell } from "lucide-react";
import GoogleTranslate from "./GoogleTranslate";

export default function TopBar() {
    return (
        <header className="fixed top-0 left-0 right-0 md:left-64 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700" translate="no">
                    ASPIRE
                </span>
            </div>

            <div className="flex items-center gap-4">
                <GoogleTranslate />
                <div className="w-px h-5 bg-slate-200" />
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell className="h-4 w-4" />
                </button>
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium">
                    RK
                </div>
            </div>
        </header>
    );
}
