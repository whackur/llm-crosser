import { defineBackground } from "wxt/utils/define-background";
import type { Browser } from "wxt/browser";
import type { ExtensionMessage } from "@/src/types/messaging";
import type { UserSettings } from "@/src/types/settings";
import { routeToSiteFrame } from "../src/lib/site-frame-message-router";
import {
  findBatchSearchTab,
  forwardToExtensionPage,
  fetchSiteConfig,
  BATCH_SEARCH_PATH,
} from "@/src/lib/background-frame-router";

const SETTINGS_KEY = "llm-crosser-settings";

const DEFAULT_SETTINGS: UserSettings = {
  enabledSites: ["ChatGPT", "Gemini", "Grok"],
  gridLayout: "side-by-side",
  gridColumns: 2,
  language: "en",
  theme: "midnight",
  promptTemplates: [],
  exportAllTemplates: [],
};

async function openOrFocusBatchSearch(hash?: string): Promise<Browser.tabs.Tab> {
  const existing = await findBatchSearchTab();
  const url = hash
    ? browser.runtime.getURL(`/${BATCH_SEARCH_PATH}${hash}`)
    : browser.runtime.getURL(`/${BATCH_SEARCH_PATH}`);

  if (existing?.id != null) {
    await browser.tabs.update(existing.id, { active: true, url: hash ? url : undefined });
    if (existing.windowId != null) {
      await browser.windows.update(existing.windowId, { focused: true });
    }
    return existing;
  }

  return browser.tabs.create({ url });
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
  try {
    browser.action.onClicked.addListener(() => {
      void openOrFocusBatchSearch();
    });
  } catch {
    console.warn("[llm-crosser] browser.action not available, falling back to chrome.action");
    try {
      chrome.action.onClicked.addListener(() => {
        void openOrFocusBatchSearch();
      });
    } catch {
      console.error("[llm-crosser] Neither browser.action nor chrome.action available");
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
    suggest([
      {
        content: text,
        description: `Search "${text}" across all LLMs`,
      },
    ]);
  });

  browser.omnibox.onInputEntered.addListener((text, disposition) => {
    const hash = `#/?q=${encodeURIComponent(text)}`;
    const url = browser.runtime.getURL(`/${BATCH_SEARCH_PATH}${hash}`);

    if (disposition === "currentTab") {
      void browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]?.id != null) {
          void browser.tabs.update(tabs[0].id, { url });
        }
      });
    } else if (disposition === "newForegroundTab") {
      void findBatchSearchTab().then((existing) => {
        if (existing?.id != null) {
          void browser.tabs.update(existing.id, { active: true, url });
          if (existing.windowId != null) {
            void browser.windows.update(existing.windowId, { focused: true });
          }
        } else {
          void browser.tabs.create({ url, active: true });
        }
      });
    } else if (disposition === "newBackgroundTab") {
      void findBatchSearchTab().then((existing) => {
        if (existing?.id != null) {
          void browser.tabs.update(existing.id, { url });
        } else {
          void browser.tabs.create({ url, active: false });
        }
      });
    }
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
