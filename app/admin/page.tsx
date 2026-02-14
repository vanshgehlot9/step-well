"use client";

import { useEffect, useState } from "react";
import { ref, query, orderByChild, limitToLast, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Heart, ShoppingBag, Users, Building2, TrendingUp, ArrowUpRight } from "lucide-react";

interface Stats {
    totalDonations: number;
    totalDonationAmount: number;
    totalOrders: number;
    totalVolunteers: number;
    totalProjects: number;
}

interface RecentDonation {
    id: string;
    donorName: string;
    amount: number;
    status: string;
    createdAt: any;
}

interface RecentOrder {
    id: string;
    orderRef: string;
    totalAmount: number;
    status: string;
    createdAt: any;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalDonations: 0,
        totalDonationAmount: 0,
        totalOrders: 0,
        totalVolunteers: 0,
        totalProjects: 0,
    });
    const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Get snapshots for counts (Note: RTDB downloads data for counts, optimized counters recommended for large scale)
                const [donationsSnap, ordersSnap, volunteersSnap, projectsSnap] =
                    await Promise.all([
                        get(ref(db, "donations")),
                        get(ref(db, "orders")),
                        get(ref(db, "volunteers")),
                        get(ref(db, "projects")),
                    ]);

                // Get recent donations (limitToLast gives most recent at the end, need to reverse)
                const donationsQuery = query(
                    ref(db, "donations"),
                    orderByChild("createdAt"),
                    limitToLast(5)
                );
                const donationsLeads = await get(donationsQuery);
                const donations: RecentDonation[] = [];
                donationsLeads.forEach((child) => {
                    donations.unshift({
                        id: child.key!,
                        ...child.val(),
                    });
                });

                let totalAmount = 0;
                // Calculate total amount from the full donations snapshot we already fetched
                donationsSnap.forEach((child) => {
                    const data = child.val();
                    if (data.status === "completed") {
                        totalAmount += data.amount || 0;
                    }
                });

                // Get recent orders
                const ordersQuery = query(
                    ref(db, "orders"),
                    orderByChild("createdAt"),
                    limitToLast(5)
                );
                const ordersLeads = await get(ordersQuery);
                const orders: RecentOrder[] = [];
                ordersLeads.forEach((child) => {
                    orders.unshift({
                        id: child.key!,
                        ...child.val(),
                    });
                });

                setStats({
                    totalDonations: donationsSnap.size,
                    totalDonationAmount: totalAmount,
                    totalOrders: ordersSnap.size,
                    totalVolunteers: volunteersSnap.size,
                    totalProjects: projectsSnap.size,
                });
                setRecentDonations(donations);
                setRecentOrders(orders);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const statCards = [
        {
            label: "Total Donations",
            value: `₹${stats.totalDonationAmount.toLocaleString("en-IN")}`,
            sub: `${stats.totalDonations} donations`,
            icon: Heart,
            color: "from-rose-500 to-pink-600",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
        },
        {
            label: "Shop Orders",
            value: stats.totalOrders.toString(),
            sub: "total orders",
            icon: ShoppingBag,
            color: "from-amber-500 to-orange-600",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
        },
        {
            label: "Volunteers",
            value: stats.totalVolunteers.toString(),
            sub: "registered",
            icon: Users,
            color: "from-emerald-500 to-green-600",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            label: "Projects",
            value: stats.totalProjects.toString(),
            sub: "restoration sites",
            icon: Building2,
            color: "from-accent-blue to-blue-600",
            bg: "bg-accent-blue/10",
            border: "border-accent-blue/20",
        },
    ];

    const statusColors: Record<string, string> = {
        completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        failed: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-white/5 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-white/40 text-sm">
                    Overview of your foundation's impact
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`p-6 rounded-2xl ${card.bg} border ${card.border} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
                            >
                                <card.icon size={18} className="text-white" />
                            </div>
                            <ArrowUpRight
                                size={16}
                                className="text-white/20 group-hover:text-white/40 transition-colors"
                            />
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                            {card.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Donations */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">
                            Recent Donations
                        </h2>
                        <TrendingUp size={16} className="text-white/20" />
                    </div>
                    {recentDonations.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-sm">
                            No donations yet
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {recentDonations.map((d) => (
                                <div
                                    key={d.id}
                                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors gap-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white/80">
                                            {d.donorName}
                                        </p>
                                        <p className="text-xs text-white/30">
                                            {d.createdAt
                                                ? new Date(d.createdAt).toLocaleDateString(
                                                    "en-IN"
                                                )
                                                : "—"}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                                        <p className="text-sm font-bold text-white/80">
                                            ₹{d.amount?.toLocaleString("en-IN")}
                                        </p>
                                        <span
                                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ml-2 sm:ml-0 sm:mt-1 ${statusColors[d.status] || "bg-white/5 text-white/40"}`}
                                        >
                                            {d.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">
                            Recent Orders
                        </h2>
                        <ShoppingBag size={16} className="text-white/20" />
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-sm">
                            No orders yet
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.04]">
                            {recentOrders.map((o) => (
                                <div
                                    key={o.id}
                                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors gap-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white/80 font-mono">
                                            {o.orderRef}
                                        </p>
                                        <p className="text-xs text-white/30">
                                            {o.createdAt
                                                ? new Date(o.createdAt).toLocaleDateString(
                                                    "en-IN"
                                                )
                                                : "—"}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0">
                                        <p className="text-sm font-bold text-white/80">
                                            ₹{o.totalAmount?.toLocaleString("en-IN")}
                                        </p>
                                        <span
                                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ml-2 sm:ml-0 sm:mt-1 ${statusColors[o.status] || "bg-white/5 text-white/40"}`}
                                        >
                                            {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
