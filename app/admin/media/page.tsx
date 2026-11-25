"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaAsset, MediaSection } from "@/lib/cms-types";
import {
  deleteMediaAsset,
  getMediaAssets,
  replaceMediaAsset,
  updateMediaMetadata,
  uploadMediaAsset,
} from "@/lib/media-services";
import { useAuth } from "@/context/auth-context";
import {
  Check,
  Copy,
  Eye,
  Film,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const SECTIONS: { value: MediaSection | "all"; label: string }[] = [
  { value: "all", label: "All Sections" },
  { value: "homepage", label: "Homepage" },
  { value: "about", label: "About Foundation" },
  { value: "restorations", label: "Restorations & Projects" },
  { value: "recognition", label: "Recognition & Media" },
  { value: "sponsors", label: "Sponsors & Partners" },
  { value: "marketplace", label: "Marketplace" },
  { value: "team", label: "Team & Leadership" },
  { value: "involvement", label: "Get Involved & Donations" },
  { value: "footer", label: "Footer & Contact" },
  { value: "general", label: "General" },
];

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminMediaLibraryPage() {
  const { user } = useAuth();
  const userEmail = user?.email || "admin";

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<MediaSection | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");

  const [uploadSection, setUploadSection] = useState<MediaSection>("general");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [editingMeta, setEditingMeta] = useState<MediaAsset | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const list = await getMediaAssets();
      setAssets(list);
    } catch (err) {
      console.error("Failed loading media library:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 5000);
  };

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((item) => {
      if (sectionFilter !== "all" && item.section !== sectionFilter) return false;
      if (typeFilter !== "all" && item.mediaType !== typeFilter) return false;
      if (!q) return true;
      return (
        item.fileName.toLowerCase().includes(q) ||
        item.altText?.toLowerCase().includes(q) ||
        item.caption?.toLowerCase().includes(q) ||
        item.fileType?.toLowerCase().includes(q)
      );
    });
  }, [assets, search, sectionFilter, typeFilter]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploadedList: MediaAsset[] = [];
      for (let i = 0; i < files.length; i++) {
        const asset = await uploadMediaAsset({
          file: files[i],
          section: uploadSection,
          uploadedBy: userEmail,
          onProgress: (p) => setUploadProgress(p),
        });
        uploadedList.push(asset);
      }
      setAssets((prev) => [...uploadedList, ...prev]);
      notify("success", `Uploaded ${uploadedList.length} file(s) to Cloudinary.`);
    } catch (err: unknown) {
      notify(
        "error",
        err instanceof Error ? err.message : "Upload failed. Check Cloudinary configuration."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleReplace = async (asset: MediaAsset, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacingId(asset.id);
    try {
      const result = await replaceMediaAsset({
        existing: asset,
        newFile: file,
        updatedBy: userEmail,
      });
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? result.asset : a)));
      notify(
        "success",
        `Replaced "${asset.fileName}". Updated ${result.referencesUpdated} CMS/project reference(s) automatically.`
      );
    } catch (err: unknown) {
      notify("error", err instanceof Error ? err.message : "Failed replacing media asset.");
    } finally {
      setReplacingId(null);
      e.target.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!deletingAsset) return;
    try {
      await deleteMediaAsset(deletingAsset);
      setAssets((prev) => prev.filter((a) => a.id !== deletingAsset.id));
      notify("success", `Deleted "${deletingAsset.fileName}" from Cloudinary and Media Library.`);
    } catch (err: unknown) {
      notify("error", err instanceof Error ? err.message : "Failed deleting media asset.");
    } finally {
      setDeletingAsset(null);
    }
  };

  const handleCopyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.downloadUrl);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notify("error", "Could not copy URL to clipboard.");
    }
  };

  const saveMetaEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeta) return;
    try {
      await updateMediaMetadata(editingMeta.id, {
        altText: editingMeta.altText,
        caption: editingMeta.caption,
        section: editingMeta.section,
      });
      setAssets((prev) => prev.map((a) => (a.id === editingMeta.id ? editingMeta : a)));
      setEditingMeta(null);
      notify("success", "Media metadata updated.");
    } catch {
      notify("error", "Failed updating media metadata.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & Upload Panel */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent-blue font-bold mb-1">
              Cloudinary CDN · Central Assets
            </p>
            <h1 className="font-serif text-3xl font-bold text-primary-blue">Media Library</h1>
            <p className="text-xs md:text-sm text-primary-blue-light/70 mt-1">
              Upload, preview, organize, replace, and copy URLs for all website images and videos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={uploadSection}
              onChange={(e) => setUploadSection(e.target.value as MediaSection)}
              className="px-3.5 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-semibold text-primary-blue outline-none focus:border-accent-blue"
            >
              {SECTIONS.filter((s) => s.value !== "all").map((s) => (
                <option key={s.value} value={s.value}>
                  Section: {s.label}
                </option>
              ))}
            </select>

            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 transition-all shadow-md">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? `Uploading ${uploadProgress}%` : "Upload Images / Videos"}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                disabled={uploading}
                onChange={handleUploadFiles}
              />
            </label>
          </div>
        </div>

        {bannerMsg && (
          <div
            className={`mt-4 px-4 py-3 rounded-xl text-xs font-semibold border ${
              bannerMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {bannerMsg.text}
          </div>
        )}
      </div>

      {/* Stats & Filter Bar */}
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
            placeholder="Search by filename, alt text, caption, MIME type..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
          />
        </div>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value as MediaSection | "all")}
          className="px-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
        >
          {SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | "image" | "video")}
          className="px-4 py-3 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue shadow-sm"
        >
          <option value="all">All Media Types ({assets.length})</option>
          <option value="image">
            Images ({assets.filter((a) => a.mediaType === "image").length})
          </option>
          <option value="video">
            Videos ({assets.filter((a) => a.mediaType === "video").length})
          </option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-16 text-center text-primary-blue-light/60">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-accent-blue" />
          Loading media assets...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-surface-blue-dark p-16 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-primary-blue-light/25 mb-3" />
          <p className="text-base font-semibold text-primary-blue">No media files found</p>
          <p className="text-xs text-primary-blue-light/55 mt-1">
            Upload images or videos above to store them in Cloudinary and manage them centrally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-surface-blue-dark shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Preview area */}
              <div
                onClick={() => setPreviewAsset(asset)}
                className="relative aspect-[4/3] bg-surface-blue cursor-pointer overflow-hidden group"
              >
                {asset.mediaType === "video" ? (
                  <video
                    src={asset.downloadUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={asset.downloadUrl}
                    alt={asset.altText || asset.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/65 text-white backdrop-blur-sm">
                    {asset.section}
                  </span>
                  {asset.mediaType === "video" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-blue text-white">
                      <Film size={10} /> Video
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-black/60 text-white"
                  title="Preview"
                >
                  <Eye size={14} />
                </button>
              </div>

              {/* Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-primary-blue truncate" title={asset.fileName}>
                    {asset.fileName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-primary-blue-light/60 mt-1">
                    <span>{asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}</span>
                    <span>·</span>
                    <span>{formatBytes(asset.fileSize)}</span>
                    <span>·</span>
                    <span className="uppercase">{asset.fileType.split("/")[1] || asset.fileType}</span>
                  </div>
                  {asset.caption && (
                    <p className="text-xs text-primary-blue-light/70 mt-1.5 line-clamp-2">
                      {asset.caption}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-blue-dark">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset)}
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-blue text-primary-blue text-xs font-semibold hover:bg-surface-blue-dark/70 transition-colors"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check size={12} className="text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy URL
                      </>
                    )}
                  </button>

                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-blue text-primary-blue text-xs font-semibold hover:bg-surface-blue-dark/70 transition-colors">
                    {replacingId === asset.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    {replacingId === asset.id ? "Replacing" : "Replace"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      disabled={replacingId === asset.id}
                      onChange={(e) => handleReplace(asset, e)}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setEditingMeta(asset)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-surface-blue-dark text-xs font-medium text-primary-blue-light/80 hover:border-accent-blue hover:text-primary-blue transition-colors"
                  >
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingAsset(asset)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Lightbox */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-blue-dark flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary-blue truncate">{previewAsset.fileName}</p>
                <p className="text-xs text-primary-blue-light/60">
                  {previewAsset.width && previewAsset.height
                    ? `${previewAsset.width}×${previewAsset.height}px · `
                    : ""}
                  {formatBytes(previewAsset.fileSize)} · {previewAsset.fileType}
                </p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-2 rounded-xl hover:bg-surface-blue text-primary-blue-light/60"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[68vh]">
              {previewAsset.mediaType === "video" ? (
                <video
                  src={previewAsset.downloadUrl}
                  controls
                  autoPlay
                  className="max-h-[68vh] w-full object-contain"
                />
              ) : (
                <img
                  src={previewAsset.downloadUrl}
                  alt={previewAsset.altText || previewAsset.fileName}
                  className="max-h-[68vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingMeta && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingMeta(null)}
        >
          <form
            onSubmit={saveMetaEdits}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-serif text-xl font-bold text-primary-blue">Edit Media Details</h3>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Section
              </label>
              <select
                value={editingMeta.section}
                onChange={(e) =>
                  setEditingMeta({ ...editingMeta, section: e.target.value as MediaSection })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              >
                {SECTIONS.filter((s) => s.value !== "all").map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={editingMeta.altText}
                onChange={(e) => setEditingMeta({ ...editingMeta, altText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Caption
              </label>
              <textarea
                rows={3}
                value={editingMeta.caption || ""}
                onChange={(e) => setEditingMeta({ ...editingMeta, caption: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMeta(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-primary-blue-light/70 hover:bg-surface-blue"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90"
              >
                Save Metadata
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAsset && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeletingAsset(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-serif text-xl font-bold text-primary-blue">Delete Media Asset?</h3>
            <p className="text-sm text-primary-blue-light/75">
              This will permanently remove <strong>{deletingAsset.fileName}</strong> from Cloudinary
              and the Media Library. Any page referencing this URL should be updated or use
              Replace instead.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAsset(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-primary-blue-light/70 hover:bg-surface-blue"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
