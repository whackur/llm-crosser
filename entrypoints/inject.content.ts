import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import {
  handleInjectQuery,
  handleInjectFile,
  handleGetUrl,
  handleExtractContent,
  handleRuntimeInjectQuery,
  handleRuntimeInjectFile,
  handleRuntimeExtractContent,
} from "../src/lib/content-script-handlers";
import type { ExtensionMessage } from "../src/types";

export default defineContentScript({
  matches: [
    "https://chatgpt.com/*",
    "https://gemini.google.com/*",
    "https://grok.com/*",
    "https://chat.qwen.ai/*",
    "https://chat.z.ai/*",
    "https://www.perplexity.ai/*",
    "https://perplexity.ai/*",
  ],
  allFrames: true,
  runAt: "document_start",
  main() {
    window.addEventListener("message", (event) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type } = event.data as { type?: string };
      const source = event.source as Window | null;

      if (type === "INJECT_QUERY_VIA_POST") {
        (async () => {
          const result = await handleInjectQuery(event.data);
          source?.postMessage(
            { type: "QUERY_STATUS", siteName: event.data.siteName ?? "", status: result.status },
            "*",
          );
        })();
        return;
      }

      if (type === "INJECT_FILE_VIA_POST") {
        (async () => {
          const result = await handleInjectFile(event.data);
          source?.postMessage(
            {
              type: "FILE_UPLOAD_STATUS",
              siteName: event.data.siteName ?? "",
              status: result.status,
            },
            "*",
          );
        })();
        return;
      }

      if (type === "GET_URL_VIA_POST") {
        const result = handleGetUrl();
        source?.postMessage(
          { type: "CURRENT_URL", siteName: event.data.siteName ?? "", url: result.url },
          "*",
        );
        return;
      }

      if (type === "EXTRACT_CONTENT_VIA_POST") {
        const result = handleExtractContent(event.data);
        if (result.success) {
          source?.postMessage(
            {
              type: "EXTRACTED_CONTENT",
              siteName: event.data.siteName ?? "",
              success: true,
              data: result.data,
            },
            "*",
          );
        }
        return;
      }
    });

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const msg = message as ExtensionMessage;

      if (msg.type === "INJECT_QUERY") {
        (async () => {
          const result = await handleRuntimeInjectQuery(msg, browser);
          sendResponse(result);
        })();
        return true;
      }

      if (msg.type === "INJECT_FILE") {
        (async () => {
          const result = await handleRuntimeInjectFile(msg, browser);
          sendResponse(result);
        })();
        return true;
      }

      if (msg.type === "EXTRACT_CONTENT") {
        (async () => {
          const result = await handleRuntimeExtractContent(msg, browser);
          sendResponse(result);
        })();
        return true;
      }
    });
  },
});
