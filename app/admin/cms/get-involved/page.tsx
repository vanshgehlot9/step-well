"use client";

import { useState } from "react";
import { InvolvementContentCMS } from "@/lib/cms-types";
import { DEFAULT_INVOLVEMENT_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { Plus, Trash2 } from "lucide-react";

export default function GetInvolvedCMSEditorPage() {
  const [data, setData] = useState<InvolvementContentCMS>(DEFAULT_INVOLVEMENT_CMS);

  const addGuideline = () => {
    setData({
      ...data,
      volunteerGuidelines: [...data.volunteerGuidelines, "New volunteer guideline"],
    });
  };

  return (
    <CMSSectionShell
      section="involvementContent"
      title="Get Involved & Donations Content"
      description="Edit volunteer & guardian messaging, donation page copy, CTAs, and supporting photographs. Payment processing and donation records remain unchanged."
      previewPath="/get-involved"
      data={data}
      setData={setData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteer Section */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">
            Volunteer &amp; Guardian Section (/get-involved)
          </h2>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Volunteer Section Heading
            </label>
            <input
              type="text"
              value={data.volunteerHeading}
              onChange={(e) => setData({ ...data, volunteerHeading: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Volunteer Description
            </label>
            <textarea
              rows={3}
              value={data.volunteerDescription}
              onChange={(e) => setData({ ...data, volunteerDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Become a Guardian CTA Label
              </label>
              <input
                type="text"
                value={data.volunteerCtaLabel}
                onChange={(e) => setData({ ...data, volunteerCtaLabel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Become a Guardian CTA URL
              </label>
              <input
                type="text"
                value={data.volunteerCtaUrl}
                onChange={(e) => setData({ ...data, volunteerCtaUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>

          <CMSMediaField
            label="Volunteer Supporting Photograph"
            value={data.volunteerImage}
            onChange={(url) => setData({ ...data, volunteerImage: url })}
            section="involvement"
          />

          <div className="space-y-2 pt-2 border-t border-surface-blue-dark">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70">
                Volunteer Guidelines
              </label>
              <button
                type="button"
                onClick={addGuideline}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={12} /> Add Rule
              </button>
            </div>
            {data.volunteerGuidelines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const copy = [...data.volunteerGuidelines];
                    copy[idx] = e.target.value;
                    setData({ ...data, volunteerGuidelines: copy });
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
                />
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      volunteerGuidelines: data.volunteerGuidelines.filter((_, i) => i !== idx),
                    })
                  }
                  className="p-2 rounded-xl bg-red-50 text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Donations Section */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">
            Donations Section (/donate)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Donation Section Heading
              </label>
              <input
                type="text"
                value={data.donationHeading}
                onChange={(e) => setData({ ...data, donationHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Donation Subheading
              </label>
              <input
                type="text"
                value={data.donationSubheading}
                onChange={(e) => setData({ ...data, donationSubheading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Donation Description
            </label>
            <textarea
              rows={3}
              value={data.donationDescription}
              onChange={(e) => setData({ ...data, donationDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Donation CTA Label
              </label>
              <input
                type="text"
                value={data.donationCtaLabel}
                onChange={(e) => setData({ ...data, donationCtaLabel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Security / 80G Note
              </label>
              <input
                type="text"
                value={data.donationSecurityNote}
                onChange={(e) => setData({ ...data, donationSecurityNote: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
              />
            </div>
          </div>

          <CMSMediaField
            label="Donation Supporting Photograph (Optional — replaces illustration if provided)"
            value={data.donationImage}
            onChange={(url) => setData({ ...data, donationImage: url })}
            section="involvement"
          />
        </div>
      </div>
    </CMSSectionShell>
  );
}
