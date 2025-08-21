"use client";
import { useState } from "react";
import { Pin } from "lucide-react";

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
            // Ensure we have a profile id; if not, try to fetch my profile
            let pid = profileId;
            if (!pid) {
                try {
                    const r = await fetch(`${API_BASE}/players/playerprofile`, {
                        headers: { ...authHeaders() },
                    });
                    if (r.ok) {
                        const j = await r.json();
                        pid = j?.data?._id || j?._id;
                    }
                } catch { }
            }

            // NOTE: Do NOT send durationDays to avoid backend per-day branch
            // which requires PRICING.promotion_per_day. Yearly pricing is default.
            const draft = await apiPost("/payments/drafts", {
                product: "promotion",
                playerProfileId: pid,
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
        <>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex flex-row  gap-5 justify-center items-center px-5 w-full h-full">
                    <div className="my-auto text-lg">
                    <Pin className="w-10 h-10 " />
                        
                    </div>
                    <div>
                        <div className="font-bold text-lg">Promote your profile now!</div>
                        <div className=" text-base">
                            Boost your profile to the top of the list and get more visibility.
                        </div>
                        {/**/}

                    </div>
                    <button
                        onClick={go}
                        disabled={busy}
                        className="px-4 py-2 rounded-lg bg-[#0037b6] text-white hover:opacity-90 disabled:opacity-60">
                        {busy ? "Opening..." : "Promote now"}
                    </button>
                </div>
            </div>


        </>
    );
}
