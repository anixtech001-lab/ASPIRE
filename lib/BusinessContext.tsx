"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FeasibilityReport } from "./ai";
import { FullFinancialPlan } from "./financialEngine";

export interface BusinessDetails {
  location: string;
  state: string;
  businessCategory: string;
  marginCapital: number;
  experience: string;
  motivation: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  label: string;
  amount: number;
  date: string;
}

interface BusinessContextValue {
  businessDetails: BusinessDetails | null;
  setBusinessDetails: (d: BusinessDetails) => void;

  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;

  feasibilityReport: FeasibilityReport | null;
  setFeasibilityReport: (r: FeasibilityReport | null) => void;

  financialPlan: FullFinancialPlan | null;
  setFinancialPlan: (r: FullFinancialPlan | null) => void;

  reportLoading: boolean;
  setReportLoading: (b: boolean) => void;

  hydrated: boolean; // true once localStorage has been read on mount
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

// Persists the CURRENT session (not the "My Reports" history — that's a
// separate, append-only list in lib/reportsStorage.ts). This is what makes a
// page refresh not wipe out the report you just generated. No login/auth is
// used, so this is scoped to one browser only — that's an accepted trade-off
// given the "no login/signup" requirement.
const SESSION_KEY = "aspire_current_session";

interface PersistedSession {
  businessDetails: BusinessDetails | null;
  feasibilityReport: FeasibilityReport | null;
  financialPlan: FullFinancialPlan | null;
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feasibilityReport, setFeasibilityReport] = useState<FeasibilityReport | null>(null);
  const [financialPlan, setFinancialPlan] = useState<FullFinancialPlan | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate once on mount (client-only — localStorage doesn't exist on the server)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedSession;
        if (parsed.businessDetails) setBusinessDetails(parsed.businessDetails);
        if (parsed.feasibilityReport) setFeasibilityReport(parsed.feasibilityReport);
        if (parsed.financialPlan) setFinancialPlan(parsed.financialPlan);
      }
    } catch (err) {
      console.error("[BusinessContext] failed to rehydrate session:", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist on every change (after initial hydration, so we don't immediately
  // overwrite saved data with the pre-hydration empty state)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const toSave: PersistedSession = { businessDetails, feasibilityReport, financialPlan };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(toSave));
    } catch (err) {
      console.error("[BusinessContext] failed to persist session:", err);
    }
  }, [businessDetails, feasibilityReport, financialPlan, hydrated]);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...t, id: crypto.randomUUID() }]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <BusinessContext.Provider
      value={{
        businessDetails,
        setBusinessDetails,
        transactions,
        addTransaction,
        removeTransaction,
        feasibilityReport,
        setFeasibilityReport,
        financialPlan,
        setFinancialPlan,
        reportLoading,
        setReportLoading,
        hydrated,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within a BusinessProvider");
  return ctx;
}
