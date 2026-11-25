"use client";

import { useState } from "react";
import { AboutFoundationCMS } from "@/lib/cms-types";
import { DEFAULT_ABOUT_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { Plus, Trash2 } from "lucide-react";

export default function AboutFoundationCMSEditorPage() {
  const [data, setData] = useState<AboutFoundationCMS>(DEFAULT_ABOUT_CMS);

  const addWhoWeAre = () => {
    setData({
      ...data,
      whoWeAreItems: [
        ...data.whoWeAreItems,
        { id: `who-${Date.now()}`, title: "New Pillar", body: "" },
      ],
    });
  };

  const removeWhoWeAre = (id: string) => {
    setData({
      ...data,
      whoWeAreItems: data.whoWeAreItems.filter((item) => item.id !== id),
    });
  };

  const addMissionCard = () => {
    setData({
      ...data,
      missionCards: [
        ...data.missionCards,
        { id: `mc-${Date.now()}`, title: "New Focus", description: "", iconName: "Droplets" },
      ],
    });
  };

  const removeMissionCard = (id: string) => {
    setData({
      ...data,
      missionCards: data.missionCards.filter((card) => card.id !== id),
    });
  };

  return (
    <CMSSectionShell
      section="aboutFoundation"
      title="About Foundation Editor"
      description="Edit both the homepage mission summary and the full /about story, founders, mission pillars, and vision."
      previewPath="/about"
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        {/* Homepage Mission Block */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">
            Homepage Mission Section
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={data.sectionHeading}
                onChange={(e) => setData({ ...data, sectionHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Highlighted Heading
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
              Foundation Description
            </label>
            <textarea
              rows={3}
              value={data.foundationDescription}
              onChange={(e) => setData({ ...data, foundationDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Story &amp; History
              </label>
              <textarea
                rows={3}
                value={data.storyAndHistory}
                onChange={(e) => setData({ ...data, storyAndHistory: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Founder Information
              </label>
              <textarea
                rows={3}
                value={data.founderInformation}
                onChange={(e) => setData({ ...data, founderInformation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <CMSMediaField
              label="Supporting Image"
              value={data.supportingImage}
              onChange={(url) => setData({ ...data, supportingImage: url })}
              section="about"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Read Our Story Button Label
                </label>
                <input
                  type="text"
                  value={data.readStoryButtonLabel}
                  onChange={(e) => setData({ ...data, readStoryButtonLabel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Read Our Story URL
                </label>
                <input
                  type="text"
                  value={data.readStoryButtonUrl}
                  onChange={(e) => setData({ ...data, readStoryButtonUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
              </div>
            </div>
          </div>
        </div>

        {/* /about Page: Who We Are & Supporting Images */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              About Page — Who We Are &amp; Supporting Gallery
            </h2>
            <button
              type="button"
              onClick={addWhoWeAre}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue"
            >
              <Plus size={14} /> Add Story Block
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Page Eyebrow
              </label>
              <input
                type="text"
                value={data.pageEyebrow}
                onChange={(e) => setData({ ...data, pageEyebrow: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Page Main Heading
              </label>
              <input
                type="text"
                value={data.pageHeading}
                onChange={(e) => setData({ ...data, pageHeading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <div className="space-y-3">
            {data.whoWeAreItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const copy = [...data.whoWeAreItems];
                      copy[idx] = { ...item, title: e.target.value };
                      setData({ ...data, whoWeAreItems: copy });
                    }}
                    placeholder="Title"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm font-bold text-primary-blue outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={() => removeWhoWeAre(item.id)}
                    className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.body}
                  onChange={(e) => {
                    const copy = [...data.whoWeAreItems];
                    copy[idx] = { ...item, body: e.target.value };
                    setData({ ...data, whoWeAreItems: copy });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 border-t border-surface-blue-dark">
            <div className="space-y-2">
              <CMSMediaField
                label="Primary Showcase Image"
                value={data.galleryPrimaryImage}
                onChange={(url) => setData({ ...data, galleryPrimaryImage: url })}
                section="about"
              />
              <input
                type="text"
                value={data.galleryPrimaryTitle}
                onChange={(e) => setData({ ...data, galleryPrimaryTitle: e.target.value })}
                placeholder="Caption Title"
                className="w-full px-3 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
              <input
                type="text"
                value={data.galleryPrimarySubtitle}
                onChange={(e) => setData({ ...data, galleryPrimarySubtitle: e.target.value })}
                placeholder="Caption Subtitle"
                className="w-full px-3 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
            </div>

            <div className="space-y-2">
              <CMSMediaField
                label="Secondary Left Image"
                value={data.gallerySecondaryLeftImage}
                onChange={(url) => setData({ ...data, gallerySecondaryLeftImage: url })}
                section="about"
              />
              <input
                type="text"
                value={data.gallerySecondaryLeftTitle}
                onChange={(e) => setData({ ...data, gallerySecondaryLeftTitle: e.target.value })}
                placeholder="Caption"
                className="w-full px-3 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
            </div>

            <div className="space-y-2">
              <CMSMediaField
                label="Secondary Right Image"
                value={data.gallerySecondaryRightImage}
                onChange={(url) => setData({ ...data, gallerySecondaryRightImage: url })}
                section="about"
              />
              <input
                type="text"
                value={data.gallerySecondaryRightTitle}
                onChange={(e) => setData({ ...data, gallerySecondaryRightTitle: e.target.value })}
                placeholder="Caption"
                className="w-full px-3 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-primary-blue">Mission Pillars</h2>
              <button
                type="button"
                onClick={addMissionCard}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Add Card
              </button>
            </div>

            <input
              type="text"
              value={data.missionHeading}
              onChange={(e) => setData({ ...data, missionHeading: e.target.value })}
              placeholder="Mission Heading"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none"
            />
            <textarea
              rows={2}
              value={data.missionDescription}
              onChange={(e) => setData({ ...data, missionDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none resize-none"
            />

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {data.missionCards.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-3 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const copy = [...data.missionCards];
                        copy[idx] = { ...card, title: e.target.value };
                        setData({ ...data, missionCards: copy });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue"
                    />
                    <select
                      value={card.iconName}
                      onChange={(e) => {
                        const copy = [...data.missionCards];
                        copy[idx] = { ...card, iconName: e.target.value };
                        setData({ ...data, missionCards: copy });
                      }}
                      className="px-2 py-1.5 rounded-lg bg-white border border-surface-blue-dark text-xs text-primary-blue"
                    >
                      <option value="Droplets">Droplets</option>
                      <option value="Landmark">Landmark</option>
                      <option value="Users">Users</option>
                      <option value="HeartHandshake">HeartHandshake</option>
                      <option value="Droplet">Droplet</option>
                      <option value="Sparkles">Sparkles</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeMissionCard(card.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={card.description}
                    onChange={(e) => {
                      const copy = [...data.missionCards];
                      copy[idx] = { ...card, description: e.target.value };
                      setData({ ...data, missionCards: copy });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary-blue">Vision Section</h2>

            <input
              type="text"
              value={data.visionHeading}
              onChange={(e) => setData({ ...data, visionHeading: e.target.value })}
              placeholder="Vision Heading"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none"
            />
            <textarea
              rows={3}
              value={data.visionParagraph1}
              onChange={(e) => setData({ ...data, visionParagraph1: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none resize-none"
            />
            <textarea
              rows={3}
              value={data.visionParagraph2}
              onChange={(e) => setData({ ...data, visionParagraph2: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none resize-none"
            />
            <CMSMediaField
              label="Vision Image"
              value={data.visionImage}
              onChange={(url) => setData({ ...data, visionImage: url })}
              section="about"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={data.visionQuote}
                onChange={(e) => setData({ ...data, visionQuote: e.target.value })}
                placeholder="Overlay Quote"
                className="w-full px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
              <input
                type="text"
                value={data.visionQuoteAuthor}
                onChange={(e) => setData({ ...data, visionQuoteAuthor: e.target.value })}
                placeholder="Quote Attribution"
                className="w-full px-3.5 py-2 rounded-xl border border-surface-blue-dark text-xs text-primary-blue"
              />
            </div>
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
