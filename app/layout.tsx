import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { BusinessProvider } from "@/lib/BusinessContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import { ProfileProvider } from "@/lib/ProfileContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import WelcomeIntro from "@/components/WelcomeIntro";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AppShell from "@/components/AppShell";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

// Noto Sans is the deliberate pick here, not a generic choice: it's the one
// Google Fonts family Google itself designed to cover every one of the 22
// scheduled Indian scripts (Noto Sans Devanagari/Tamil/Telugu/Bengali/etc.
// are siblings drawn to match), which is exactly what ASPIRE needs now that
// it supports all 22 languages. `latin` covers English UI text; `devanagari`
// covers Hindi (and Marathi/Nepali/Sanskrit/Maithili/Bodo/Dogri, which share
// the script) — the two languages actually wired with real translations so
// far. As more languages in lib/i18n get filled in via Bhashini, add that
// script's Noto Sans sibling here the same way (e.g. Noto_Sans_Tamil for
// Tamil) so it gets a properly-designed font instead of falling back to
// whatever the visitor's device happens to ship.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASPIRE — AI-driven Support for Project Investment and Rural Entrepreneurship",
  description: "AI-driven hyper-local business advisory and financial structuring for rural micro-entrepreneurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoSansDevanagari.variable}`}>
      <body className="bg-[#F7F8F6] text-slate-900 antialiased">
        <WelcomeIntro />
        <LanguageProvider>
          <SidebarProvider>
            <ProfileProvider>
              <BusinessProvider>
                <Sidebar />
                <TopBar />
                <AppShell>{children}</AppShell>
                <MobileBottomNav />
              </BusinessProvider>
            </ProfileProvider>
          </SidebarProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
