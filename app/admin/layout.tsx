"use client";

import { ProtectedRoute } from "@/components/protected-route";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Building2,
    ChevronRight,
    Heart,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ShoppingBag,
    Users,
    X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

const sidebarItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/donations", label: "Donations", icon: Heart },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/businesses", label: "Businesses", icon: Building2 },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/projects", label: "Projects", icon: Building2 },
    { href: "/admin/volunteers", label: "Volunteers", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, signOut } = useAuth();

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <ProtectedRoute allowedRoles={["admin"]}>
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
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-accent-blue/20">
                            S
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-primary-blue tracking-wide">Stepwells</h1>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-primary-blue-light/50 font-bold">
                                Admin Dashboard
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shadow-sm" : "text-primary-blue-light/70 hover:text-primary-blue hover:bg-surface-blue"}`}
                            >
                                <item.icon
                                    size={18}
                                    className={isActive ? "text-accent-blue" : "text-primary-blue-light/40 group-hover:text-primary-blue"}
                                />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="text-accent-blue/50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-surface-blue-dark">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-surface-blue border border-surface-blue-dark flex items-center justify-center text-xs font-bold text-primary-blue">
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-primary-blue">
                                {user?.displayName || "Admin User"}
                            </p>
                            <p className="text-[10px] text-primary-blue-light/70 font-medium truncate">
                                {user?.email || "Admin Access"}
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

            <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="p-6 pt-16 lg:p-10 lg:pt-10">{children}</div>
            </main>
        </div>
        </ProtectedRoute>
    );
}
