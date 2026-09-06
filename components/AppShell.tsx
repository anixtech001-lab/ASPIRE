"use client";

import { ReactNode } from "react";
import { useSidebar } from "@/lib/SidebarContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className={`pt-14 pb-16 md:pb-0 transition-all duration-200 ${collapsed ? "md:pl-16" : "md:pl-64"}`}>
      {children}
    </div>
  );
}
