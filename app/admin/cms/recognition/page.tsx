"use client";

import { useState } from "react";
import { RecognitionMediaCMS, RecognitionMediaItem, RecognitionMediaType } from "@/lib/cms-types";
import { DEFAULT_RECOGNITION_MEDIA_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export default function RecognitionMediaCMSEditorPage() {
  const [data, setData] = useState<RecognitionMediaCMS>(DEFAULT_RECOGNITION_MEDIA_CMS);

  const addItem = (type: RecognitionMediaType) => {
    const newItem: RecognitionMediaItem = {
      id: `rec-${Date.now()}`,
      type,
      title: "",
      caption: "",
      mediaUrl: "",
      embedUrl: type === "instagram" ? "https://www.instagram.com/reel/.../embed" : "",
      tweetId: type === "tweet" ? "" : "",
      externalUrl: "",
      sourceName: "",
      order: data.items.length + 1,
      visible: true,
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const updateItem = (idx: number, patch: Partial<RecognitionMediaItem>) => {
    const copy = [...data.items];
    copy[idx] = { ...copy[idx], ...patch };
    setData({ ...data, items: copy });
  };

  const removeItem = (id: string) => {
    setData({
      ...data,
      items: data.items.filter((item) => item.id !== id),
    });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= data.items.length) return;
    const copy = [...data.items];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setData({
      ...data,
      items: copy.map((item, i) => ({ ...item, order: i + 1 })),
    });
  };

  return (
    <CMSSectionShell
      section="recognitionMedia"
      title="Global Recognition & Media"
      description="Manage press coverage, newspaper clippings, recognition photos, Instagram embeds, Tweet embeds, and videos."
      previewPath="/#recognition"
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        {/* Section Heading */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">Section Header</h2>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue cursor-pointer">
              <input
                type="checkbox"
                checked={data.visible}
                onChange={(e) => setData({ ...data, visible: e.target.checked })}
                className="accent-[#0D3B66] w-4 h-4"
              />
              Visible on Homepage
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Eyebrow
              </label>
              <input
                type="text"
                value={data.eyebrow}
                onChange={(e) => setData({ ...data, eyebrow: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Heading
              </label>
              <input
                type="text"
                value={data.heading}
                onChange={(e) => setData({ ...data, heading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
            />
          </div>
        </div>

        {/* Media Items */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Media &amp; Press Items ({data.items.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addItem("press")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Press / Clipping
              </button>
              <button
                type="button"
                onClick={() => addItem("image")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Photo
              </button>
              <button
                type="button"
                onClick={() => addItem("video")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Video
              </button>
              <button
                type="button"
                onClick={() => addItem("instagram")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Instagram Embed
              </button>
              <button
                type="button"
                onClick={() => addItem("tweet")}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Tweet Embed
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {data.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-blue/30 border border-surface-blue-dark space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-blue">#{idx + 1}</span>
                    <select
                      value={item.type}
                      onChange={(e) =>
                        updateItem(idx, { type: e.target.value as RecognitionMediaType })
                      }
                      className="px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue"
                    >
                      <option value="press">Press / Newspaper Clipping</option>
                      <option value="image">Recognition Photograph</option>
                      <option value="video">Video</option>
                      <option value="instagram">Instagram Embed</option>
                      <option value="tweet">X / Tweet Embed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-xs font-bold text-primary-blue cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.visible}
                        onChange={(e) => updateItem(idx, { visible: e.target.checked })}
                        className="accent-[#0D3B66]"
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white border border-surface-blue-dark disabled:opacity-30"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === data.items.length - 1}
                      className="p-1.5 rounded-lg bg-white border border-surface-blue-dark disabled:opacity-30"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(idx, { title: e.target.value })}
                    placeholder="Title"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateItem(idx, { caption: e.target.value })}
                    placeholder="Caption / Alt text"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                  <input
                    type="text"
                    value={item.externalUrl || ""}
                    onChange={(e) => updateItem(idx, { externalUrl: e.target.value })}
                    placeholder="External Article / Post URL (optional)"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                </div>

                {(item.type === "press" || item.type === "image" || item.type === "video") && (
                  <CMSMediaField
                    label={item.type === "video" ? "Video Asset" : "Image / Clipping"}
                    value={item.mediaUrl}
                    acceptType={item.type === "video" ? "video" : "image"}
                    section="recognition"
                    onChange={(url) => updateItem(idx, { mediaUrl: url })}
                  />
                )}

                {item.type === "instagram" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                      Instagram Embed URL (e.g. https://www.instagram.com/reel/DaNREiUBxqv/embed)
                    </label>
                    <input
                      type="text"
                      value={item.embedUrl || ""}
                      onChange={(e) => updateItem(idx, { embedUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                    />
                  </div>
                )}

                {item.type === "tweet" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                      Tweet ID (e.g. 2075545878652412085)
                    </label>
                    <input
                      type="text"
                      value={item.tweetId || ""}
                      onChange={(e) => updateItem(idx, { tweetId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
