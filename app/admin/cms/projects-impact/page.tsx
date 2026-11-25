"use client";

import { useState } from "react";
import Link from "next/link";
import { ImpactStatisticsCMS } from "@/lib/cms-types";
import { DEFAULT_IMPACT_STATISTICS_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { ArrowDown, ArrowRight, ArrowUp, Plus, Trash2 } from "lucide-react";

export default function ProjectsAndImpactCMSPage() {
  const [statsData, setStatsData] = useState<ImpactStatisticsCMS>(DEFAULT_IMPACT_STATISTICS_CMS);

  const addStat = () => {
    setStatsData({
      ...statsData,
      items: [
        ...statsData.items,
        {
          id: `stat-${Date.now()}`,
          value: "0",
          label: "New Metric",
          description: "",
          icon: "🏛️",
          order: statsData.items.length + 1,
          visible: true,
        },
      ],
    });
  };

  const removeStat = (id: string) => {
    setStatsData({
      ...statsData,
      items: statsData.items.filter((i) => i.id !== id),
    });
  };

  const moveStat = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= statsData.items.length) return;
    const copy = [...statsData.items];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setStatsData({
      ...statsData,
      items: copy.map((item, i) => ({ ...item, order: i + 1 })),
    });
  };

  return (
    <div className="space-y-8">
      <CMSSectionShell
        section="impactStatistics"
        title="Projects & Impact Statistics"
        description="Edit dynamic homepage impact statistics (number, label, description, order) without auto-incrementing, and manage restoration projects."
        previewPath="/"
        data={statsData}
        setData={setStatsData}
        extraActions={
          <Link
            href="/admin/cms/featured-restorations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-primary-blue text-xs font-bold hover:border-accent-blue transition-all"
          >
            Manage Restoration Projects <ArrowRight size={13} />
          </Link>
        }
      >
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary-blue">
                Impact Statistics
              </h2>
              <p className="text-xs text-primary-blue-light/65">
                Values shown here are strictly controlled by you — never auto-invented or auto-incremented.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue cursor-pointer">
                <input
                  type="checkbox"
                  checked={statsData.sectionVisible}
                  onChange={(e) =>
                    setStatsData({ ...statsData, sectionVisible: e.target.checked })
                  }
                  className="accent-[#0D3B66] w-4 h-4"
                />
                Section Visible
              </label>

              <button
                type="button"
                onClick={addStat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold hover:bg-[#0D3B66]/90"
              >
                <Plus size={14} /> Add Statistic
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {statsData.items.map((stat, idx) => (
              <div
                key={stat.id}
                className="p-4 rounded-2xl bg-surface-blue/35 border border-surface-blue-dark grid grid-cols-1 md:grid-cols-[90px_140px_1fr_1.4fr_auto] gap-3 items-center"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={stat.icon}
                    onChange={(e) => {
                      const copy = [...statsData.items];
                      copy[idx] = { ...stat, icon: e.target.value };
                      setStatsData({ ...statsData, items: copy });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-center text-base"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                    Number / Value
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const copy = [...statsData.items];
                      copy[idx] = { ...stat, value: e.target.value };
                      setStatsData({ ...statsData, items: copy });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm font-bold text-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const copy = [...statsData.items];
                      copy[idx] = { ...stat, label: e.target.value };
                      setStatsData({ ...statsData, items: copy });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-sm font-semibold text-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-primary-blue-light/60 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={stat.description}
                    onChange={(e) => {
                      const copy = [...statsData.items];
                      copy[idx] = { ...stat, description: e.target.value };
                      setStatsData({ ...statsData, items: copy });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-surface-blue-dark text-xs text-primary-blue"
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-4 md:pt-0">
                  <label className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-blue mr-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stat.visible}
                      onChange={(e) => {
                        const copy = [...statsData.items];
                        copy[idx] = { ...stat, visible: e.target.checked };
                        setStatsData({ ...statsData, items: copy });
                      }}
                      className="accent-[#0D3B66]"
                    />
                    Show
                  </label>
                  <button
                    type="button"
                    onClick={() => moveStat(idx, -1)}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-white border border-surface-blue-dark disabled:opacity-30"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStat(idx, 1)}
                    disabled={idx === statsData.items.length - 1}
                    className="p-2 rounded-xl bg-white border border-surface-blue-dark disabled:opacity-30"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStat(stat.id)}
                    className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CMSSectionShell>

      {/* Link Cards to Unified Projects Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
        <Link
          href="/admin/cms/featured-restorations"
          className="p-6 rounded-3xl bg-white border border-surface-blue-dark hover:border-accent-blue transition-all shadow-sm flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent-blue">
              Restoration Stories &amp; Photos
            </p>
            <h3 className="font-serif text-xl font-bold text-primary-blue mt-1">
              Edit Restorations, Galleries &amp; Publish Status
            </h3>
            <p className="text-xs text-primary-blue-light/65 mt-1">
              Create, edit, upload photographs, feature/unfeature, reorder, and publish projects.
            </p>
          </div>
          <ArrowRight size={20} className="text-accent-blue shrink-0" />
        </Link>

        <Link
          href="/admin/projects"
          className="p-6 rounded-3xl bg-white border border-surface-blue-dark hover:border-accent-blue transition-all shadow-sm flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent-blue">
              Platform Operations
            </p>
            <h3 className="font-serif text-xl font-bold text-primary-blue mt-1">
              Open Existing Projects Progress Tracker
            </h3>
            <p className="text-xs text-primary-blue-light/65 mt-1">
              Uses the exact same shared Firestore projects collection with zero duplicate records.
            </p>
          </div>
          <ArrowRight size={20} className="text-accent-blue shrink-0" />
        </Link>
      </div>
    </div>
  );
}
