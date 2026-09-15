"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations } from "./translations";
import { isValidLang } from "./languages";

interface LanguageContextValue {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "aspire_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>("en");

    useEffect(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (isValidLang(saved)) setLangState(saved);
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        window.localStorage.setItem(STORAGE_KEY, l);
    };

    const t = (key: string): string => {
        return translations[lang]?.[key] || translations.en[key] || key;
    };

    return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
    return ctx;
}
