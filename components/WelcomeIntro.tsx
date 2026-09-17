"use client";

import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

const STORAGE_KEY = "aspire_welcome_seen";
const BRAND_GREEN = "#2C5F2D";
const BRAND_MOSS = "#97BC62";

type Stage = "hidden" | "icon" | "arcs" | "wordmark" | "exit" | "done";

export default function WelcomeIntro() {
  const [stage, setStage] = useState<Stage>("hidden");

  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage unavailable — just skip the intro rather than risk showing it every time
    }
    if (seen) {
      setStage("done");
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    setStage("icon");
    timers.push(setTimeout(() => setStage("arcs"), 350));
    timers.push(setTimeout(() => setStage("wordmark"), 1150));
    timers.push(setTimeout(() => setStage("exit"), 2500));
    timers.push(
      setTimeout(() => {
        setStage("done");
        try {
          window.localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // best-effort only
        }
      }, 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  if (stage === "hidden" || stage === "done") return null;

  // Past the guard above, `stage` can only be "icon" | "arcs" | "wordmark" | "exit"
  // — meaning the icon is always visible for all of them, so there's no
  // separate "is the icon in" check needed.
  const arcsIn = stage === "arcs" || stage === "wordmark" || stage === "exit";
  const wordmarkIn = stage === "wordmark" || stage === "exit";
  const exiting = stage === "exit";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F7F8F6] transition-opacity duration-500"
      style={{ opacity: exiting ? 0 : 1, pointerEvents: exiting ? "none" : "auto" }}
    >
      <style>{`
        @keyframes aspireIconIn {
          0% { opacity: 0; transform: scale(0.4); }
          70% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes aspireArcDraw {
          from { stroke-dashoffset: 220; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes aspireWordIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative flex flex-col items-center">
        {/* Decorative arcs, echoing a pair of leaves either side of the icon */}
        <svg
          className="absolute -top-6 left-1/2 -translate-x-1/2"
          width="220"
          height="140"
          viewBox="0 0 220 140"
          fill="none"
        >
          <path
            d="M20 130 C 20 70, 70 20, 100 15"
            stroke={BRAND_GREEN}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="220"
            style={{
              strokeDashoffset: arcsIn ? 0 : 220,
              opacity: arcsIn ? 1 : 0,
              animation: arcsIn ? "aspireArcDraw 700ms ease-out forwards" : undefined,
            }}
          />
          <path
            d="M200 130 C 200 70, 150 20, 120 15"
            stroke={BRAND_MOSS}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="220"
            style={{
              strokeDashoffset: arcsIn ? 0 : 220,
              opacity: arcsIn ? 1 : 0,
              animation: arcsIn ? "aspireArcDraw 700ms ease-out 100ms forwards" : undefined,
            }}
          />
        </svg>

        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm"
          style={{ animation: "aspireIconIn 550ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
        >
          <Sprout className="h-10 w-10 text-emerald-700" />
        </div>

        <div
          className="mt-5 text-center"
          style={{
            opacity: wordmarkIn ? 1 : 0,
            animation: wordmarkIn ? "aspireWordIn 450ms ease-out forwards" : undefined,
          }}
        >
          <div className="text-2xl font-semibold text-slate-900 tracking-wide" translate="no">
            ASPIRE
          </div>
          <div className="text-xs text-slate-500 mt-1">Rural Business Advisor</div>
        </div>
      </div>
    </div>
  );
}
