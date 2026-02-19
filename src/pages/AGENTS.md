# src/pages/ — Route-Level Views

One page per HashRouter route. Pages orchestrate components and wire hooks — they own route-level state.

## STRUCTURE

```
pages/
├── BatchSearchPage.tsx   # Main view: iframe grid + query bar + omnibox auto-send + reset. 452 LOC — FAR OVER LIMIT
├── SettingsPage.tsx      # Settings: site toggles, layout, language, theme, prompt templates. 183 LOC
└── HistoryPage.tsx       # History: browse/search/delete past queries. 165 LOC
```

Routes registered in `entrypoints/batch-search/main.tsx` (HashRouter).

## BatchSearchPage.tsx (452 LOC — FAR OVER LIMIT)

The primary orchestrator. Owns:

- **`siteUrlOverrides`** (state): Per-site custom URLs, overriding defaults from `site-handlers.json`. Cleared on reset.
- **`resetKey`** (state, number counter): Incremented on "New Chat". Passed to each `IframeWrapper` React key → forces full remount of all iframes.
- **`handleSend(query, files)`**: Iterates enabled sites, dispatches `postMessage(INJECT_QUERY_VIA_POST)` to each `IframeWrapper` via ref, saves to history, starts `startConversationUrlCapture()`.
- **Omnibox auto-send**: Reads `?q=` from hash via `useSearchParams`. If present, fires `handleSend` after 3s delay (iframe load time), then clears param.
- **Reset mechanism**: Detects `/?reset=true` URL param → clears `siteUrlOverrides`, increments `resetKey`, cleans URL.

**Must split before adding new features.** Suggested extractions: omnibox logic → `useOmniboxAutoSend`, reset logic → `useResetMechanism`, send logic → `useQueryDispatch`.

## SettingsPage.tsx (183 LOC)

Renders settings UI in sections:

1. **Site toggles** — enable/disable each LLM site
2. **Layout** — grid vs side-by-side
3. **Language** — 7-locale selector
4. **Theme** — 6-theme visual picker
5. **Prompt templates** — list + editor modal

All settings written via `useSettings().updateSettings()` (persists to `chrome.storage.local`).

## HistoryPage.tsx (165 LOC)

- Loads history via `useHistory` hook.
- Local search filter (client-side, no API).
- Delete single entry or clear all.
- Clicking a history entry navigates to `/?q=<query>` to re-run.

## WHERE TO LOOK

| Task                        | File                                                | Notes                                                        |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| Change query dispatch logic | `BatchSearchPage.tsx` `handleSend`                  | Iterates `enabledSites`, calls `iframeRefs[site].dispatch()` |
| Fix omnibox auto-send       | `BatchSearchPage.tsx` `useEffect` on `searchParams` | 3s delay, clears `?q=` after send                            |
| Fix reset / New Chat        | `BatchSearchPage.tsx` reset logic                   | `/?reset=true` → clears overrides + increments `resetKey`    |
| Add new settings section    | `SettingsPage.tsx`                                  | Add UI + wire to `useSettings().updateSettings()`            |
| Change history display      | `HistoryPage.tsx`                                   | Uses `useHistory` hook; filter is local state                |
| Add a new route             | `entrypoints/batch-search/main.tsx`                 | Add `<Route>` + import page here                             |

## CONVENTIONS

- Pages import components and call hooks. No direct `chrome.*` or `browser.*` usage.
- Route navigation via React Router `<Link>` or `useNavigate()` — HashRouter only.
- State that needs to survive navigation goes to `useSettings` (storage). Ephemeral UI state stays local.

## ANTI-PATTERNS

- **Never add business logic to pages** — extract to lib or hook.
- **`BatchSearchPage.tsx` at 452 LOC** — do NOT add features until it is split.
- **Never add a route directly here** — routes live in `entrypoints/batch-search/main.tsx`.
