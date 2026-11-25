"use client";

import { useState, useEffect, useCallback } from "react";
import { CMSSectionKey, ContentRevision } from "@/lib/cms-types";
import {
  getCMSRevisions,
  loadCMSSectionAdmin,
  publishCMSSection,
  restoreCMSRevision,
  saveCMSDraft,
  unpublishCMSSection,
} from "@/lib/cms-services";
import { CMS_DEFAULTS_MAP } from "@/lib/cms-defaults";
import { useAuth } from "@/context/auth-context";
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  History,
  Loader2,
  RotateCcw,
  Save,
  Send,
  X,
} from "lucide-react";

interface CMSSectionShellProps<T> {
  section: CMSSectionKey;
  title: string;
  description: string;
  previewPath?: string;
  data: T;
  setData: (next: T) => void;
  children: React.ReactNode;
  extraActions?: React.ReactNode;
}

export function CMSSectionShell<T>({
  section,
  title,
  description,
  previewPath = "/",
  data,
  setData,
  children,
  extraActions,
}: CMSSectionShellProps<T>) {
  const { user } = useAuth();
  const userEmail = user?.email || "admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [publishedStatus, setPublishedStatus] = useState<"published" | "unpublished" | "none">("none");
  const [publishedVersion, setPublishedVersion] = useState(0);
  const [draftVersion, setDraftVersion] = useState(0);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [publishedAt, setPublishedAt] = useState<string | undefined>();

  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [revisions, setRevisions] = useState<ContentRevision<T>[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);

  const loadSection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loadCMSSectionAdmin<T>(section);
      setData(res.draft);
      setLastSavedSnapshot(JSON.stringify(res.draft));
      setPublishedStatus(res.publishedStatus);
      setPublishedVersion(res.publishedVersion);
      setDraftVersion(res.draftVersion);
      setUpdatedAt(res.updatedAt);
      setPublishedAt(res.publishedAt);
    } catch (err) {
      console.error(`Failed loading CMS section ${section}:`, err);
      setStatusMessage({ type: "error", text: "Failed to load CMS section from Firestore." });
    } finally {
      setLoading(false);
    }
  }, [section, setData]);

  useEffect(() => {
    loadSection();
  }, [loadSection]);

  const hasUnsavedLocalEdits =
    lastSavedSnapshot !== "" && JSON.stringify(data) !== lastSavedSnapshot;

  const notify = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveCMSDraft(section, data, userEmail);
      setDraftVersion(saved.version);
      setUpdatedAt(saved.updatedAt);
      setLastSavedSnapshot(JSON.stringify(data));
      notify("success", `Draft saved (v${saved.version}). Public website unchanged until published.`);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const pub = await publishCMSSection(section, data, userEmail);
      setPublishedStatus("published");
      setPublishedVersion(pub.version);
      setPublishedAt(pub.publishedAt);
      setUpdatedAt(pub.publishedAt);
      setLastSavedSnapshot(JSON.stringify(data));
      notify("success", `Published v${pub.version} live to the public website.`);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to publish section.");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Unpublish this section? It will no longer appear on the public website until republished.")) {
      return;
    }
    setUnpublishing(true);
    try {
      await unpublishCMSSection(section, userEmail);
      setPublishedStatus("unpublished");
      notify("success", "Section unpublished from the public website.");
    } catch (err) {
      console.error(err);
      notify("error", "Failed to unpublish section.");
    } finally {
      setUnpublishing(false);
    }
  };

  const handlePreview = async () => {
    // Save draft before previewing so preview reflects current editor state
    setSaving(true);
    try {
      const saved = await saveCMSDraft(section, data, userEmail);
      setDraftVersion(saved.version);
      setUpdatedAt(saved.updatedAt);
      setLastSavedSnapshot(JSON.stringify(data));
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      notify("error", "Could not prepare draft preview.");
    } finally {
      setSaving(false);
    }
  };

  const openRevisions = async () => {
    setRevisionsOpen(true);
    setLoadingRevisions(true);
    try {
      const list = await getCMSRevisions<T>(section);
      setRevisions(list);
    } catch (err) {
      console.error("Failed loading revisions:", err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleRestore = async (rev: ContentRevision<T>) => {
    if (!confirm(`Restore draft to version v${rev.version}? You can preview and publish it afterward.`)) {
      return;
    }
    try {
      const restored = await restoreCMSRevision(section, rev, userEmail);
      setData(restored);
      setLastSavedSnapshot(JSON.stringify(restored));
      setRevisionsOpen(false);
      notify("success", `Restored v${rev.version} into draft. Click Publish to make it live.`);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to restore revision.");
    }
  };

  const handleResetToDefaults = () => {
    if (!confirm("Load the original migrated website defaults into this draft editor? (Does not publish until you click Publish.)")) {
      return;
    }
    setData(CMS_DEFAULTS_MAP[section] as T);
  };

  const previewUrl = `${previewPath}${previewPath.includes("?") ? "&" : "?"}cmsPreview=${section}`;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sticky Workflow Action Bar */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark shadow-sm p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent-blue font-bold">
                Website CMS
              </span>

              {publishedStatus === "published" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} /> Published v{publishedVersion}
                </span>
              ) : publishedStatus === "unpublished" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <EyeOff size={11} /> Unpublished
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock size={11} /> Initial Migrated Content (Not Yet Published)
                </span>
              )}

              {hasUnsavedLocalEdits && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Unsaved Changes
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary-blue">
              {title}
            </h1>
            <p className="text-xs md:text-sm text-primary-blue-light/70 mt-1">{description}</p>

            {(updatedAt || publishedAt) && (
              <p className="text-[11px] text-primary-blue-light/45 mt-2">
                {updatedAt && `Draft v${draftVersion} updated ${new Date(updatedAt).toLocaleString()}`}
                {updatedAt && publishedAt && " · "}
                {publishedAt && `Last published ${new Date(publishedAt).toLocaleString()}`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {extraActions}

            <button
              type="button"
              onClick={openRevisions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-primary-blue text-xs font-bold hover:border-accent-blue transition-all"
            >
              <History size={14} />
              History
            </button>

            <button
              type="button"
              onClick={handlePreview}
              disabled={loading || saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-surface-blue-dark text-primary-blue text-xs font-bold hover:border-accent-blue transition-all shadow-sm disabled:opacity-50"
            >
              <Eye size={14} />
              Preview
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-blue border border-accent-blue/30 text-primary-blue text-xs font-bold hover:bg-accent-blue/10 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>

            {publishedStatus === "published" && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={loading || unpublishing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
              >
                {unpublishing ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />}
                Unpublish
              </button>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={loading || publishing}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90 transition-all shadow-md disabled:opacity-50"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Publish
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 px-4 py-3 rounded-xl text-xs font-semibold border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Section Editor Body */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-16 text-center text-primary-blue-light/60">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-accent-blue" />
          Loading section editor...
        </div>
      ) : (
        <>
          {children}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-xs font-medium text-primary-blue-light/50 hover:text-primary-blue inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={12} /> Load Original Website Defaults into Draft
            </button>
          </div>
        </>
      )}

      {/* Version History Modal */}
      {revisionsOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRevisionsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-xl max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-blue-dark flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary-blue">
                  Revision History — {title}
                </h3>
                <p className="text-xs text-primary-blue-light/60">
                  Restore any published snapshot back into your draft.
                </p>
              </div>
              <button
                onClick={() => setRevisionsOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-blue text-primary-blue-light/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingRevisions ? (
                <div className="py-10 text-center text-xs text-primary-blue-light/60">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-accent-blue" />
                  Loading revisions...
                </div>
              ) : revisions.length === 0 ? (
                <p className="py-10 text-center text-sm text-primary-blue-light/60">
                  No published revisions recorded yet. Publish this section to create the first snapshot.
                </p>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-surface-blue-dark bg-surface-blue/30 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary-blue">
                          v{rev.version} · {rev.action.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-primary-blue-light/55">
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-primary-blue-light/70 mt-0.5 truncate">
                        {rev.note || "Snapshot"} · by {rev.createdBy}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(rev)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue transition-colors"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Draft Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-surface-blue-dark w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-surface-blue-dark flex items-center justify-between bg-[#0D3B66] text-white">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-[#D7C2A3]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#D7C2A3]">
                    Admin Draft Preview
                  </p>
                  <p className="text-xs text-white/75">
                    Showing unpublished draft for {title} ({previewUrl})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              className="w-full flex-1 bg-white"
              title={`Preview ${title}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
