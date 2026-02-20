# src/hooks/ — React State Bridge

Custom hooks that wrap `chrome.storage`, `browser.runtime`, and extension APIs behind React-friendly interfaces. Every hook in this directory follows the same pattern: async init on mount, reactive updates via `chrome.storage.onChanged` or `useEffect`, cleanup on unmount.

## HOOKS

| Hook               | LOC | Wraps                              | Returns                                                 |
| ------------------ | --- | ---------------------------------- | ------------------------------------------------------- |
| `useSettings`      | 78  | `chrome.storage.local` (settings)  | `{ settings, updateSettings, loading }`                 |
| `useHistory`       | 124 | `chrome.storage.local` (history)   | `{ history, addEntry, deleteEntry, clearAll }`          |
| `useIframeManager` | 109 | Multi-iframe lifecycle             | `{ iframeRefs, statuses, dispatch, extract }`           |
| `useSiteConfig`    | 42  | `site-handlers.json` fetch         | `{ siteConfigs, loading }`                              |
| `useTheme`         | 22  | `document.documentElement` dataset | Applies `data-theme` attribute; no return value         |
| `useFloatMode`     | 47  | `lib/float-state.ts`               | `{ isPopupWindow, isFloatActive, floatState, loading }` |
| `useExportHistory` | 96  | `chrome.storage.local` (exports)   | `{ exportHistory, addEntry, deleteEntry, clearAll }`    |
| `useGitHubStars`   | 67  | GitHub API + chrome.storage cache  | `stars: number \| null`                                 |

## PATTERNS

- **Optimistic updates**: `useExportHistory` and `useHistory` update local state immediately, then persist. On failure, they reload from storage (rollback).
- **Storage listener sync**: `useSettings`, `useExportHistory` subscribe to `chrome.storage.onChanged` to stay in sync across tabs/contexts.
- **Cache with TTL**: `useGitHubStars` caches star count in `chrome.storage.local` with a 12-hour TTL. Shows cached value immediately, then refreshes if stale.
- **Cleanup**: All hooks with listeners return cleanup functions or use `useEffect` return for unmount.

## WHERE TO LOOK

| Task                    | Hook                | Notes                                                          |
| ----------------------- | ------------------- | -------------------------------------------------------------- |
| Add new settings field  | `useSettings.ts`    | Also update `types/settings.ts` + `lib/storage.ts` defaults    |
| Change iframe lifecycle | `useIframeManager`  | Manages load/query/status/extract per iframe                   |
| Add theme               | `useTheme.ts`       | Applies `[data-theme]` to `<html>`. Add theme in `globals.css` |
| Float window reactivity | `useFloatMode.ts`   | Reads from `lib/float-state.ts`; detects popup window type     |
| Export history CRUD     | `useExportHistory`  | Storage key: `llm-crosser-export-history`                      |
| Change star cache TTL   | `useGitHubStars.ts` | `CACHE_TTL_12H_MS` constant; repo: `whackur/llm-crosser`       |

## CONVENTIONS

- Hooks consume `lib/` and `types/` — never the other way around.
- No direct `chrome.*` calls for settings/history — use `lib/storage.ts`. Exception: `useGitHubStars` and `useFloatMode` access `chrome.storage.local` directly for their own isolated keys.
- Hook files are named `use{Feature}.ts` — one hook per file.
- Return typed interfaces (not inline objects) for complex hooks.

## ANTI-PATTERNS

- **Never call `chrome.storage` without cleanup** — always remove `onChanged` listeners on unmount.
- **Never import hooks in `src/lib/`** — lib is framework-agnostic, hooks are React-only.
- **Never duplicate storage logic** — if `lib/storage.ts` has the CRUD, the hook wraps it with reactive state.
