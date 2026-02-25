const QUILL_INJECT_TYPE = "LLM_CROSSER_QUILL_INJECT";
const QUILL_RESULT_TYPE = "LLM_CROSSER_QUILL_INJECT_RESULT";
const QUILL_TIMEOUT_MS = 5000;

/**
 * Attempts Quill-based text injection via MAIN world postMessage bridge.
 * Used for Gemini's logged-in Quill editor where standard contenteditable
 * manipulation fails to update Angular/Quill internal state.
 *
 * Returns true if the MAIN world handler successfully injected + submitted.
 * Returns false if no Quill editor detected or injection failed.
 */
export function tryQuillInjection(query: string): Promise<boolean> {
  const editor = document.querySelector(".ql-editor");
  if (!editor) return Promise.resolve(false);

  const requestId = `quill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("message", handler);
      resolve(false);
    }, QUILL_TIMEOUT_MS);

    function handler(event: MessageEvent) {
      if (event.data?.type !== QUILL_RESULT_TYPE || event.data?.requestId !== requestId) {
        return;
      }
      clearTimeout(timeout);
      window.removeEventListener("message", handler);
      resolve(event.data.success === true);
    }

    window.addEventListener("message", handler);
    window.postMessage({ type: QUILL_INJECT_TYPE, text: query, requestId }, "*");
  });
}
