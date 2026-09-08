"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/SidebarContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  if (pathname === "/") return <>{children}</>; // landing page: full-width, no app chrome

  return (
    <div className={`pt-14 pb-16 md:pb-0 transition-all duration-200 ${collapsed ? "md:pl-16" : "md:pl-64"}`}>
      {children}
    </div>
  );
}
