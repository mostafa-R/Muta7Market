"use client";

import { API_BASE, authHeaders } from "@/app/utils/api";
import { useState } from "react";

export default function PayListingButton({
  playerProfileId,
  className,
  children = "List my profile (1 year)",
}: { playerProfileId: string; className?: string; children?: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const start = async () => {
    try {
      setLoading(true);
      if (!playerProfileId) throw new Error("Missing playerProfileId");

      // Step 1: ensure draft invoice exists (DB only)
      const draftRes = await fetch(`${API_BASE}/payments/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ product: "listing", profileId: playerProfileId }),
      });
      const draftJson = await draftRes.json();
      if (!draftRes.ok || !draftJson?.success) {
        throw new Error(draftJson?.message || "Failed to create draft invoice");
      }
      const invoiceId = draftJson?.data?.id;
      if (!invoiceId) throw new Error("No invoice id returned");

      // Step 2: initiate checkout with Paylink
      const initRes = await fetch(`${API_BASE}/payments/invoices/${invoiceId}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      const initJson = await initRes.json();
      if (!initRes.ok || !initJson?.success) {
        throw new Error(initJson?.message || "Failed to start checkout");
      }
      const url = initJson?.data?.paymentUrl;
      if (!url) throw new Error("No paymentUrl from server");

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
