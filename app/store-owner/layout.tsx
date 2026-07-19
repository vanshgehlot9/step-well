"use client";

import { ProtectedRoute } from "@/components/protected-route";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    LogOut,
    Menu,
    X,
    AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getStoresByOwner } from "@/lib/firebase-services";
import { Store } from "@/lib/types";

const sidebarItems = [
    { href: "/store-owner", label: "Dashboard", icon: LayoutDashboard },
    { href: "/store-owner/products", label: "Products", icon: Package },
    { href: "/store-owner/orders", label: "Orders", icon: ShoppingBag },
    { href: "/store-owner/settings", label: "Settings", icon: Settings },
];

export default function StoreOwnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, signOut, loading: authLoading } = useAuth();
    
    const [myStore, setMyStore] = useState<Store | null>(null);
    const [loadingStore, setLoadingStore] = useState(true);

    useEffect(() => {
        if (user && !authLoading) {
            getStoresByOwner(user.uid).then(stores => {
                if (stores.length > 0) {
                    setMyStore(stores[0]);
                }
                setLoadingStore(false);
            }).catch(err => {
                console.error("Failed to load store for layout", err);
                setLoadingStore(false);
            });
        }
    }, [user, authLoading]);

    return (
        <ProtectedRoute allowedRoles={["store_owner", "admin"]}>
        <div className="min-h-screen bg-[#f0f4f8] text-primary-blue flex">
            <button
                onClick={() => setSidebarOpen((value) => !value)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white border border-surface-blue-dark text-primary-blue-light/70 hover:text-primary-blue hover:bg-surface-blue transition-all shadow-sm"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:static z-40 top-0 left-0 h-screen w-[280px] bg-white border-r border-surface-blue-dark flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="p-6 border-b border-surface-blue-dark">
                    <Link href="/store-owner" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">
                            {myStore ? myStore.name.charAt(0).toUpperCase() : "V"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-bold text-primary-blue tracking-wide truncate">
                                {loadingStore ? "Loading..." : (myStore ? myStore.name : "Vendor")}
                            </h1>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-primary-blue-light/50 font-bold truncate">
                                Store Dashboard
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/store-owner" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm" : "text-primary-blue-light/70 hover:text-primary-blue hover:bg-surface-blue"}`}
                            >
                                <item.icon
                                    size={18}
                                    className={isActive ? "text-amber-500" : "text-primary-blue-light/40 group-hover:text-primary-blue"}
                                />
                                <span className="flex-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-surface-blue-dark">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-surface-blue border border-surface-blue-dark flex items-center justify-center text-xs font-bold text-primary-blue">
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "V"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-primary-blue">
                                {user?.displayName || "Vendor User"}
                            </p>
                            <p className="text-[10px] text-primary-blue-light/70 font-medium truncate">
                                {user?.email || "Vendor Access"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col">
                {myStore?.status === 'PENDING' && (
                    <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 lg:px-10 lg:py-4 flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-amber-800 font-bold text-sm">Store Not Verified / Not Listed</p>
                            <p className="text-amber-700/80 text-xs">
                                Your store is currently under review. You can set up your products and dashboard, but your store will not be visible to the public until verified.
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="flex-1 p-6 pt-16 lg:p-10 lg:pt-10">
                    {children}
                </div>
            </main>
        </div>
        </ProtectedRoute>
    );
}
