"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaAsset, MediaSection } from "@/lib/cms-types";
import { getMediaAssets, uploadMediaAsset } from "@/lib/media-services";
import { useAuth } from "@/context/auth-context";
import {
  Check,
  Film,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  acceptType?: "all" | "image" | "video";
  defaultSection?: MediaSection;
  title?: string;
}

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

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  acceptType = "all",
  defaultSection = "general",
  title = "Select Media from Library",
}: MediaPickerModalProps) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<MediaSection | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">(acceptType);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTypeFilter(acceptType);
    setLoading(true);
    getMediaAssets()
      .then((list) => setAssets(list))
      .catch((err) => console.error("Failed to fetch media library:", err))
      .finally(() => setLoading(false));
  }, [isOpen, acceptType]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((item) => {
      if (typeFilter !== "all" && item.mediaType !== typeFilter) return false;
      if (sectionFilter !== "all" && item.section !== sectionFilter) return false;
      if (!q) return true;
      return (
        item.fileName.toLowerCase().includes(q) ||
        item.altText?.toLowerCase().includes(q) ||
        item.caption?.toLowerCase().includes(q)
      );
    });
  }, [assets, search, sectionFilter, typeFilter]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    try {
      const asset = await uploadMediaAsset({
        file,
        section: defaultSection,
        uploadedBy: user?.email || "admin",
        onProgress: setProgress,
      });
      setAssets((prev) => [asset, ...prev]);
      onSelect(asset);
      onClose();
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Check Cloudinary configuration."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-blue-dark flex items-center justify-between gap-4 bg-surface-blue/40">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary-blue">{title}</h2>
            <p className="text-xs text-primary-blue-light/65">
              Choose an existing Cloudinary asset or upload a new file.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 transition-all shadow-sm">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? `Uploading ${progress}%` : "Upload New"}
              <input
                type="file"
                accept={
                  acceptType === "image"
                    ? "image/*"
                    : acceptType === "video"
                    ? "video/*"
                    : "image/*,video/*"
                }
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-primary-blue-light/50 hover:text-primary-blue hover:bg-surface-blue transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-surface-blue-dark flex flex-wrap items-center gap-3 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue-light/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename, alt text, caption..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue focus:border-accent-blue outline-none"
            />
          </div>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value as MediaSection | "all")}
            className="px-3 py-2 rounded-xl border border-surface-blue-dark text-xs font-medium text-primary-blue bg-white outline-none focus:border-accent-blue"
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {acceptType === "all" && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "image" | "video")}
              className="px-3 py-2 rounded-xl border border-surface-blue-dark text-xs font-medium text-primary-blue bg-white outline-none focus:border-accent-blue"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          )}
        </div>

        {uploadError && (
          <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {uploadError}
          </div>
        )}

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-primary-blue-light/60 text-sm">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent-blue" />
              Loading media library...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-surface-blue-dark rounded-2xl">
              <ImageIcon className="w-10 h-10 mx-auto text-primary-blue-light/30 mb-2" />
              <p className="text-sm font-medium text-primary-blue-light/70">
                No matching media assets found.
              </p>
              <p className="text-xs text-primary-blue-light/45 mt-1">
                Click &ldquo;Upload New&rdquo; above to add an image or video to Cloudinary.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group text-left rounded-2xl border border-surface-blue-dark bg-white overflow-hidden hover:border-accent-blue hover:shadow-md transition-all"
                >
                  <div className="aspect-[4/3] bg-surface-blue relative overflow-hidden flex items-center justify-center">
                    {item.mediaType === "video" ? (
                      <div className="flex flex-col items-center gap-1 text-primary-blue-light/60">
                        <Film size={28} />
                        <span className="text-[10px] font-bold uppercase">Video</span>
                      </div>
                    ) : (
                      <img
                        src={item.downloadUrl}
                        alt={item.altText || item.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-accent-blue text-white rounded-full p-1 shadow">
                      <Check size={12} />
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-primary-blue truncate">
                      {item.fileName}
                    </p>
                    <p className="text-[10px] text-primary-blue-light/55 mt-0.5 truncate">
                      {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                      {(item.fileSize / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
