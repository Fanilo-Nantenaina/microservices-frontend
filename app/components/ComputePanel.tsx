"use client";
import { useState } from "react";
import { api } from "../../lib/api";

export default function ComputePanel() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any[]>([]);
    const [running, setRunning] = useState(false);
    const [count, setCount] = useState(0);

    const runOnce = async () => {
        const res = await api.compute.run(38);
        setResults(prev => [res, ...prev].slice(0, 10)); // garder les 10 derniers
        return res;
    };

    const runBenchmark = async () => {
        setRunning(true);
        setCount(0);
        setResults([]);
        // 20 requêtes séquentielles pour stresser le CPU
        for (let i = 0; i < 20; i++) {
            await runOnce();
            setCount(i + 1);
        }
        setRunning(false);
    };

    return (
        <div className="border rounded-lg p-4 bg-white shadow col-span-2">
            <h2 className="text-lg font-bold mb-3 text-red-600">⚡ Compute — Benchmark CPU</h2>
            <div className="flex gap-3 mb-4 items-center">
                <button
                    onClick={runOnce}
                    className="bg-orange-400 text-white px-4 py-2 rounded text-sm"
                >
                    1 requête
                </button>
                <button
                    onClick={runBenchmark}
                    disabled={running}
                    className="bg-red-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                >
                    {running ? `Benchmark... (${count}/20)` : "🔥 Lancer Benchmark (20 req)"}
                </button>
            </div>

            {/* Tableau des résultats — montre quel POD répond */}
            {results.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-2 py-1">Pod</th>
                                <th className="px-2 py-1">Fibonacci(n)</th>
                                <th className="px-2 py-1">Durée (ms)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-2 py-1 font-mono text-gray-500">{r.pod?.slice(0, 12)}</td>
                                    <td className="px-2 py-1">{r.input} → {r.fibonacci}</td>
                                    <td className={`px-2 py-1 font-bold ${r.durationMs > 500 ? "text-red-500" : "text-green-500"}`}>
                                        {r.durationMs}ms
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}