"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  INITIATIVE_CATEGORIES,
  INITIATIVE_STATUSES,
  InitiativeFull,
  InitiativeImage,
  InitiativeLink,
  InitiativeTeamMember,
  InitiativeVideo,
} from "@/lib/initiatives-types";
import {
  MAX_INITIATIVE_FILE_BYTES,
  safeDeleteCloudinaryMedia,
  saveInitiativeFull,
  slugifyInitiativeTitle,
  uploadInitiativeMedia,
  validateInitiativeFile,
} from "@/lib/initiatives-services";
import { parseInstagramReelEmbed, resolveInitiativeVideo } from "@/lib/video-embed";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  CheckCircle2,
  ExternalLink,
  Eye,
  Film,
  FolderOpen,
  Heading2,
  Image as ImageIcon,
  Instagram,
  Italic,
  Link2,
  List,
  Loader2,
  Plus,
  Save,
  Send,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

type EditorTab = "basic" | "media" | "team" | "seo";

interface InitiativeEditorProps {
  initialData?: InitiativeFull | null;
}

type DraftImage = Omit<InitiativeImage, "id" | "initiative_id" | "is_published" | "created_at"> & {
  tempId: string;
  created_at?: string;
};

type DraftVideo = Omit<InitiativeVideo, "id" | "initiative_id" | "is_published" | "created_at"> & {
  tempId: string;
  created_at?: string;
};

type DraftLink = Omit<InitiativeLink, "id" | "initiative_id" | "is_published" | "created_at"> & {
  tempId: string;
  created_at?: string;
};

