"use client";
import { useState, useEffect } from "react";
import Shell from "../components/Shell";
import PageHeader from "../components/PageHeader";
import { api } from "../../lib/api";
import type { Employee, PayslipResult, BatchPayrollResult, BenchmarkResult, PaginatedResponse } from "../../types";
import { Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PayrollPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payslip, setPayslip] = useState<PayslipResult | null>(null);
    const [batch, setBatch] = useState<BatchPayrollResult | null>(null);
    const [benchResults, setBench] = useState<BenchmarkResult[]>([]);
    const [running, setRunning] = useState(false);
    const [benchRun, setBenchRun] = useState(false);
    const [benchCount, setBenchCount] = useState(0);
    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

    useEffect(() => {
        const load = async () => {
            const r = await api.employees.list("?limit=100&status=active") as PaginatedResponse<Employee>;
            setEmployees(r.data ?? []);
        };
        void load();
    }, []);

    const calcPayslip = async () => {
        if (!selectedEmp) return;
        setRunning(true); setPayslip(null);
        try {
            const seniority = Math.floor(
                (Date.now() - new Date(selectedEmp.hireDate).getTime()) / (365.25 * 24 * 3600 * 1000)
            );
            const res = await api.payroll.calculate({
                name: `${selectedEmp.firstName} ${selectedEmp.lastName}`,
                salary: selectedEmp.salary,
                department: selectedEmp.department,
                contractType: selectedEmp.contractType,
                seniority,
            }) as PayslipResult;
            setPayslip(res);
        } finally { setRunning(false); }
    };

    const calcBatch = async () => {
        setRunning(true); setBatch(null);
        try {
            const res = await api.payroll.batch({
                employees: employees.map((e: Employee) => ({
                    name: `${e.firstName} ${e.lastName}`,
                    salary: e.salary,
                    department: e.department,
                    contractType: e.contractType,
                }))
            }) as BatchPayrollResult;
            setBatch(res);
        } finally { setRunning(false); }
    };

    const runBenchmark = async () => {
        setBenchRun(true); setBenchCount(0); setBench([]);
        for (let i = 0; i < 20; i++) {
            const r = await api.payroll.benchmark(40) as BenchmarkResult;
            setBench(p => [r, ...p].slice(0, 15));
            setBenchCount(i + 1);
        }
        setBenchRun(false);
    };

    const row = (label: string, value: string | number, highlight = false) => (
        <div className="flex justify-between py-2 border-b last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={cn("text-sm font-mono", highlight && "font-semibold text-foreground")}>
                {value}
            </span>
        </div>
    );

    return (
        <Shell>
            <PageHeader title="Paie & Performance" subtitle="Simulation de paie et benchmark HPA" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Simulateur */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Simulateur de fiche de paie</CardTitle>
                        <CardDescription className="text-xs">
                            Calcul individuel avec cotisations et primes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Employé</Label>
                            <Select onValueChange={id => {
                                const found = employees.find(e => e._id === id);
                                if (found) setSelectedEmp(found);
                            }}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Sélectionner un employé" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e._id} value={e._id}>
                                            {e.firstName} {e.lastName} — {e.department}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" size="sm" onClick={calcPayslip}
                            disabled={!selectedEmp || running}>
                            <Play size={13} className="mr-1.5" />
                            {running ? "Calcul..." : "Calculer"}
                        </Button>

                        {payslip && (
                            <div className="pt-2">
                                <Separator className="mb-3" />
                                {row("Salaire brut mensuel", `${payslip.gross.toLocaleString("fr")} €`)}
                                {row("Cotisations salariales", `− ${payslip.employeeContributions.toLocaleString("fr")} €`)}
                                {row("Net avant impôt", `${payslip.netBeforeTax.toLocaleString("fr")} €`)}
                                {row("Prime ancienneté", `+ ${payslip.seniorityBonus.toLocaleString("fr")} €`)}
                                {row("Prime performance", `+ ${payslip.perfBonus.toLocaleString("fr")} €`)}
                                {row("Tickets restaurant", `+ ${payslip.mealVouchers.toLocaleString("fr")} €`)}
                                <Separator className="my-2" />
                                {row("NET À PAYER", `${payslip.netTotal.toLocaleString("fr")} €`, true)}
                                <p className="text-[11px] text-muted-foreground font-mono mt-2">
                                    {payslip.durationMs}ms · {payslip.pod?.slice(0, 16)}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Masse salariale */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Masse salariale globale</CardTitle>
                        <CardDescription className="text-xs">
                            Traitement batch de tous les employés actifs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Lance le calcul simultané pour les {employees.length} employés actifs.
                            Intensif CPU — déclenche le HPA.
                        </p>
                        <Button className="w-full" size="sm" variant="outline"
                            onClick={calcBatch} disabled={running || employees.length === 0}>
                            <Play size={13} className="mr-1.5" />
                            {running ? "Traitement..." : `Batch (${employees.length} employés)`}
                        </Button>

                        {batch && (
                            <div className="pt-2">
                                <Separator className="mb-3" />
                                {row("Employés traités", batch.count)}
                                {row("Masse mensuelle", `${batch.totalPayroll.toLocaleString("fr")} €`, true)}
                                {row("Masse annuelle", `${(batch.totalPayroll * 12).toLocaleString("fr")} €`, true)}
                                <p className="text-[11px] text-muted-foreground font-mono mt-2">
                                    {batch.durationMs}ms · {batch.pod?.slice(0, 16)}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Benchmark */}
            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-sm font-semibold">Benchmark CPU — HPA</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            20 requêtes Fibonacci(40) — observer kubectl get hpa
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={runBenchmark} disabled={benchRun}
                        className="shrink-0">
                        <Zap size={13} className="mr-1.5" />
                        {benchRun ? `En cours (${benchCount}/20)` : "Lancer benchmark"}
                    </Button>
                </CardHeader>
                <CardContent>
                    {benchResults.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">#</TableHead>
                                    <TableHead className="text-xs">Pod</TableHead>
                                    <TableHead className="text-xs">Fibonacci(40)</TableHead>
                                    <TableHead className="text-xs">Éléments triés</TableHead>
                                    <TableHead className="text-xs text-right">Durée</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {benchResults.map((r: BenchmarkResult, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell className="text-xs text-muted-foreground font-mono">
                                            {benchResults.length - i}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {r.pod?.slice(0, 18)}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono">
                                            {r.input} → {r.fibonacci?.toLocaleString("fr")}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {r.sortedElements?.toLocaleString("fr")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={r.durationMs > 1500 ? "destructive" : r.durationMs > 800 ? "outline" : "secondary"}
                                                className="text-xs font-mono"
                                            >
                                                {r.durationMs}ms
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Shell>
    );
}