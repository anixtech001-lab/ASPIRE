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

const INCLUDED_LANGUAGES = "hi,bn,ta,te,mr,gu,kn,ml,pa,ur,or,as,en";

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
                    autoDisplay: false,
                    // No `layout` set on purpose — this renders the classic gadget as
                    // a real <select class="goog-te-combo">, which is small,
                    // reliably stylable, and matches globals.css. The "SIMPLE" inline
                    // layout renders a completely different DOM (a clickable
                    // <span>+popup, not a <select>) that our CSS doesn't target,
                    // which is what caused the oversized, unstyled two-line box.
                },
                "google_translate_element"
            );
        };

        if (!document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        } else if (window.google?.translate) {
            window.googleTranslateElementInit();
        }

        // CSS alone isn't always enough — Google's banner iframe and the
        // `top: 40px` it forces on <body> are applied via inline styles that
        // can slip in after our stylesheet loads (or on route changes when the
        // banner re-triggers). This observer actively strips them the moment
        // they appear, as a belt-and-suspenders fix alongside globals.css.
        const stripBanner = () => {
            document.querySelectorAll(".goog-te-banner-frame").forEach((el) => {
                (el as HTMLElement).style.display = "none";
            });
            if (document.body.style.top && document.body.style.top !== "0px") {
                document.body.style.top = "0px";
            }
        };

        stripBanner();
        const observer = new MutationObserver(stripBanner);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex items-center gap-1.5">
            <Languages className="h-4 w-4 text-slate-400 shrink-0" />
            <div id="google_translate_element" className="aspire-gtranslate" />
        </div>
    );
}