type DraftTeam = Omit<InitiativeTeamMember, "id" | "initiative_id" | "is_published"> & {
  tempId: string;
};

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function InitiativeEditor({ initialData }: InitiativeEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userEmail = user?.email || "admin";
  const isEditing = Boolean(initialData?.id);

  const [activeTab, setActiveTab] = useState<EditorTab>("basic");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));

  // Tab A: Basic Details
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || "");
  const [fullDesc, setFullDesc] = useState(initialData?.full_description || "");
  const [category, setCategory] = useState(initialData?.category || INITIATIVE_CATEGORIES[0]);
  const [location, setLocation] = useState(initialData?.location || "Rajasthan");
  const [status, setStatus] = useState(initialData?.status || INITIATIVE_STATUSES[0]);
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.is_featured));
  const [publicationStatus, setPublicationStatus] = useState<"draft" | "published">(
    initialData?.publication_status || "draft"
  );
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.display_order || 1);

  // Tab B: Media
  const [images, setImages] = useState<DraftImage[]>(
    (initialData?.images || []).map((img, i) => ({
      tempId: img.id || `img-${i}`,
      image_url: img.image_url,
      cloudinary_public_id: img.cloudinary_public_id,
      alt_text: img.alt_text,
      caption: img.caption,
      display_order: img.display_order,
      is_primary: img.is_primary,
      created_at: img.created_at,
    }))
  );
  const [videos, setVideos] = useState<DraftVideo[]>(
    (initialData?.videos || []).map((vid, i) => ({
      tempId: vid.id || `vid-${i}`,
      video_url: vid.video_url,
      cloudinary_public_id: vid.cloudinary_public_id,
      video_type: vid.video_type,
      title: vid.title,
      description: vid.description,
      file_size: vid.file_size,
      duration_label: vid.duration_label,
      display_order: vid.display_order,
      created_at: vid.created_at,
    }))
  );

  // Tab C: Team & Links
  const [team, setTeam] = useState<DraftTeam[]>(
    (initialData?.team || []).map((m, i) => ({
      tempId: m.id || `team-${i}`,
      name: m.name,
      role: m.role,
      description: m.description,
      image_url: m.image_url,
      cloudinary_public_id: m.cloudinary_public_id || "",
      display_order: m.display_order,
    }))
  );
  const [links, setLinks] = useState<DraftLink[]>(
    (initialData?.links || []).map((l, i) => ({
      tempId: l.id || `link-${i}`,
      platform: l.platform,
      label: l.label,
      url: l.url,
      created_at: l.created_at,
    }))
  );

  // Tab D: SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [seoOgImage, setSeoOgImage] = useState(initialData?.seo_og_image || "");
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState(initialData?.seo_canonical_url || "");
  const [seoNoIndex, setSeoNoIndex] = useState(Boolean(initialData?.seo_no_index));

  // Upload & Action states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [dragOverImages, setDragOverImages] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [externalVideoTitle, setExternalVideoTitle] = useState("");
  const [instaReelUrl, setInstaReelUrl] = useState("");
  const [instaReelTitle, setInstaReelTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const storyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    if (type === "success") {
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugifyInitiativeTitle(val));
    }
  };

  const applyStoryFormat = (prefix: string, suffix = "") => {
    const el = storyTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = fullDesc.slice(start, end) || "Text";
    const next =
      fullDesc.slice(0, start) + prefix + selected + suffix + fullDesc.slice(end);
    setFullDesc(next);
  };

  // --- Image Gallery Handlers ---
  const handleImageFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    for (const f of files) {
      const err = validateInitiativeFile(f, "image");
      if (err) {
        showNotice("error", err);
        return;
      }
    }

    setUploadingImages(true);
    setImageUploadProgress(0);
    try {
      const added: DraftImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadInitiativeMedia({
          file: files[i],
          kind: "image",
          uploadedBy: userEmail,
          onProgress: setImageUploadProgress,
        });
        added.push({
          tempId: `img-${Date.now()}-${i}`,
          image_url: res.secure_url,
          cloudinary_public_id: res.public_id,
          alt_text: files[i].name.replace(/\.[^.]+$/, ""),
          caption: "",
          display_order: images.length + added.length + 1,
          is_primary: images.length === 0 && added.length === 0,
        });
      }
      const next = [...images, ...added];
      setImages(next);
      if (!coverImage && added[0]) {
        setCoverImage(added[0].image_url);
      }
      showNotice("success", `Uploaded ${added.length} image(s) to Cloudinary.`);
    } catch (err: unknown) {
      showNotice("error", err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingImages(false);
    }
  };

  const setPrimaryImage = (idx: number) => {
    const next = images.map((img, i) => ({ ...img, is_primary: i === idx }));
    setImages(next);
    if (next[idx]?.image_url) {
      setCoverImage(next[idx].image_url);
    }
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setImages(copy.map((img, i) => ({ ...img, display_order: i + 1 })));
  };

  const removeImage = async (idx: number) => {
    const target = images[idx];
    if (target.cloudinary_public_id) {
      const check = await safeDeleteCloudinaryMedia({
        publicId: target.cloudinary_public_id,
        url: target.image_url,
        resourceType: "image",
        excludeInitiativeId: initialData?.id,
      });
      if (check.blockedReason) {
        showNotice("error", check.blockedReason);
        return;
      }
    }
    const next = images.filter((_, i) => i !== idx);
    if (target.is_primary && next.length > 0) {
      next[0] = { ...next[0], is_primary: true };
    }
    setImages(next);
  };

  // --- Video Upload Handlers ---
  const handleSelectVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateInitiativeFile(file, "video");
    if (err) {
      showNotice("error", err);
      setPendingVideoFile(null);
      e.target.value = "";
      return;
    }
    setPendingVideoFile(file);
  };

  const handleUploadSelectedVideo = async () => {
    if (!pendingVideoFile) return;
    setUploadingVideo(true);
    setVideoUploadProgress(0);
    try {
      const res = await uploadInitiativeMedia({
        file: pendingVideoFile,
        kind: "video",
        uploadedBy: userEmail,
        onProgress: setVideoUploadProgress,
      });
      const mins = res.duration ? Math.floor(res.duration / 60) : 0;
      const secs = res.duration ? Math.round(res.duration % 60) : 0;
      const durationLabel = res.duration
        ? `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        : "";

      const newVid: DraftVideo = {
        tempId: `vid-${Date.now()}`,
        video_url: res.secure_url,
        cloudinary_public_id: res.public_id,
        video_type: "upload",
        title: pendingVideoFile.name.replace(/\.[^.]+$/, ""),
        description: "",
        file_size: res.bytes,
        duration_label: durationLabel,
        display_order: videos.length + 1,
      };
      setVideos((prev) => [...prev, newVid]);
      setPendingVideoFile(null);
      showNotice("success", "MP4 video uploaded to Cloudinary.");
    } catch (err: unknown) {
      showNotice("error", err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAddExternalVideo = () => {
    const trimmedUrl = externalVideoUrl.trim();
    if (!trimmedUrl) return;
    const insta = parseInstagramReelEmbed(trimmedUrl);
    setVideos((prev) => [
      ...prev,
      {
        tempId: `vid-${insta ? "reel" : "ext"}-${Date.now()}`,
        video_url: insta ? insta.canonicalUrl : trimmedUrl,
        cloudinary_public_id: "",
        video_type: insta ? "instagram" : "external",
        title: externalVideoTitle.trim() || (insta ? "Instagram Reel" : "Initiative Video"),
        description: "",
        file_size: 0,
        display_order: prev.length + 1,
      },
    ]);
    setExternalVideoUrl("");
    setExternalVideoTitle("");
  };

  const handleAddInstagramReel = () => {
    const trimmedUrl = instaReelUrl.trim();
    if (!trimmedUrl) {
      showNotice("error", "Please paste an Instagram Reel URL.");
      return;
    }
    const parsed = parseInstagramReelEmbed(trimmedUrl);
    if (!parsed) {
      showNotice(
        "error",
        "Enter a valid Instagram Reel or Post URL (e.g. https://www.instagram.com/reel/...)."
      );
      return;
    }
    setVideos((prev) => [
      ...prev,
      {
        tempId: `vid-reel-${Date.now()}`,
        video_url: parsed.canonicalUrl,
        cloudinary_public_id: "",
        video_type: "instagram",
        title: instaReelTitle.trim() || "Instagram Reel",
        description: "",
        file_size: 0,
        duration_label: "Reel",
        display_order: prev.length + 1,
      },
    ]);
    setInstaReelUrl("");
    setInstaReelTitle("");
    showNotice("success", "Instagram Reel added to initiative videos.");
  };

  const moveVideo = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= videos.length) return;
    const copy = [...videos];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setVideos(copy.map((vid, i) => ({ ...vid, display_order: i + 1 })));
  };

  const removeVideo = async (idx: number) => {
    const target = videos[idx];
    if (target.cloudinary_public_id) {
      const check = await safeDeleteCloudinaryMedia({
        publicId: target.cloudinary_public_id,
        url: target.video_url,
        resourceType: "video",
        excludeInitiativeId: initialData?.id,
      });
      if (check.blockedReason) {
        showNotice("error", check.blockedReason);
        return;
      }
    }
    setVideos(videos.filter((_, i) => i !== idx));
  };

  // --- Team & Links Handlers ---
  const addTeamMember = () => {
    setTeam((prev) => [
      ...prev,
      {
        tempId: `team-${Date.now()}`,
        name: "",
        role: "",
        description: "",
        image_url: "",
        cloudinary_public_id: "",
        display_order: prev.length + 1,
      },
    ]);
  };

  const addLink = (platform: InitiativeLink["platform"] = "instagram") => {
    setLinks((prev) => [
      ...prev,
      {
        tempId: `link-${Date.now()}`,
        platform,
        label: platform === "instagram" ? "Follow on Instagram" : "Visit Link",
        url: "",
      },
    ]);
  };

  // --- Save / Publish / Preview ---
  const persist = async (publishNow: boolean, openPreview = false) => {
    if (!title.trim()) {
      showNotice("error", "Initiative title is required.");
      setActiveTab("basic");
      return;
    }
    if (!shortDesc.trim()) {
      showNotice("error", "Short description is required.");
      setActiveTab("basic");
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const saved = await saveInitiativeFull({
        id: initialData?.id || null,
        initiative: {
          title,
          slug: slug || slugifyInitiativeTitle(title),
          subtitle,
          short_description: shortDesc,
          full_description: fullDesc || shortDesc,
          category,
          location: location || "Rajasthan",
          status,
          cover_image: coverImage,
          is_featured: isFeatured,
          display_order: Number(displayOrder || 1),
          publication_status: publishNow ? "published" : "draft",
          seo_title: seoTitle || title,
          seo_description: seoDescription || shortDesc,
          seo_og_image: seoOgImage || coverImage,
          seo_canonical_url: seoCanonicalUrl,
          seo_no_index: seoNoIndex,
          created_at: initialData?.created_at,
          published_at: initialData?.published_at,
        },
        images: images.map((img, i) => ({
          image_url: img.image_url,
          cloudinary_public_id: img.cloudinary_public_id,
          alt_text: img.alt_text,
          caption: img.caption,
          display_order: i + 1,
          is_primary: img.is_primary,
          created_at: img.created_at,
        })),
        videos: videos.map((vid, i) => ({
          video_url: vid.video_url,
          cloudinary_public_id: vid.cloudinary_public_id,
          video_type: vid.video_type,
          title: vid.title,
          description: vid.description,
          file_size: vid.file_size,
          duration_label: vid.duration_label,
          display_order: i + 1,
          created_at: vid.created_at,
        })),
        links: links.map((l) => ({
          platform: l.platform,
          label: l.label,
          url: l.url,
          created_at: l.created_at,
        })),
        team: team.map((m, i) => ({
          name: m.name,
          role: m.role,
          description: m.description,
          image_url: m.image_url,
          cloudinary_public_id: m.cloudinary_public_id,
          display_order: i + 1,
        })),
        publishNow,
      });

      setPublicationStatus(saved.publication_status);
      setSlug(saved.slug);

      if (openPreview) {
        setPreviewUrl(`/initiatives/${saved.slug}?preview=1`);
      }

      if (!isEditing) {
        router.replace(`/admin/initiatives/${saved.id}`);
      } else {
        showNotice(
          "success",
          publishNow
            ? "Initiative published live to /initiatives!"
            : "Initiative saved as draft."
        );
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "permission-denied") {
        showNotice(
          "error",
          "Missing Firestore permissions for initiatives. Please publish the updated firestore.rules in Firebase Console → Firestore Database → Rules."
        );
      } else {
        showNotice("error", err instanceof Error ? err.message : "Failed saving initiative.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Action Header */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin/initiatives"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-blue hover:underline mb-1"
            >
              <ArrowLeft size={13} /> Back to Initiatives
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary-blue">
                {isEditing ? title || "Edit Initiative" : "Add New Initiative"}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  publicationStatus === "published"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {publicationStatus}
              </span>
              {isFeatured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Star size={10} className="fill-current" /> Featured
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => persist(publicationStatus === "published", true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-surface-blue-dark text-primary-blue text-xs font-bold hover:border-accent-blue transition-all"
            >
              <Eye size={14} /> Preview
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => persist(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-blue border border-accent-blue/30 text-primary-blue text-xs font-bold hover:bg-accent-blue/10 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => persist(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 transition-all shadow-md"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Publish
            </button>
          </div>
        </div>

        {/* 4 Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-blue-dark">
          {(
            [
              { id: "basic", label: "Tab A · Basic Details", icon: Sparkles },
              {
                id: "media",
                label: `Tab B · Media (${images.length} photos, ${videos.length} videos)`,
                icon: ImageIcon,
              },
              {
                id: "team",
                label: `Tab C · Team & Links (${team.length} team, ${links.length} links)`,
                icon: Users,
              },
              { id: "seo", label: "Tab D · SEO", icon: CheckCircle2 },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id
                  ? "bg-[#0D3B66] text-white shadow-sm"
                  : "bg-surface-blue/60 text-primary-blue-light/75 hover:text-primary-blue hover:bg-surface-blue"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {notice && (
          <div
            className={`px-4 py-3 rounded-xl text-xs font-semibold border ${
              notice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {notice.text}
          </div>
        )}
      </div>

      {/* TAB A — BASIC DETAILS */}
      {activeTab === "basic" && (
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Initiative Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Stepwell Restoration Drive"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm font-semibold text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(slugifyInitiativeTitle(e.target.value));
                }}
                placeholder="stepwell-restoration-drive"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm font-mono text-primary-blue outline-none focus:border-accent-blue"
              />
              <p className="text-[11px] text-primary-blue-light/50 mt-1">
                Public URL: /initiatives/{slug || "..."}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Reviving Water Heritage, Rebuilding Communities"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue bg-white outline-none focus:border-accent-blue"
              >
                {INITIATIVE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Project Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue bg-white outline-none focus:border-accent-blue"
                >
                  {INITIATIVE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Short Description *
            </label>
            <textarea
              rows={3}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Concise summary displayed on the featured card and grid cards..."
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
            />
          </div>

          {/* Full Story Editor */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70">
                Full Description / Story
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyStoryFormat("## ")}
                  className="p-1.5 rounded-lg bg-surface-blue border border-surface-blue-dark text-primary-blue hover:border-accent-blue"
                  title="Subheading"
                >
                  <Heading2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => applyStoryFormat("**", "**")}
                  className="p-1.5 rounded-lg bg-surface-blue border border-surface-blue-dark text-primary-blue hover:border-accent-blue"
                  title="Bold"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => applyStoryFormat("*", "*")}
                  className="p-1.5 rounded-lg bg-surface-blue border border-surface-blue-dark text-primary-blue hover:border-accent-blue"
                  title="Italic"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => applyStoryFormat("\n- ")}
                  className="p-1.5 rounded-lg bg-surface-blue border border-surface-blue-dark text-primary-blue hover:border-accent-blue"
                  title="Bullet Point"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
            <textarea
              ref={storyTextareaRef}
              rows={7}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Write the full initiative story. Separate paragraphs with blank lines, or use ## for section headings."
              className="w-full px-4 py-3 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue leading-relaxed"
            />
          </div>

          <CMSMediaField
            label="Cover Image"
            value={coverImage}
            onChange={setCoverImage}
            section="restorations"
            helperText="Displayed on the Other Initiatives grid card and as fallback hero image."
          />

          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-surface-blue-dark">
            <label className="inline-flex items-center gap-2.5 text-sm font-bold text-primary-blue cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-[#0D3B66] w-4 h-4"
              />
              Mark as Featured Initiative
            </label>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-blue-light/65">
                Visibility:
              </span>
              <select
                value={publicationStatus}
                onChange={(e) =>
                  setPublicationStatus(e.target.value as "draft" | "published")
                }
                className="px-3 py-1.5 rounded-xl border border-surface-blue-dark text-xs font-bold text-primary-blue bg-white"
              >
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="published">Published (Live on Website)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB B — MEDIA (IMAGES GALLERY + VIDEO UPLOAD) */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Images Gallery */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-primary-blue">
                  Images Gallery ({images.length})
                </h2>
                <p className="text-xs text-primary-blue-light/65">
                  Supported formats: JPG, PNG, WEBP · Maximum image size: 10 MB per image.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue"
              >
                <FolderOpen size={14} className="text-accent-blue" /> Pick from Media Library
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverImages(true);
              }}
              onDragLeave={() => setDragOverImages(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverImages(false);
                if (e.dataTransfer.files.length) handleImageFiles(e.dataTransfer.files);
              }}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragOverImages
                  ? "border-accent-blue bg-accent-blue/5"
                  : "border-surface-blue-dark bg-surface-blue/30 hover:border-accent-blue/60"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingImages}
                onChange={(e) => {
                  if (e.target.files) handleImageFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploadingImages ? (
                <div className="space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-accent-blue" />
                  <p className="text-xs font-bold text-primary-blue">
                    Uploading to Cloudinary... {imageUploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="w-7 h-7 mx-auto text-accent-blue" />
                  <p className="text-sm font-bold text-primary-blue">
                    Drag &amp; drop photos here, or click to browse
                  </p>
                  <p className="text-xs text-primary-blue-light/60">
                    Multiple JPG, PNG, or WEBP files supported (max 10 MB each)
                  </p>
                </div>
              )}
            </label>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div
                    key={img.tempId}
                    className="p-4 rounded-2xl border border-surface-blue-dark bg-surface-blue/25 flex flex-col md:flex-row gap-4 items-start"
                  >
                    <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-white border border-surface-blue-dark shrink-0 relative">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || "Gallery photo"}
                        className="w-full h-full object-cover"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#0D3B66] text-white">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={img.alt_text}
                          onChange={(e) => {
                            const copy = [...images];
                            copy[idx] = { ...img, alt_text: e.target.value };
                            setImages(copy);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                          Caption
                        </label>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => {
                            const copy = [...images];
                            copy[idx] = { ...img, caption: e.target.value };
                            setImages(copy);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          img.is_primary
                            ? "bg-amber-50 border-amber-300 text-amber-800"
                            : "bg-white border-surface-blue-dark text-primary-blue"
                        }`}
                      >
                        {img.is_primary ? "Primary" : "Set Primary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, -1)}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-white border border-surface-blue-dark disabled:opacity-30"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 1)}
                        disabled={idx === images.length - 1}
                        className="p-2 rounded-xl bg-white border border-surface-blue-dark disabled:opacity-30"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary-blue">
                Video &amp; Insta Reel ({videos.length})
              </h2>
              <p className="text-xs font-semibold text-amber-700 mt-0.5">
                Upload MP4 (max 10 MB), embed an Instagram Reel, or link a YouTube/external video
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* MP4 File Uploader */}
              <div className="p-4 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-blue">
                  Upload MP4 Video to Cloudinary
                </p>
                <p className="text-[11px] text-primary-blue-light/65">
                  Maximum video size: 10 MB
                </p>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue">
                  <Film size={14} className="text-accent-blue" />
                  Choose MP4 File
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    disabled={uploadingVideo}
                    onChange={handleSelectVideoFile}
                  />
                </label>

                {pendingVideoFile && (
                  <div className="p-3 rounded-xl bg-white border border-surface-blue-dark space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary-blue truncate">
                        {pendingVideoFile.name}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 shrink-0 ml-2">
                        {formatMB(pendingVideoFile.size)} / 10 MB
                      </span>
                    </div>

                    {uploadingVideo && (
                      <div className="space-y-1">
                        <div className="h-2 rounded-full bg-surface-blue overflow-hidden">
                          <div
                            className="h-full bg-accent-blue transition-all"
                            style={{ width: `${videoUploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-bold text-accent-blue">
                          Uploading MP4... {videoUploadProgress}%
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={uploadingVideo || pendingVideoFile.size > MAX_INITIATIVE_FILE_BYTES}
                        onClick={handleUploadSelectedVideo}
                        className="px-4 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {uploadingVideo ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Upload size={13} />
                        )}
                        Upload Video
                      </button>
                      <button
                        type="button"
                        disabled={uploadingVideo}
                        onClick={() => setPendingVideoFile(null)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-primary-blue-light/70 hover:bg-surface-blue"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram Reel Embed */}
              <div className="p-4 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-blue flex items-center gap-1.5">
                  <Instagram size={14} className="text-pink-600" />
                  Add Instagram Reel
                </p>
                <input
                  type="text"
                  value={instaReelTitle}
                  onChange={(e) => setInstaReelTitle(e.target.value)}
                  placeholder="Reel title (e.g. Toorji Cleanup Drive)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="url"
                  value={instaReelUrl}
                  onChange={(e) => setInstaReelUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                />
                <button
                  type="button"
                  onClick={handleAddInstagramReel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue"
                >
                  <Instagram size={13} className="text-pink-600" /> Add Insta Reel
                </button>
              </div>

              {/* Optional External Video URL */}
              <div className="p-4 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-primary-blue">
                  Or Add External Video URL (Optional)
                </p>
                <input
                  type="text"
                  value={externalVideoTitle}
                  onChange={(e) => setExternalVideoTitle(e.target.value)}
                  placeholder="Video title"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="url"
                  value={externalVideoUrl}
                  onChange={(e) => setExternalVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or direct MP4 URL"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                />
                <button
                  type="button"
                  onClick={handleAddExternalVideo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue"
                >
                  <Plus size={13} /> Add External Video
                </button>
              </div>
            </div>

            {/* Video List & Preview */}
            {videos.length > 0 && (
              <div className="space-y-4">
                {videos.map((vid, idx) => {
                  const resolved = resolveInitiativeVideo(vid.video_url);
                  return (
                    <div
                      key={vid.tempId}
                      className="p-4 rounded-2xl border border-surface-blue-dark bg-surface-blue/25 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 items-start"
                    >
                      <div
                        className={`rounded-xl overflow-hidden ${
                          resolved.kind === "instagram"
                            ? "bg-white max-h-[380px] overflow-y-auto mx-auto w-full border border-surface-blue-dark"
                            : "bg-black aspect-video"
                        }`}
                      >
                        {resolved.kind === "instagram" || resolved.kind === "youtube" ? (
                          <iframe
                            src={resolved.embedUrl}
                            title={vid.title || "Video preview"}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            className={`w-full border-none ${
                              resolved.kind === "instagram" ? "h-[460px]" : "h-full"
                            }`}
                            allowFullScreen
                          />
                        ) : (
                          <video src={vid.video_url} controls className="w-full h-full object-contain" />
                        )}
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-surface-blue-dark text-primary-blue">
                              {resolved.kind === "instagram" && (
                                <Instagram size={11} className="text-pink-600" />
                              )}
                              {vid.video_type === "upload"
                                ? `MP4 · ${vid.file_size ? formatMB(vid.file_size) : "Cloudinary"}`
                                : resolved.kind === "instagram"
                                ? "Instagram Reel"
                                : resolved.kind === "youtube"
                                ? "YouTube Video"
                                : "External URL"}
                              {vid.duration_label && resolved.kind !== "instagram"
                                ? ` · ${vid.duration_label}`
                                : ""}
                            </span>
                            {resolved.kind !== "direct" && (
                              <a
                                href={resolved.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-blue hover:underline"
                              >
                                <ExternalLink size={11} /> Open Link
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveVideo(idx, -1)}
                              disabled={idx === 0}
                              title="Move up"
                              className="p-1.5 rounded-xl bg-white border border-surface-blue-dark disabled:opacity-30"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVideo(idx, 1)}
                              disabled={idx === videos.length - 1}
                              title="Move down"
                              className="p-1.5 rounded-xl bg-white border border-surface-blue-dark disabled:opacity-30"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVideo(idx)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={vid.title}
                          onChange={(e) => {
                            const copy = [...videos];
                            copy[idx] = { ...vid, title: e.target.value };
                            setVideos(copy);
                          }}
                          placeholder="Video title"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs font-semibold text-primary-blue"
                        />
                        <textarea
                          rows={2}
                          value={vid.description}
                          onChange={(e) => {
                            const copy = [...videos];
                            copy[idx] = { ...vid, description: e.target.value };
                            setVideos(copy);
                          }}
                          placeholder="Video description"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue resize-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C — TEAM & LINKS */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Team Section */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-primary-blue">
                  Team &amp; Coordinators ({team.length})
                </h2>
                <p className="text-xs text-primary-blue-light/65">
                  If left empty, the team section is automatically hidden on the public detail page.
                </p>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold"
              >
                <Plus size={14} /> Add Team Entry
              </button>
            </div>

            <div className="space-y-4">
              {team.map((member, idx) => (
                <div
                  key={member.tempId}
                  className="p-4 rounded-2xl bg-surface-blue/30 border border-surface-blue-dark space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-blue">
                      Team Member / Group #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTeam(team.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const copy = [...team];
                        copy[idx] = { ...member, name: e.target.value };
                        setTeam(copy);
                      }}
                      placeholder="Team / Member Name"
                      className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm font-semibold text-primary-blue"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => {
                        const copy = [...team];
                        copy[idx] = { ...member, role: e.target.value };
                        setTeam(copy);
                      }}
                      placeholder="Role / Group Designation"
                      className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={member.description}
                    onChange={(e) => {
                      const copy = [...team];
                      copy[idx] = { ...member, description: e.target.value };
                      setTeam(copy);
                    }}
                    placeholder="Team description or contribution..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue resize-none"
                  />

                  <CMSMediaField
                    label="Team Photograph"
                    value={member.image_url}
                    onChange={(url) => {
                      const copy = [...team];
                      copy[idx] = { ...member, image_url: url };
                      setTeam(copy);
                    }}
                    section="team"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-xl font-bold text-primary-blue">
                  Instagram &amp; External Links ({links.length})
                </h2>
                <p className="text-xs text-primary-blue-light/65">
                  Only actual stored URLs are displayed on the public website.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addLink("instagram")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
                >
                  <Instagram size={13} /> Add Instagram Link
                </button>
                <button
                  type="button"
                  onClick={() => addLink("website")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold"
                >
                  <Link2 size={13} /> Add External Link
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {links.map((link, idx) => (
                <div
                  key={link.tempId}
                  className="p-3.5 rounded-2xl bg-surface-blue/30 border border-surface-blue-dark grid grid-cols-1 md:grid-cols-[150px_1fr_1.4fr_auto] gap-3 items-center"
                >
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const copy = [...links];
                      copy[idx] = {
                        ...link,
                        platform: e.target.value as InitiativeLink["platform"],
                      };
                      setLinks(copy);
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const copy = [...links];
                      copy[idx] = { ...link, label: e.target.value };
                      setLinks(copy);
                    }}
                    placeholder="Link Label"
                    className="px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />

                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const copy = [...links];
                      copy[idx] = { ...link, url: e.target.value };
                      setLinks(copy);
                    }}
                    placeholder="https://instagram.com/..."
                    className="px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />

                  <button
                    type="button"
                    onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                    className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB D — SEO */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">SEO &amp; Social Sharing</h2>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Initiative SEO title"}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70">
                Meta Description
              </label>
              <span className="text-[11px] text-primary-blue-light/55">
                {seoDescription.length} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={shortDesc || "Search result description..."}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
            />
          </div>

          <CMSMediaField
            label="Open Graph Image"
            value={seoOgImage}
            onChange={setSeoOgImage}
            section="restorations"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Canonical URL (Optional)
              </label>
              <input
                type="text"
                value={seoCanonicalUrl}
                onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                placeholder="https://www.stepwellsrenovaterfoundation.org/initiatives/..."
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm font-bold text-primary-blue cursor-pointer pt-5">
              <input
                type="checkbox"
                checked={seoNoIndex}
                onChange={(e) => setSeoNoIndex(e.target.checked)}
                className="accent-[#0D3B66] w-4 h-4"
              />
              No-index (hide from search engines)
            </label>
          </div>
        </div>
      )}

      {/* Media Picker for Gallery */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        acceptType="image"
        defaultSection="restorations"
        onSelect={(asset) => {
          setImages((prev) => [
            ...prev,
            {
              tempId: `img-${Date.now()}`,
              image_url: asset.downloadUrl,
              cloudinary_public_id: asset.publicId || "",
              alt_text: asset.altText || asset.fileName,
              caption: asset.caption || "",
              display_order: prev.length + 1,
              is_primary: prev.length === 0,
            },
          ]);
        }}
      />

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 bg-[#0D3B66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye size={16} className="text-[#D7C2A3]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Admin Initiative Preview ({previewUrl})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe src={previewUrl} className="w-full flex-1 bg-white" title="Initiative Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
