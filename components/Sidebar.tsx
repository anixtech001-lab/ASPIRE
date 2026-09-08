"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/SidebarContext";
import {
  LayoutDashboard,
  MessageSquareText,
  Calculator,
  Landmark,
  TrendingUp,
  FileText,
  UserCircle,
  HelpCircle,
  Sprout,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/advisor", label: "Business Advisor", icon: MessageSquareText },
  { href: "/financial-planner", label: "Financial Planner", icon: Calculator },
  { href: "/schemes", label: "Schemes & Support", icon: Landmark },
  { href: "/market-insights", label: "Market Insights", icon: TrendingUp },
  { href: "/reports", label: "My Reports", icon: FileText },
];

const FOOTER_ITEMS = [
  { href: "/profile", label: "Profile & Settings", icon: UserCircle },
  { href: "/help", label: "Help & Resources", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-[#0E2A1E] text-white transition-all duration-200 z-30 ${collapsed ? "md:w-16" : "md:w-64"
        }`}
    >
      <div className={`flex items-center gap-2 py-6 ${collapsed ? "justify-center px-2" : "px-5"}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 shrink-0">
          <Sprout className="h-5 w-5 text-emerald-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight" translate="no">
              ASPIRE
            </div>
            <div className="text-xs text-white/50 leading-tight">Rural Business Advisor</div>
          </div>
        )}
      </div>

      <button
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`flex items-center gap-3 mx-3 mb-2 rounded-lg px-3 py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white transition-colors ${collapsed ? "justify-center" : ""
          }`}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
        {!collapsed && "Collapse"}
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${collapsed ? "justify-center" : ""
                } ${active
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        {!collapsed && (
          <div className="rounded-xl bg-white/5 p-4 mb-3">
            <div className="text-sm font-medium mb-1">Need Help?</div>
            <div className="text-xs text-white/50 mb-3">Talk to our assistant for any help.</div>
            <Link
              href="/advisor"
              className="block text-center text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg py-2 font-medium transition-colors"
            >
              Chat with Advisor
            </Link>
          </div>
        )}
        {FOOTER_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors ${collapsed ? "justify-center" : ""
              }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
