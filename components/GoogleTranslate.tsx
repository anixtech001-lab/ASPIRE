"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";

declare global {
    interface Window {
        google?: { translate?: { TranslateElement: any } };
        googleTranslateElementInit?: () => void;
    }
}

// value "" means original/English — matches the real widget's convention.
const LANGUAGES: { code: string; label: string }[] = [
    { code: "", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "bn", label: "বাংলা" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "mr", label: "मराठी" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "ml", label: "മലയാളം" },
    { code: "pa", label: "ਪੰਜਾਬੀ" },
    { code: "ur", label: "اردو" },
    { code: "or", label: "ଓଡ଼ିଆ" },
    { code: "as", label: "অসমীয়া" },
];

const INCLUDED_LANGUAGES = LANGUAGES.filter((l) => l.code).map((l) => l.code).join(",");

export default function GoogleTranslate() {
    const initialized = useRef(false);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        window.googleTranslateElementInit = () => {
            if (!window.google?.translate) return;
            // This creates Google's real widget, but its container is hidden via
            // CSS (see the `hidden` div below) — we never show any of Google's
            // own UI. We only use it as a hidden "engine" that our own dropdown
            // below drives programmatically. This is the only reliable way to
            // guarantee no stray Google branding/banner ever becomes visible,
            // regardless of what markup Google's widget renders internally.
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: INCLUDED_LANGUAGES,
                    autoDisplay: false,
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

        // Belt-and-suspenders: Google occasionally attaches its banner iframe
        // directly to <body> (outside our hidden container) and nudges body's
        // `top` style. Strip both if they ever appear.
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

    const handleChange = (code: string) => {
        setSelected(code);
        // Find Google's real (hidden) <select> and drive it directly — this is
        // exactly what a user clicking the real widget would do, so it
        // triggers the actual page translation without ever showing Google's
        // own dropdown/banner/logo.
        const triggerTranslation = (attemptsLeft: number) => {
            const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
            if (combo) {
                combo.value = code;
                combo.dispatchEvent(new Event("change"));
            } else if (attemptsLeft > 0) {
                // Widget script may still be loading on a fast click — retry briefly.
                setTimeout(() => triggerTranslation(attemptsLeft - 1), 300);
            }
        };
        triggerTranslation(10);
    };

    return (
        <div className="flex items-center gap-1.5">
            <Languages className="h-4 w-4 text-slate-400 shrink-0" />
            <select
                value={selected}
                onChange={(e) => handleChange(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 bg-white outline-none cursor-pointer max-w-[110px]"
                aria-label="Select language"
            >
                {LANGUAGES.map((l) => (
                    <option key={l.code || "en"} value={l.code}>
                        {l.label}
                    </option>
                ))}
            </select>
            {/* Google's real widget — intentionally hidden, see comment above */}
            <div id="google_translate_element" className="hidden" aria-hidden="true" />
        </div>
    );
}
