"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import { api } from "../../lib/api";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Legal", "Sales"];
const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Alternance"];
const STATUS_COLOR: Record<string, string> = {
    active: "#10B981", inactive: "#6B7280", onLeave: "#F59E0B"
};
const STATUS_LABEL: Record<string, string> = {
    active: "Actif", inactive: "Inactif", onLeave: "En congé"
};
const DEPT_COLOR: Record<string, string> = {
    Engineering: "#3B82F6", HR: "#8B5CF6", Finance: "#10B981",
    Marketing: "#F59E0B", Operations: "#EF4444", Legal: "#64748B", Sales: "#EC4899"
};

const EMPTY = {
    firstName: "", lastName: "", email: "", phone: "",
    position: "", department: "Engineering", contractType: "CDI",
    salary: "", city: "", skills: ""
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<any>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<any>(null);

    const load = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (deptFilter) params.set("department", deptFilter);
            if (statusFilter) params.set("status", statusFilter);
            params.set("limit", "50");
            const res = await api.employees.list(`?${params}`);
            setEmployees(res.data || []);
            setTotal(res.total || 0);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [search, deptFilter, statusFilter]);

    const openCreate = () => { setForm(EMPTY); setSelected(null); setError(""); setShowModal(true); };
    const openEdit = (e: any) => {
        setForm({ ...e, salary: e.salary, city: e.address?.city || "", skills: e.skills?.join(", ") || "" });
        setSelected(e);
        setError("");
        setShowModal(true);
    };

    const save = async () => {
        setSaving(true); setError("");
        try {
            const payload = {
                ...form,
                salary: Number(form.salary),
                skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                address: { city: form.city, country: "France" },
            };
            if (selected) await api.employees.update(selected._id, payload);
            else await api.employees.create(payload);
            setShowModal(false);
            load();
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    };

    const remove = async (id: string) => {
        if (!confirm("Supprimer cet employé ?")) return;
        await api.employees.delete(id);
        load();
    };

    const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <main className="main-content">
                <PageHeader
                    title="👥 Employés"
                    subtitle={`${total} collaborateurs`}
                    action={<button className="btn btn-primary" onClick={openCreate}>+ Nouvel employé</button>}
                />

                {/* Filtres */}
                <div className="card" style={{ padding: 16, marginBottom: 20, display: "flex", gap: 12 }}>
                    <input className="input" style={{ maxWidth: 280 }} placeholder="🔍 Rechercher..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="input" style={{ maxWidth: 180 }} value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}>
                        <option value="">Tous les départements</option>
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select className="input" style={{ maxWidth: 160 }} value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="onLeave">En congé</option>
                    </select>
                    {(search || deptFilter || statusFilter) && (
                        <button className="btn btn-ghost" onClick={() => { setSearch(""); setDeptFilter(""); setStatusFilter(""); }}>
                            ✕ Réinitialiser
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="card" style={{ overflow: "hidden" }}>
                    {loading ? (
                        <div style={{ padding: 60, textAlign: "center", color: "#94A3B8" }}>Chargement...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Employé</th><th>Poste</th><th>Département</th>
                                    <th>Contrat</th><th>Salaire</th><th>Statut</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((e: any) => (
                                    <tr key={e._id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                                    background: `${DEPT_COLOR[e.department] || "#64748B"}20`,
                                                    color: DEPT_COLOR[e.department] || "#64748B",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontWeight: 700, fontSize: 13
                                                }}>
                                                    {e.firstName[0]}{e.lastName[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "#0F172A" }}>
                                                        {e.firstName} {e.lastName}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#94A3B8" }}>{e.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: "#374151" }}>{e.position}</td>
                                        <td>
                                            <span className="badge" style={{
                                                background: `${DEPT_COLOR[e.department] || "#64748B"}18`,
                                                color: DEPT_COLOR[e.department] || "#64748B"
                                            }}>{e.department}</span>
                                        </td>
                                        <td style={{ fontSize: 13, color: "#64748B" }}>{e.contractType}</td>
                                        <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                                            {e.salary.toLocaleString("fr")} €
                                        </td>
                                        <td>
                                            <span className="badge" style={{
                                                background: `${STATUS_COLOR[e.status]}18`,
                                                color: STATUS_COLOR[e.status]
                                            }}>{STATUS_LABEL[e.status]}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}
                                                    onClick={() => openEdit(e)}>✏️ Modifier</button>
                                                <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 12 }}
                                                    onClick={() => remove(e._id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                                {selected ? "✏️ Modifier l'employé" : "➕ Nouvel employé"}
                            </h2>
                            {error && (
                                <div style={{
                                    background: "#FEE2E2", color: "#DC2626", padding: "10px 14px",
                                    borderRadius: 8, marginBottom: 16, fontSize: 14
                                }}>{error}</div>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                {[
                                    ["Prénom *", "firstName"], ["Nom *", "lastName"],
                                    ["Email *", "email"], ["Téléphone", "phone"],
                                    ["Poste *", "position"], ["Ville", "city"],
                                ].map(([label, key]) => (
                                    <div key={key}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
                                            {label}
                                        </label>
                                        <input className="input" value={form[key]} onChange={e => f(key, e.target.value)} />
                                    </div>
                                ))}

                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
                                        Département *
                                    </label>
                                    <select className="input" value={form.department} onChange={e => f("department", e.target.value)}>
                                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
                                        Contrat
                                    </label>
                                    <select className="input" value={form.contractType} onChange={e => f("contractType", e.target.value)}>
                                        {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
                                        Salaire annuel (€)
                                    </label>
                                    <input className="input" type="number" value={form.salary} onChange={e => f("salary", e.target.value)} />
                                </div>

                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
                                        Statut
                                    </label>
                                    <select className="input" value={form.status} onChange={e => f("status", e.target.value)}>
                                        <option value="active">Actif</option>
                                        <option value="inactive">Inactif</option>
                                        <option value="onLeave">En congé</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>
                                        Compétences (séparées par des virgules)
                                    </label>
                                    <input className="input" value={form.skills}
                                        placeholder="React, Node.js, Docker..."
                                        onChange={e => f("skills", e.target.value)} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
                                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                                <button className="btn btn-primary" onClick={save} disabled={saving}>
                                    {saving ? "⏳ Enregistrement..." : "✅ Enregistrer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}