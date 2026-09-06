"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquareText,
    Calculator,
    Landmark,
    TrendingUp,
    FileText,
    BookmarkCheck,
    UserCircle,
    HelpCircle,
} from "lucide-react";

const ITEMS = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/advisor", label: "Advisor", icon: MessageSquareText },
    { href: "/financial-planner", label: "Finance", icon: Calculator },
    { href: "/schemes", label: "Schemes", icon: Landmark },
    { href: "/market-insights", label: "Market", icon: TrendingUp },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/saved-ideas", label: "Saved", icon: BookmarkCheck },
    { href: "/profile", label: "Profile", icon: UserCircle },
    { href: "/help", label: "Help", icon: HelpCircle },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E2A1E] border-t border-white/10 z-40">
            <div className="flex overflow-x-auto no-scrollbar">
                {ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = pathname?.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-2.5 min-w-[68px] shrink-0 text-[10px] font-medium transition-colors ${active ? "text-emerald-400" : "text-white/50"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
