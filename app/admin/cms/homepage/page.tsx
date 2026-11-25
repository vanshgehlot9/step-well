"use client";

import { useState } from "react";
import Link from "next/link";
import { HomepageCMS } from "@/lib/cms-types";
import { DEFAULT_HOMEPAGE_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { ArrowRight } from "lucide-react";

const VISIBILITY_TOGGLES: { key: keyof HomepageCMS["visibility"]; label: string }[] = [
  { key: "showHero", label: "Hero Banner" },
  { key: "showMission", label: "About / Mission Section" },
  { key: "showImpactStats", label: "Impact Statistics Strip" },
  { key: "showFeaturedRestorations", label: "Featured Restorations Carousel" },
  { key: "showMarketplace", label: "Foundation Marketplace Teaser" },
  { key: "showRecognition", label: "Global Recognition & Media" },
  { key: "showSponsors", label: "Sponsors & Partners" },
];

export default function HomepageCMSEditorPage() {
  const [data, setData] = useState<HomepageCMS>(DEFAULT_HOMEPAGE_CMS);

  return (
    <CMSSectionShell
      section="homepage"
      title="Homepage Editor"
      description="Manage the hero headline, description, hero background image & positioning, CTAs, and homepage section visibility."
      previewPath="/"
      data={data}
      setData={setData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Copy & CTAs */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">Hero Text &amp; Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Main Heading
              </label>
              <input
                type="text"
                value={data.mainHeading}
                onChange={(e) => setData({ ...data, mainHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Highlighted / Second Line Heading
              </label>
              <input
                type="text"
                value={data.highlightedHeading}
                onChange={(e) => setData({ ...data, highlightedHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-blue-dark">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Primary CTA Label
              </label>
              <input
                type="text"
                value={data.primaryCtaLabel}
                onChange={(e) => setData({ ...data, primaryCtaLabel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Primary CTA URL
              </label>
              <input
                type="text"
                value={data.primaryCtaUrl}
                onChange={(e) => setData({ ...data, primaryCtaUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Secondary CTA Label
              </label>
              <input
                type="text"
                value={data.secondaryCtaLabel}
                onChange={(e) => setData({ ...data, secondaryCtaLabel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Secondary CTA URL
              </label>
              <input
                type="text"
                value={data.secondaryCtaUrl}
                onChange={(e) => setData({ ...data, secondaryCtaUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
          </div>
        </div>

        {/* Hero Image & Visibility */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary-blue">Hero Visuals</h2>

            <CMSMediaField
              label="Hero Background Image"
              value={data.heroImage}
              onChange={(url) => setData({ ...data, heroImage: url })}
              section="homepage"
              acceptType="image"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={data.heroImageAlt}
                  onChange={(e) => setData({ ...data, heroImageAlt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Hero Image Positioning
                </label>
                <select
                  value={data.heroImagePosition}
                  onChange={(e) =>
                    setData({
                      ...data,
                      heroImagePosition: e.target.value as HomepageCMS["heroImagePosition"],
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue bg-white outline-none focus:border-accent-blue"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-primary-blue">
                Section Visibility
              </h2>
              <Link
                href="/admin/cms/projects-impact"
                className="text-xs font-bold text-accent-blue hover:underline inline-flex items-center gap-1"
              >
                Edit Impact Stats <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VISIBILITY_TOGGLES.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-blue/50 border border-surface-blue-dark text-xs font-semibold text-primary-blue cursor-pointer hover:border-accent-blue transition-colors"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={data.visibility[item.key]}
                    onChange={(e) =>
                      setData({
                        ...data,
                        visibility: {
                          ...data.visibility,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#0D3B66] w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
