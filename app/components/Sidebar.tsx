"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
    LayoutDashboard, Users, CalendarOff,
    Bell, Wallet, Sun, Moon, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/", icon: LayoutDashboard, label: "Tableau de bord" },
    { href: "/employees", icon: Users, label: "Employés" },
    { href: "/leaves", icon: CalendarOff, label: "Congés" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/payroll", icon: Wallet, label: "Paie & Perf." },
];

export default function Sidebar() {
    const path = usePathname();
    const { theme, setTheme } = useTheme();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen flex flex-col border-r",
            "bg-background z-40"
        )} style={{ width: "var(--sidebar-w)" }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
                    <Activity size={16} />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-none">RH Cloud</p>
                    <p className="text-xs text-muted-foreground mt-0.5">MERN · K8s</p>
                </div>
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Navigation
                </p>
                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = path === href;
                    return (
                        <Link key={href} href={href}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                                active
                                    ? "bg-secondary font-medium text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}>
                                <Icon size={16} />
                                {label}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <Separator />

            {/* Footer */}
            <div className="px-4 py-4 space-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Cluster
                    </p>
                    <p className="text-xs text-muted-foreground">GKE · europe-west1</p>
                    <p className="text-xs text-muted-foreground">HPA · 1-5 replicas</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun size={14} className="dark:hidden" />
                    <Moon size={14} className="hidden dark:block" />
                    <span className="text-xs">Thème</span>
                </Button>
            </div>
        </aside>
    );
}