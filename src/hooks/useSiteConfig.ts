import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import type { SiteConfig, SiteHandlersConfig } from "../types";

export function useSiteConfig() {
  const [siteConfigs, setSiteConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const url = browser.runtime.getURL("/site-handlers.json");
        const response = await fetch(url);
        const data = (await response.json()) as SiteHandlersConfig;
        if (data?.sites) {
          setSiteConfigs(data.sites);
        }
      } catch {
        /* config fetch failure handled by loading state */
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return { siteConfigs, loading };
}
