import type { UserSettings, PromptTemplate } from "../types/settings";
import type { HistoryEntry } from "../types/history";

const SETTINGS_KEY = "llm-crosser-settings";
const HISTORY_KEY = "llm-crosser-history";

const DEFAULT_SETTINGS: UserSettings = {
  enabledSites: ["ChatGPT", "Gemini", "Grok"],
  gridLayout: "side-by-side",
  gridColumns: 2,
  language: "en",
  theme: "midnight",
  promptTemplates: [],
};

/**
 * Get current settings, merged with defaults
 */
export async function getSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result: Record<string, unknown>) => {
      const stored = result[SETTINGS_KEY] as UserSettings | undefined;
      resolve({
        ...DEFAULT_SETTINGS,
        ...stored,
      });
    });
  });
}

/**
 * Update settings with partial merge
 */
export async function updateSettings(partial: Partial<UserSettings>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result: Record<string, unknown>) => {
      const current = result[SETTINGS_KEY] as UserSettings | undefined;
      const merged: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...current,
        ...partial,
      };
      chrome.storage.local.set({ [SETTINGS_KEY]: merged }, () => {
        resolve();
      });
    });
  });
}

/**
 * Get history entries
 */
export async function getHistory(): Promise<HistoryEntry[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result: Record<string, unknown>) => {
      const stored = result[HISTORY_KEY] as HistoryEntry[] | undefined;
      resolve(stored || []);
    });
  });
}

/**
 * Add entry to history (prepend)
 */
export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result: Record<string, unknown>) => {
      const current = result[HISTORY_KEY] as HistoryEntry[] | undefined;
      const updated = [entry, ...(current || [])];
      chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => {
        resolve();
      });
    });
  });
}

/**
 * Update an existing history entry by id (partial merge)
 */
export async function updateHistoryEntry(
  id: string,
  updates: Partial<HistoryEntry>,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result: Record<string, unknown>) => {
      const current = result[HISTORY_KEY] as HistoryEntry[] | undefined;
      const updated = (current || []).map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry,
      );
      chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => {
        resolve();
      });
    });
  });
}

/**
 * Delete history entry by id
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result: Record<string, unknown>) => {
      const current = result[HISTORY_KEY] as HistoryEntry[] | undefined;
      const updated = (current || []).filter((entry) => entry.id !== id);
      chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => {
        resolve();
      });
    });
  });
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [HISTORY_KEY]: [] }, () => {
      resolve();
    });
  });
}

/**
 * Search history by query (case-insensitive)
 */
export async function searchHistory(query: string): Promise<HistoryEntry[]> {
  const history = await getHistory();
  const lowerQuery = query.toLowerCase();
  return history.filter((entry) => entry.query.toLowerCase().includes(lowerQuery));
}

/**
 * Get prompt templates from settings
 */
export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  const settings = await getSettings();
  return settings.promptTemplates;
}

/**
 * Save prompt templates to settings
 */
export async function savePromptTemplates(templates: PromptTemplate[]): Promise<void> {
  await updateSettings({ promptTemplates: templates });
}
