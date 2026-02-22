import { defineContentScript } from "wxt/utils/define-content-script";

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
  world: "MAIN",
  main() {
    // Capture real window.top before any overrides
    let realTop: Window | null;
    try {
      realTop = window.top;
    } catch {
      // Sandboxed iframe may throw — treat as being inside an iframe
      realTop = null;
    }

    // Only activate when actually running inside an iframe
    if (window.self === realTop) return;

    const _defineProperty = Object.defineProperty;

    const overrides: Array<[string, () => unknown]> = [
      ["top", () => window.self],
      ["parent", () => window.self],
      ["frameElement", () => null],
    ];

    for (const [prop, getter] of overrides) {
      try {
        _defineProperty(window, prop, {
          get: getter,
          configurable: false,
          enumerable: true,
        });
      } catch {
        // Property may be non-configurable in this context (e.g. sandboxed iframe).
        // Header-level stripping via declarativeNetRequest handles framing in that case.
      }
    }
  },
});
