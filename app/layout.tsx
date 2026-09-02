import type { Metadata } from "next";
import { BusinessProvider } from "@/lib/BusinessContext";
import Sidebar from "@/components/Sidebar";
import GoogleTranslateDomGuard from "@/components/GoogleTranslateDomGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASPIRE — AI-driven Support for Project Investment and Rural Entrepreneurship",
  description: "AI-driven hyper-local business advisory and financial structuring for rural micro-entrepreneurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F8F6] text-slate-900 antialiased">
        {/* Must render before any content that Google Translate could touch */}
        <GoogleTranslateDomGuard />
        <BusinessProvider>
          <Sidebar />
          <div className="md:pl-64">{children}</div>
        </BusinessProvider>
      </body>
    </html>
  );
}
