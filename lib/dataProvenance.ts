// Data provenance system — every important number shown in the app should
// be traceable to where it actually came from. This is the foundation for
// never presenting an AI guess as a verified fact.

export type ProvenanceType =
    | "VERIFIED_OFFICIAL" // from an official government/verified dataset
    | "VERIFIED_EXTERNAL" // from a verified third-party source
    | "USER_PROVIDED" // the entrepreneur entered this themselves
    | "CALCULATED" // deterministic math from other known values
    | "MODEL_ESTIMATE" // an LLM's plausible estimate — NOT a verified fact
    | "UNAVAILABLE"; // no reliable value exists

export type ConfidenceLevel = "High" | "Medium" | "Low" | "Insufficient Data";

export interface DataPoint<T> {
    value: T | null;
    unit?: string;
    provenance: ProvenanceType;
    source?: string;
    retrievedAt?: string;
    confidence: ConfidenceLevel;
    methodology?: string;
}

export function unavailable<T>(methodology?: string): DataPoint<T> {
    return { value: null, provenance: "UNAVAILABLE", confidence: "Insufficient Data", methodology };
}

export function modelEstimate<T>(value: T, unit?: string): DataPoint<T> {
    return {
        value,
        unit,
        provenance: "MODEL_ESTIMATE",
        confidence: "Low",
        methodology: "AI-generated plausible estimate based on regional patterns — not verified local data.",
    };
}

export function calculated<T>(value: T, unit?: string, methodology?: string): DataPoint<T> {
    return { value, unit, provenance: "CALCULATED", confidence: "High", methodology };
}

export function userProvided<T>(value: T, unit?: string): DataPoint<T> {
    return { value, unit, provenance: "USER_PROVIDED", confidence: "Medium" };
}

// Short badge label + color, used across the UI wherever a DataPoint is shown
export const PROVENANCE_LABEL: Record<ProvenanceType, string> = {
    VERIFIED_OFFICIAL: "Verified (Official)",
    VERIFIED_EXTERNAL: "Verified (External)",
    USER_PROVIDED: "User-Provided",
    CALCULATED: "Calculated",
    MODEL_ESTIMATE: "Model Estimate — Not Verified",
    UNAVAILABLE: "Data Unavailable",
};

export const PROVENANCE_COLOR: Record<ProvenanceType, string> = {
    VERIFIED_OFFICIAL: "emerald",
    VERIFIED_EXTERNAL: "emerald",
    USER_PROVIDED: "blue",
    CALCULATED: "slate",
    MODEL_ESTIMATE: "amber",
    UNAVAILABLE: "slate",
};
