"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { InitiativeFull, INITIATIVE_CATEGORIES } from "@/lib/initiatives-types";
import {
  deleteInitiativeFull,
  getAllInitiativesAdmin,
  setInitiativeFeatured,
  toggleInitiativePublish,
  updateInitiativeDisplayOrder,
} from "@/lib/initiatives-services";
import { seedRealInitiatives } from "@/lib/initiatives-seed";
import {
  ArrowDown,
  ArrowUp,
  Database,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";

export default function AdminInitiativesPage() {
  const [initiatives, setInitiatives] = useState<InitiativeFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const [seeding, setSeeding] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<InitiativeFull | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadInitiatives = async () => {
    setLoading(true);
    try {
      const list = await getAllInitiativesAdmin();
      setInitiatives(list);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "permission-denied") {
        notify(
          "error",
          "Firestore permission denied for initiatives. Please publish the updated firestore.rules in Firebase Console → Firestore Database → Rules."
        );
      } else {
        console.warn("Failed loading initiatives:", err);
        notify("error", "Failed loading initiatives.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitiatives();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initiatives.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter !== "all" && item.publication_status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    });
  }, [initiatives, search, categoryFilter, statusFilter]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedRealInitiatives();
      notify(
        "success",
        `Seeded ${res.created} new initiative(s) (${res.skipped} existing preserved untouched).`
      );
      await loadInitiatives();
    } catch (err: unknown) {
      notify(
        "error",
        err instanceof Error ? err.message : "Failed seeding initiatives. Ensure Firestore rules are updated."
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleFeatured = async (item: InitiativeFull) => {
    await setInitiativeFeatured(item.id, !item.is_featured);
    await loadInitiatives();
  };

  const handleTogglePublish = async (item: InitiativeFull) => {
    const nextPub = item.publication_status !== "published";
    await toggleInitiativePublish(item.id, nextPub);
    notify("success", nextPub ? `Published "${item.title}".` : `Moved "${item.title}" to draft.`);
    await loadInitiatives();
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= filtered.length) return;
    const a = filtered[idx];
    const b = filtered[target];
    await Promise.all([
      updateInitiativeDisplayOrder(a.id, b.display_order || target + 1),
      updateInitiativeDisplayOrder(b.id, a.display_order || idx + 1),
    ]);
    await loadInitiatives();
  };

  const confirmDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      await deleteInitiativeFull(deletingTarget.id);
      notify("success", `Deleted "${deletingTarget.title}" and cleaned up unused media.`);
      setDeletingTarget(null);
      await loadInitiatives();
    } catch (err) {
      console.error(err);
      notify("error", "Failed to delete initiative.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent-blue font-bold mb-1">
              Website CMS · Dynamic Platform
            </p>
            <h1 className="font-serif text-3xl font-bold text-primary-blue">
              Initiatives Management
            </h1>
            <p className="text-xs md:text-sm text-primary-blue-light/70 mt-1">
              Create, edit, publish, order, and feature initiatives across <code className="font-mono">/initiatives</code> and the homepage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
              Seed Initial Initiatives
            </button>

            <Link
              href="/admin/initiatives/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 transition-all shadow-md"
            >
              <Plus size={15} /> Add Initiative
            </Link>
          </div>
        </div>

        {notice && (
          <div
            className={`mt-4 px-4 py-3 rounded-xl text-xs font-semibold border ${
              notice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-blue-light/45"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search initiatives by title, category, or location..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
        >
          <option value="all">All Categories</option>
          {INITIATIVE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
          className="px-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
        >
          <option value="all">All Statuses ({initiatives.length})</option>
          <option value="published">
            Published ({initiatives.filter((i) => i.publication_status === "published").length})
          </option>
          <option value="draft">
            Draft ({initiatives.filter((i) => i.publication_status === "draft").length})
          </option>
        </select>
      </div>

      {/* Listing Table */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-primary-blue-light/60 text-sm">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-accent-blue" />
            Loading initiatives...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-base font-bold text-primary-blue">No initiatives found</p>
            <p className="text-xs text-primary-blue-light/60 max-w-md mx-auto">
              Click &ldquo;Seed Initial Initiatives&rdquo; to populate the 6 real Stepwells Renovater initiatives into Firestore, or create a new one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-blue/50 border-b border-surface-blue-dark">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Order
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Image
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Title
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Category
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Featured
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Media
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Updated
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] uppercase tracking-wider text-primary-blue-light/70 font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-blue-dark">
                {filtered.map((item, idx) => {
                  const thumb =
                    item.cover_image ||
                    item.images.find((i) => i.is_primary)?.image_url ||
                    item.images[0]?.image_url;

                  return (
                    <tr key={item.id} className="hover:bg-surface-blue/25 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-primary-blue w-5">
                            {item.display_order}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded-lg bg-surface-blue border border-surface-blue-dark disabled:opacity-30"
                            title="Move up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 1)}
                            disabled={idx === filtered.length - 1}
                            className="p-1 rounded-lg bg-surface-blue border border-surface-blue-dark disabled:opacity-30"
                            title="Move down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-surface-blue border border-surface-blue-dark">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary-blue-light/30">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-[240px]">
                        <p className="font-serif font-bold text-primary-blue truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-primary-blue-light/55 truncate">
                          /initiatives/{item.slug}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-primary-blue">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          title="Click to toggle Draft / Published"
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                            item.publication_status === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {item.publication_status === "published" ? (
                            <>
                              <Eye size={11} /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff size={11} /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                            item.is_featured
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-surface-blue text-primary-blue-light/60 border-surface-blue-dark hover:border-amber-300"
                          }`}
                        >
                          <Star
                            size={11}
                            className={item.is_featured ? "fill-current" : ""}
                          />
                          {item.is_featured ? "Yes" : "No"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 text-xs text-primary-blue-light/70 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon size={13} className="text-accent-blue" />
                            {item.images.length}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Film size={13} className="text-accent-blue" />
                            {item.videos.length}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-primary-blue-light/65 whitespace-nowrap">
                        {new Date(item.updated_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/initiatives/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue"
                          >
                            <Pencil size={12} /> Edit
                          </Link>
                          <Link
                            href={`/initiatives/${item.slug}?preview=1`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue"
                          >
                            <Eye size={12} /> Preview
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingTarget(item)}
                            className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                            title="Delete Initiative"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTarget && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setDeletingTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-serif text-xl font-bold text-primary-blue">
              Delete Initiative?
            </h3>
            <p className="text-sm text-primary-blue-light/75">
              Are you sure you want to delete <strong>{deletingTarget.title}</strong>? All
              associated images, videos, links, and team entries for this initiative will be
              removed, and unused Cloudinary media will be cleaned up safely.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-primary-blue-light/70 hover:bg-surface-blue"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 inline-flex items-center gap-1.5"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
