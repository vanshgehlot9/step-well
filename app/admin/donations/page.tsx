"use client";

import { useEffect, useState } from "react";
import {
    ref,
    query,
    orderByChild,
    equalTo,
    get,
} from "firebase/database";
import { db } from "@/lib/firebase";
import { Download, Search, Filter, Heart } from "lucide-react";

interface Donation {
    id: string;
    donorName: string;
    amount: number;
    currency: string;
    status: string;
    razorpayPaymentId: string | null;
    receipt: string;
    message: string;
    createdAt: number;
}

export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchDonations();
    }, [statusFilter]);

    async function fetchDonations() {
        setLoading(true);
        try {
            let q;
            if (statusFilter === "all") {
                q = ref(db, "donations");
            } else {
                q = query(
                    ref(db, "donations"),
                    orderByChild("status"),
                    equalTo(statusFilter)
                );
            }
            const snapshot = await get(q);
            const data: Donation[] = [];
            snapshot.forEach((child) => {
                data.push({ id: child.key!, ...(child.val() as any) });
            });
            // Sort by createdAt desc
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            setDonations(data);
        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredDonations = donations.filter((d) =>
        d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.receipt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportCSV = () => {
        const headers = ["Receipt", "Donor", "Amount", "Currency", "Status", "Payment ID", "Date", "Message"];
        const rows = filteredDonations.map((d) => [
            d.receipt,
            d.donorName,
            d.amount,
            d.currency,
            d.status,
            d.razorpayPaymentId || "",
            d.createdAt ? new Date(d.createdAt).toISOString() : "",
            d.message || "",
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `donations_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    const statusColors: Record<string, string> = {
        completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        failed: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const totalCompleted = filteredDonations
        .filter((d) => d.status === "completed")
        .reduce((sum, d) => sum + (d.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Donations</h1>
                    <p className="text-white/40 text-sm">
                        Total received: ₹{totalCompleted.toLocaleString("en-IN")}
                    </p>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-medium"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                    />
                    <input
                        type="text"
                        placeholder="Search by donor or receipt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 outline-none text-sm appearance-none cursor-pointer min-w-[140px]"
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div className="p-12 text-center">
                        <Heart size={32} className="text-white/10 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">No donations found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                        Receipt
                                    </th>
                                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                        Donor
                                    </th>
                                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                        Amount
                                    </th>
                                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                        Date
                                    </th>
                                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                        Message
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredDonations.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-white/50">
                                            {d.receipt}
                                        </td>
                                        <td className="px-6 py-4 text-white/80 font-medium">
                                            {d.donorName}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white/80">
                                            ₹{d.amount?.toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[d.status] || "bg-white/5 text-white/40"}`}
                                            >
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/40 text-xs">
                                            {d.createdAt
                                                ? new Date(d.createdAt).toLocaleDateString(
                                                    "en-IN",
                                                    { day: "2-digit", month: "short", year: "numeric" }
                                                )
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-white/40 text-xs max-w-[200px] truncate">
                                            {d.message || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
