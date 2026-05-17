"use client";
import { useEffect, useState } from "react";
import Shell from "./components/Shell";
import PageHeader from "./components/PageHeader";
import { api } from "../lib/api";
import type {
  EmployeeStats, LeaveStats, NotifStats,
  Leave, PaginatedResponse
} from "../types";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Users, CalendarOff, Bell, TrendingUp,
  UserCheck, UserX, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const LEAVE_STATUS_LABEL: Record<string, string> = {
  pending: "En attente", approved: "Approuvé",
  rejected: "Refusé", cancelled: "Annulé",
};
const LEAVE_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline", approved: "default",
  rejected: "destructive", cancelled: "secondary",
};

const CHART_COLORS = ["#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7", "#f4f4f5"];

export default function Dashboard() {
  const [empStats, setEmpStats] = useState<EmployeeStats | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [notifStats, setNotifStats] = useState<NotifStats | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [e, l, n, lv] = await Promise.all([
          api.employees.stats() as Promise<EmployeeStats>,
          api.leaves.stats() as Promise<LeaveStats>,
          api.notify.stats() as Promise<NotifStats>,
          api.leaves.list("?limit=6&status=pending") as Promise<PaginatedResponse<Leave>>,
        ]);
        setEmpStats(e);
        setLeaveStats(l);
        setNotifStats(n);
        setRecentLeaves(lv.data ?? []);
      } finally { setLoading(false); }
    };
    void fetch();
  }, []);

  const seedAll = async () => {
    setSeeding(true);
    try {
      await Promise.all([
        api.employees.seed(),
        api.leaves.seed(),
        api.notify.seed(),
      ]);
      window.location.reload();
    } finally { setSeeding(false); }
  };

  const kpis = [
    {
      label: "Effectif total",
      value: empStats?.total ?? 0,
      sub: `Salaire moyen : ${(empStats?.avgSalary ?? 0).toLocaleString("fr")} €/an`,
      icon: Users,
    },
    {
      label: "Employés actifs",
      value: empStats?.byStatus?.find(s => s._id === "active")?.count ?? 0,
      sub: "Statut actif",
      icon: UserCheck,
    },
    {
      label: "Congés en attente",
      value: leaveStats?.pending ?? 0,
      sub: "Demandes à traiter",
      icon: CalendarOff,
    },
    {
      label: "Notifications",
      value: notifStats?.unread ?? 0,
      sub: `Sur ${notifStats?.total ?? 0} au total`,
      icon: Bell,
    },
  ];

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Chargement...
        </div>
      </Shell>
    );
  }

  const deptData = (empStats?.byDepartment ?? []).map(d => ({
    name: d._id, effectif: d.count,
    salaire: Math.round(d.avgSalary / 1000),
  }));

  const contractData = (empStats?.byContract ?? []).map(c => ({
    name: c._id, value: c.count,
  }));

  return (
    <Shell>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble des ressources humaines"
        action={
          <Button variant="outline" size="sm" onClick={seedAll} disabled={seeding}>
            {seeding ? "Chargement..." : "Initialiser les données"}
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <div className="p-2 rounded-md bg-secondary">
                  <Icon size={16} className="text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Effectifs par département */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Effectifs par département
            </CardTitle>
            <CardDescription className="text-xs">
              Nombre d&apos;employés et salaire moyen (k€)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12, border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))", color: "hsl(var(--foreground))",
                    borderRadius: 6,
                  }}
                />
                <Bar dataKey="effectif" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Types de contrats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Types de contrats</CardTitle>
            <CardDescription className="text-xs">Répartition par type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={contractData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {contractData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12, border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))", color: "hsl(var(--foreground))",
                    borderRadius: 6,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Congés en attente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Congés en attente</CardTitle>
            <CardDescription className="text-xs">Demandes à valider</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Aucune demande en attente
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Employé</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Durée</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeaves.map(l => (
                    <TableRow key={l._id}>
                      <TableCell className="text-sm font-medium">{l.employeeName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.type}</TableCell>
                      <TableCell className="text-xs">{l.days}j</TableCell>
                      <TableCell>
                        <Badge variant={LEAVE_STATUS_VARIANT[l.status] ?? "outline"} className="text-xs">
                          {LEAVE_STATUS_LABEL[l.status] ?? l.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Statuts employés */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Statuts des employés</CardTitle>
            <CardDescription className="text-xs">Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {(empStats?.byStatus ?? []).map(s => {
              const total = empStats?.total || 1;
              const pct = Math.round((s.count / total) * 100);
              const icons: Record<string, typeof UserCheck> = {
                active: UserCheck, inactive: UserX, onLeave: Clock
              };
              const labels: Record<string, string> = {
                active: "Actif", inactive: "Inactif", onLeave: "En congé"
              };
              const Icon = icons[s._id] ?? Users;
              return (
                <div key={s._id} className="flex items-center gap-3">
                  <Icon size={14} className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{labels[s._id] ?? s._id}</span>
                      <span className="text-muted-foreground">{s.count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Stats congés par type */}
            <div className="pt-3 border-t mt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Congés pris (approuvés)
              </p>
              <div className="space-y-2">
                {(leaveStats?.byType ?? []).slice(0, 4).map(t => (
                  <div key={t._id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t._id}</span>
                    <span className="font-medium">{t.totalDays}j · {t.count} dem.</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résumé notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Notifications par catégorie</CardTitle>
          <CardDescription className="text-xs">
            {notifStats?.unread ?? 0} non lues sur {notifStats?.total ?? 0} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(notifStats?.byCategory ?? []).map(c => (
              <div key={c._id} className="text-center p-3 rounded-md bg-secondary/50">
                <p className="text-xl font-bold">{c.count}</p>
                <p className="text-[11px] text-muted-foreground capitalize mt-1">{c._id}</p>
                {c.unread > 0 && (
                  <p className="text-[10px] font-semibold text-foreground mt-0.5">
                    {c.unread} non lues
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}