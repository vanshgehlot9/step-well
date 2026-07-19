"use client";

import { Award, CheckCircle, Clock, Crown, Medal, ShieldAlert, Store, Users, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getStores, updateStore, deleteStore } from "@/lib/firebase-services";
import { Store as StoreType } from "@/lib/types";
import { StoreModal } from "@/components/store-modal";

const levelMeta = {
    gold: { icon: Crown, label: "Gold" },
    silver: { icon: Award, label: "Silver" },
    bronze: { icon: Medal, label: "Bronze" },
} as const;

const statusMeta = {
    approved: { icon: CheckCircle, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending: { icon: Clock, className: "bg-amber-100 text-amber-700 border-amber-200" },
    suspended: { icon: ShieldAlert, className: "bg-red-100 text-red-700 border-red-200" },
} as const;

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<StoreType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

    const loadStores = useCallback(async () => {
        setLoading(true);
        try {
            const stores = await getStores();
            setBusinesses(stores);
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStores();
    }, [loadStores]);

    const handleEdit = (store: StoreType) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedStore(null);
        setIsModalOpen(true);
    };

    const handleApprove = async (id: string) => {
        try {
            await updateStore(id, { status: "ACTIVE" });
            loadStores();
        } catch (error) {
            console.error("Failed to approve:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this business?")) return;
        try {
            await deleteStore(id);
            loadStores();
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-primary-blue mb-1">Businesses</h1>
                    <p className="text-primary-blue-light/70 text-sm font-medium">Manage storefronts and business profiles.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-primary-blue font-bold text-sm hover:bg-accent-blue/90 transition-all shadow-sm"
                >
                    <Store size={16} /> Add Business
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-primary-blue">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-blue-light/50" />
                        Loading businesses...
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-surface-blue-dark bg-white p-5 flex items-center justify-center text-center text-primary-blue-light/70 min-h-[180px]">
                        <div className="space-y-2">
                            <Store size={28} className="mx-auto text-primary-blue-light/30" />
                            <p className="text-sm font-medium">No businesses registered yet.</p>
                        </div>
                    </div>
                ) : businesses.map((business) => {
                    const statusKey = business.status?.toLowerCase() || 'pending';
                    const StatusIcon = statusMeta[statusKey as keyof typeof statusMeta]?.icon || statusMeta.pending.icon;

                    return (
                        <div key={business.id} className="rounded-2xl border border-surface-blue-dark bg-white shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-primary-blue">{business.name}</h3>
                                    <p className="text-xs text-primary-blue-light/70 mt-1 font-medium">{business.location}</p>
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusMeta[statusKey as keyof typeof statusMeta]?.className || statusMeta.pending.className}`}>
                                    <StatusIcon size={12} /> {business.status}
                                </span>
                            </div>



                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <button 
                                    onClick={() => handleEdit(business)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-primary-blue text-sm font-medium hover:border-accent-blue hover:text-accent-blue transition-all"
                                >
                                    Edit Profile
                                </button>
                                {business.status !== 'ACTIVE' && (
                                    <button 
                                        onClick={() => handleApprove(business.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium hover:bg-accent-blue/20 transition-all"
                                    >
                                        Approve Listing
                                    </button>
                                )}
                                <div className="flex-grow" />
                                <button 
                                    onClick={() => handleDelete(business.id)}
                                    className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                                    title="Delete Business"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Approved", value: businesses.filter(b => b.status === "ACTIVE").length.toString() },
                    { label: "Pending", value: businesses.filter(b => b.status === "PENDING").length.toString() },
                    { label: "Suspended", value: businesses.filter(b => b.status === "INACTIVE").length.toString() },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-surface-blue-dark bg-white shadow-sm p-6">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary-blue-light/70">{item.label}</p>
                        <p className="text-3xl font-bold text-primary-blue mt-2">{item.value}</p>
                    </div>
                ))}
            </div>
            <StoreModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                store={selectedStore}
                onSaved={loadStores}
            />
        </div>
    );
}

