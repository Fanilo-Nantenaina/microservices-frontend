"use client";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";

const TYPES = ["info", "warning", "error"];

export default function NotifyPanel() {
    const [notifs, setNotifs] = useState<{ _id: string; message: string; type: string; read: boolean; createdAt: Date }[]>([]);
    const [msg, setMsg] = useState("");
    const [type, setType] = useState("info");

    const load = async () => setNotifs(await api.notify.list());

    useEffect(() => {
        const fetchNotifs = async () => {
            const notifList = await api.notify.list();
            setNotifs(notifList);
        };
        fetchNotifs();
    }, []);

    const add = async () => {
        if (!msg.trim()) return;
        await api.notify.create({ message: msg, type, read: false });
        setMsg("");
        await load();
    };

    const color = (t: string) =>
        t === "error" ? "text-red-500" : t === "warning" ? "text-yellow-500" : "text-blue-500";

    return (
        <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-lg font-bold mb-3 text-yellow-600">🔔 Notifications ({notifs.length})</h2>
            <div className="flex gap-2 mb-3">
                <input className="border rounded px-2 py-1 flex-1 text-sm" placeholder="Message..." value={msg} onChange={e => setMsg(e.target.value)} />
                <select className="border rounded px-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={add} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">+</button>
            </div>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
                {notifs.map((n: { _id: string; message: string; type: string; read: boolean; createdAt: Date }) => (
                    <li key={n._id} className={`text-sm bg-gray-50 px-2 py-1 rounded ${color(n.type)}`}>
                        [{n.type}] {n.message}
                        <span className="text-gray-500">({n.createdAt.toLocaleString()})</span>
                        <span className="text-gray-500">{n.read ? "Read" : "Unread"}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}