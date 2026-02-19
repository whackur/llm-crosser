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
import { startConversationUrlCapture } from "@/src/lib/conversation-url-capture";
import { formatConversation, formatAllConversations } from "@/src/lib/html-to-markdown";
import type { ConversationData } from "@/src/lib/content-extractor";
import type { HistoryEntry } from "@/src/types/history";
import type { GridLayout } from "@/src/types/settings";
import type { ContentExtractor } from "@/src/types/site";

export default function BatchSearchPage() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { history, addEntry, updateEntry } = useHistory();
  const { siteConfigs, loading: configLoading } = useSiteConfig();
  const [isQuerying, setIsQuerying] = useState(false);
  const [siteUrlOverrides, setSiteUrlOverrides] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);
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

  useEffect(() => {
    const resetParam = searchParams.get("reset");
    if (!resetParam) return;

    setSiteUrlOverrides({});
    setResetKey((prev) => prev + 1);
    setIsQuerying(false);
    urlCaptureCleanupRef.current?.();
    urlCaptureCleanupRef.current = null;
    autoSentQueryRef.current = "";
    appliedHistoryIdRef.current = "";
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

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

  const postMessageToSiteIframe = useCallback(
    (siteName: string, message: Record<string, unknown>) => {
      const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
      const normalizeHost = (h: string) => h.toLowerCase().replace(/^www\./, "");
      const site = siteList.find((s) => s.name === siteName);
      if (!site) return false;

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
              iframe.contentWindow?.postMessage(message, "*");
              return true;
            }
          } catch {
            /* invalid iframe URL */
          }
        }
      } catch {
        /* invalid site URL */
      }
      return false;
    },
    [siteList],
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const enabledSites = siteList.filter((s) => s.enabled);
      if (enabledSites.length === 0) return;

      const fileDataArray = await Promise.all(
        files.map(async (file) => ({
          arrayBuffer: await file.arrayBuffer(),
          type: file.type,
          fileName: file.name,
        })),
      );

      for (let i = 0; i < enabledSites.length; i++) {
        const site = enabledSites[i];
        if (!site) continue;

        const config = siteConfigs.find((c) => c.name === site.name);
        const focusSelector = config?.fileUploadHandler?.steps?.[0]?.selector;

        postMessageToSiteIframe(site.name, {
          type: "INJECT_FILE_VIA_POST",
          siteName: site.name,
          files: fileDataArray,
          focusSelector,
        });

        if (i < enabledSites.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    },
    [siteList, siteConfigs, postMessageToSiteIframe],
  );

  const extractViaPostMessage = useCallback(
    (siteName: string, contentExtractor: ContentExtractor): Promise<ConversationData | null> => {
      return new Promise((resolve) => {
        const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
        const normalizeHost = (h: string) => h.toLowerCase().replace(/^www\./, "");

        const site = siteList.find((s) => s.name === siteName);
        if (!site) {
          resolve(null);
          return;
        }

        let resolved = false;
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            window.removeEventListener("message", handler);
            resolve(null);
          }
        }, 5000);

        const handler = (event: MessageEvent) => {
          if (
            !event.data ||
            typeof event.data !== "object" ||
            event.data.type !== "EXTRACTED_CONTENT" ||
            event.data.siteName !== siteName
          ) {
            return;
          }
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            window.removeEventListener("message", handler);
            resolve(event.data.success ? (event.data.data as ConversationData) : null);
          }
        };

        window.addEventListener("message", handler);

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
                  { type: "EXTRACT_CONTENT_VIA_POST", siteName, contentExtractor },
                  "*",
                );
                return;
              }
            } catch {
              /* invalid iframe URL */
            }
          }
        } catch {
          /* invalid site URL */
        }

        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          window.removeEventListener("message", handler);
          resolve(null);
        }
      });
    },
    [siteList],
  );

  const handleShareAll = useCallback(async () => {
    const enabledSites = siteList.filter((s) => s.enabled);
    if (enabledSites.length === 0) return;

    const results: Array<{ siteName: string; data: ConversationData }> = [];

    for (const site of enabledSites) {
      const config = siteConfigs.find((c) => c.name === site.name);
      if (!config?.contentExtractor) {
        results.push({ siteName: site.name, data: { messages: [] } });
        continue;
      }
      const data = await extractViaPostMessage(site.name, config.contentExtractor);
      results.push({ siteName: site.name, data: data ?? { messages: [] } });
    }

    const markdown = formatAllConversations(results);
    setShareState({ isOpen: true, siteName: "All Sites", content: markdown });
  }, [siteList, siteConfigs, extractViaPostMessage]);

  const handleShare = useCallback(
    async (siteName: string) => {
      try {
        const config = siteConfigs.find((c) => c.name === siteName);
        if (!config?.contentExtractor) {
          setShareState({
            isOpen: true,
            siteName,
            content: "No content extractor configured for this site.",
          });
          return;
        }

        const data = await extractViaPostMessage(siteName, config.contentExtractor);
        let markdown = "No conversation content extracted yet.";

        if (data && data.messages && data.messages.length > 0) {
          markdown = formatConversation(data);
        }

        setShareState({ isOpen: true, siteName, content: markdown });
      } catch {
        setShareState({
          isOpen: true,
          siteName,
          content: "Failed to extract conversation content.",
        });
      }
    },
    [siteConfigs, extractViaPostMessage],
  );

  const renderIframe = useCallback(
    (site: { name: string; url: string }) => {
      const effectiveUrl = siteUrlOverrides[site.name] || site.url;
      return (
        <IframeWrapper
          key={`${site.name}-${resetKey}`}
          siteName={site.name}
          siteUrl={effectiveUrl}
          onShare={handleShare}
        />
      );
    },
    [handleShare, siteUrlOverrides, resetKey],
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
          onShareAll={handleShareAll}
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
          <FileUploadButton onFilesSelected={handleFileUpload} disabled={isQuerying} />
        </div>
      </div>
      <SharePopup
        isOpen={shareState.isOpen}
        onClose={() => setShareState((prev) => ({ ...prev, isOpen: false }))}
        siteName={shareState.siteName}
        markdownContent={shareState.content}
        exportAllTemplates={settings.exportAllTemplates}
      />
    </div>
  );
}
