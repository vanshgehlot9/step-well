"use client";

import { useState } from "react";
import { MediaSection } from "@/lib/cms-types";
import { uploadMediaAsset } from "@/lib/media-services";
import { useAuth } from "@/context/auth-context";
import { MediaPickerModal } from "./media-picker-modal";
import { Film, FolderOpen, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

interface CMSMediaFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  section: MediaSection;
  acceptType?: "image" | "video" | "all";
  helperText?: string;
}

export function CMSMediaField({
  label,
  value,
  onChange,
  section,
  acceptType = "image",
  helperText,
}: CMSMediaFieldProps) {
  const { user } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("video");

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const asset = await uploadMediaAsset({
        file,
        section,
        uploadedBy: user?.email || "admin",
        onProgress: setProgress,
      });
      onChange(asset.downloadUrl);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to upload to Cloudinary."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-2xl bg-surface-blue/40 border border-surface-blue-dark">
        {/* Preview */}
        <div className="w-28 h-20 rounded-xl bg-white border border-surface-blue-dark overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            acceptType === "video" || isVideoUrl(value) ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            )
          ) : acceptType === "video" ? (
            <Film size={22} className="text-primary-blue-light/30" />
          ) : (
            <ImageIcon size={22} className="text-primary-blue-light/30" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0 w-full space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste image/video URL or choose from Media Library..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue focus:border-accent-blue outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-surface-blue-dark text-xs font-semibold text-primary-blue hover:border-accent-blue transition-colors shadow-sm"
            >
              <FolderOpen size={13} className="text-accent-blue" />
              Media Library
            </button>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D3B66] text-white text-xs font-semibold hover:bg-[#0D3B66]/90 transition-colors shadow-sm">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? `Uploading ${progress}%` : "Upload"}
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
                onChange={handleDirectUpload}
              />
            </label>

            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          {helperText && (
            <p className="text-[11px] text-primary-blue-light/55">{helperText}</p>
          )}
          {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        acceptType={acceptType}
        defaultSection={section}
        onSelect={(asset) => onChange(asset.downloadUrl)}
      />
    </div>
  );
}
