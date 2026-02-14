"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Heart,
    ShoppingBag,
    Package,
    Building2,
    Users,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";

const sidebarItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/donations", label: "Donations", icon: Heart },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/projects", label: "Projects", icon: Building2 },
    { href: "/admin/volunteers", label: "Volunteers", icon: Users },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAdmin, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Only check auth on non-login pages
        if (pathname === "/admin/login") {
            return;
        }

        if (!user) {
            router.replace("/admin/login");
            return;
        }

        if (!isAdmin) {
            router.replace("/admin/login?error=unauthorized");
            return;
        }
    }, [user, loading, isAdmin, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                    <p className="text-white/50 text-sm tracking-widest uppercase">Loading</p>
                </div>
            </div>
        );
    }

    // Allow login page to render without auth check
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // For non-admin routes, redirect (handled by useEffect above)
    if (!user || !isAdmin) {
        // Return null for non-authenticated users - the redirect will handle it
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static z-40 top-0 left-0 h-screen w-[280px] bg-[#0d0d14] border-r border-white/[0.06] flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="p-6 border-b border-white/[0.06]">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-accent-blue/20">
                            S
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-wide">Stepwells</h1>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">
                                Admin Panel
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <item.icon
                                    size={18}
                                    className={
                                        isActive
                                            ? "text-accent-blue"
                                            : "text-white/30 group-hover:text-white/60"
                                    }
                                />
                                <span className="flex-1">{item.label}</span>
                                {isActive && (
                                    <ChevronRight size={14} className="text-accent-blue/50" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white/80">
                                {user.displayName || "Admin"}
                            </p>
                            <p className="text-[10px] text-white/30 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="p-6 pt-16 lg:p-10 lg:pt-10">{children}</div>
            </main>
        </div>
    );
}
