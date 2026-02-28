import type { ExtensionMessage } from "@/src/types/messaging";
import { findBatchSearchTab } from "@/src/lib/background-frame-router";

type SiteFrameMessage = Extract<
  ExtensionMessage,
  {
    type: "INJECT_QUERY" | "INJECT_FILE" | "EXTRACT_CONTENT";
  }
>;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown injection error";
}

export async function routeToSiteFrame(message: SiteFrameMessage): Promise<unknown> {
  const tab = await findBatchSearchTab();
  if (tab?.id == null) {
    return { success: false, error: "No batch-search tab found" };
  }

  try {
    // Broadcast to all frames in the batch-search tab.
    // Content scripts self-filter by siteName via FRAME_SITE_MISMATCH.
    return await browser.tabs.sendMessage(tab.id, message);
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
