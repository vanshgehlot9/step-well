"use client";

import { useEffect, useState } from "react";
import { FeaturedRestorationsCMS } from "@/lib/cms-types";
import { DEFAULT_FEATURED_RESTORATIONS_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import {
  getAllProjectsOrdered,
  publishProjectCMS,
  reorderProjectsCMS,
  seedInitialProjectsIfEmpty,
} from "@/lib/cms-services";
import { deleteProject } from "@/lib/firebase-services";
import { Project, ProjectMediaItem } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import {
  ArrowDown,
  ArrowUp,
  Database,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

const EMPTY_FORM: Omit<Project, "id" | "createdAt"> = {
  name: "",
  slug: "",
  location: "Jodhpur, Rajasthan",
  category: "Stepwell Restoration",
  status: "active",
  statusLabel: "Active",
  progress: 50,
  description: "",
  story: "",
  featuredImage: "",
  images: [],
  additionalMedia: [],
  featured: true,
  published: true,
  displayOrder: 1,
};

export default function FeaturedRestorationsCMSPage() {
  const { user } = useAuth();
  const userEmail = user?.email || "admin";

  const [sectionData, setSectionData] = useState<FeaturedRestorationsCMS>(
    DEFAULT_FEATURED_RESTORATIONS_CMS
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Project, "id" | "createdAt">>(EMPTY_FORM);
  const [savingProject, setSavingProject] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const list = await getAllProjectsOrdered();
      setProjects(list);
    } catch (err) {
      console.error("Failed loading restorations:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSeedInitial = async () => {
    setSeeding(true);
    try {
      const count = await seedInitialProjectsIfEmpty();
      if (count === 0) {
        alert("Projects collection already contains restoration records.");
      }
      await loadProjects();
    } finally {
      setSeeding(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, displayOrder: projects.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      location: p.location,
      category: p.category || "Stepwell Restoration",
      status: p.status,
      statusLabel: p.statusLabel || p.status,
      progress: p.progress,
      description: p.description,
      story: p.story || p.description,
      featuredImage: p.featuredImage || p.images?.[0] || "",
      images: p.images || [],
      additionalMedia: p.additionalMedia || [],
      featured: Boolean(p.featured),
      published: p.published !== false,
      displayOrder: p.displayOrder ?? 1,
    });
    setModalOpen(true);
  };

  const handleSaveProject = async (publishNow: boolean) => {
    if (!form.name || !form.location || !form.description) {
      alert("Please enter title, location, and description.");
      return;
    }
    setSavingProject(true);
    try {
      const existing = projects.find((p) => p.id === editingId);
      const mergedImages = Array.from(
        new Set([form.featuredImage, ...(form.images || [])].filter(Boolean) as string[])
      );
      await publishProjectCMS(
        editingId,
        {
          ...form,
          images: mergedImages,
          createdAt: existing?.createdAt,
        },
        userEmail,
        publishNow
      );
      setModalOpen(false);
      await loadProjects();
    } catch (err) {
      console.error(err);
      alert("Failed saving restoration project.");
    } finally {
      setSavingProject(false);
    }
  };

  const toggleFeatured = async (p: Project) => {
    await publishProjectCMS(p.id, { ...p, featured: !p.featured }, userEmail, p.published !== false);
    await loadProjects();
  };

  const togglePublished = async (p: Project) => {
    await publishProjectCMS(p.id, p, userEmail, p.published === false);
    await loadProjects();
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Delete "${p.name.replace(/\n/g, " ")}" from shared projects?`)) return;
    await deleteProject(p.id);
    await loadProjects();
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const copy = [...projects];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setProjects(copy);
    await reorderProjectsCMS(copy.map((p) => p.id));
  };

  const addGalleryImage = (url: string) => {
    if (!url) return;
    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
  };

  const addAdditionalMedia = () => {
    const newItem: ProjectMediaItem = {
      id: `pm-${Date.now()}`,
      type: "image",
      url: "",
      caption: "",
    };
    setForm((prev) => ({
      ...prev,
      additionalMedia: [...(prev.additionalMedia || []), newItem],
    }));
  };

  return (
    <div className="space-y-8">
      <CMSSectionShell
        section="featuredRestorations"
        title="Featured Restorations"
        description="Configure the homepage Featured Restorations showcase and curate restoration stories from the shared projects database."
        previewPath="/#projects"
        data={sectionData}
        setData={setSectionData}
      >
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Section Display Settings
            </h2>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue cursor-pointer">
              <input
                type="checkbox"
                checked={sectionData.visible}
                onChange={(e) => setSectionData({ ...sectionData, visible: e.target.checked })}
                className="accent-[#0D3B66] w-4 h-4"
              />
              Visible on Homepage
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Eyebrow
              </label>
              <input
                type="text"
                value={sectionData.eyebrow}
                onChange={(e) => setSectionData({ ...sectionData, eyebrow: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={sectionData.heading}
                onChange={(e) => setSectionData({ ...sectionData, heading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Card Tag Label
              </label>
              <input
                type="text"
                value={sectionData.sublabel}
                onChange={(e) => setSectionData({ ...sectionData, sublabel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                CTA Button Text
              </label>
              <input
                type="text"
                value={sectionData.ctaLabel}
                onChange={(e) => setSectionData({ ...sectionData, ctaLabel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>
        </div>
      </CMSSectionShell>

      {/* Shared Restoration Projects Curator */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary-blue">
              Restoration Projects Manager
            </h2>
            <p className="text-xs text-primary-blue-light/70 mt-0.5">
              Connected directly to the shared Firestore <code className="font-mono">projects</code> collection (no duplicate records). Featured &amp; published items appear in the homepage carousel and at <code className="font-mono">/projects/[slug]</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {projects.length === 0 && (
              <button
                type="button"
                onClick={handleSeedInitial}
                disabled={seeding}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100"
              >
                {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                Import Toorji Ka Jhalra &amp; Initial Restorations
              </button>
            )}
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 shadow-sm"
            >
              <Plus size={14} /> Add Restoration Project
            </button>
          </div>
        </div>

        {loadingProjects ? (
          <div className="py-12 text-center text-primary-blue-light/60 text-sm">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent-blue" />
            Loading restoration projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-surface-blue-dark rounded-2xl">
            <p className="text-sm font-semibold text-primary-blue">
              No restoration projects stored in Firestore yet.
            </p>
            <p className="text-xs text-primary-blue-light/60 mt-1">
              Click &ldquo;Import Toorji Ka Jhalra &amp; Initial Restorations&rdquo; above to migrate the existing website restorations into Firestore.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p, idx) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-surface-blue-dark bg-surface-blue/25 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="w-full md:w-32 h-24 rounded-xl bg-white border border-surface-blue-dark overflow-hidden shrink-0">
                  {p.featuredImage || p.images?.[0] ? (
                    <img
                      src={p.featuredImage || p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-primary-blue-light/40">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-surface-blue-dark text-primary-blue">
                      #{idx + 1} · {p.category || "Restoration"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                      {p.statusLabel || p.status}
                    </span>
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                        <Sparkles size={10} /> Featured
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        p.published !== false
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      {p.published !== false ? "Published" : "Unpublished"}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-primary-blue truncate">
                    {p.name.replace(/\n/g, " ")}
                  </h3>
                  <p className="text-xs text-primary-blue-light/65 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {p.location} · /projects/{p.slug}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, -1)}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-white border border-surface-blue-dark text-primary-blue disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOrder(idx, 1)}
                    disabled={idx === projects.length - 1}
                    className="p-2 rounded-xl bg-white border border-surface-blue-dark text-primary-blue disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFeatured(p)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                      p.featured
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-white border-surface-blue-dark text-primary-blue-light/70"
                    }`}
                  >
                    {p.featured ? "Featured" : "Feature"}
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublished(p)}
                    className="px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue inline-flex items-center gap-1"
                  >
                    {p.published !== false ? <EyeOff size={13} /> : <Eye size={13} />}
                    {p.published !== false ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="px-3 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restoration Edit / Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-surface-blue-dark flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-primary-blue">
                {editingId ? "Edit Restoration Project" : "New Restoration Project"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-blue text-primary-blue-light/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                    Project Title * (Use line break for 2-line display)
                  </label>
                  <textarea
                    rows={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                    placeholder="Toorji Ka Jhalra: From Neglect to Revival"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated if blank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as Project["status"],
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue bg-white"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={form.statusLabel || ""}
                      onChange={(e) => setForm({ ...form, statusLabel: e.target.value })}
                      placeholder="Revived / Active"
                      className="w-full px-3 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                  />
                </div>

                <div className="flex items-center gap-5 pt-5">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.featured)}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="accent-[#0D3B66] w-4 h-4"
                    />
                    Featured on Homepage
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Summary Description *
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Full Project Story (Separate paragraphs with blank lines)
                </label>
                <textarea
                  rows={5}
                  value={form.story || ""}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>

              <CMSMediaField
                label="Featured Hero Image"
                value={form.featuredImage || ""}
                onChange={(url) => setForm({ ...form, featuredImage: url })}
                section="restorations"
              />

              {/* Image Gallery */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70">
                  Image Gallery ({form.images.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {form.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-surface-blue-dark group"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            images: form.images.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <CMSMediaField
                  label="Add Photo to Gallery"
                  value=""
                  onChange={addGalleryImage}
                  section="restorations"
                />
              </div>

              {/* Additional Media */}
              <div className="space-y-3 pt-2 border-t border-surface-blue-dark">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70">
                    Additional Media (Videos / Captioned Photos)
                  </label>
                  <button
                    type="button"
                    onClick={addAdditionalMedia}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
                  >
                    <Plus size={12} /> Add Media Item
                  </button>
                </div>

                {(form.additionalMedia || []).map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={item.type}
                        onChange={(e) => {
                          const copy = [...(form.additionalMedia || [])];
                          copy[idx] = { ...item, type: e.target.value as "image" | "video" };
                          setForm({ ...form, additionalMedia: copy });
                        }}
                        className="px-2.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        type="text"
                        value={item.caption || ""}
                        onChange={(e) => {
                          const copy = [...(form.additionalMedia || [])];
                          copy[idx] = { ...item, caption: e.target.value };
                          setForm({ ...form, additionalMedia: copy });
                        }}
                        placeholder="Caption"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            additionalMedia: (form.additionalMedia || []).filter(
                              (m) => m.id !== item.id
                            ),
                          })
                        }
                        className="p-2 rounded-xl bg-red-50 text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <CMSMediaField
                      label="Media File"
                      value={item.url}
                      acceptType={item.type}
                      section="restorations"
                      onChange={(url) => {
                        const copy = [...(form.additionalMedia || [])];
                        copy[idx] = { ...item, url };
                        setForm({ ...form, additionalMedia: copy });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-surface-blue-dark flex flex-wrap items-center justify-end gap-3 bg-surface-blue/30">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-primary-blue-light/70 hover:bg-surface-blue"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingProject}
                onClick={() => handleSaveProject(false)}
                className="px-4 py-2.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue disabled:opacity-50"
              >
                Save Unpublished
              </button>
              <button
                type="button"
                disabled={savingProject}
                onClick={() => handleSaveProject(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {savingProject && <Loader2 size={13} className="animate-spin" />}
                Save &amp; Publish Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
