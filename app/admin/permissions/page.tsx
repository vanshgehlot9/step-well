"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllUsers, updateUserPermissions } from "@/lib/cms-services";
import { AdminPermissionSet, Role, UserProfile } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { Loader2, Search, ShieldCheck, UserCheck } from "lucide-react";

const PERMISSION_KEYS: { key: keyof AdminPermissionSet; label: string }[] = [
  { key: "canManageCMS", label: "Edit CMS Drafts" },
  { key: "canPublishCMS", label: "Publish / Unpublish" },
  { key: "canManageMedia", label: "Media Library" },
  { key: "canManageMarketplace", label: "Marketplace" },
  { key: "canManageDonations", label: "Donations & Volunteers" },
  { key: "canManagePermissions", label: "Admin Permissions" },
];

export default function AdminPermissionsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (err) {
      console.error("Failed loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const adminCount = useMemo(
    () => users.filter((u) => String(u.role).toLowerCase() === "admin").length,
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        String(u.role).toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleRoleChange = async (target: UserProfile, nextRole: Role) => {
    const isCurrentlyAdmin = String(target.role).toLowerCase() === "admin";
    if (isCurrentlyAdmin && nextRole !== "admin" && adminCount <= 1) {
      alert("Cannot demote the last remaining administrator.");
      return;
    }
    if (target.id === currentUser?.uid && nextRole !== "admin") {
      if (!confirm("You are changing your own admin role. Continue?")) return;
    }

    setSavingId(target.id);
    try {
      await updateUserPermissions(target.id, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u)));
      setNotice(`Updated role for ${target.email} to ${nextRole}.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed updating user role.");
    } finally {
      setSavingId(null);
    }
  };

  const togglePermission = async (target: UserProfile, key: keyof AdminPermissionSet) => {
    const currentPerms: AdminPermissionSet = target.permissions || {
      canManageCMS: true,
      canPublishCMS: true,
      canManageMedia: true,
      canManageMarketplace: true,
      canManageDonations: true,
      canManagePermissions: true,
    };
    const updated: AdminPermissionSet = {
      ...currentPerms,
      [key]: !currentPerms[key],
    };

    setSavingId(target.id);
    try {
      await updateUserPermissions(target.id, { permissions: updated });
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, permissions: updated } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed updating permissions.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent-blue font-bold mb-1">
          Security &amp; Access Control
        </p>
        <h1 className="font-serif text-3xl font-bold text-primary-blue">Admin Permissions</h1>
        <p className="text-xs md:text-sm text-primary-blue-light/70 mt-1">
          Manage platform roles and granular CMS permissions using your existing Firebase Authentication users.
        </p>

        {notice && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            {notice}
          </div>
        )}
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-blue-light/45"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by email, name, or role..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-16 text-center text-primary-blue-light/60">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-accent-blue" />
          Loading users...
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((u) => {
            const isUserAdmin = String(u.role).toLowerCase() === "admin";
            const perms: AdminPermissionSet = u.permissions || {
              canManageCMS: true,
              canPublishCMS: true,
              canManageMedia: true,
              canManageMarketplace: true,
              canManageDonations: true,
              canManagePermissions: true,
            };

            return (
              <div
                key={u.id}
                className="bg-white rounded-3xl border border-surface-blue-dark p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 ${
                        isUserAdmin ? "bg-[#0D3B66]" : "bg-slate-400"
                      }`}
                    >
                      {(u.displayName || u.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-primary-blue">
                          {u.displayName || u.email}
                        </p>
                        {u.id === currentUser?.uid && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary-blue-light/65">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {savingId === u.id && <Loader2 size={15} className="animate-spin text-accent-blue" />}
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                      className="px-3.5 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue outline-none focus:border-accent-blue"
                    >
                      <option value="admin">Admin (Full Access)</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="supporter">Supporter</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                </div>

                {isUserAdmin ? (
                  <div className="pt-3 border-t border-surface-blue-dark">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary-blue-light/55 mb-2.5 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-accent-blue" />
                      Granular Administrator Capabilities
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {PERMISSION_KEYS.map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-blue/50 border border-surface-blue-dark text-xs font-medium text-primary-blue cursor-pointer hover:border-accent-blue transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={perms[perm.key] !== false}
                            onChange={() => togglePermission(u, perm.key)}
                            className="accent-[#0D3B66]"
                          />
                          <span className="truncate">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-primary-blue-light/55 flex items-center gap-1.5 pt-2 border-t border-surface-blue-dark">
                    <UserCheck size={13} /> Non-admin users cannot access `/admin` or edit CMS content.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
