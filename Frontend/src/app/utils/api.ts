// "use client";
export const API_BASE = (() => {
    const v = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
    return v.endsWith("/api/v1") ? v : `${v}/api/v1`;
  })();
  
  export function authHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {} as Record<string, string>;
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {} as Record<string, string>;
  }
  