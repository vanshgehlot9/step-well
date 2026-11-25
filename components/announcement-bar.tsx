"use client";

import { useState, useEffect } from "react";
import { X, Phone, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { usePublicCMS } from "@/lib/use-cms";
import { SiteSettingsCMS } from "@/lib/cms-types";
import { DEFAULT_SITE_SETTINGS_CMS } from "@/lib/cms-defaults";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: settings, unpublished } = usePublicCMS<SiteSettingsCMS>("siteSettings");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/store-owner")) {
    return null;
  }

  if (!mounted || unpublished || !settings) return null;

  const cms = settings || DEFAULT_SITE_SETTINGS_CMS;
  if (!cms.announcementEnabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0D3B66] border-t border-[#D7C2A3]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]"
        >
          <div className="container mx-auto px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left w-full sm:w-auto">
              <div className="hidden sm:flex bg-[#D7C2A3]/20 p-2 rounded-full shrink-0">
                <Hammer className="w-4 h-4 text-[#D7C2A3]" />
              </div>
              <p className="text-[#F8F6F1] text-[13px] md:text-sm font-medium tracking-wide">
                {cms.announcementBadge && (
                  <span className="text-[#D7C2A3] font-bold mr-1">{cms.announcementBadge}</span>
                )}
                {cms.announcementText}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {cms.announcementPhone && (
                <a
                  href={`tel:${cms.announcementPhone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#D7C2A3] text-[#0D3B66] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {cms.announcementPhone}
                </a>
              )}
              <button
                onClick={() => setIsVisible(false)}
                className="text-[#F8F6F1]/50 hover:text-[#F8F6F1] transition-colors p-1 hidden sm:block"
                aria-label="Dismiss announcement"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
