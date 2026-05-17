export default function StatCard({
    label, value, sub, color = "#3B82F6", icon
}: {
    label: string; value: string | number;
    sub?: string; color?: string; icon: string;
}) {
    return (
        <div className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>{label}</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</p>
                    {sub && <p style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>{sub}</p>}
                </div>
                <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${color}18`,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 22
                }}>{icon}</div>
            </div>
        </div>
    );
}