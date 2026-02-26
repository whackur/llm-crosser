import { useState, useCallback, useMemo, useRef } from "react";
import { QueryInputBar } from "@/src/components/query/QueryInputBar";
import { FileUploadButton } from "@/src/components/query/FileUploadButton";
import { IframeGrid } from "@/src/components/grid/IframeGrid";
import { IframeWrapper } from "@/src/components/grid/IframeWrapper";
import { SharePopup } from "@/src/components/share/SharePopup";
import { NewChatIcon } from "@/src/components/ui/Icons";
import { useSettings } from "@/src/hooks/useSettings";
import { useHistory } from "@/src/hooks/useHistory";
import { useExportHistory } from "@/src/hooks/useExportHistory";
import { useSiteConfig } from "@/src/hooks/useSiteConfig";
import { useConversationShare } from "@/src/hooks/useConversationShare";
import { useOmniboxAutoSend } from "@/src/hooks/useOmniboxAutoSend";
import { useResetMechanism } from "@/src/hooks/useResetMechanism";
import { startConversationUrlCapture } from "@/src/lib/conversation-url-capture";
import { matchesHost } from "@/src/lib/url-utils";
import type { GridLayout } from "@/src/types/settings";

type Site = { name: string; url: string; enabled: boolean };

export default function BatchSearchPage() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { history, loading: historyLoading, addEntry, updateEntry } = useHistory();
  const { addEntry: addExportEntry } = useExportHistory();
  const { siteConfigs, loading: configLoading } = useSiteConfig();
  const [isQuerying, setIsQuerying] = useState(false);
  const urlCaptureCleanupRef = useRef<(() => void) | null>(null);
  const siteList = useMemo<Site[]>(
    () =>
      siteConfigs.map((site) => ({
        name: site.name,
        url: String(site.url),
        enabled: settings?.enabledSites.includes(site.name) ?? false,
      })),
    [siteConfigs, settings?.enabledSites],
  );

  const postMessageToSiteIframe = useCallback(
    (siteName: string, msg: Record<string, unknown>) => {
      const site = siteList.find((s) => s.name === siteName);
      if (!site) return false;
      try {
        const siteHost = new URL(site.url).hostname;
        if (!siteHost) return false;
        for (const iframe of document.querySelectorAll<HTMLIFrameElement>("iframe")) {
          try {
            const h = new URL(iframe.src).hostname;
            if (h && matchesHost(h, siteHost)) {
              iframe.contentWindow?.postMessage(msg, "*");
              return true;
            }
          } catch {
            /* skip */
          }
        }
      } catch {
        /* skip */
      }
      return false;
    },
    [siteList],
  );

  const handleSend = useCallback(
    async (query: string) => {
      const enabledSites = siteList.filter((s) => s.enabled);
      const automationSites = enabledSites.filter(
        (s) => !settings?.disabledAutomationSites?.includes(s.name),
      );
      if (enabledSites.length === 0) return;
      setIsQuerying(true);
      await Promise.all(
        automationSites.map(
          (site, i) =>
            new Promise<void>((resolve) => {
              setTimeout(() => {
                const config = siteConfigs.find((c) => c.name === site.name);
                if (config?.searchHandler) {
                  postMessageToSiteIframe(site.name, {
                    type: "INJECT_QUERY_VIA_POST",
                    siteName: site.name,
                    query,
                    searchHandler: config.searchHandler,
                  });
                }
                resolve();
              }, i * 200);
            }),
        ),
      );
      const entryId = crypto.randomUUID();
      await addEntry({
        id: entryId,
        query,
        timestamp: Date.now(),
        siteResults: enabledSites.map((s) => ({ siteName: s.name })),
      });
      setIsQuerying(false);
      urlCaptureCleanupRef.current?.();
      urlCaptureCleanupRef.current = startConversationUrlCapture({
        sites: enabledSites,
        onCaptured: (siteResults) => {
          if (siteResults.some((r) => r.conversationUrl))
            void updateEntry(entryId, { siteResults });
        },
      });
    },
    [siteList, siteConfigs, settings?.disabledAutomationSites, addEntry, updateEntry, postMessageToSiteIframe],
  );

  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;
  const { resetKey, siteUrlOverrides, setSiteUrlOverrides } = useResetMechanism({
    onReset: () => {
      setIsQuerying(false);
      urlCaptureCleanupRef.current?.();
      urlCaptureCleanupRef.current = null;
      resetAutoSendState();
    },
  });
  const { urlQuery, resetAutoSendState } = useOmniboxAutoSend({
    handleSendRef,
    settingsLoading,
    configLoading,
    settingsReady: !!settings,
    history,
    historyLoading,
    onHistoryRestore: setSiteUrlOverrides,
  });
  const { shareState, handleShare, handleShareAll, handleExportSave, closeSharePopup } =
    useConversationShare({ siteList, siteConfigs, addExportEntry });
  const handleLayoutChange = useCallback(
    (l: GridLayout) => void updateSettings({ gridLayout: l }),
    [updateSettings],
  );
  const handleColumnsChange = useCallback(
    (c: 1 | 2 | 3 | 4) => void updateSettings({ gridColumns: c }),
    [updateSettings],
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const enabledSites = siteList.filter((s) => s.enabled);
      const automationSites = enabledSites.filter(
        (s) => !settings?.disabledAutomationSites?.includes(s.name),
      );
      if (enabledSites.length === 0) return;
      const fileDataArray = await Promise.all(
        files.map(async (file) => ({
          arrayBuffer: await file.arrayBuffer(),
          type: file.type,
          fileName: file.name,
        })),
      );
      for (let i = 0; i < automationSites.length; i++) {
        const site = automationSites[i];
        if (!site) continue;
        const config = siteConfigs.find((c) => c.name === site.name);
        postMessageToSiteIframe(site.name, {
          type: "INJECT_FILE_VIA_POST",
          siteName: site.name,
          files: fileDataArray,
          focusSelector: config?.fileUploadHandler?.steps?.[0]?.selector,
        });
        if (i < automationSites.length - 1) await new Promise((r) => setTimeout(r, 500));
      }
    },
    [siteList, siteConfigs, settings?.disabledAutomationSites, postMessageToSiteIframe],
  );

  const handleAutomationToggle = useCallback(
    (siteName: string) => {
      if (!settings) return;
      const current = new Set(settings.disabledAutomationSites || []);
      if (current.has(siteName)) {
        current.delete(siteName);
      } else {
        current.add(siteName);
      }
      void updateSettings({ disabledAutomationSites: Array.from(current) });
    },
    [settings, updateSettings],
  );

  const renderIframe = useCallback(
    (site: { name: string; url: string }) => (
      <IframeWrapper
        key={`${site.name}-${resetKey}`}
        siteName={site.name}
        siteUrl={siteUrlOverrides[site.name] || site.url}
        automationDisabled={settings?.disabledAutomationSites?.includes(site.name) ?? false}
        onAutomationToggle={handleAutomationToggle}
        onShare={handleShare}
      />
    ),
    [handleShare, handleAutomationToggle, siteUrlOverrides, resetKey, settings?.disabledAutomationSites],
  );
  if (settingsLoading || configLoading || !settings)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );

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
          headerSlot={
            <>
              <img src="/icons/icon-48.png" alt="" className="w-4 h-4" />
              <a
                href="#/?reset=true"
                title="New Chat"
                className="w-7 h-7 flex items-center justify-center rounded-md text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
              >
                <NewChatIcon className="w-3.5 h-3.5" />
              </a>
            </>
          }
        />
      </div>
      <div className="px-2 py-1.5 border-t border-border bg-surface/95 backdrop-blur-sm shrink-0">
        <div className="flex items-start gap-1.5 max-w-5xl mx-auto w-full">
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
        onClose={closeSharePopup}
        siteName={shareState.siteName}
        markdownContent={shareState.content}
        exportAllTemplates={settings.exportAllTemplates}
        defaultExportName={settings.defaultExportName}
        onSave={handleExportSave}
      />
    </div>
  );
}
