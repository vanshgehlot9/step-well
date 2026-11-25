"use client";

import { useState } from "react";
import { SponsorPartnerItem, SponsorsCMS } from "@/lib/cms-types";
import { DEFAULT_SPONSORS_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export default function SponsorsCMSEditorPage() {
  const [data, setData] = useState<SponsorsCMS>(DEFAULT_SPONSORS_CMS);

  const addPartner = () => {
    const newItem: SponsorPartnerItem = {
      id: `sp-${Date.now()}`,
      name: "New Partner",
      logo: "",
      websiteUrl: "",
      shortDescription: "",
      order: data.items.length + 1,
      visible: true,
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const updatePartner = (idx: number, patch: Partial<SponsorPartnerItem>) => {
    const copy = [...data.items];
    copy[idx] = { ...copy[idx], ...patch };
    setData({ ...data, items: copy });
  };

  const removePartner = (id: string) => {
    setData({ ...data, items: data.items.filter((i) => i.id !== id) });
  };

  const movePartner = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= data.items.length) return;
    const copy = [...data.items];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setData({
      ...data,
      items: copy.map((p, i) => ({ ...p, order: i + 1 })),
    });
  };

  return (
    <CMSSectionShell
      section="sponsors"
      title="Sponsors & Partners"
      description="Add, edit, reorder, and control visibility for foundation sponsors and partners (including Bagheera, Imaginary Studio, and Uptantra)."
      previewPath="/#sponsors"
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">Section Settings</h2>
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
        </div>

        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Partners ({data.items.length})
            </h2>
            <button
              type="button"
              onClick={addPartner}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90"
            >
              <Plus size={14} /> Add Partner
            </button>
          </div>

          <div className="space-y-4">
            {data.items.map((partner, idx) => (
              <div
                key={partner.id}
                className="p-4 rounded-2xl bg-surface-blue/30 border border-surface-blue-dark space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary-blue">
                    Partner #{idx + 1} — {partner.name || "Untitled"}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-blue cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partner.visible}
                        onChange={(e) => updatePartner(idx, { visible: e.target.checked })}
                        className="accent-[#0D3B66]"
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() => movePartner(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white border border-surface-blue-dark disabled:opacity-30"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePartner(idx, 1)}
                      disabled={idx === data.items.length - 1}
                      className="p-1.5 rounded-lg bg-white border border-surface-blue-dark disabled:opacity-30"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePartner(partner.id)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                      Partner Name
                    </label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => updatePartner(idx, { name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm font-semibold text-primary-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={partner.websiteUrl}
                      onChange={(e) => updatePartner(idx, { websiteUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={partner.shortDescription}
                      onChange={(e) => updatePartner(idx, { shortDescription: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue"
                    />
                  </div>
                </div>

                <CMSMediaField
                  label="Partner Logo"
                  value={partner.logo}
                  onChange={(url) => updatePartner(idx, { logo: url })}
                  section="sponsors"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
