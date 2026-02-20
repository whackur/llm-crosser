import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFloatMode } from "@/src/hooks/useFloatMode";
import { useSettings } from "@/src/hooks/useSettings";
import { useSiteConfig } from "@/src/hooks/useSiteConfig";
import { SearchIcon, DetachIcon } from "@/src/components/ui/Icons";
import { ActiveSitesBar } from "@/src/components/grid/ActiveSitesBar";

export function SidepanelHome() {
  const { t } = useTranslation();
  const { isFloatActive, floatState } = useFloatMode();
  const { settings, updateSettings } = useSettings();
  const { siteConfigs } = useSiteConfig();
  const [query, setQuery] = useState("");

  const allSites = useMemo(
    () => siteConfigs.map((site) => ({ name: site.name, url: String(site.url) })),
    [siteConfigs],
  );

  const handleSiteToggle = useCallback(
    (siteName: string, enabled: boolean) => {
      if (!settings) return;
      const current = new Set(settings.enabledSites);
      if (enabled) {
        current.add(siteName);
      } else {
        current.delete(siteName);
      }
      void updateSettings({ enabledSites: Array.from(current) });
    },
    [settings, updateSettings],
  );

  const handleSend = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    chrome.runtime.sendMessage({
      type: "DETACH_BATCH_SEARCH",
      query: trimmed,
    });
    setQuery("");
  };

  const handleOpenWindow = () => {
    chrome.runtime.sendMessage({ type: "DETACH_BATCH_SEARCH" });
  };

  const handleFocusWindow = () => {
    if (!floatState?.windowId) return;
    chrome.windows.update(floatState.windowId, { focused: true }).catch(() => {});
  };

  const handleCloseWindow = () => {
    if (!floatState?.windowId) return;
    chrome.windows.remove(floatState.windowId).catch(() => {});
  };

  return (
    <div className="flex flex-col h-full">
      <ActiveSitesBar
        sites={allSites}
        enabledSites={settings?.enabledSites ?? []}
        onToggle={handleSiteToggle}
      />
      <div className="flex flex-col flex-1 p-4">
        {isFloatActive ? (
          <div className="mb-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
              <span className="text-xs font-medium text-text">{t("sidepanel.windowActive")}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFocusWindow}
                className="flex-1 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-all"
              >
                {t("sidepanel.focusWindow")}
              </button>
              <button
                onClick={handleCloseWindow}
                className="flex-1 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error text-xs font-medium transition-all"
              >
                {t("sidepanel.closeWindow")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleOpenWindow}
            className="mb-3 w-full py-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DetachIcon className="w-3.5 h-3.5" />
            {t("sidepanel.openWindow")}
          </button>
        )}

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("batch.inputPlaceholder")}
          className="w-full min-h-[80px] max-h-[200px] resize-y rounded-xl border border-border bg-surface-secondary p-3 text-sm text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />

        <button
          onClick={handleSend}
          disabled={!query.trim()}
          className="mt-3 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <SearchIcon className="w-4 h-4 mr-2" />
          {t("nav.batchSearch")}
        </button>

        <div className="my-6 border-t border-border/30" />

        <p className="text-xs text-text-secondary/60 text-center px-4 leading-relaxed">
          {t("sidepanel.tip")}
        </p>
      </div>
    </div>
  );
}

export default SidepanelHome;
