import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "ASPIRE — AI-driven Support for Project Investment and Rural Entrepreneurship",
  description: "AI-driven hyper-local business advisory and financial structuring for rural micro-entrepreneurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
