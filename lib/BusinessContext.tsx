"use client";

import { createContext, useContext, useState, ReactNode } from "react";
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
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feasibilityReport, setFeasibilityReport] = useState<FeasibilityReport | null>(null);
  const [financialPlan, setFinancialPlan] = useState<FullFinancialPlan | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

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
