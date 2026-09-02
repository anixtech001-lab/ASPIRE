"use client";

import { useEffect, useRef } from "react";
import { Languages } from "lucide-react";

declare global {
    interface Window {
        google?: {
            translate?: {
                TranslateElement: any;
            };
        };
        googleTranslateElementInit?: () => void;
    }
}

// Languages relevant to rural/semi-urban Indian micro-entrepreneurs —
// covers the major regional languages. "en" (English) is always available
// as the default/original.
const INCLUDED_LANGUAGES =
    "hi,bn,ta,te,mr,gu,kn,ml,pa,ur,or,as,en";

export default function GoogleTranslate() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        window.googleTranslateElementInit = () => {
            if (!window.google?.translate) return;
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: INCLUDED_LANGUAGES,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        // Don't double-inject the script if it's already there (e.g. fast
        // client-side navigation remounting this component)
        if (!document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google?.translate) {
            // Script already loaded from a previous mount — just re-init.
            window.googleTranslateElementInit();
        }
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <Languages className="h-4 w-4 text-white/50 shrink-0" />
            <div id="google_translate_element" className="aspire-gtranslate min-w-0" />
        </div>
    );
}
