# entrypoints/ — WXT Extension Entry Points

WXT-managed files that become the Chrome extension's service worker, content scripts, and SPA root. Each runs in a distinct JavaScript context.

## STRUCTURE

```
entrypoints/
├── background.ts            # Service worker (MV3): message router, tab manager, omnibox, settings
├── batch-search/            # React SPA — the main UI tab
│   ├── index.html           # HTML shell (WXT injects bundle)
│   └── main.tsx             # App root: ReactDOM.createRoot + i18next + HashRouter
├── frame-guard.content.ts   # MAIN world content script (document_start): neutralizes frame-busting
└── inject.content.ts        # ISOLATED world content script: dual-channel query automation
```

## JAVASCRIPT WORLDS

| File                     | World          | Run At           | Purpose                                                    |
| ------------------------ | -------------- | ---------------- | ---------------------------------------------------------- |
| `background.ts`          | Service worker | —                | Message hub, tab/omnibox management                        |
| `frame-guard.content.ts` | **MAIN**       | `document_start` | Overrides `window.top`/`window.parent` before page JS runs |
| `inject.content.ts`      | **ISOLATED**   | `document_idle`  | Registers message listeners, calls automation engine       |
| `batch-search/main.tsx`  | Extension page | —                | React SPA rendered in a full tab                           |

**MAIN world** shares the page's JS scope — required to override frame-busting properties that target `window.top`. Runs first via `document_start`.

**ISOLATED world** is sandboxed — can access the DOM and use `browser.runtime` but cannot touch page globals. Used for safe automation.

## background.ts (150 LOC)

- **Tab manager**: Opens/focuses the batch-search tab on icon click. Stores `batchSearchTabId`.
- **Omnibox**: Handles `llmc` keyword → opens tab with `#/?q=<query>` hash.
- **Message router**: Receives `INJECT_QUERY`, `INJECT_FILE`, `EXTRACT_CONTENT`, `GET_SITE_CONFIG`, `REPORT_SITE_URL` messages from any context; delegates to `site-frame-message-router.ts`.
- **Settings sync**: Defines `DEFAULT_SETTINGS` (must stay in sync with `src/lib/storage.ts`).

## frame-guard.content.ts

Runs at `document_start` in MAIN world on all matching LLM site URLs. Overrides:

- `window.top` → returns `window` (self-reference)
- `window.parent` → returns `window`
- `window.self` → passthrough

Neutralizes frame-busting checks like `if (window.top !== window.self) { top.location = ... }`.

Must update `matches` array when adding a new LLM site.

## inject.content.ts (253 LOC — OVER 200 LOC LIMIT)

Dual-channel listener in ISOLATED world:

1. **postMessage channel** (`window "message"` listener): Receives `INJECT_QUERY_VIA_POST`, `INJECT_FILE_VIA_POST`, `EXTRACT_CONTENT_VIA_POST`, `GET_URL_VIA_POST` from `IframeWrapper.tsx` via `contentWindow.postMessage()`.
2. **Runtime channel** (`browser.runtime.onMessage` listener): Fallback path routed through `background.ts` → `tabs.sendMessage({frameId})`.

Both channels call the same automation/extraction logic. Replies to `GET_URL_VIA_POST` with `CURRENT_URL` (used by `conversation-url-capture.ts`).

**Must split before adding new message handlers.** Suggested: separate listener registration from handler logic.

## WHERE TO LOOK

| Task                        | File                                                     | Notes                                             |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Fix iframe frame-busting    | `frame-guard.content.ts`                                 | Add/fix property overrides; check `matches` array |
| Add new LLM site            | `frame-guard.content.ts` + `inject.content.ts`           | Both need site URL in `matches` array             |
| Change omnibox keyword      | `background.ts`                                          | `omnibox.onInputEntered`, currently `llmc`        |
| Fix message routing failure | `background.ts` + `src/lib/site-frame-message-router.ts` | Check frameId resolution                          |
| Change auto-send delay      | `background.ts` + `src/pages/BatchSearchPage.tsx`        | 3s delay on omnibox path                          |
| Add React route             | `batch-search/main.tsx`                                  | HashRouter — add route + import page              |

## CONVENTIONS

- `background.ts` and `src/lib/storage.ts` both define `DEFAULT_SETTINGS` — **keep in sync**.
- `browser` (from `wxt/browser`) not `chrome.*` — polyfilled for cross-browser support.
- No React imports in `background.ts`, `frame-guard.content.ts`, or `inject.content.ts`.

## ANTI-PATTERNS

- **Never add logic to `batch-search/index.html`** — WXT manages this file.
- **Never use `chrome.*` directly** — use `browser` from `wxt/browser`.
- **`inject.content.ts` is at 253 LOC** — split before adding new message handlers.
- **Never add `frame-guard.content.ts` logic to ISOLATED world** — property overrides require MAIN world.
