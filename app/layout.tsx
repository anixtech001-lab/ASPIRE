import type { Metadata } from "next";
import { BusinessProvider } from "@/lib/BusinessContext";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grameen Business Advisor",
  description: "AI-driven hyper-local business advisory for rural micro-entrepreneurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F8F6] text-slate-900 antialiased">
        <BusinessProvider>
          <Sidebar />
          <div className="md:pl-64">{children}</div>
        </BusinessProvider>
      </body>
    </html>
  );
}
