"use client";

import { Download, Heart, Search, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { getDonations, getDonors } from "@/lib/firebase-services";
import { Donation, Donor } from "@/lib/types";

const statusColors: Record<string, string> = {
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminDonationsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [donations, setDonations] = useState<(Donation & { donorName: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [donationsData, donorsData] = await Promise.all([
                    getDonations(),
                    getDonors()
                ]);
                
                const donorMap = new Map(donorsData.map(d => [d.id, d.name]));
                
                const combined = donationsData.map(donation => ({
                    ...donation,
                    donorName: donorMap.get(donation.donorId) || "Anonymous"
                }));
                
                setDonations(combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Error loading donations:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredDonations = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return donations.filter((donation) => donation.donorName.toLowerCase().includes(search) || donation.transactionId.toLowerCase().includes(search));
    }, [searchTerm, donations]);

    const totalCompleted = donations.filter((donation) => donation.paymentStatus === "COMPLETED").reduce((sum, donation) => sum + donation.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-primary-blue mb-1">Donations</h1>
                    <p className="text-primary-blue-light/70 text-sm font-medium">Total received: ₹{totalCompleted.toLocaleString("en-IN")}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-blue-dark text-primary-blue-light/70 hover:text-primary-blue hover:border-accent-blue transition-all text-sm font-bold shadow-sm">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue-light/50" />
                <input
                    type="text"
                    placeholder="Search by donor or receipt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-primary-blue placeholder:text-primary-blue-light/50 focus:border-accent-blue outline-none text-sm shadow-sm"
                />
            </div>

            <div className="bg-white rounded-3xl border border-surface-blue-dark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-surface-blue/50">
                            <tr className="border-b border-surface-blue-dark">
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">Receipt</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">Donor</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">Amount</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">Status</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">Date</th>
                                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-blue-dark">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-primary-blue">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-blue-light/50" />
                                        Loading donations...
                                    </td>
                                </tr>
                            ) : filteredDonations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-primary-blue-light/70 font-medium">
                                        No donations found matching your search.
                                    </td>
                                </tr>
                            ) : filteredDonations.map((donation) => (
                                <tr key={donation.id} className="hover:bg-surface-blue/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-primary-blue-light/70">{donation.transactionId}</td>
                                    <td className="px-6 py-4 text-primary-blue font-bold">{donation.donorName}</td>
                                    <td className="px-6 py-4 font-bold text-primary-blue">₹{donation.amount.toLocaleString("en-IN")}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 font-bold rounded-full border ${statusColors[donation.paymentStatus]}`}>{donation.paymentStatus}</span>
                                    </td>
                                    <td className="px-6 py-4 text-primary-blue-light/70 text-xs font-medium">{new Date(donation.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                                    <td className="px-6 py-4 text-primary-blue-light/70 text-xs font-medium max-w-[220px] truncate">{donation.notes || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-12 text-center bg-white rounded-2xl border border-surface-blue-dark shadow-sm">
                <Heart size={32} className="text-primary-blue-light/30 mx-auto mb-3" />
                <p className="text-primary-blue-light/70 font-medium text-sm">Donation records are fetched securely from the backend.</p>
            </div>
        </div>
    );
}
