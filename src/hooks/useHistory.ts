import { useState, useEffect, useCallback } from "react";
import type { HistoryEntry } from "../types/history";
import {
  getHistory,
  addHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
} from "../lib/storage";
import { HISTORY_KEY } from "../lib/constants";

interface UseHistoryReturn {
  history: HistoryEntry[];
  loading: boolean;
  addEntry: (entry: HistoryEntry) => Promise<void>;
  updateEntry: (id: string, updates: Partial<HistoryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStorageChange = useCallback(
    (changes: Record<string, chrome.storage.StorageChange>) => {
      if (HISTORY_KEY in changes) {
        const newHistory = changes[HISTORY_KEY].newValue as HistoryEntry[] | undefined;
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

  const handleAddEntry = useCallback(async (entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev]);

    try {
      await addHistoryEntry(entry);
    } catch (error) {
      const reloaded = await getHistory();
      setHistory(reloaded);
      throw error;
    }
  }, []);

  const handleUpdateEntry = useCallback(async (id: string, updates: Partial<HistoryEntry>) => {
    setHistory((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

    try {
      await updateHistoryEntry(id, updates);
    } catch (error) {
      const reloaded = await getHistory();
      setHistory(reloaded);
      throw error;
    }
  }, []);

  const handleDeleteEntry = useCallback(async (id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));

    try {
      await deleteHistoryEntry(id);
    } catch (error) {
      const reloaded = await getHistory();
      setHistory(reloaded);
      throw error;
    }
  }, []);

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

  return {
    history,
    loading,
    addEntry: handleAddEntry,
    updateEntry: handleUpdateEntry,
    deleteEntry: handleDeleteEntry,
    clearHistory: handleClearHistory,
  };
}
