"use client";

import { ProtectedRoute } from "@/components/protected-route";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Globe,
  Handshake,
  Heart,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Info,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  PanelBottom,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const sidebarGroups: NavGroup[] = [
  {
    title: "PLATFORM MANAGEMENT",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/donations", label: "Donations", icon: Heart },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/businesses", label: "Businesses", icon: Building2 },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/volunteers", label: "Volunteers", icon: Users },
    ],
  },
  {
    title: "WEBSITE CMS",
    items: [
      { href: "/admin/cms/homepage", label: "Homepage", icon: Home },
      { href: "/admin/cms/about", label: "About Foundation", icon: Info },
      { href: "/admin/cms/featured-restorations", label: "Featured Restorations", icon: Sparkles },
      { href: "/admin/cms/projects-impact", label: "Projects & Impact", icon: Landmark },
      { href: "/admin/cms/recognition", label: "Recognition & Media", icon: Newspaper },
      { href: "/admin/cms/sponsors", label: "Sponsors & Partners", icon: Handshake },
      { href: "/admin/cms/marketplace", label: "Marketplace Content", icon: Store },
      { href: "/admin/cms/team", label: "Team & Leadership", icon: UsersRound },
      { href: "/admin/cms/get-involved", label: "Get Involved & Donations", icon: HeartHandshake },
      { href: "/admin/cms/footer", label: "Footer & Contact", icon: PanelBottom },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/settings", label: "Website Settings", icon: Settings },
      { href: "/admin/permissions", label: "Admin Permissions", icon: ShieldCheck },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stepwells_admin_sidebar_collapsed");
      if (saved === "true") setCollapsed(true);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("stepwells_admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isRouteActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  const activeItem = sidebarGroups
    .flatMap((g) => g.items)
    .find((item) => isRouteActive(item.href));

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#f0f4f8] text-primary-blue flex">
        {/* Mobile & Tablet Top Bar */}
        <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-surface-blue-dark px-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="p-2 rounded-lg bg-surface-blue border border-surface-blue-dark text-primary-blue hover:bg-surface-blue-dark/60 transition-all"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent-blue font-bold leading-none">
                Stepwells CMS
              </p>
              <p className="text-sm font-bold text-primary-blue truncate mt-0.5">
                {activeItem?.label || "Admin"}
              </p>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-blue border border-surface-blue-dark text-primary-blue hover:border-accent-blue transition-colors"
          >
            <Globe size={13} />
            Live Site
          </Link>
        </header>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky z-40 top-0 left-0 h-screen bg-white border-r border-surface-blue-dark flex flex-col transition-all duration-300 shrink-0 ${
            collapsed ? "lg:w-[82px] w-[280px]" : "w-[280px]"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {/* Brand Header */}
          <div
            className={`border-b border-surface-blue-dark flex items-center justify-between gap-2 ${
              collapsed ? "lg:px-3 lg:py-5 p-5" : "p-5"
            }`}
          >
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 min-w-0 ${collapsed ? "lg:justify-center lg:w-full" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D3B66] to-accent-blue flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-accent-blue/20 shrink-0">
                S
              </div>
              <div className={collapsed ? "lg:hidden" : ""}>
                <h1 className="text-base font-bold text-primary-blue tracking-wide leading-tight">
                  Stepwells
                </h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-primary-blue-light/50 font-bold">
                  Platform &amp; CMS
                </p>
              </div>
            </Link>

            <button
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg border border-surface-blue-dark text-primary-blue-light/60 hover:text-primary-blue hover:bg-surface-blue transition-colors shrink-0"
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto scrollbar-hide">
            {sidebarGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p
                  className={`px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-blue-light/45 mb-2 ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {group.title}
                </p>
                {collapsed && (
                  <div className="hidden lg:block h-px bg-surface-blue-dark mx-2 my-2" />
                )}

                {group.items.map((item) => {
                  const isActive = isRouteActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                        collapsed ? "lg:justify-center lg:px-2 lg:py-2.5 px-3.5 py-2.5" : "px-3.5 py-2.5"
                      } ${
                        isActive
                          ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shadow-sm font-semibold"
                          : "text-primary-blue-light/75 hover:text-primary-blue hover:bg-surface-blue border border-transparent"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={`shrink-0 ${
                          isActive
                            ? "text-accent-blue"
                            : "text-primary-blue-light/45 group-hover:text-primary-blue"
                        }`}
                      />
                      <span className={`flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight
                          size={14}
                          className={`text-accent-blue/60 shrink-0 ${collapsed ? "lg:hidden" : ""}`}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer / User / View Website */}
          <div className="p-3 border-t border-surface-blue-dark space-y-2">
            <Link
              href="/"
              target="_blank"
              title="View Public Website"
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-blue bg-surface-blue border border-surface-blue-dark hover:border-accent-blue transition-all ${
                collapsed ? "lg:justify-center lg:px-2" : ""
              }`}
            >
              <ExternalLink size={14} className="text-accent-blue shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>View Public Website</span>
            </Link>

            <div
              className={`flex items-center gap-3 px-2.5 py-2 ${
                collapsed ? "lg:justify-center" : ""
              }`}
            >
              <div
                title={user?.email || "Admin"}
                className="w-8 h-8 rounded-full bg-[#0D3B66] text-white flex items-center justify-center text-xs font-bold shrink-0"
              >
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "A"}
              </div>
              <div className={`flex-1 min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="text-xs font-bold truncate text-primary-blue">
                  {user?.displayName || "Admin User"}
                </p>
                <p className="text-[10px] text-primary-blue-light/65 font-medium truncate">
                  {user?.email || "Admin Access"}
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              title="Sign Out"
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-all ${
                collapsed ? "lg:justify-center lg:px-2" : ""
              }`}
            >
              <LogOut size={15} className="shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
          <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
