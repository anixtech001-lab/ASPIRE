import { SchemeCriteria } from "./schemeMatching";

export interface SchemeEmiDefaults {
    rate: number; // annual %
    tenureMonths: number;
    moratoriumMonths: number;
}

export interface SchemeInfo {
    name: string;
    desc: string;
    rows: { label: string; value: string }[];
    note: string;
    applyUrl: string;
    criteria: SchemeCriteria;
    emiDefaults: SchemeEmiDefaults;
}

export const SCHEMES: SchemeInfo[] = [
    {
        name: "PMEGP Scheme",
        desc: "Credit-linked subsidy for setting up new micro-enterprises. Implemented by KVIC, Ministry of MSME.",
        rows: [
            { label: "Subsidy", value: "15% – 35% of project cost" },
            { label: "Max Project Cost", value: "₹50L (Mfg) / ₹20L (Service)" },
        ],
        note: "General category: 15% urban / 25% rural. SC/ST/Women/NE/special category: 25% urban / 35% rural. Ceiling depends on whether your unit is manufacturing (₹50L) or service (₹20L) — confirm which applies to you.",
        applyUrl: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
        criteria: {
            targetCategories: ["Retail", "Textiles", "Food Processing", "Handicrafts", "Services", "Other"],
            minProjectCost: 0,
            maxProjectCost: 5000000,
        },
        emiDefaults: { rate: 9, tenureMonths: 84, moratoriumMonths: 6 },
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
        criteria: { targetCategories: "any", minProjectCost: 0, maxProjectCost: 2000000 },
        emiDefaults: { rate: 10, tenureMonths: 60, moratoriumMonths: 3 },
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
        criteria: {
            targetCategories: "any",
            minProjectCost: 1100000,
            maxProjectCost: 11000000,
            specialEligibility: "SC/ST or Women entrepreneur, for a new (greenfield) enterprise",
        },
        emiDefaults: { rate: 10, tenureMonths: 84, moratoriumMonths: 18 },
    },
    {
        name: "Kisan Credit Card (KCC)",
        desc: "Working-capital credit for farming and allied activities, including dairy, poultry, and fisheries.",
        rows: [
            { label: "Interest Rate", value: "~4% effective (with subvention)" },
            { label: "Limit", value: "Up to ₹3L at subsidized rate" },
        ],
        note: "This is a revolving working-capital limit, not a fixed-tenure project loan — the calculator below is illustrative only, treating it like a term loan for comparison purposes. Subsidized rate applies only for prompt repayment.",
        applyUrl: "https://www.myscheme.gov.in/schemes/kcc",
        criteria: { targetCategories: ["Dairy"], minProjectCost: 0, maxProjectCost: 300000 },
        emiDefaults: { rate: 4, tenureMonths: 12, moratoriumMonths: 0 },
    },
];
