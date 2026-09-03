import type { Metadata } from "next";
import { BusinessProvider } from "@/lib/BusinessContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import GoogleTranslateDomGuard from "@/components/GoogleTranslateDomGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASPIRE — AI-driven Support for Project Investment and Rural Entrepreneurship",
  description: "AI-driven hyper-local business advisory and financial structuring for rural micro-entrepreneurs",
  // Prevents Chrome's own native "Translate this page?" infobar from
  // appearing on top of our own Google Translate widget — we already
  // handle translation ourselves via the widget, so the browser's separate
  // auto-detect prompt is redundant and looks like a second, uglier banner.
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F8F6] text-slate-900 antialiased">
        {/* Must render before any content that Google Translate could touch */}
        <GoogleTranslateDomGuard />
        <BusinessProvider>
          <Sidebar />
          <TopBar />
          <div className="md:pl-64 pt-14">{children}</div>
        </BusinessProvider>
      </body>
    </html>
  );
}
