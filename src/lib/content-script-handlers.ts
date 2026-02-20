import { executeSteps } from "./automation-engine";
import { extractConversation } from "./content-extractor";
import { findElement } from "./element-finder";
import { matchesHost } from "./url-utils";
import type { ExtensionMessage, SiteHandlersConfig } from "../types";

interface RuntimeMessenger {
  runtime: { sendMessage: (msg: unknown) => Promise<unknown> };
}

type RuntimeResult = { success: boolean; error?: string; data?: unknown };

export function isCurrentFrameForSite(siteUrl: string): boolean {
  try {
    return matchesHost(window.location.hostname, new URL(siteUrl).hostname);
  } catch {
    return false;
  }
}

async function resolveRuntimeSite(
  siteName: string | undefined,
  messenger: RuntimeMessenger,
): Promise<
  { ok: true; site: SiteHandlersConfig["sites"][number] } | { ok: false; result: RuntimeResult }
> {
  const config = (await messenger.runtime.sendMessage({
    type: "GET_SITE_CONFIG",
  })) as unknown as SiteHandlersConfig;

  const site = config.sites.find((s) => s.name === siteName);
  if (!site) {
    return { ok: false, result: { success: false, error: `Site ${siteName} not found` } };
  }

  if (!isCurrentFrameForSite(site.url)) {
    return { ok: false, result: { success: false, error: "FRAME_SITE_MISMATCH" } };
  }

  return { ok: true, site };
}

export async function handleInjectQuery(data: {
  query?: string;
  searchHandler?: { steps: unknown[] };
  siteName?: string;
}): Promise<{ status: string }> {
  const { query, searchHandler } = data;
  if (!query || !searchHandler?.steps || !Array.isArray(searchHandler.steps)) {
    return { status: "error" };
  }

  try {
    const ok = await executeSteps(
      searchHandler.steps as unknown as Parameters<typeof executeSteps>[0],
      query,
    );
    return { status: ok ? "done" : "error" };
  } catch (error) {
    console.error("[llm-crosser] postMessage handler error:", error);
    return { status: "error" };
  }
}

export async function handleInjectFile(data: {
  files?: Array<{ arrayBuffer: ArrayBuffer; type: string; fileName: string }>;
  focusSelector?: string | string[];
  siteName?: string;
}): Promise<{ status: string }> {
  const { files, focusSelector } = data;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return { status: "error" };
  }

  try {
    let targetElement: HTMLElement | null = null;
    if (focusSelector) {
      targetElement = findElement(focusSelector);
      if (targetElement) {
        targetElement.focus();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    if (!targetElement) {
      targetElement = document.activeElement as HTMLElement | null;
    }

    const dataTransfer = new DataTransfer();
    for (const fd of files) {
      const file = new File([fd.arrayBuffer], fd.fileName, { type: fd.type });
      dataTransfer.items.add(file);
    }

    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    });

    const dispatchTarget = targetElement ?? document.activeElement ?? document;
    (dispatchTarget as EventTarget).dispatchEvent(pasteEvent);

    return { status: "done" };
  } catch (error) {
    console.error("[llm-crosser] file paste error:", error);
    return { status: "error" };
  }
}

export function handleGetUrl(): { url: string } {
  return { url: window.location.href };
}

export function handleExtractContent(data: {
  contentExtractor?: Parameters<typeof extractConversation>[0];
  siteName?: string;
}): { success: boolean; data?: unknown } {
  const { contentExtractor } = data;
  if (!contentExtractor) {
    return { success: false };
  }

  try {
    const extractedData = extractConversation(contentExtractor);
    return { success: true, data: extractedData };
  } catch (error) {
    console.error("[llm-crosser] postMessage extract error:", error);
    return { success: false };
  }
}

export async function handleRuntimeInjectQuery(
  msg: ExtensionMessage,
  messenger: RuntimeMessenger,
): Promise<RuntimeResult> {
  if (msg.type !== "INJECT_QUERY") {
    return { success: false, error: "Invalid message type" };
  }

  try {
    const resolved = await resolveRuntimeSite(msg.siteName, messenger);
    if (!resolved.ok) return resolved.result;

    const ok = await executeSteps(resolved.site.searchHandler.steps, msg.query);
    return ok ? { success: true } : { success: false, error: "Failed to execute search steps" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function handleRuntimeInjectFile(
  msg: ExtensionMessage,
  messenger: RuntimeMessenger,
): Promise<RuntimeResult> {
  if (msg.type !== "INJECT_FILE") {
    return { success: false, error: "Invalid message type" };
  }

  try {
    const resolved = await resolveRuntimeSite(msg.siteName, messenger);
    if (!resolved.ok) return resolved.result;

    if (!resolved.site.fileUploadHandler) {
      return { success: false, error: `Site ${msg.siteName} file handler not found` };
    }

    const ok = await executeSteps(resolved.site.fileUploadHandler.steps, msg.fileData);
    return ok ? { success: true } : { success: false, error: "Failed to execute file steps" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function handleRuntimeExtractContent(
  msg: ExtensionMessage,
  messenger: RuntimeMessenger,
): Promise<RuntimeResult> {
  if (msg.type !== "EXTRACT_CONTENT") {
    return { success: false, error: "Invalid message type" };
  }

  try {
    const resolved = await resolveRuntimeSite(msg.siteName, messenger);
    if (!resolved.ok) return resolved.result;

    if (!resolved.site.contentExtractor) {
      return { success: false, error: `Site ${msg.siteName} content extractor not found` };
    }

    const data = extractConversation(resolved.site.contentExtractor);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
