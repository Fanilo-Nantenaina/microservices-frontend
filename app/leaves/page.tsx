"use client";
import { useState, useEffect } from "react";
import Shell from "../components/Shell";
import PageHeader from "../components/PageHeader";
import { api } from "../../lib/api";
import type {
    Leave, LeaveFormData, LeaveStats, LeaveStatus, LeaveType,
    LeaveStatusStat, PaginatedResponse, Employee
} from "../../types";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const LEAVE_TYPES: LeaveType[] = [
    "Congé Payé", "RTT", "Maladie", "Maternité", "Paternité", "Sans Solde", "Exceptionnel"
];
const STATUS_CONFIG: Record<LeaveStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "En attente", variant: "outline" },
    approved: { label: "Approuvé", variant: "default" },
    rejected: { label: "Refusé", variant: "destructive" },
    cancelled: { label: "Annulé", variant: "secondary" },
};

const EMPTY: LeaveFormData = {
    employeeId: "", employeeName: "", department: "",
    type: "Congé Payé", startDate: "", endDate: "", days: "", reason: ""
};

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [stats, setStats] = useState<LeaveStats | null>(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusF, setStatusF] = useState("all");
    const [typeF, setTypeF] = useState("all");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<LeaveFormData>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const p = new URLSearchParams();
                if (statusF !== "all") p.set("status", statusF);
                if (typeF !== "all") p.set("type", typeF);
                p.set("limit", "50");
                const [lv, st] = await Promise.all([
                    api.leaves.list(`?${p}`) as Promise<PaginatedResponse<Leave>>,
                    api.leaves.stats() as Promise<LeaveStats>,
                ]);
                setLeaves(lv.data ?? []);
                setTotal(lv.total ?? 0);
                setStats(st);
            } finally { setLoading(false); }
        };
        void load();
    }, [statusF, typeF]);

    useEffect(() => {
        const load = async () => {
            const r = await api.employees.list("?limit=100&status=active") as PaginatedResponse<Employee>;
            setEmployees(r.data ?? []);
        };
        void load();
    }, []);

    const selectEmp = (id: string) => {
        const emp = employees.find(e => e.employeeId === id || e._id === id);
        if (!emp) return;
        setForm(p => ({
            ...p,
            employeeId: emp.employeeId,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
        }));
    };

    const save = async () => {
        setSaving(true); setError("");
        try {
            await api.leaves.create({ ...form, days: Number(form.days) });
            setOpen(false);
            setStatusF(s => s);
        } catch (e) { setError((e as Error).message); }
        finally { setSaving(false); }
    };

    const updateStatus = async (id: string, status: LeaveStatus) => {
        await api.leaves.updateStatus(id, { status, approvedBy: "RH Dashboard" });
        setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
        if (stats) {
            const pending = status === "pending"
                ? stats.pending + 1
                : Math.max(0, stats.pending - 1);
            setStats({ ...stats, pending });
        }
    };

    const f = (k: keyof LeaveFormData, v: string) => setForm(p => ({ ...p, [k]: v }));
    const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR");

    return (
        <Shell>
            <PageHeader
                title="Congés"
                subtitle={`${total} demandes`}
                action={
                    <Button size="sm" onClick={() => { setForm(EMPTY); setError(""); setOpen(true); }}>
                        <Plus size={14} className="mr-1" /> Nouvelle demande
                    </Button>
                }
            />

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-3 mb-5">
                    {(Object.entries(STATUS_CONFIG) as [LeaveStatus, typeof STATUS_CONFIG[LeaveStatus]][]).map(([key, cfg]) => {
                        const found = stats.byStatus?.find((s: LeaveStatusStat) => s._id === key);
                        return (
                            <Card key={key} className="cursor-pointer" onClick={() => setStatusF(statusF === key ? "all" : key)}>
                                <CardContent className="p-4">
                                    <p className="text-2xl font-bold">{found?.count ?? 0}</p>
                                    <Badge variant={cfg.variant} className="mt-1 text-xs">{cfg.label}</Badge>
                                    <p className="text-xs text-muted-foreground mt-1">{found?.totalDays ?? 0}j total</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Filtres */}
            <Card className="mb-5">
                <CardContent className="p-3 flex gap-3">
                    <Select value={statusF} onValueChange={setStatusF}>
                        <SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[LeaveStatus]][]).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={typeF} onValueChange={setTypeF}>
                        <SelectTrigger className="w-[200px] h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            {LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {(statusF !== "all" || typeF !== "all") && (
                        <Button variant="ghost" size="sm" className="h-8"
                            onClick={() => { setStatusF("all"); setTypeF("all"); }}>
                            Réinitialiser
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Tableau */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employé</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Période</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Motif</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : leaves.map(l => {
                            const cfg = STATUS_CONFIG[l.status];
                            return (
                                <TableRow key={l._id}>
                                    <TableCell>
                                        <p className="font-medium text-sm">{l.employeeName}</p>
                                        <p className="text-xs text-muted-foreground">{l.department}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs font-normal">{l.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {fmt(l.startDate)} → {fmt(l.endDate)}
                                    </TableCell>
                                    <TableCell className="text-sm font-semibold">{l.days}j</TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                                        {l.reason || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {l.status === "pending" && (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7"
                                                    onClick={() => updateStatus(l._id, "approved")}>
                                                    <Check size={12} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                                                    onClick={() => updateStatus(l._id, "rejected")}>
                                                    <X size={12} />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle demande de congé</DialogTitle>
                    </DialogHeader>
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
                    )}
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Employé *</Label>
                            <Select value={form.employeeId} onValueChange={selectEmp}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e._id} value={e.employeeId}>
                                            {e.firstName} {e.lastName} ({e.employeeId})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Type *</Label>
                            <Select value={form.type} onValueChange={v => f("type", v)}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {([
                                ["Début *", "startDate", "date"],
                                ["Fin *", "endDate", "date"],
                                ["Nb jours *", "days", "number"],
                            ] as [string, keyof LeaveFormData, string][]).map(([label, key, type]) => (
                                <div key={key} className="space-y-1.5">
                                    <Label className="text-xs">{label}</Label>
                                    <Input className="h-8 text-sm" type={type} value={form[key] as string}
                                        onChange={e => f(key, e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Motif</Label>
                            <Input className="h-8 text-sm" value={form.reason}
                                placeholder="Raison de la demande..."
                                onChange={e => f("reason", e.target.value)} />
                        </div>
                    </div>
                    <Separator />
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button size="sm" onClick={save} disabled={saving}>
                            {saving ? "Envoi..." : "Soumettre"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Shell>
    );
}