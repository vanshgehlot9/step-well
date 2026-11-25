"use client";

import { useState } from "react";
import { MarketplaceContentCMS } from "@/lib/cms-types";
import { DEFAULT_MARKETPLACE_CONTENT_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";

export default function MarketplaceContentCMSEditorPage() {
  const [data, setData] = useState<MarketplaceContentCMS>(DEFAULT_MARKETPLACE_CONTENT_CMS);

  return (
    <CMSSectionShell
      section="marketplaceContent"
      title="Marketplace Content Editor"
      description="Control public-facing marketplace headings, introductions, promotional imagery, and CTA text. Store listings, products, and orders continue running on existing marketplace collections."
      previewPath="/foundation-store"
      data={data}
      setData={setData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Homepage Marketplace Section
            </h2>
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

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Eyebrow
            </label>
            <input
              type="text"
              value={data.homeEyebrow}
              onChange={(e) => setData({ ...data, homeEyebrow: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Heading
            </label>
            <input
              type="text"
              value={data.homeHeading}
              onChange={(e) => setData({ ...data, homeHeading: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={data.homeDescription}
              onChange={(e) => setData({ ...data, homeDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                CTA Button Label
              </label>
              <input
                type="text"
                value={data.homeCtaLabel}
                onChange={(e) => setData({ ...data, homeCtaLabel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                CTA URL
              </label>
              <input
                type="text"
                value={data.homeCtaUrl}
                onChange={(e) => setData({ ...data, homeCtaUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">
            Marketplace Page Banner (/foundation-store)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Page Eyebrow
              </label>
              <input
                type="text"
                value={data.storePageEyebrow}
                onChange={(e) => setData({ ...data, storePageEyebrow: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Page Heading
              </label>
              <input
                type="text"
                value={data.storePageHeading}
                onChange={(e) => setData({ ...data, storePageHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Banner Eyebrow
            </label>
            <input
              type="text"
              value={data.bannerEyebrow}
              onChange={(e) => setData({ ...data, bannerEyebrow: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Banner Description
            </label>
            <textarea
              rows={3}
              value={data.bannerDescription}
              onChange={(e) => setData({ ...data, bannerDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
            />
          </div>

          <CMSMediaField
            label="Promotional Banner Image (Optional)"
            value={data.promotionalImage}
            onChange={(url) => setData({ ...data, promotionalImage: url })}
            section="marketplace"
          />
        </div>
      </div>
    </CMSSectionShell>
  );
}
