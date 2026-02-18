import { useState, useEffect, useCallback } from "react";
import type { UserSettings } from "../types/settings";
import { getSettings, updateSettings } from "../lib/storage";

interface UseSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const handleStorageChange = useCallback(
    (changes: Record<string, chrome.storage.StorageChange>) => {
      if ("llm-crosser-settings" in changes) {
        const newSettings = changes["llm-crosser-settings"].newValue as UserSettings | undefined;
        if (newSettings) {
          setSettings(newSettings);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const loaded = await getSettings();
      setSettings(loaded);
      setLoading(false);
    };

    loadSettings();

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [handleStorageChange]);

  const handleUpdateSettings = useCallback(
    async (partial: Partial<UserSettings>) => {
      if (!settings) return;

      const optimistic = { ...settings, ...partial };
      setSettings(optimistic);

      try {
        await updateSettings(partial);
      } catch (error) {
        const reloaded = await getSettings();
        setSettings(reloaded);
        throw error;
      }
    },
    [settings],
  );

  return {
    settings,
    loading,
    updateSettings: handleUpdateSettings,
  };
}
