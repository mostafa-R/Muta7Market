"use client";
import { useState } from "react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:5000/api/v1";

function authHeaders() {
    if (typeof window === "undefined") return {};
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}
async function apiPost(path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body || {}),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.message || "Request failed");
    return j;
}

export default function PromoteNowButton({ profileId, days = 365 }) {
    const [busy, setBusy] = useState(false);

    const go = async () => {
        try {
            setBusy(true);
            const draft = await apiPost("/payments/drafts", {
                product: "promotion",
                profileId,
                durationDays: days,
            });
            const id = draft?.data?.id;
            const init = await apiPost(`/payments/invoices/${id}/initiate`);
            const url = init?.data?.paymentUrl;
            if (!url) throw new Error("No paymentUrl");
            window.location.href = url;
        } catch (e) {
            alert(e?.message || "Payment error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={go}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-[#00183D] text-white hover:opacity-90 disabled:opacity-60"
        >
            {busy ? "Opening..." : "Promote now"}
        </button>
    );
}
