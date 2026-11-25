"use client";

import { useState } from "react";
import { TeamCMS, TeamMemberItem } from "@/lib/cms-types";
import { DEFAULT_TEAM_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { CMSMediaField } from "@/components/admin/cms-media-field";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export default function TeamCMSEditorPage() {
  const [data, setData] = useState<TeamCMS>(DEFAULT_TEAM_CMS);

  const addMember = (group: "founder" | "core") => {
    const newMember: TeamMemberItem = {
      id: `team-${Date.now()}`,
      name: "New Team Member",
      designation: group === "founder" ? "Co-Founder" : "Team Member",
      group,
      photo: "",
      initials: "TM",
      accentColor: "#0D3B66",
      biography: "",
      socialLinks: {},
      order: data.members.length + 1,
      visible: true,
    };
    setData({ ...data, members: [...data.members, newMember] });
  };

  const updateMember = (idx: number, patch: Partial<TeamMemberItem>) => {
    const copy = [...data.members];
    copy[idx] = { ...copy[idx], ...patch };
    setData({ ...data, members: copy });
  };

  const removeMember = (id: string) => {
    setData({ ...data, members: data.members.filter((m) => m.id !== id) });
  };

  const moveMember = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= data.members.length) return;
    const copy = [...data.members];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setData({
      ...data,
      members: copy.map((m, i) => ({ ...m, order: i + 1 })),
    });
  };

  return (
    <CMSSectionShell
      section="team"
      title="Team & Leadership"
      description="Manage founding members, advisors, and core team profiles, photos, biographies, social links, display order, and visibility."
      previewPath="/team"
      data={data}
      setData={setData}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">Page Copy &amp; CTA</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={data.eyebrow}
              onChange={(e) => setData({ ...data, eyebrow: e.target.value })}
              placeholder="Eyebrow"
              className="px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
            <input
              type="text"
              value={data.heading}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
              placeholder="Page Heading"
              className="px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
            <input
              type="text"
              value={data.foundersHeading}
              onChange={(e) => setData({ ...data, foundersHeading: e.target.value })}
              placeholder="Founders Group Heading"
              className="px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue"
            />
          </div>
          <textarea
            rows={2}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue resize-none"
          />
        </div>

        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-bold text-primary-blue">
              Team Members ({data.members.length})
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addMember("founder")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue"
              >
                <Plus size={13} /> Add Founder
              </button>
              <button
                type="button"
                onClick={() => addMember("core")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold"
              >
                <Plus size={13} /> Add Core Member
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {data.members.map((member, idx) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-surface-blue/30 border border-surface-blue-dark space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-blue">#{idx + 1}</span>
                    <select
                      value={member.group}
                      onChange={(e) =>
                        updateMember(idx, { group: e.target.value as "founder" | "core" })
                      }
                      className="px-3 py-1.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue"
                    >
                      <option value="founder">Founding Member</option>
                      <option value="core">Core Team</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-xs font-bold text-primary-blue cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.visible}
                        onChange={(e) => updateMember(idx, { visible: e.target.checked })}
                        className="accent-[#0D3B66]"
                      />
                      Visible
                    </label>
                    <button
                      type="button"
                      onClick={() => moveMember(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white border border-surface-blue-dark disabled:opacity-30"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMember(idx, 1)}
                      disabled={idx === data.members.length - 1}
                      className="p-1.5 rounded-lg bg-white border border-surface-blue-dark disabled:opacity-30"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(idx, { name: e.target.value })}
                    placeholder="Full Name"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm font-semibold text-primary-blue"
                  />
                  <input
                    type="text"
                    value={member.designation}
                    onChange={(e) => updateMember(idx, { designation: e.target.value })}
                    placeholder="Designation / Role"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue"
                  />
                  <input
                    type="text"
                    value={member.initials}
                    onChange={(e) => updateMember(idx, { initials: e.target.value.slice(0, 3) })}
                    placeholder="Initials (e.g. PR)"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue"
                  />
                  <input
                    type="text"
                    value={member.accentColor}
                    onChange={(e) => updateMember(idx, { accentColor: e.target.value })}
                    placeholder="#0D3B66"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue"
                  />
                </div>

                <textarea
                  rows={2}
                  value={member.biography}
                  onChange={(e) => updateMember(idx, { biography: e.target.value })}
                  placeholder="Short biography..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm text-primary-blue resize-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={member.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      updateMember(idx, {
                        socialLinks: { ...member.socialLinks, instagram: e.target.value },
                      })
                    }
                    placeholder="Instagram URL (optional)"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                  <input
                    type="text"
                    value={member.socialLinks?.linkedin || ""}
                    onChange={(e) =>
                      updateMember(idx, {
                        socialLinks: { ...member.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="LinkedIn URL (optional)"
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                </div>

                <CMSMediaField
                  label="Profile Photograph (falls back to styled initials if blank)"
                  value={member.photo}
                  onChange={(url) => updateMember(idx, { photo: url })}
                  section="team"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
