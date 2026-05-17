"use client";
import { useState, useEffect } from "react";
import Shell from "../components/Shell";
import PageHeader from "../components/PageHeader";
import { api } from "../../lib/api";
import type {
    Notification, NotifFormData, NotifStats,
    NotifCategoryStat, NotifType, NotifCategory,
    NotifPriority, NotifResponse
} from "../../types";
import { Plus, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TYPE_VARIANT: Record<NotifType, "default" | "secondary" | "destructive" | "outline"> = {
    info: "outline",
    success: "default",
    warning: "secondary",
    error: "destructive",
};
const PRIORITY_LABEL: Record<NotifPriority, string> = {
    low: "Faible", medium: "Moyen", high: "Élevé", urgent: "Urgent"
};
const CATEGORIES: NotifCategory[] = ["conge", "paie", "rh", "systeme", "anniversaire", "contrat"];

const EMPTY: NotifFormData = {
    title: "", message: "", type: "info", category: "rh",
    priority: "medium", employeeId: "all", employeeName: "Tous"
};

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotifStats | null>(null);
    const [total, setTotal] = useState(0);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [catF, setCatF] = useState("all");
    const [readF, setReadF] = useState("all");
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<NotifFormData>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const p = new URLSearchParams();
                if (catF !== "all") p.set("category", catF);
                if (readF !== "all") p.set("read", readF);
                p.set("limit", "50");
                const [n, s] = await Promise.all([
                    api.notify.list(`?${p}`) as Promise<NotifResponse>,
                    api.notify.stats() as Promise<NotifStats>,
                ]);
                setNotifs(n.data ?? []);
                setTotal(n.total ?? 0);
                setUnread(n.unread ?? 0);
                setStats(s);
            } finally { setLoading(false); }
        };
        void load();
    }, [catF, readF]);

    const markRead = async (id: string) => {
        await api.notify.markRead(id);
        setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnread(u => Math.max(0, u - 1));
    };
    const markAll = async () => {
        await api.notify.markAllRead();
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    };
    const del = async (id: string) => {
        await api.notify.delete(id);
        setNotifs(prev => prev.filter(n => n._id !== id));
        setTotal(t => t - 1);
    };
    const save = async () => {
        setSaving(true);
        try { await api.notify.create(form); setOpen(false); setCatF(c => c); }
        finally { setSaving(false); }
    };

    const f = (k: keyof NotifFormData, v: string) => setForm(p => ({ ...p, [k]: v }));

    type SelectField = [string, keyof NotifFormData, string[]];
    const selectFields: SelectField[] = [
        ["Type", "type", ["info", "success", "warning", "error"] as NotifType[]],
        ["Catégorie", "category", CATEGORIES as string[]],
        ["Priorité", "priority", ["low", "medium", "high", "urgent"] as NotifPriority[]],
    ];

    return (
        <Shell>
            <PageHeader
                title="Notifications"
                subtitle={`${unread} non lues · ${total} au total`}
                action={
                    <div className="flex gap-2">
                        {unread > 0 && (
                            <Button variant="outline" size="sm" onClick={markAll}>
                                <CheckCheck size={14} className="mr-1" /> Tout marquer lu
                            </Button>
                        )}
                        <Button size="sm" onClick={() => { setForm(EMPTY); setOpen(true); }}>
                            <Plus size={14} className="mr-1" /> Envoyer
                        </Button>
                    </div>
                }
            />

            {/* Stats catégories */}
            {stats && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                    {(stats.byCategory ?? []).map((c: NotifCategoryStat) => (
                        <Card
                            key={c._id}
                            className={cn("cursor-pointer transition-colors", catF === c._id && "border-foreground")}
                            onClick={() => setCatF(catF === c._id ? "all" : c._id)}
                        >
                            <CardContent className="p-3 text-center">
                                <p className="text-xl font-bold">{c.count}</p>
                                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{c._id}</p>
                                {c.unread > 0 && (
                                    <p className="text-[10px] font-semibold mt-0.5">{c.unread} non lues</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filtres */}
            <Card className="mb-5">
                <CardContent className="p-3 flex gap-3">
                    <Select value={readF} onValueChange={setReadF}>
                        <SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="false">Non lues</SelectItem>
                            <SelectItem value="true">Lues</SelectItem>
                        </SelectContent>
                    </Select>
                    {catF !== "all" && (
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => setCatF("all")}>
                            Effacer filtre
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Liste */}
            <div className="space-y-2">
                {loading ? (
                    <p className="text-center py-12 text-muted-foreground text-sm">Chargement...</p>
                ) : notifs.map(n => (
                    <Card key={n._id} className={cn(!n.read && "border-l-2 border-l-foreground")}>
                        <CardContent className="p-4 flex gap-4 items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className={cn("text-sm", !n.read ? "font-semibold" : "font-normal text-muted-foreground")}>
                                            {n.title}
                                        </p>
                                        {!n.read && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-foreground inline-block" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant={TYPE_VARIANT[n.type]} className="text-xs">{n.type}</Badge>
                                        <span className="text-[11px] text-muted-foreground font-medium">
                                            {PRIORITY_LABEL[n.priority]}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[11px] text-muted-foreground">
                                        {n.employeeId === "all" ? "Tous" : n.employeeName}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] py-0">{n.category}</Badge>
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                {!n.read && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7"
                                        onClick={() => markRead(n._id)}>
                                        <Check size={12} />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                                    onClick={() => del(n._id)}>
                                    <Trash2 size={12} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle notification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Titre *</Label>
                            <Input className="h-8 text-sm" value={form.title}
                                onChange={e => f("title", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Message *</Label>
                            <Textarea className="text-sm resize-none" rows={3}
                                value={form.message} onChange={e => f("message", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {selectFields.map(([label, key, opts]) => (
                                <div key={key} className="space-y-1.5">
                                    <Label className="text-xs">{label}</Label>
                                    <Select value={form[key] as string} onValueChange={v => f(key, v)}>
                                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Separator />
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button size="sm" onClick={save} disabled={saving}>
                            {saving ? "Envoi..." : "Envoyer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Shell>
    );
}