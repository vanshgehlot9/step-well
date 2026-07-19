"use client";

import { useMemo, useState, useEffect } from "react";
import { Check, ChevronDown, CreditCard, Package, Search, ShoppingBag, Truck, Loader2 } from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/firebase-services";
import { Order } from "@/lib/types";

type OrderStatus = Order['status'];

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
    SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const nextStatusMap: Partial<Record<OrderStatus, { label: string; icon: any; nextStatus: OrderStatus }>> = {
    PENDING: { label: "Mark as Processing", icon: CreditCard, nextStatus: "PROCESSING" },
    PROCESSING: { label: "Mark as Shipped", icon: Truck, nextStatus: "SHIPPED" },
    SHIPPED: { label: "Mark as Delivered", icon: Check, nextStatus: "DELIVERED" },
};

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            const search = searchTerm.toLowerCase();
            const customerName = `${order.customerInfo.firstName} ${order.customerInfo.lastName}`;
            const matchesSearch = order.id.toLowerCase().includes(search) || customerName.toLowerCase().includes(search);
            return matchesStatus && matchesSearch;
        });
    }, [searchTerm, statusFilter, orders]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-primary-blue mb-1">Orders</h1>
                <p className="text-primary-blue-light/70 text-sm font-medium">Manage store orders and updates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue-light/50" />
                    <input
                        type="text"
                        placeholder="Search by order ref or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-primary-blue placeholder:text-primary-blue-light/50 focus:border-accent-blue outline-none text-sm shadow-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-primary-blue outline-none text-sm shadow-sm focus:border-accent-blue"
                >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                </select>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-primary-blue">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-blue-light/50" />
                        Loading orders...
                    </div>
                ) : filteredOrders.map((order) => {
                    const customerName = `${order.customerInfo.firstName} ${order.customerInfo.lastName}`;
                    return (
                    <div key={order.id} className="bg-white rounded-2xl border border-surface-blue-dark shadow-sm overflow-hidden">
                        <button
                            className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-blue/50 transition-colors text-left"
                            onClick={() => setExpandedOrder((current) => (current === order.id ? null : order.id))}
                        >
                            <div>
                                <p className="text-sm font-mono font-bold text-primary-blue">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-primary-blue-light/70">{customerName} · {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors['PENDING']}`}>{order.status}</span>
                                <span className="text-sm font-bold text-primary-blue">₹{order.total.toLocaleString("en-IN")}</span>
                                <ChevronDown size={16} className={`text-primary-blue-light/50 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                            </div>
                        </button>

                        {expandedOrder === order.id && (
                            <div className="px-6 pb-6 border-t border-surface-blue-dark pt-4 space-y-4 bg-surface-blue/20">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div className="rounded-xl bg-white p-4 border border-surface-blue-dark text-primary-blue font-medium shadow-sm">
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary-blue-light/70 mb-1">Items</p>
                                        {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                                    </div>
                                    <div className="rounded-xl bg-white p-4 border border-surface-blue-dark text-primary-blue font-medium shadow-sm">
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary-blue-light/70 mb-1">Payment</p>
                                        {order.paymentStatus}
                                    </div>
                                    <div className="rounded-xl bg-white p-4 border border-surface-blue-dark text-primary-blue font-medium shadow-sm">
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary-blue-light/70 mb-1">Delivery</p>
                                        {order.customerInfo.address}, {order.customerInfo.city}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {nextStatusMap[order.status] && (
                                        <button 
                                            onClick={() => handleUpdateStatus(order.id, nextStatusMap[order.status]!.nextStatus)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium hover:bg-accent-blue/20 transition-all"
                                        >
                                            {(() => {
                                                const Icon = nextStatusMap[order.status]!.icon;
                                                return <Icon size={14} />;
                                            })()}
                                            {nextStatusMap[order.status]!.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )})}

                {!loading && filteredOrders.length === 0 && (
                    <div className="p-12 text-center bg-white rounded-2xl border border-surface-blue-dark shadow-sm">
                        <ShoppingBag size={32} className="text-primary-blue-light/30 mx-auto mb-3" />
                        <p className="text-primary-blue-light/70 font-medium text-sm">No orders match this filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}
