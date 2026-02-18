import { browser } from "wxt/browser";
import type { ExtensionMessage } from "@/src/types/messaging";
import type { SiteHandlersConfig } from "@/src/types/site";

export async function sendToBackground(message: ExtensionMessage): Promise<unknown> {
  try {
    return await browser.runtime.sendMessage(message);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to send message to background: ${msg}`, { cause: error });
  }
}

export async function getSiteConfig(): Promise<SiteHandlersConfig> {
  const response = await sendToBackground({ type: "GET_SITE_CONFIG", siteName: "" });
  return response as SiteHandlersConfig;
}

export async function injectQuery(
  siteName: string,
  query: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await sendToBackground({ type: "INJECT_QUERY", siteName, query });
    return response as { success: boolean; error?: string };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

export async function injectFile(
  siteName: string,
  fileData: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await sendToBackground({ type: "INJECT_FILE", siteName, fileData });
    return response as { success: boolean; error?: string };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

export async function extractContent(siteName: string): Promise<unknown> {
  try {
    return await sendToBackground({ type: "EXTRACT_CONTENT", siteName });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}
