"use client";

import { useEffect, useState } from "react";
import { CMSSectionKey } from "./cms-types";
import { CMS_DEFAULTS_MAP } from "./cms-defaults";
import { getDraftCMSSectionForPreview, getPublishedCMSSection } from "./cms-services";
import { useAuth } from "@/context/auth-context";

/**
 * Loads published CMS content for a public website section.
 * Only authorized admins with `?cmsPreview=<section>` or `?cmsPreview=all` can preview draft content.
 */
export function usePublicCMS<T>(section: CMSSectionKey): {
  data: T | null;
  loading: boolean;
  unpublished: boolean;
  isPreview: boolean;
} {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<T | null>(CMS_DEFAULTS_MAP[section] as T);
  const [loading, setLoading] = useState(true);
  const [unpublished, setUnpublished] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      let previewRequested = false;
      if (typeof window !== "undefined" && isAdmin) {
        const params = new URLSearchParams(window.location.search);
        const target = params.get("cmsPreview");
        previewRequested = target === section || target === "all";
      }

      if (previewRequested) {
        const draft = await getDraftCMSSectionForPreview<T>(section);
        if (active) {
          setData(draft);
          setUnpublished(false);
          setIsPreview(true);
          setLoading(false);
        }
        return;
      }

      const result = await getPublishedCMSSection<T>(section);
      if (active) {
        setData(result.data);
        setUnpublished(result.unpublished);
        setIsPreview(false);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [section, isAdmin]);

  return { data, loading, unpublished, isPreview };
}
