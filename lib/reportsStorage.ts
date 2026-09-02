"use client";

import { BusinessDetails } from "./BusinessContext";
import { FeasibilityReport } from "./ai";
import { FullFinancialPlan } from "./financialEngine";

export interface SavedReport {
    id: string;
    createdAt: string; // ISO timestamp
    businessDetails: BusinessDetails;
    feasibilityReport: FeasibilityReport;
    financialPlan: FullFinancialPlan;
}

const STORAGE_KEY = "aspire_saved_reports";

// SSR-safe: Next.js renders this on the server first, where `window` doesn't
// exist, so every function guards against that before touching localStorage.

export function getSavedReports(): SavedReport[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as SavedReport[];
        // newest first
        return parsed.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (err) {
        console.error("[reportsStorage] failed to read saved reports:", err);
        return [];
    }
}

export function saveReport(
    businessDetails: BusinessDetails,
    feasibilityReport: FeasibilityReport,
    financialPlan: FullFinancialPlan
): SavedReport {
    const report: SavedReport = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        businessDetails,
        feasibilityReport,
        financialPlan,
    };

    if (typeof window !== "undefined") {
        try {
            const existing = getSavedReports();
            const updated = [report, ...existing];
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
            // Storage can fail (quota exceeded, private browsing, etc.) — never
            // block the user's flow because a save failed.
            console.error("[reportsStorage] failed to save report:", err);
        }
    }

    return report;
}

export function deleteReport(id: string): void {
    if (typeof window === "undefined") return;
    try {
        const existing = getSavedReports();
        const updated = existing.filter((r) => r.id !== id);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
        console.error("[reportsStorage] failed to delete report:", err);
    }
}
