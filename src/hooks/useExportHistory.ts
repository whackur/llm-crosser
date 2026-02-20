import { useState, useEffect, useCallback } from "react";
import type { ExportHistoryEntry } from "../types/history";
import {
  getExportHistory,
  addExportHistoryEntry,
  deleteExportHistoryEntry,
  clearExportHistory,
} from "../lib/storage";

interface UseExportHistoryReturn {
  exportHistory: ExportHistoryEntry[];
  loading: boolean;
  addEntry: (entry: ExportHistoryEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useExportHistory(): UseExportHistoryReturn {
  const [exportHistory, setExportHistory] = useState<ExportHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStorageChange = useCallback(
    (changes: Record<string, chrome.storage.StorageChange>) => {
      if ("llm-crosser-export-history" in changes) {
        const next = changes["llm-crosser-export-history"].newValue as
          | ExportHistoryEntry[]
          | undefined;
        if (next !== undefined) {
          setExportHistory(next);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const loaded = await getExportHistory();
      setExportHistory(loaded);
      setLoading(false);
    };

    load();
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [handleStorageChange]);

  const handleAddEntry = useCallback(
    async (entry: ExportHistoryEntry) => {
      const optimistic = [entry, ...exportHistory];
      setExportHistory(optimistic);
      try {
        await addExportHistoryEntry(entry);
      } catch {
        const reloaded = await getExportHistory();
        setExportHistory(reloaded);
      }
    },
    [exportHistory],
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      const optimistic = exportHistory.filter((e) => e.id !== id);
      setExportHistory(optimistic);
      try {
        await deleteExportHistoryEntry(id);
      } catch {
        const reloaded = await getExportHistory();
        setExportHistory(reloaded);
      }
    },
    [exportHistory],
  );

  const handleClearAll = useCallback(async () => {
    setExportHistory([]);
    try {
      await clearExportHistory();
    } catch {
      const reloaded = await getExportHistory();
      setExportHistory(reloaded);
    }
  }, []);

  return {
    exportHistory,
    loading,
    addEntry: handleAddEntry,
    deleteEntry: handleDeleteEntry,
    clearAll: handleClearAll,
  };
}
