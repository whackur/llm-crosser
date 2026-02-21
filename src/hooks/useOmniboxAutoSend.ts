import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { HistoryEntry } from "@/src/types/history";

interface UseOmniboxAutoSendOptions {
  handleSendRef: { readonly current: (query: string) => Promise<void> };
  settingsLoading: boolean;
  configLoading: boolean;
  settingsReady: boolean;
  history: HistoryEntry[];
  historyLoading: boolean;
  onHistoryRestore: (overrides: Record<string, string>) => void;
}

interface UseOmniboxAutoSendReturn {
  urlQuery: string;
  resetAutoSendState: () => void;
}

export function useOmniboxAutoSend(options: UseOmniboxAutoSendOptions): UseOmniboxAutoSendReturn {
  const { handleSendRef, settingsLoading, configLoading, settingsReady, history, historyLoading } =
    options;
  const [searchParams, setSearchParams] = useSearchParams();
  const [restoredQuery, setRestoredQuery] = useState("");
  const urlQueryParam = searchParams.get("q") || "";
  const historyId = searchParams.get("historyId") || "";
  const autoSentQueryRef = useRef<string>("");
  const appliedHistoryIdRef = useRef<string>("");

  const onHistoryRestoreRef = useRef(options.onHistoryRestore);
  onHistoryRestoreRef.current = options.onHistoryRestore;

  useEffect(() => {
    if (!urlQueryParam || settingsLoading || configLoading || !settingsReady) return;
    if (autoSentQueryRef.current === urlQueryParam) return;
    autoSentQueryRef.current = urlQueryParam;

    const timer = setTimeout(() => {
      handleSendRef.current(urlQueryParam);
      setSearchParams({}, { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    urlQueryParam,
    settingsLoading,
    configLoading,
    settingsReady,
    setSearchParams,
    handleSendRef,
  ]);

  useEffect(() => {
    if (!historyId || settingsLoading || configLoading || !settingsReady || historyLoading) return;
    if (appliedHistoryIdRef.current === historyId) return;

    const entry = history.find((e) => e.id === historyId);
    if (!entry) return;

    appliedHistoryIdRef.current = historyId;
    setRestoredQuery(entry.query);

    const overrides: Record<string, string> = {};
    for (const result of entry.siteResults) {
      if (result.conversationUrl) {
        overrides[result.siteName] = result.conversationUrl;
      }
    }
    onHistoryRestoreRef.current(overrides);
    setSearchParams({}, { replace: true });
  }, [
    historyId,
    history,
    settingsLoading,
    configLoading,
    settingsReady,
    historyLoading,
    setSearchParams,
  ]);

  const resetAutoSendState = useCallback(() => {
    autoSentQueryRef.current = "";
    appliedHistoryIdRef.current = "";
    setRestoredQuery("");
  }, []);

  return { urlQuery: urlQueryParam || restoredQuery, resetAutoSendState };
}
