export default function PageHeader({
    title, subtitle, action
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>{title}</h1>
                {subtitle && <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}