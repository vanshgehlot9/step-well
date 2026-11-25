"use client";

import { useState } from "react";
import { FooterCMS } from "@/lib/cms-types";
import { DEFAULT_FOOTER_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { Plus, Trash2 } from "lucide-react";

export default function FooterContactCMSEditorPage() {
  const [data, setData] = useState<FooterCMS>(DEFAULT_FOOTER_CMS);

  const addLinkToColumn = (colIdx: number) => {
    const copy = [...data.navigationColumns];
    copy[colIdx] = {
      ...copy[colIdx],
      links: [
        ...copy[colIdx].links,
        { id: `link-${Date.now()}`, label: "New Link", href: "/" },
      ],
    };
    setData({ ...data, navigationColumns: copy });
  };

  const removeLinkFromColumn = (colIdx: number, linkId: string) => {
    const copy = [...data.navigationColumns];
    copy[colIdx] = {
      ...copy[colIdx],
      links: copy[colIdx].links.filter((l) => l.id !== linkId),
    };
    setData({ ...data, navigationColumns: copy });
  };

  return (
    <CMSSectionShell
      section="footer"
      title="Footer & Contact Editor"
      description="Manage foundation branding, logo, contact email/phone/address, Google Maps link, footer navigation links, social URLs, and copyright text."
      previewPath="/contact"
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand & CTA Strip */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Foundation Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Foundation Full Name
                </label>
                <input
                  type="text"
                  value={data.foundationName}
                  onChange={(e) => setData({ ...data, foundationName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Brand Word 1
                </label>
                <input
                  type="text"
                  value={data.foundationBrandPrimary}
                  onChange={(e) => setData({ ...data, foundationBrandPrimary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Brand Word 2 (Accent)
                </label>
                <input
                  type="text"
                  value={data.foundationBrandAccent}
                  onChange={(e) => setData({ ...data, foundationBrandAccent: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={data.copyrightText}
                  onChange={(e) => setData({ ...data, copyrightText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>
            </div>

            <CMSMediaField
              label="Foundation Logo"
              value={data.logo}
              onChange={(url) => setData({ ...data, logo: url })}
              section="footer"
            />

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Short Description
              </label>
              <textarea
                rows={3}
                value={data.shortDescription}
                onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
              />
            </div>

            <div className="pt-3 border-t border-surface-blue-dark space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-blue">
                Footer Top CTA Banner
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.ctaHeading}
                  onChange={(e) => setData({ ...data, ctaHeading: e.target.value })}
                  placeholder="Headline"
                  className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="text"
                  value={data.ctaHighlight}
                  onChange={(e) => setData({ ...data, ctaHighlight: e.target.value })}
                  placeholder="Highlighted Phrase"
                  className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="text"
                  value={data.ctaPrimaryLabel}
                  onChange={(e) => setData({ ...data, ctaPrimaryLabel: e.target.value })}
                  placeholder="Primary CTA Label"
                  className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="text"
                  value={data.ctaPrimaryUrl}
                  onChange={(e) => setData({ ...data, ctaPrimaryUrl: e.target.value })}
                  placeholder="Primary CTA URL"
                  className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="text"
                  value={data.ctaSecondaryLabel}
                  onChange={(e) => setData({ ...data, ctaSecondaryLabel: e.target.value })}
                  placeholder="Secondary CTA Label"
                  className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
                <input
                  type="text"
                  value={data.ctaSecondaryUrl}
                  onChange={(e) => setData({ ...data, ctaSecondaryUrl: e.target.value })}
                  placeholder="Secondary CTA URL"
                  className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
              </div>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Contact &amp; Social Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Physical Address
              </label>
              <textarea
                rows={2}
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Google Maps Link
              </label>
              <input
                type="text"
                value={data.googleMapsLink}
                onChange={(e) => setData({ ...data, googleMapsLink: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1">
                Google Maps Embed URL (/contact page)
              </label>
              <input
                type="text"
                value={data.googleMapsEmbedUrl}
                onChange={(e) => setData({ ...data, googleMapsEmbedUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
            </div>

            <div className="pt-3 border-t border-surface-blue-dark space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-blue">
                Social Media URLs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["instagram", "twitter", "facebook", "youtube", "linkedin"] as const).map(
                  (platform) => (
                    <input
                      key={platform}
                      type="text"
                      value={data.socialLinks[platform] || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          socialLinks: {
                            ...data.socialLinks,
                            [platform]: e.target.value,
                          },
                        })
                      }
                      placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                      className="px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">
            Footer Navigation Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.navigationColumns.map((col, colIdx) => (
              <div
                key={col.id}
                className="p-4 rounded-2xl bg-surface-blue/30 border border-surface-blue-dark space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={col.heading}
                    onChange={(e) => {
                      const copy = [...data.navigationColumns];
                      copy[colIdx] = { ...col, heading: e.target.value };
                      setData({ ...data, navigationColumns: copy });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold uppercase tracking-wider text-primary-blue"
                  />
                  <button
                    type="button"
                    onClick={() => addLinkToColumn(colIdx)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue"
                  >
                    <Plus size={12} /> Add Link
                  </button>
                </div>

                <div className="space-y-2">
                  {col.links.map((link, linkIdx) => (
                    <div key={link.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const copy = [...data.navigationColumns];
                          const links = [...col.links];
                          links[linkIdx] = { ...link, label: e.target.value };
                          copy[colIdx] = { ...col, links };
                          setData({ ...data, navigationColumns: copy });
                        }}
                        placeholder="Label"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => {
                          const copy = [...data.navigationColumns];
                          const links = [...col.links];
                          links[linkIdx] = { ...link, href: e.target.value };
                          copy[colIdx] = { ...col, links };
                          setData({ ...data, navigationColumns: copy });
                        }}
                        placeholder="/route"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                      />
                      <button
                        type="button"
                        onClick={() => removeLinkFromColumn(colIdx, link.id)}
                        className="p-1.5 rounded-xl bg-red-50 text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
