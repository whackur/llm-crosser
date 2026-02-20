import type { Browser } from "wxt/browser";
import type { QueryStatusMessage, SiteReadyMessage } from "@/src/types/messaging";
import { getFloatState } from "./float-state";
import { matchesHost } from "./url-utils";

export const BATCH_SEARCH_PATH = "batch-search.html";

function isFrameUrlMatchingSite(frameUrl: string | undefined, siteUrl: string): boolean {
  if (!frameUrl) return false;

  if (frameUrl.startsWith(siteUrl)) {
    return true;
  }

  try {
    const frameHost = new URL(frameUrl).hostname;
    const siteHost = new URL(siteUrl).hostname;
    if (!frameHost || !siteHost) return false;
    return matchesHost(frameHost, siteHost);
  } catch {
    return false;
  }
}

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

export async function findTargetFrame(
  siteName: string,
): Promise<{ tabId: number; frameId: number } | { error: string }> {
  const tab = await findBatchSearchTab();
  if (tab?.id == null) return { error: "No batch-search tab found" };

  const frames = await browser.webNavigation.getAllFrames({ tabId: tab.id });
  if (!frames) return { error: "No frames found" };

  const siteConfig = (await fetchSiteConfig()) as {
    sites: Array<{ name: string; url: string }>;
  };
  const site = siteConfig.sites.find((s) => s.name === siteName);
  if (!site) return { error: `Site "${siteName}" not found in config` };

  const targetFrame = frames.find(
    (f) => f.frameId !== 0 && isFrameUrlMatchingSite(f.url, site.url),
  );
  if (!targetFrame) {
    return { error: `No frame found for site "${siteName}"` };
  }

  return { tabId: tab.id, frameId: targetFrame.frameId };
}

export async function forwardToExtensionPage(
  message: QueryStatusMessage | SiteReadyMessage,
): Promise<void> {
  const tab = await findBatchSearchTab();
  if (tab?.id != null) {
    await browser.tabs.sendMessage(tab.id, message);
  }
}
