const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  employees: {
    list: (params = "") => request<any>(`/api/employees${params}`),
    stats: () => request<any>("/api/employees/stats"),
    get: (id: string) => request<any>(`/api/employees/${id}`),
    create: (data: any) =>
      request<any>("/api/employees", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/api/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/api/employees/${id}`, { method: "DELETE" }),
    seed: () => request<any>("/api/employees/seed", { method: "POST" }),
  },
  leaves: {
    list: (params = "") => request<any>(`/api/leaves${params}`),
    stats: () => request<any>("/api/leaves/stats"),
    create: (data: any) =>
      request<any>("/api/leaves", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, data: any) =>
      request<any>(`/api/leaves/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/api/leaves/${id}`, { method: "DELETE" }),
    seed: () => request<any>("/api/leaves/seed", { method: "POST" }),
  },
  notify: {
    list: (params = "") => request<any>(`/api/notify${params}`),
    stats: () => request<any>("/api/notify/stats"),
    create: (data: any) =>
      request<any>("/api/notify", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    markRead: (id: string) =>
      request<any>(`/api/notify/${id}/read`, { method: "PATCH" }),
    markAllRead: () =>
      request<any>("/api/notify/read-all", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    delete: (id: string) =>
      request<any>(`/api/notify/${id}`, { method: "DELETE" }),
    seed: () => request<any>("/api/notify/seed", { method: "POST" }),
  },
  payroll: {
    calculate: (data: any) =>
      request<any>("/api/payroll/calculate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    batch: (data: any) =>
      request<any>("/api/payroll/batch", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    stats: (data: any) =>
      request<any>("/api/payroll/stats", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    benchmark: (n = 38) => request<any>(`/api/compute?n=${n}`),
  },
};
