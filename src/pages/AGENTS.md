# src/pages/ — Route-Level Views

One page per HashRouter route. Pages orchestrate components and wire hooks — they own route-level state.

## STRUCTURE

```
pages/
├── BatchSearchPage.tsx   # Main view: iframe grid + query bar. 159 LOC
├── SettingsPage.tsx      # Settings: site toggles, layout, language, theme, prompt templates. 135 LOC
└── HistoryPage.tsx       # History: browse/search/delete past queries + export history. 158 LOC
```

Routes registered in `entrypoints/batch-search/main.tsx` (HashRouter).

## BatchSearchPage.tsx (159 LOC)

The primary orchestrator. Owns:

- **`siteUrlOverrides`** (state): Per-site custom URLs, overriding defaults from `site-handlers.json`. Cleared on reset.
- **`handleSend(query, files)`**: Iterates enabled sites, dispatches `postMessage(INJECT_QUERY_VIA_POST)` to each `IframeWrapper` via ref, saves to history, starts `startConversationUrlCapture()`.
- **`useOmniboxAutoSend`** (hook): Reads `?q=` from hash via `useSearchParams`. If present, fires `handleSend` after 3s delay (iframe load time), then clears param.
- **`useResetMechanism`** (hook): Detects `/?reset=true` URL param → clears `siteUrlOverrides`, returns `resetKey` counter for iframe remount.
- **`useConversationShare`** (hook): Manages share popup state, content extraction, formatting.

Previously 484 LOC — split into 3 custom hooks (`useOmniboxAutoSend`, `useResetMechanism`, `useConversationShare`).

## SettingsPage.tsx (135 LOC)

Renders settings UI in sections:

1. **Site toggles** — extracted to `SiteToggleSection` component
2. **Layout** — grid vs side-by-side
3. **Language** — 7-locale selector
4. **Theme** — 6-theme visual picker
5. **Prompt templates** — list + editor modal

All settings written via `useSettings().updateSettings()` (persists to `chrome.storage.local`).

Previously 207 LOC — `SiteToggleSection` extracted to `src/components/settings/`.

## HistoryPage.tsx (158 LOC)

- Loads history via `useHistory` hook.
- Loads export history via `useExportHistory` hook.
- Local search filter (client-side, no API).
- Delete single entry or clear all.
- Clicking a history entry navigates to `/?q=<query>` to re-run.
- Export history list delegated to `ExportHistoryList` component.

Previously 207 LOC — `ExportHistoryList` extracted to `src/components/history/`.

**Both pages are shared** — imported by both `batch-search/main.tsx` and `sidepanel/main.tsx`.

## WHERE TO LOOK

| Task                        | File                                | Notes                                                        |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Change query dispatch logic | `BatchSearchPage.tsx` `handleSend`  | Iterates `enabledSites`, calls `iframeRefs[site].dispatch()` |
| Fix omnibox auto-send       | `hooks/useOmniboxAutoSend.ts`       | 3s delay, clears `?q=` after send                            |
| Fix reset / New Chat        | `hooks/useResetMechanism.ts`        | `/?reset=true` → clears overrides + increments `resetKey`    |
| Add new settings section    | `SettingsPage.tsx`                  | Add UI + wire to `useSettings().updateSettings()`            |
| Change history display      | `HistoryPage.tsx`                   | Uses `useHistory` hook; filter is local state                |
| Add a new route             | `entrypoints/batch-search/main.tsx` | Add `<Route>` + import page here                             |

## CONVENTIONS

- Pages import components and call hooks. No direct `chrome.*` or `browser.*` usage.
- Route navigation via React Router `<Link>` or `useNavigate()` — HashRouter only.
- State that needs to survive navigation goes to `useSettings` (storage). Ephemeral UI state stays local.

## ANTI-PATTERNS

- **Never add business logic to pages** — extract to lib or hook.
- **Never add a route directly here** — routes live in `entrypoints/batch-search/main.tsx` and `entrypoints/sidepanel/main.tsx`.
- **Never duplicate pages for sidepanel** — sidepanel imports the same page components.
