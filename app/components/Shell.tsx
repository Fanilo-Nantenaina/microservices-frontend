import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full">
            <Sidebar />
            <main
                className="flex-1 overflow-auto p-6 md:p-8"
                style={{ marginLeft: "var(--sidebar-w)" }}
            >
                {children}
            </main>
        </div>
    );
}