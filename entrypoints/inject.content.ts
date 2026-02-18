import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import { executeSteps } from "../src/lib/automation-engine";
import { extractConversation } from "../src/lib/content-extractor";
import type { ExtensionMessage, SiteHandlersConfig } from "../src/types";

export default defineContentScript({
  matches: [
    "https://chatgpt.com/*",
    "https://gemini.google.com/*",
    "https://grok.com/*",
    "https://chat.qwen.ai/*",
    "https://chat.z.ai/*",
    "https://www.perplexity.ai/*",
  ],
  allFrames: true,
  runAt: "document_start",
  main() {
    const normalizeHostname = (hostname: string): string =>
      hostname.toLowerCase().replace(/^www\./, "");

    const isCurrentFrameForSite = (siteUrl: string): boolean => {
      try {
        const currentHost = normalizeHostname(window.location.hostname);
        const siteHost = normalizeHostname(new URL(siteUrl).hostname);
        return (
          currentHost === siteHost ||
          currentHost.endsWith(`.${siteHost}`) ||
          siteHost.endsWith(`.${currentHost}`)
        );
      } catch {
        return false;
      }
    };

    // Primary: postMessage-based injection (reliable for iframes within extension pages)
    window.addEventListener("message", (event) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type } = event.data as { type?: string };

      if (type === "INJECT_QUERY_VIA_POST") {
        const { query, searchHandler, siteName } = event.data as {
          query?: string;
          searchHandler?: { steps: unknown[] };
          siteName?: string;
        };
        if (!query || !searchHandler?.steps || !Array.isArray(searchHandler.steps)) return;

        (async () => {
          try {
            const ok = await executeSteps(
              searchHandler.steps as unknown as Parameters<typeof executeSteps>[0],
              query,
            );
            const source = event.source as Window | null;
            source?.postMessage(
              { type: "QUERY_STATUS", siteName: siteName ?? "", status: ok ? "done" : "error" },
              "*",
            );
          } catch (error) {
            console.error("[llm-crosser] postMessage handler error:", error);
          }
        })();
        return;
      }

      if (type === "INJECT_FILE_VIA_POST") {
        const { fileData, fileUploadHandler, siteName } = event.data as {
          fileData?: string;
          fileUploadHandler?: { steps: unknown[] };
          siteName?: string;
        };
        if (!fileData || !fileUploadHandler?.steps) return;

        (async () => {
          try {
            const ok = await executeSteps(
              fileUploadHandler.steps as unknown as Parameters<typeof executeSteps>[0],
              fileData,
            );
            const source = event.source as Window | null;
            source?.postMessage(
              {
                type: "FILE_UPLOAD_STATUS",
                siteName: siteName ?? "",
                status: ok ? "done" : "error",
              },
              "*",
            );
          } catch (error) {
            console.error("[llm-crosser] postMessage file handler error:", error);
          }
        })();
        return;
      }

      if (type === "GET_URL_VIA_POST") {
        const { siteName } = event.data as { siteName?: string };
        const source = event.source as Window | null;
        source?.postMessage(
          { type: "CURRENT_URL", siteName: siteName ?? "", url: window.location.href },
          "*",
        );
        return;
      }

      if (type === "EXTRACT_CONTENT_VIA_POST") {
        const { contentExtractor, siteName } = event.data as {
          contentExtractor?: Parameters<typeof extractConversation>[0];
          siteName?: string;
        };
        if (!contentExtractor) return;

        try {
          const data = extractConversation(contentExtractor);
          const source = event.source as Window | null;
          source?.postMessage(
            { type: "EXTRACTED_CONTENT", siteName: siteName ?? "", success: true, data },
            "*",
          );
        } catch (error) {
          console.error("[llm-crosser] postMessage extract error:", error);
        }
        return;
      }
    });

    // Fallback: Chrome extension messaging (for non-iframe contexts)
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const msg = message as ExtensionMessage;

      if (msg.type === "INJECT_QUERY") {
        (async () => {
          try {
            const config = (await browser.runtime.sendMessage({
              type: "GET_SITE_CONFIG",
            })) as unknown as SiteHandlersConfig;

            const site = config.sites.find((s) => s.name === msg.siteName);

            if (site) {
              if (!isCurrentFrameForSite(site.url)) {
                sendResponse({ success: false, error: "FRAME_SITE_MISMATCH" });
                return;
              }

              const ok = await executeSteps(site.searchHandler.steps, msg.query);
              sendResponse(
                ok
                  ? { success: true }
                  : { success: false, error: "Failed to execute search steps" },
              );
            } else {
              sendResponse({ success: false, error: `Site ${msg.siteName} not found` });
            }
          } catch (error) {
            sendResponse({ success: false, error: String(error) });
          }
        })();
        return true;
      }

      if (msg.type === "INJECT_FILE") {
        (async () => {
          try {
            const config = (await browser.runtime.sendMessage({
              type: "GET_SITE_CONFIG",
            })) as unknown as SiteHandlersConfig;

            const site = config.sites.find((s) => s.name === msg.siteName);

            if (site && site.fileUploadHandler) {
              if (!isCurrentFrameForSite(site.url)) {
                sendResponse({ success: false, error: "FRAME_SITE_MISMATCH" });
                return;
              }

              const ok = await executeSteps(site.fileUploadHandler.steps, msg.fileData);
              sendResponse(
                ok ? { success: true } : { success: false, error: "Failed to execute file steps" },
              );
            } else {
              sendResponse({
                success: false,
                error: `Site ${msg.siteName} or file handler not found`,
              });
            }
          } catch (error) {
            sendResponse({ success: false, error: String(error) });
          }
        })();
        return true;
      }

      if (msg.type === "EXTRACT_CONTENT") {
        (async () => {
          try {
            const config = (await browser.runtime.sendMessage({
              type: "GET_SITE_CONFIG",
            })) as unknown as SiteHandlersConfig;

            const site = config.sites.find((s) => s.name === msg.siteName);

            if (site?.contentExtractor) {
              if (!isCurrentFrameForSite(site.url)) {
                sendResponse({ success: false, error: "FRAME_SITE_MISMATCH" });
                return;
              }

              const data = extractConversation(site.contentExtractor);
              sendResponse({ success: true, data });
            } else {
              sendResponse({
                success: false,
                error: `Site ${msg.siteName} or content extractor not found`,
              });
            }
          } catch (error) {
            sendResponse({ success: false, error: String(error) });
          }
        })();
        return true;
      }
    });
  },
});
