import { useState, useCallback, useEffect } from "react";
import { injectQuery, extractContent as extractContentFromSite } from "@/src/lib/messaging";

export interface IframeState {
  siteName: string;
  status: "loading" | "ready" | "querying" | "done" | "error";
  error?: string;
}

export interface UseIframeManagerReturn {
  iframeStates: Map<string, IframeState>;
  sendQueryToAll: (query: string) => Promise<void>;
  sendQueryToSite: (siteName: string, query: string) => Promise<void>;
  extractContent: (siteName: string) => Promise<string | null>;
  isQuerying: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useIframeManager(enabledSites: string[]): UseIframeManagerReturn {
  const [iframeStates, setIframeStates] = useState<Map<string, IframeState>>(() => {
    const initial = new Map<string, IframeState>();
    for (const siteName of enabledSites) {
      initial.set(siteName, { siteName, status: "loading" });
    }
    return initial;
  });

  useEffect(() => {
    setIframeStates((prev) => {
      const next = new Map<string, IframeState>();
      for (const siteName of enabledSites) {
        const existing = prev.get(siteName);
        next.set(siteName, existing ?? { siteName, status: "loading" });
      }
      return next;
    });
  }, [enabledSites]);

  const updateSiteState = useCallback((siteName: string, update: Partial<IframeState>) => {
    setIframeStates((prev) => {
      const next = new Map(prev);
      const current = next.get(siteName);
      if (current) {
        next.set(siteName, { ...current, ...update });
      }
      return next;
    });
  }, []);

  const sendQueryToSite = useCallback(
    async (siteName: string, query: string): Promise<void> => {
      updateSiteState(siteName, { status: "querying", error: undefined });
      try {
        const result = await injectQuery(siteName, query);
        if (result.success) {
          updateSiteState(siteName, { status: "done" });
        } else {
          updateSiteState(siteName, { status: "error", error: result.error });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        updateSiteState(siteName, { status: "error", error: errorMessage });
      }
    },
    [updateSiteState],
  );

  const sendQueryToAll = useCallback(
    async (query: string): Promise<void> => {
      const promises = enabledSites.map(async (siteName, index) => {
        if (index > 0) {
          await delay(index * 100);
        }
        await sendQueryToSite(siteName, query);
      });
      await Promise.allSettled(promises);
    },
    [enabledSites, sendQueryToSite],
  );

  const handleExtractContent = useCallback(async (siteName: string): Promise<string | null> => {
    try {
      const result = await extractContentFromSite(siteName);
      if (typeof result === "string") {
        return result;
      }
      if (result != null && typeof result === "object" && "content" in result) {
        const content = (result as { content: unknown }).content;
        return typeof content === "string" ? content : null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const isQuerying = [...iframeStates.values()].some((state) => state.status === "querying");

  return {
    iframeStates,
    sendQueryToAll,
    sendQueryToSite,
    extractContent: handleExtractContent,
    isQuerying,
  };
}
