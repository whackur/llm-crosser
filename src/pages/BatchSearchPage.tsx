import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { QueryInputBar } from "@/src/components/query/QueryInputBar";
import { FileUploadButton } from "@/src/components/query/FileUploadButton";
import { IframeGrid } from "@/src/components/grid/IframeGrid";
import { IframeWrapper } from "@/src/components/grid/IframeWrapper";
import { SharePopup } from "@/src/components/share/SharePopup";
import { useSettings } from "@/src/hooks/useSettings";
import { useHistory } from "@/src/hooks/useHistory";
import { useSiteConfig } from "@/src/hooks/useSiteConfig";
import { extractContent } from "@/src/lib/messaging";
import { startConversationUrlCapture } from "@/src/lib/conversation-url-capture";
import type { HistoryEntry } from "@/src/types/history";
import type { GridLayout } from "@/src/types/settings";

export default function BatchSearchPage() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { history, addEntry, updateEntry } = useHistory();
  const { siteConfigs, loading: configLoading } = useSiteConfig();
  const [isQuerying, setIsQuerying] = useState(false);
  const [siteUrlOverrides, setSiteUrlOverrides] = useState<Record<string, string>>({});
  const [shareState, setShareState] = useState<{
    isOpen: boolean;
    siteName: string;
    content: string;
  }>({
    isOpen: false,
    siteName: "",
    content: "",
  });
  const urlCaptureCleanupRef = useRef<(() => void) | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const historyId = searchParams.get("historyId") || "";
  const autoSentQueryRef = useRef<string>("");
  const appliedHistoryIdRef = useRef<string>("");

  const siteList = useMemo(
    () =>
      siteConfigs.map((site) => ({
        name: site.name,
        url: String(site.url),
        enabled: settings?.enabledSites.includes(site.name) ?? false,
      })),
    [siteConfigs, settings?.enabledSites],
  );

  const handleSend = useCallback(
    async (query: string) => {
      const enabledSites = siteList.filter((s) => s.enabled);
      if (enabledSites.length === 0) return;

      setIsQuerying(true);

      const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
      const normalizeHost = (h: string) => h.toLowerCase().replace(/^www\./, "");

      const sends = enabledSites.map(
        (site, i) =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              const config = siteConfigs.find((c) => c.name === site.name);
              if (!config?.searchHandler) {
                resolve();
                return;
              }

              try {
                const siteHost = normalizeHost(new URL(site.url).hostname);

                for (const iframe of iframes) {
                  try {
                    const iframeHost = normalizeHost(new URL(iframe.src).hostname);
                    if (
                      iframeHost === siteHost ||
                      iframeHost.endsWith(`.${siteHost}`) ||
                      siteHost.endsWith(`.${iframeHost}`)
                    ) {
                      iframe.contentWindow?.postMessage(
                        {
                          type: "INJECT_QUERY_VIA_POST",
                          siteName: site.name,
                          query,
                          searchHandler: config.searchHandler,
                        },
                        "*",
                      );
                      break;
                    }
                  } catch {
                    // Invalid iframe URL, skip
                  }
                }
              } catch {
                // Invalid site URL, skip
              }

              resolve();
            }, i * 200);
          }),
      );

      await Promise.all(sends);

      const entryId = crypto.randomUUID();
      const entry: HistoryEntry = {
        id: entryId,
        query,
        timestamp: Date.now(),
        siteResults: enabledSites.map((s) => ({ siteName: s.name })),
      };
      await addEntry(entry);

      setIsQuerying(false);

      urlCaptureCleanupRef.current?.();
      urlCaptureCleanupRef.current = startConversationUrlCapture({
        sites: enabledSites,
        onCaptured: (siteResults) => {
          const withUrls = siteResults.filter((r) => r.conversationUrl);
          if (withUrls.length > 0) {
            void updateEntry(entryId, { siteResults });
          }
        },
      });
    },
    [siteList, siteConfigs, addEntry, updateEntry],
  );

  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  useEffect(() => {
    if (!urlQuery || settingsLoading || configLoading || !settings) return;
    if (autoSentQueryRef.current === urlQuery) return;

    autoSentQueryRef.current = urlQuery;

    const timer = setTimeout(() => {
      handleSendRef.current(urlQuery);
      setSearchParams({}, { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [urlQuery, settingsLoading, configLoading, settings, setSearchParams]);

  useEffect(() => {
    if (!historyId || settingsLoading || configLoading || !settings) return;
    if (appliedHistoryIdRef.current === historyId) return;

    const entry = history.find((e) => e.id === historyId);
    if (!entry) return;

    appliedHistoryIdRef.current = historyId;

    const overrides: Record<string, string> = {};
    for (const result of entry.siteResults) {
      if (result.conversationUrl) {
        overrides[result.siteName] = result.conversationUrl;
      }
    }
    setSiteUrlOverrides(overrides);
    setSearchParams({}, { replace: true });
  }, [historyId, history, settingsLoading, configLoading, settings, setSearchParams]);

  const handleLayoutChange = useCallback(
    (layout: GridLayout) => {
      void updateSettings({ gridLayout: layout });
    },
    [updateSettings],
  );

  const handleColumnsChange = useCallback(
    (cols: 1 | 2 | 3 | 4) => {
      void updateSettings({ gridColumns: cols });
    },
    [updateSettings],
  );

  const enabledSiteNames = useMemo(
    () => siteList.filter((s) => s.enabled).map((s) => s.name),
    [siteList],
  );

  const handleShare = useCallback(async (siteName: string) => {
    try {
      const response = await extractContent(siteName);
      let markdown = "No conversation content extracted yet.";

      if (typeof response === "string") {
        markdown = response;
      } else if (response !== null && typeof response === "object") {
        const obj = response as Record<string, unknown>;
        if (typeof obj["markdown"] === "string") {
          markdown = obj["markdown"];
        } else if (typeof obj["error"] === "string") {
          markdown = `Error: ${obj["error"]}`;
        }
      }

      setShareState({ isOpen: true, siteName, content: markdown });
    } catch {
      setShareState({
        isOpen: true,
        siteName,
        content: "Failed to extract conversation content.",
      });
    }
  }, []);

  const renderIframe = useCallback(
    (site: { name: string; url: string }) => {
      const effectiveUrl = siteUrlOverrides[site.name] || site.url;
      return <IframeWrapper siteName={site.name} siteUrl={effectiveUrl} onShare={handleShare} />;
    },
    [handleShare, siteUrlOverrides],
  );

  if (settingsLoading || configLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-0">
        <IframeGrid
          layout={settings.gridLayout}
          columns={settings.gridColumns}
          onLayoutChange={handleLayoutChange}
          onColumnsChange={handleColumnsChange}
          sites={siteList}
          renderIframe={renderIframe}
        />
      </div>
      <div className="p-4 border-t border-border bg-surface/95 backdrop-blur-sm shrink-0">
        <div className="flex items-start gap-2 max-w-5xl mx-auto w-full">
          <div className="flex-1 min-w-0">
            <QueryInputBar
              onSend={handleSend}
              initialQuery={urlQuery}
              promptTemplates={settings.promptTemplates}
              disabled={isQuerying}
            />
          </div>
          <FileUploadButton enabledSites={enabledSiteNames} disabled={isQuerying} />
        </div>
      </div>
      <SharePopup
        isOpen={shareState.isOpen}
        onClose={() => setShareState((prev) => ({ ...prev, isOpen: false }))}
        siteName={shareState.siteName}
        markdownContent={shareState.content}
      />
    </div>
  );
}
