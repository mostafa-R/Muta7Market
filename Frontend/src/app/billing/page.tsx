"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE, authHeaders } from "@/app/utils/api";

type Invoice = {
  id: string;
  createdAt: string;
  product: "contacts_access" | "player_listing";
  amount: number;
  currency: string;
  status: "pending" | "paid" | "cancelled" | "expired" | "failed" | "refunded";
  paymentUrl?: string | null;
  receiptUrl?: string | null;
  orderNumber: string;
  playerProfileId?: string | null;
  paidAt?: string | null;
};

async function fetchInvoices(status?: string): Promise<Invoice[]> {
  const u = status ? `${API_BASE}/payments/invoices?status=${status}` : `${API_BASE}/payments/invoices`;
  const res = await fetch(u, { headers: { ...authHeaders() } });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.message || "Failed to load invoices");
  return j?.data?.items ?? [];
}

export default function BillingPage() {
  const [pending, setPending] = useState<Invoice[]>([]);
  const [paid, setPaid] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [p1, p2] = await Promise.all([fetchInvoices("pending"), fetchInvoices("paid")]);
      setPending(p1); setPaid(p2);
    } catch (e: any) {
      alert(e?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-semibold">Billing</h1>

      <section>
        <h2 className="text-xl font-medium mb-3">To pay</h2>
        {loading ? <div>Loading…</div> : pending.length === 0 ? <div>No pending invoices.</div> : (
          <div className="space-y-3">
            {pending.map(inv => (
              <div key={inv.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {inv.product === "contacts_access" ? "Contacts access" : "Player listing"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(inv.createdAt).toLocaleString()} • {inv.amount} {inv.currency}
                  </div>
                </div>
                {inv.paymentUrl ? (
                  <a href={inv.paymentUrl} className="px-3 py-2 rounded bg-black text-white">Pay</a>
                ) : (
                  <span className="text-sm">No link</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-medium mb-3">Paid</h2>
        {loading ? <div /> : paid.length === 0 ? <div>No paid invoices yet.</div> : (
          <div className="space-y-3">
            {paid.map(inv => (
              <div key={inv.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {inv.product === "contacts_access" ? "Contacts access" : "Player listing"}
                  </div>
                  <div className="text-sm">
                    {inv.amount} {inv.currency}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Paid at {inv.paidAt ? new Date(inv.paidAt).toLocaleString() : "—"} • Order {inv.orderNumber}
                </div>
                {inv.receiptUrl ? (
                  <a href={inv.receiptUrl} target="_blank" className="text-blue-600 underline text-sm">View receipt</a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
