# src/lib/ — Business Logic Layer

Pure functions and side-effect handlers. **No React imports.** Consumed by hooks and entrypoints only.

## PIPELINES

Three distinct pipelines, each with clear data flow:

### 1. Automation Pipeline (query injection)

```
automation-engine.ts  →  step-actions.ts  →  element-finder.ts
  (orchestrator)          (action impls)      (DOM selector)
                               ↓
                    contenteditable-handler.ts
                      (rich editor input)
```

- `automation-engine.ts` (75 LOC): Iterates `SearchStep[]` from site config, delegates to action handlers. Retry logic with `waitFor`.
- `step-actions.ts` (238 LOC): **OVER 200 LOC limit — must split.** Implements `focus`, `setValue`, `click`, `sendKeys`, `paste`, `triggerEvents`, `wait`. Dispatches to `contenteditable-handler.ts` for rich editors.
- `contenteditable-handler.ts` (158 LOC): Handles `contenteditable` input across editor frameworks: Lexical (data-lexical-editor), Tiptap/ProseMirror, and generic contenteditable. Uses execCommand + paste simulation fallback.
- `element-finder.ts` (46 LOC): Resolves `string | string[]` selectors. Recursively pierces Shadow DOM roots.

### 2. Content Extraction Pipeline (response scraping)

```
content-extractor.ts  →  html-node-converter.ts  →  html-to-markdown.ts
  (DOM → structured)       (nodes → clean HTML)       (HTML → Markdown)
```

- `content-extractor.ts` (135 LOC): Reads LLM conversation from DOM. Config-driven via `ContentExtractor` type. Handles thinking blocks, edit-mode exclusion, role detection.
- `html-node-converter.ts` (233 LOC): Transforms DOM nodes to clean HTML. Exempt from 200 LOC rule (static conversion mapping).
- `html-to-markdown.ts`: Final stage — converts clean HTML to Markdown for export/sharing.

### 3. Extension Bridge (messaging + routing + storage)

```
messaging.ts  ←→  background-frame-router.ts  ←→  site-frame-message-router.ts
storage.ts         (tab + frame discovery)          (message routing to iframes)
```

- `messaging.ts` (53 LOC): Typed wrappers around `browser.runtime.sendMessage`. Four operations: `sendToBackground`, `getSiteConfig`, `injectQuery`, `extractContent`.
- `background-frame-router.ts` (54 LOC): Finds the batch-search tab, resolves `siteName` → `{tabId, frameId}` using `webNavigation.getAllFrames()`.
- `site-frame-message-router.ts` (85 LOC): Routes `INJECT_QUERY`/`INJECT_FILE`/`EXTRACT_CONTENT` messages from background to the correct iframe. Tries direct frame first, then iterates all frames as fallback (skips `FRAME_SITE_MISMATCH` responses).
- `storage.ts` (125 LOC): CRUD for `chrome.storage.local`. Keys: `llm-crosser-settings`, `llm-crosser-history`. Contains `DEFAULT_SETTINGS` (must stay in sync with `entrypoints/background.ts`).

## WHERE TO LOOK

| Task                   | File                                              | Notes                                                         |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Add new action type    | `step-actions.ts` + `automation-engine.ts` switch | step-actions at 238 LOC — **MUST split first**                |
| Fix element not found  | `element-finder.ts`                               | Check Shadow DOM piercing logic                               |
| Fix rich editor input  | `contenteditable-handler.ts`                      | Lexical vs Tiptap vs generic — different strategies           |
| Fix content extraction | `content-extractor.ts`                            | Config-driven — check `site-handlers.json` selectors          |
| Add new message type   | `messaging.ts`                                    | Also add to `types/messaging.ts` + `background.ts` handler    |
| Fix message routing    | `site-frame-message-router.ts`                    | Direct frame → fallback iteration with mismatch filtering     |
| Change storage schema  | `storage.ts`                                      | Must also update `entrypoints/background.ts` DEFAULT_SETTINGS |

## CONVENTIONS

- All functions return result objects or primitives — never throw for expected failures.
- `findElement()` accepts `string | string[]` for selector fallback chains.
- `executeSteps()` is the only export from `automation-engine.ts` — single entry point.
- `setContentEditableValue()` is the only export from `contenteditable-handler.ts`.

## ANTI-PATTERNS

- **Never import React** in this directory — lib is framework-agnostic.
- **Never call `chrome.*` directly** — use `browser` from `wxt/browser` (polyfilled).
- **`step-actions.ts` at 238 LOC**: **OVER the 200 LOC limit.** Must split before adding new actions. Suggested grouping: input actions (`setValue`/`paste`), keyboard actions (`sendKeys`/`triggerEvents`), element actions (`focus`/`click`/`wait`).
