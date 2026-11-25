"use client";

import { useState } from "react";
import { SiteSettingsCMS } from "@/lib/cms-types";
import { DEFAULT_SITE_SETTINGS_CMS } from "@/lib/cms-defaults";
import { CMSSectionShell } from "@/components/admin/cms-section-shell";
import { seedMissingCMSContent } from "@/lib/cms-services";
import { useAuth } from "@/context/auth-context";
import { Database, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<SiteSettingsCMS>(DEFAULT_SITE_SETTINGS_CMS);
  const [migrating, setMigrating] = useState(false);
  const [migrationMsg, setMigrationMsg] = useState<string | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrationMsg(null);
    try {
      const res = await seedMissingCMSContent(user?.email || "admin");
      setMigrationMsg(
        `Sync complete: initialized ${res.seededSections.length} unseeded CMS section(s) and ${res.seededProjects} restoration project(s) without overwriting existing data.`
      );
    } catch (err) {
      console.error(err);
      setMigrationMsg("Failed to sync initial CMS data. Check Firestore permissions.");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <CMSSectionShell
      section="siteSettings"
      title="Website Settings"
      description="Control global metadata, navbar tagline, announcement banner, and initialize missing CMS sections."
      previewPath="/"
      data={data}
      setData={setData}
      extraActions={
        <button
          type="button"
          onClick={handleMigrate}
          disabled={migrating}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all disabled:opacity-50"
        >
          {migrating ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
          Sync Missing Site Content
        </button>
      }
    >
      {migrationMsg && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {migrationMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-blue">General &amp; SEO</h2>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Site Title
            </label>
            <input
              type="text"
              value={data.siteTitle}
              onChange={(e) => setData({ ...data, siteTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Navbar Brand Tagline
            </label>
            <input
              type="text"
              value={data.navbarTagline}
              onChange={(e) => setData({ ...data, navbarTagline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Site Description
            </label>
            <textarea
              rows={3}
              value={data.siteDescription}
              onChange={(e) => setData({ ...data, siteDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-primary-blue">Announcement Bar</h2>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue cursor-pointer">
              <input
                type="checkbox"
                checked={data.announcementEnabled}
                onChange={(e) => setData({ ...data, announcementEnabled: e.target.checked })}
                className="accent-[#0D3B66] w-4 h-4"
              />
              Show Bar
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Badge Label
            </label>
            <input
              type="text"
              value={data.announcementBadge}
              onChange={(e) => setData({ ...data, announcementBadge: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Message Text
            </label>
            <input
              type="text"
              value={data.announcementText}
              onChange={(e) => setData({ ...data, announcementText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
              Contact Phone CTA
            </label>
            <input
              type="text"
              value={data.announcementPhone}
              onChange={(e) => setData({ ...data, announcementPhone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
            />
          </div>
        </div>
      </div>
    </CMSSectionShell>
  );
}
