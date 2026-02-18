import type { ExtensionMessage } from "@/src/types/messaging";
import { findBatchSearchTab, findTargetFrame } from "@/src/lib/background-frame-router";

type SiteFrameMessage = Extract<
  ExtensionMessage,
  {
    type: "INJECT_QUERY" | "INJECT_FILE" | "EXTRACT_CONTENT";
  }
>;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown injection error";
}

function isSuccessfulResponse(response: unknown): response is { success: true } {
  return (
    response != null &&
    typeof response === "object" &&
    "success" in response &&
    (response as { success: unknown }).success === true
  );
}

function isFrameMismatchResponse(response: unknown): boolean {
  if (response == null || typeof response !== "object" || !("error" in response)) return false;
  return (response as { error?: string }).error === "FRAME_SITE_MISMATCH";
}

async function sendToFrame(
  tabId: number,
  frameId: number,
  message: SiteFrameMessage,
): Promise<unknown> {
  try {
    return await browser.tabs.sendMessage(tabId, message, { frameId });
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function routeToSiteFrame(message: SiteFrameMessage): Promise<unknown> {
  const directTarget = await findTargetFrame(message.siteName);

  if (!("error" in directTarget)) {
    const directResponse = await sendToFrame(directTarget.tabId, directTarget.frameId, message);
    if (isSuccessfulResponse(directResponse)) {
      return directResponse;
    }
  }

  const tab = await findBatchSearchTab();
  if (tab?.id == null) {
    return { success: false, error: "No batch-search tab found" };
  }

  const frames = await browser.webNavigation.getAllFrames({ tabId: tab.id });
  if (!frames || frames.length === 0) {
    return { success: false, error: "No frames found" };
  }

  let lastError = "No matching frame accepted the message";
  for (const frame of frames) {
    if (frame.frameId === 0) continue;

    const response = await sendToFrame(tab.id, frame.frameId, message);
    if (isSuccessfulResponse(response)) {
      return response;
    }

    if (isFrameMismatchResponse(response)) {
      continue;
    }

    if (
      response != null &&
      typeof response === "object" &&
      "error" in response &&
      typeof (response as { error?: unknown }).error === "string"
    ) {
      lastError = (response as { error: string }).error;
    }
  }

  return { success: false, error: lastError };
}
