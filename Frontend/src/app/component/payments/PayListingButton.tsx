"use client";

import { API_BASE, authHeaders } from "@/app/utils/api";
import { useState } from "react";

export default function PayListingButton({
  playerProfileId,
  className,
  children = "List my profile (55 SAR)",
}: { playerProfileId: string; className?: string; children?: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const start = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ product: "player_listing", playerProfileId }),
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
