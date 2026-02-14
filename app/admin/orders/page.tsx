"use client";

import { useEffect, useState } from "react";
import {
    ref,
    query,
    orderByChild,
    equalTo,
    get,
} from "firebase/database";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import { ShoppingBag, Search, ChevronDown, Truck, CreditCard, Package, Check } from "lucide-react";

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Order {
    id: string;
    orderRef: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    paymentMethod: string;
    upiReference: string | null;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };
    createdAt: number;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    async function fetchOrders() {
        setLoading(true);
        try {
            let q;
            if (statusFilter === "all") {
                q = ref(db, "orders");
            } else {
                q = query(
                    ref(db, "orders"),
                    orderByChild("status"),
                    equalTo(statusFilter)
                );
            }
            const snapshot = await get(q);
            const data: Order[] = [];
            snapshot.forEach((child) => {
                data.push({ id: child.key!, ...(child.val() as any) });
            });
            // Client-side sort by createdAt desc
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateStatus(orderId: string, newStatus: string) {
        setUpdating(orderId);
        try {
            const updateOrderStatus = httpsCallable(functions, "updateOrderStatus");
            await updateOrderStatus({ orderId, status: newStatus });
            await fetchOrders();
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order status.");
        } finally {
            setUpdating(null);
        }
    }

    const filteredOrders = orders.filter(
        (o) =>
            o.orderRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColors: Record<string, string> = {
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const nextStatusMap: Record<string, { label: string; status: string; icon: any }> = {
        pending: { label: "Mark as Paid", status: "paid", icon: CreditCard },
        paid: { label: "Mark as Shipped", status: "shipped", icon: Truck },
        shipped: { label: "Mark as Delivered", status: "delivered", icon: Check },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Orders</h1>
                <p className="text-white/40 text-sm">
                    {orders.length} total orders
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search by order ref or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/20 focus:border-accent-blue outline-none text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 outline-none text-sm min-w-[140px]"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                        <ShoppingBag size={32} className="text-white/10 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden"
                        >
                            {/* Order Header */}
                            <div
                                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                                onClick={() =>
                                    setExpandedOrder(
                                        expandedOrder === order.id ? null : order.id
                                    )
                                }
                            >
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-mono font-medium text-white/70">
                                            {order.orderRef}
                                        </p>
                                        <p className="text-xs text-white/30">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString(
                                                    "en-IN",
                                                    { day: "2-digit", month: "short", year: "numeric" }
                                                )
                                                : "—"}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[order.status] || "bg-white/5"}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-white/70">
                                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-white/20 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order.id && (
                                <div className="px-6 pb-6 border-t border-white/[0.04] pt-4 space-y-4">
                                    {/* Items */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                                            Items
                                        </p>
                                        {order.items?.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]"
                                            >
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm text-white/70">{item.name}</p>
                                                    <p className="text-xs text-white/30">
                                                        ₹{item.price} × {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-white/60">
                                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Shipping Address */}
                                    {order.shippingAddress && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold mb-2">
                                                Shipping To
                                            </p>
                                            <div className="p-3 rounded-xl bg-white/[0.02] text-sm text-white/50">
                                                <p className="font-medium text-white/70">
                                                    {order.shippingAddress.name}
                                                </p>
                                                <p>{order.shippingAddress.address}</p>
                                                <p>
                                                    {order.shippingAddress.city},{" "}
                                                    {order.shippingAddress.state} —{" "}
                                                    {order.shippingAddress.pincode}
                                                </p>
                                                <p>{order.shippingAddress.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {nextStatusMap[order.status] && (
                                            <button
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        order.id,
                                                        nextStatusMap[order.status].status
                                                    )
                                                }
                                                disabled={updating === order.id}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium hover:bg-accent-blue/20 transition-all disabled:opacity-50"
                                            >
                                                {updating === order.id ? (
                                                    <div className="w-4 h-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        {(() => {
                                                            const Icon = nextStatusMap[order.status].icon;
                                                            return <Icon size={14} />;
                                                        })()}
                                                    </>
                                                )}
                                                {nextStatusMap[order.status].label}
                                            </button>
                                        )}
                                        {order.status !== "cancelled" &&
                                            order.status !== "delivered" && (
                                                <button
                                                    onClick={() =>
                                                        handleUpdateStatus(order.id, "cancelled")
                                                    }
                                                    disabled={updating === order.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/70 text-sm font-medium hover:bg-red-500/10 transition-all disabled:opacity-50"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
