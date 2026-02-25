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

    // --- Quill injection handler (Gemini logged-in) ---
    // ISOLATED world sends LLM_CROSSER_QUILL_INJECT via postMessage.
    // MAIN world accesses Quill instance directly, injects text, and clicks send.
    window.addEventListener("message", (event: MessageEvent) => {
      if (event.data?.type !== "LLM_CROSSER_QUILL_INJECT") return;

      const { text, requestId } = event.data as { text: string; requestId: string };

      const reply = (success: boolean) =>
        window.postMessage(
          { type: "LLM_CROSSER_QUILL_INJECT_RESULT", requestId, success },
          "*",
        );

      const container = document.querySelector(".ql-container") as HTMLElement | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quill = (container as any)?.__quill as
        | {
          focus: () => void;
          deleteText: (i: number, l: number, s: string) => void;
          insertText: (i: number, t: string, s: string) => void;
          getLength: () => number;
          setSelection: (i: number) => void;
        }
        | undefined;

      if (!quill) {
        reply(false);
        return;
      }

      quill.focus();
      const len = quill.getLength();
      if (len > 1) quill.deleteText(0, len, "user");
      quill.insertText(0, text, "user");
      quill.setSelection(quill.getLength() - 1);

      // Poll for send button to become visible (Angular re-renders after Quill state change)
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 100;

      const poll = setInterval(() => {
        attempts++;
        const sendBtn = document.querySelector(
          "button.send, .send-button-container button",
        ) as HTMLButtonElement | null;

        if (sendBtn && sendBtn.offsetParent !== null) {
          clearInterval(poll);
          sendBtn.click();
          reply(true);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          reply(false);
        }
      }, pollInterval);
    });
  },
});
