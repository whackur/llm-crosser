import { useState, useEffect, useCallback } from "react";
import type { HistoryEntry } from "../types/history";
import {
  getHistory,
  addHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
  searchHistory,
} from "../lib/storage";

interface UseHistoryReturn {
  history: HistoryEntry[];
  loading: boolean;
  addEntry: (entry: HistoryEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  searchHistory: (query: string) => Promise<HistoryEntry[]>;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStorageChange = useCallback(
    (changes: Record<string, chrome.storage.StorageChange>) => {
      if ("llm-crosser-history" in changes) {
        const newHistory = changes["llm-crosser-history"].newValue as HistoryEntry[] | undefined;
        if (newHistory !== undefined) {
          setHistory(newHistory);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const loaded = await getHistory();
      setHistory(loaded);
      setLoading(false);
    };

    loadHistory();

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [handleStorageChange]);

  const handleAddEntry = useCallback(
    async (entry: HistoryEntry) => {
      const optimistic = [entry, ...history];
      setHistory(optimistic);

      try {
        await addHistoryEntry(entry);
      } catch (error) {
        const reloaded = await getHistory();
        setHistory(reloaded);
        throw error;
      }
    },
    [history],
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      const optimistic = history.filter((entry) => entry.id !== id);
      setHistory(optimistic);

      try {
        await deleteHistoryEntry(id);
      } catch (error) {
        const reloaded = await getHistory();
        setHistory(reloaded);
        throw error;
      }
    },
    [history],
  );

  const handleClearHistory = useCallback(async () => {
    setHistory([]);

    try {
      await clearHistory();
    } catch (error) {
      const reloaded = await getHistory();
      setHistory(reloaded);
      throw error;
    }
  }, []);

  const handleSearchHistory = useCallback(async (query: string) => {
    return searchHistory(query);
  }, []);

  return {
    history,
    loading,
    addEntry: handleAddEntry,
    deleteEntry: handleDeleteEntry,
    clearHistory: handleClearHistory,
    searchHistory: handleSearchHistory,
  };
}
