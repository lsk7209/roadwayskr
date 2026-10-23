"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Auto Ads cannot be unloaded; history and programmatic routing need a new document. */
export function AdDocumentGuard() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const loadedAt = document.documentElement.dataset.autoAdsLocation;
    if (loadedAt && loadedAt !== location.pathname + location.search)
      location.reload();
  }, [pathname, search]);

  useEffect(() => {
    const onHistory = () => {
      const loadedAt = document.documentElement.dataset.autoAdsLocation;
      // Hash-only navigation (e.g. the skip link) stays in the same document.
      if (loadedAt && loadedAt !== location.pathname + location.search)
        location.reload();
    };
    window.addEventListener("popstate", onHistory, true);
    return () => window.removeEventListener("popstate", onHistory, true);
  }, []);
  return null;
}
