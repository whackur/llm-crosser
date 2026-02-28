import type { Browser } from "wxt/browser";
import type { QueryStatusMessage, SiteReadyMessage } from "@/src/types/messaging";
import { getFloatState } from "./float-state";

export const BATCH_SEARCH_PATH = "batch-search.html";


export async function findBatchSearchTab(): Promise<Browser.tabs.Tab | undefined> {
  const floatState = await getFloatState();

  if (floatState?.active) {
    try {
      const floatTab = await browser.tabs.get(floatState.tabId);
      if (floatTab) return floatTab;
    } catch {
      // intentional: float tab may have been closed
    }
  }

  const extensionUrl = browser.runtime.getURL(`/${BATCH_SEARCH_PATH}`);
  const tabs = await browser.tabs.query({});
  return tabs.find((tab) => tab.url?.startsWith(extensionUrl));
}

export async function fetchSiteConfig(): Promise<unknown> {
  const url = browser.runtime.getURL("/site-handlers.json");
  const response = await fetch(url);
  return response.json() as Promise<unknown>;
}


export async function forwardToExtensionPage(
  message: QueryStatusMessage | SiteReadyMessage,
): Promise<void> {
  const tab = await findBatchSearchTab();
  if (tab?.id != null) {
    await browser.tabs.sendMessage(tab.id, message);
  }
}
