"use client";

import { API_BASE, authHeaders } from "@/app/utils/api";
import { useState } from "react";

export default function PayContactsButton({
  className,
  children = "Unlock contacts (55 SAR)",
}: { className?: string; children?: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const start = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ product: "contacts_access" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to start payment");
      const url = json?.data?.paymentUrl;
      if (!url) throw new Error("No payment URL returned");
      window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={start} disabled={loading} className={className}>
      {loading ? "Opening…" : children}
    </button>
  );
}
