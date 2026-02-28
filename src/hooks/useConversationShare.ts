import { useState, useCallback } from "react";
import { matchesHost } from "@/src/lib/url-utils";
import { formatConversation, formatAllConversations } from "@/src/lib/html-to-markdown";
import type { ConversationData } from "@/src/lib/content-extractor";
import type { ContentExtractor, SiteConfig } from "@/src/types/site";
import type { ExportHistoryEntry } from "@/src/types/history";

interface ShareState {
  isOpen: boolean;
  siteName: string;
  content: string;
}

interface SiteListItem {
  name: string;
  url: string;
  enabled: boolean;
}

interface UseConversationShareOptions {
  siteList: SiteListItem[];
  siteConfigs: SiteConfig[];
  addExportEntry: (entry: ExportHistoryEntry) => Promise<void>;
}

interface UseConversationShareReturn {
  shareState: ShareState;
  isExtracting: boolean;
  handleShare: (siteName: string) => Promise<void>;
  handleShareAll: () => Promise<void>;
  handleExportSave: (name: string, content: string, exportSiteName: string) => void;
  closeSharePopup: () => void;
}

export function useConversationShare(
  options: UseConversationShareOptions,
): UseConversationShareReturn {
  const { siteList, siteConfigs, addExportEntry } = options;
  const [shareState, setShareState] = useState<ShareState>({
    isOpen: false,
    siteName: "",
    content: "",
  });
  const [isExtracting, setIsExtracting] = useState(false);

  const extractViaPostMessage = useCallback(
    (siteName: string, contentExtractor: ContentExtractor): Promise<ConversationData | null> => {
      return new Promise((resolve) => {
        const iframes = document.querySelectorAll<HTMLIFrameElement>("iframe");
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
          )
            return;
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            window.removeEventListener("message", handler);
            resolve(event.data.success ? (event.data.data as ConversationData) : null);
          }
        };

        window.addEventListener("message", handler);

        try {
          const siteHost = new URL(site.url).hostname;
          if (!siteHost) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              window.removeEventListener("message", handler);
              resolve(null);
            }
            return;
          }
          for (const iframe of iframes) {
            try {
              const iframeHost = new URL(iframe.src).hostname;
              if (iframeHost && matchesHost(iframeHost, siteHost)) {
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

    setIsExtracting(true);
    try {
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
    } finally {
      setIsExtracting(false);
    }
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

  const handleExportSave = useCallback(
    (name: string, content: string, exportSiteName: string) => {
      const entry: ExportHistoryEntry = {
        id: crypto.randomUUID(),
        name,
        siteName: exportSiteName,
        content,
        timestamp: Date.now(),
        exportType: exportSiteName === "All Sites" ? "all" : "single",
      };
      void addExportEntry(entry);
    },
    [addExportEntry],
  );

  const closeSharePopup = useCallback(() => {
    setShareState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { shareState, isExtracting, handleShare, handleShareAll, handleExportSave, closeSharePopup };
}
