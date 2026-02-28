# src/lib/ — Business Logic Layer

Pure functions and side-effect handlers. **No React imports.** Consumed by hooks and entrypoints only.

## PIPELINES

Three distinct pipelines, each with clear data flow:

### 1. Automation Pipeline (query injection)

```
automation-engine.ts  →  step-actions.ts  →  input-actions.ts   →  contenteditable-handler.ts
  (orchestrator)          (action router)     (setValue/paste)       (rich editor input)
                                           →  keyboard-actions.ts
                                              (sendKeys/events)
                                           →  element-finder.ts
                                              (DOM selector)
```

- `automation-engine.ts` (75 LOC): Iterates `SearchStep[]` from site config, delegates to action handlers. Retry logic with `waitFor`.
- `step-actions.ts` (62 LOC): Action router — delegates `focus`, `click`, `wait` inline; dispatches `setValue`/`paste` to `input-actions.ts` and `sendKeys`/`triggerEvents` to `keyboard-actions.ts`.
- `input-actions.ts` (106 LOC): Input actions: `setValue` (textarea/input + contenteditable dispatch), `paste` (clipboard simulation).
- `keyboard-actions.ts` (80 LOC): Keyboard actions: `sendKeys` (KeyboardEvent dispatch), `triggerEvents` (input/change event firing).
- `contenteditable-handler.ts` (158 LOC): Handles `contenteditable` input across editor frameworks: Lexical (data-lexical-editor), Tiptap/ProseMirror, and generic contenteditable. Uses execCommand + paste simulation fallback.
- `element-finder.ts` (46 LOC): Resolves `string | string[]` selectors. Recursively pierces Shadow DOM roots.

### 2. Content Extraction Pipeline (response scraping)

```
content-extractor.ts  →  html-node-converter.ts  →  html-to-markdown.ts
  (DOM → structured)       (nodes → clean HTML)       (HTML → Markdown)
```

- `content-extractor.ts` (143 LOC): Reads LLM conversation from DOM. Config-driven via `ContentExtractor` type. Handles thinking blocks, edit-mode exclusion, role detection.
- `html-node-converter.ts` (233 LOC): Transforms DOM nodes to clean HTML. Exempt from 200 LOC rule (static conversion mapping).
- `html-to-markdown.ts`: Final stage — converts clean HTML to Markdown for export/sharing.

### 3. Extension Bridge (routing + storage + float state)

```
background-frame-router.ts  ←→  site-frame-message-router.ts
storage.ts                       (broadcast message routing to iframes)
float-state.ts                   (float window lifecycle)
```

- `background-frame-router.ts` (39 LOC): Finds the batch-search tab via `tabs.query()`. Exports `findBatchSearchTab`, `fetchSiteConfig`, `forwardToExtensionPage`.
- `site-frame-message-router.ts` (29 LOC): Routes `INJECT_QUERY`/`INJECT_FILE`/`EXTRACT_CONTENT` messages from background to the batch-search tab via broadcast (`tabs.sendMessage` without frameId). Content scripts self-filter by siteName.
- `float-state.ts` (33 LOC): Float window state CRUD via `chrome.storage.local`. Key: `llm-crosser-float-state`. Exports `getFloatState`, `setFloatState`, `clearFloatState`, `onFloatStateChanged`. Type: `FloatState { active, tabId, windowId, originalWindowId }`.
- `constants.ts` (~30 LOC): `DEFAULT_SETTINGS` and `STORAGE_KEYS` — single source of truth. Imported by both `storage.ts` and `background.ts`.
- `url-utils.ts` (~25 LOC): `matchesHost()` — centralized hostname matching. Used by `content-script-handlers.ts`, `conversation-url-capture.ts`, `BatchSearchPage.tsx`, and `useConversationShare.ts`.
- `storage.ts` (136 LOC): CRUD for `chrome.storage.local`. Keys: `llm-crosser-settings`, `llm-crosser-history`. Imports defaults from `constants.ts`.
- `export-history-storage.ts` (~60 LOC): Export history CRUD. Split from `storage.ts`. Key: `llm-crosser-export-history`.
- `content-script-handlers.ts` (196 LOC): Handler logic extracted from `inject.content.ts`. Processes runtime messages (INJECT_QUERY, EXTRACT_CONTENT, etc.) via typed `RuntimeMessenger` interface.

### 4. URL Capture (conversation permalink tracking)

```
BatchSearchPage → startConversationUrlCapture() → postMessage(GET_URL_VIA_POST)
                                                         ↓
                                              inject.content.ts replies CURRENT_URL
```

- `conversation-url-capture.ts` (72 LOC): Polls all iframes via postMessage at 5s and 12s after query. Collects `CURRENT_URL` replies per site, fires `onCaptured(SiteResult[])` callback. Returns cleanup fn (removes listener + cancels timers).

### 5. Viral Comparison Examples (sidepanel content)

- `viral-comparison-examples.ts` (~450 LOC): Static data module — 100 curated LLM comparison queries across 8 categories (Brain Teaser, AI Identity, Creative Writing, Coding Challenge, Practical Advice, Knowledge Test, Hot Take, Fun & Personality). Exports `VIRAL_CATEGORIES` record, `VIRAL_EXAMPLES` array, and `getRandomExample()` utility. No React imports — consumed by `ViralExampleCard.tsx` in sidepanel.

## WHERE TO LOOK

| Task                      | File                                                            | Notes                                                                     |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Add new action type       | `step-actions.ts` + `input-actions.ts` or `keyboard-actions.ts` | Router in step-actions, impl in input/keyboard                            |
| Fix element not found     | `element-finder.ts`                                             | Check Shadow DOM piercing logic                                           |
| Fix rich editor input     | `contenteditable-handler.ts`                                    | Lexical vs Tiptap vs generic — different strategies                       |
| Fix content extraction    | `content-extractor.ts`                                          | Config-driven — check `site-handlers.json` selectors                      |
| Add new message type      | `types/messaging.ts` + `background.ts` handler                  | Add type to union, add case to background switch                  |
| Fix message routing       | `site-frame-message-router.ts`                                  | Broadcasts to batch-search tab; content scripts self-filter       |
| Change storage schema     | `constants.ts` + `storage.ts`                                   | Update defaults in `constants.ts`, CRUD in `storage.ts`                   |
| Capture conversation URLs | `conversation-url-capture.ts`                                   | Polls at 5s+12s; inject.content.ts handles `GET_URL_VIA_POST`             |
| Float window state        | `float-state.ts`                                                | CRUD + onChange listener; consumed by `useFloatMode` hook                 |
| Export history CRUD       | `export-history-storage.ts`                                     | `addExportHistoryEntry`, `deleteExportHistoryEntry`, `clearExportHistory` |
| Normalize site URLs       | `url-utils.ts`                                                  | Single `normalizeHostname()` — used across 4+ modules                     |
| Add/edit viral queries    | `viral-comparison-examples.ts`                                  | 100 queries, 8 categories; consumed by sidepanel `ViralExampleCard`       |

## CONVENTIONS

- All functions return result objects or primitives — never throw for expected failures.
- `findElement()` accepts `string | string[]` for selector fallback chains.
- `executeSteps()` is the only export from `automation-engine.ts` — single entry point.
- `setContentEditableValue()` is the only export from `contenteditable-handler.ts`.

## ANTI-PATTERNS

- **Never import React** in this directory — lib is framework-agnostic.
- **Never call `chrome.*` directly** — use `browser` from `wxt/browser` (polyfilled). Exception: `float-state.ts` uses `chrome.storage` directly (no `browser` polyfill needed for storage).
