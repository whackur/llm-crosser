import { defineBackground } from "wxt/utils/define-background";
import type { Browser } from "wxt/browser";
import type { ExtensionMessage } from "@/src/types/messaging";
import type { UserSettings } from "@/src/types/settings";
import { routeToSiteFrame } from "../src/lib/site-frame-message-router";
import {
  forwardToExtensionPage,
  fetchSiteConfig,
  BATCH_SEARCH_PATH,
} from "@/src/lib/background-frame-router";
import { getFloatState, setFloatState, clearFloatState } from "@/src/lib/float-state";
import { SETTINGS_KEY, DEFAULT_SETTINGS } from "@/src/lib/constants";

async function openOrFocusBatchSearch(hash?: string): Promise<void> {
  const floatState = await getFloatState();
  const url = hash
    ? browser.runtime.getURL(`/${BATCH_SEARCH_PATH}${hash}`)
    : browser.runtime.getURL(`/${BATCH_SEARCH_PATH}`);

  if (floatState?.active) {
    try {
      await browser.windows.update(floatState.windowId, { focused: true });
      if (hash && floatState.tabId != null) {
        await browser.tabs.update(floatState.tabId, { url });
      }
      return;
    } catch {
      await clearFloatState();
    }
  }

  const newWindow = await browser.windows.create({
    url,
    type: "popup",
    width: 1200,
    height: 800,
    focused: true,
  });

  if (newWindow?.id != null && newWindow.tabs?.[0]?.id != null) {
    await setFloatState({
      active: true,
      tabId: newWindow.tabs[0].id,
      windowId: newWindow.id,
      originalWindowId: -1,
    });
  }
}

async function getSettings(): Promise<UserSettings> {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  return (result[SETTINGS_KEY] as UserSettings | undefined) ?? { ...DEFAULT_SETTINGS };
}

async function updateSettings(partial: Record<string, unknown>): Promise<UserSettings> {
  const current = await getSettings();
  const merged: UserSettings = { ...current, ...partial } as UserSettings;
  await browser.storage.local.set({ [SETTINGS_KEY]: merged });
  return merged;
}

export default defineBackground(() => {
  void getFloatState().then(async (state) => {
    if (!state?.active) return;
    try {
      await browser.windows.get(state.windowId);
    } catch {
      void clearFloatState();
    }
  });

  browser.windows.onRemoved.addListener((windowId) => {
    void getFloatState().then((state) => {
      if (state?.active && state.windowId === windowId) {
        void clearFloatState();
      }
    });
  });

  try {
    if (typeof chrome !== "undefined" && chrome.sidePanel) {
      void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch {
    try {
      browser.action.onClicked.addListener(() => {
        void openOrFocusBatchSearch();
      });
    } catch {
      console.error("[llm-crosser] Neither sidePanel nor action API available");
    }
  }

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      void browser.storage.local.set({ [SETTINGS_KEY]: { ...DEFAULT_SETTINGS } });
    }
  });

  browser.omnibox.setDefaultSuggestion({
    description: "Search with LLM Crosser: %s",
  });

  browser.omnibox.onInputChanged.addListener((text, suggest) => {
    suggest([{ content: text, description: `Search "${text}" across all LLMs` }]);
  });

  browser.omnibox.onInputEntered.addListener((text) => {
    const hash = `#/?q=${encodeURIComponent(text)}`;
    void openOrFocusBatchSearch(hash);
  });

  browser.runtime.onMessage.addListener(
    (rawMessage: unknown, _sender: Browser.runtime.MessageSender): Promise<unknown> | undefined => {
      const message = rawMessage as ExtensionMessage;

      switch (message.type) {
        case "GET_SITE_CONFIG":
          return fetchSiteConfig();

        case "GET_SETTINGS":
          return getSettings();

        case "UPDATE_SETTINGS":
          return updateSettings(message.settings);

        case "INJECT_QUERY":
        case "INJECT_FILE":
        case "EXTRACT_CONTENT":
          return routeToSiteFrame(message);

        case "DETACH_BATCH_SEARCH":
          return openOrFocusBatchSearch(
            "query" in message && typeof message.query === "string"
              ? `#/?q=${encodeURIComponent(message.query)}`
              : undefined,
          ) as Promise<unknown>;

        case "QUERY_STATUS":
        case "SITE_READY":
          void forwardToExtensionPage(message);
          return undefined;

        default:
          return undefined;
      }
    },
  );
});
