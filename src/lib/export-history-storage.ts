import type { ExportHistoryEntry } from "../types/history";
import { EXPORT_HISTORY_KEY } from "./constants";

/**
 * Get export history entries
 */
export async function getExportHistory(): Promise<ExportHistoryEntry[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([EXPORT_HISTORY_KEY], (result: Record<string, unknown>) => {
      const stored = result[EXPORT_HISTORY_KEY] as ExportHistoryEntry[] | undefined;
      resolve(stored || []);
    });
  });
}

/**
 * Add entry to export history (prepend)
 */
export async function addExportHistoryEntry(entry: ExportHistoryEntry): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([EXPORT_HISTORY_KEY], (result: Record<string, unknown>) => {
      const current = result[EXPORT_HISTORY_KEY] as ExportHistoryEntry[] | undefined;
      const updated = [entry, ...(current || [])];
      chrome.storage.local.set({ [EXPORT_HISTORY_KEY]: updated }, () => {
        resolve();
      });
    });
  });
}

/**
 * Delete export history entry by id
 */
export async function deleteExportHistoryEntry(id: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([EXPORT_HISTORY_KEY], (result: Record<string, unknown>) => {
      const current = result[EXPORT_HISTORY_KEY] as ExportHistoryEntry[] | undefined;
      const updated = (current || []).filter((entry) => entry.id !== id);
      chrome.storage.local.set({ [EXPORT_HISTORY_KEY]: updated }, () => {
        resolve();
      });
    });
  });
}

/**
 * Clear all export history
 */
export async function clearExportHistory(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [EXPORT_HISTORY_KEY]: [] }, () => {
      resolve();
    });
  });
}
