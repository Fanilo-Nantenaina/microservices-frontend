"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
    { href: "/", icon: "⊞", label: "Dashboard" },
    { href: "/employees", icon: "👥", label: "Employés" },
    { href: "/leaves", icon: "🏖️", label: "Congés" },
    { href: "/notifications", icon: "🔔", label: "Notifications" },
    { href: "/payroll", icon: "💰", label: "Paie & Perf" },
];

export default function Sidebar() {
    const path = usePathname();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16
                    }}>☁</div>
                    <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>RH Cloud</div>
                        <div style={{ color: "#64748B", fontSize: 11 }}>MERN · K8s · GKE</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "16px 12px", flex: 1 }}>
                <div style={{
                    fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", padding: "0 12px", marginBottom: 8
                }}>
                    Menu principal
                </div>
                {nav.map(({ href, icon, label }) => {
                    const active = path === href;
                    return (
                        <Link key={href} href={href} style={{ textDecoration: "none" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "11px 14px", borderRadius: 10, marginBottom: 2,
                                background: active ? "rgba(59,130,246,0.15)" : "transparent",
                                color: active ? "#60A5FA" : "#94A3B8",
                                fontWeight: active ? 600 : 400, fontSize: 14,
                                transition: "all 0.15s",
                                cursor: "pointer",
                                borderLeft: active ? "3px solid #3B82F6" : "3px solid transparent",
                            }}>
                                <span style={{ fontSize: 16 }}>{icon}</span>
                                {label}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
                    <div style={{ color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Infrastructure</div>
                    <div>🟢 GKE · europe-west1</div>
                    <div>🟢 MongoDB · StatefulSet</div>
                    <div>🟢 HPA · 1-5 replicas</div>
                </div>
            </div>
        </aside>
    );
}