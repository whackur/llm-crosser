# src/components/ — UI Layer

React components grouped by feature domain. No direct `chrome.*` access — go through hooks or lib.

## STRUCTURE

```
components/
├── grid/
│   ├── IframeGrid.tsx        # Layout engine: side-by-side (flex) vs grid (CSS grid). 244 LOC — OVER LIMIT
│   ├── IframeWrapper.tsx     # Per-site iframe: loading state, postMessage bridge, status overlay
│   └── ActiveSitesBar.tsx    # Horizontal favicon toggle bar for enabling/disabling LLM sites
├── layout/
│   ├── AppLayout.tsx         # Shell: Sidebar + <Outlet>. Syncs i18n language on mount.
│   ├── Sidebar.tsx           # Nav: site toggles, layout toggle, New Chat link
│   ├── SidebarFooter.tsx     # Footer: float window btn, GitHub star link, Report Issue, collapse toggle
│   └── FloatModePlaceholder.tsx # Placeholder shown when batch-search is detached to float window
├── query/
│   ├── QueryInputBar.tsx     # Bottom input: text area, template picker, submit, file upload
│   └── FileUploadButton.tsx  # File picker + preview chip; emits file data to parent
├── settings/
│   ├── LanguageSelector.tsx  # Dropdown: 7 locales via i18next
│   ├── ThemeSelector.tsx     # Visual theme picker (6 themes: midnight/dawn/ocean/forest/rose/mint)
│   ├── PromptTemplateEditor.tsx # CRUD modal for prompt templates. 202 LOC — AT LIMIT
│   └── TemplateListItem.tsx  # Single template row with edit/delete actions
├── sidepanel/
│   ├── SidepanelLayout.tsx   # Side panel shell: header, bottom tab nav (/, /history, /settings)
│   └── SidepanelHome.tsx     # Quick query input + float window control (open/focus/close)
├── share/
│   └── SharePopup.tsx        # Export modal: copies Markdown or per-site conversation URLs. 229 LOC — OVER LIMIT
└── ui/
    ├── ErrorBanner.tsx       # Generic dismissible error display
    └── Icons.tsx             # SVG icon set: GitHubIcon, NewChatIcon, DetachIcon, etc. 207 LOC — OVER LIMIT
```

## FEATURE OWNERSHIP

| Group        | Owns                                                | Consumes                                              |
| ------------ | --------------------------------------------------- | ----------------------------------------------------- |
| `grid/`      | iframe layout, loading states, postMessage dispatch | `useIframeManager`, `useSiteConfig`                   |
| `layout/`    | app shell, sidebar collapse, float placeholder      | `useSettings`, `useTheme`, `useFloatMode`, `<Outlet>` |
| `query/`     | text input, file input, template selection          | `useSettings` (templates), parent `onSend`            |
| `settings/`  | all settings UI forms                               | `useSettings`                                         |
| `sidepanel/` | side panel shell, quick query, float control        | `useSettings`, `useFloatMode`, `useSiteConfig`        |
| `share/`     | Markdown export, URL copy                           | `useIframeManager` (extraction results)               |
| `ui/`        | reusable primitives (errors, icons)                 | nothing — zero dependencies                           |

## LOC STATUS

| File                                | LOC | Status                                            |
| ----------------------------------- | --- | ------------------------------------------------- |
| `grid/IframeGrid.tsx`               | 244 | **OVER** — split layout logic before adding modes |
| `share/SharePopup.tsx`              | 229 | **OVER** — split export format logic              |
| `ui/Icons.tsx`                      | 207 | **OVER** — exempt if static SVG only              |
| `settings/PromptTemplateEditor.tsx` | 202 | **AT LIMIT** — do not add more logic              |
| `query/QueryInputBar.tsx`           | 173 | OK                                                |
| `grid/IframeWrapper.tsx`            | 159 | OK                                                |
| `layout/SidebarFooter.tsx`          | 125 | OK                                                |
| `sidepanel/SidepanelHome.tsx`       | 125 | OK                                                |
| `sidepanel/SidepanelLayout.tsx`     | 122 | OK                                                |
| `layout/Sidebar.tsx`                | 118 | OK                                                |
| `grid/ActiveSitesBar.tsx`           | 94  | OK                                                |

## WHERE TO LOOK

| Task                       | File                                | Notes                                                        |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Change grid column count   | `grid/IframeGrid.tsx`               | `side-by-side`: flex-row equal widths; `grid`: CSS grid cols |
| Fix iframe loading overlay | `grid/IframeWrapper.tsx`            | Status: `idle`/`loading`/`ready`/`error`                     |
| Toggle sites visually      | `grid/ActiveSitesBar.tsx`           | Favicon-based; used in both sidepanel and potentially main   |
| Add sidebar nav item       | `layout/Sidebar.tsx`                | Footer extracted to `SidebarFooter.tsx`                      |
| Float window placeholder   | `layout/FloatModePlaceholder.tsx`   | Shown when batch-search is detached                          |
| Change language sync       | `layout/AppLayout.tsx`              | `useEffect` → `i18n.changeLanguage()` on mount               |
| Side panel layout          | `sidepanel/SidepanelLayout.tsx`     | Bottom tab nav; shares Settings/History pages with main      |
| Side panel quick query     | `sidepanel/SidepanelHome.tsx`       | Sends `DETACH_BATCH_SEARCH` to background with query         |
| Add template feature       | `settings/PromptTemplateEditor.tsx` | At 202 LOC — extract first                                   |
| Change export format       | `share/SharePopup.tsx`              | At 229 LOC — split format logic                              |
| Add new icon               | `ui/Icons.tsx`                      | Add SVG component; export named                              |

## CONVENTIONS

- Tailwind v4 utility classes only. Theme vars (`bg-surface`, `text-text`, `border-border`) from `globals.css @theme`.
- One component per file. File name = component name.
- No `chrome.*` or `browser.*` imports — use hooks.
- Props typed inline (not separate interface file) unless shared across components.

## ANTI-PATTERNS

- **Never import from `src/lib/` directly** — go through hooks.
- **Never put business logic in components** — extract to lib or hook.
- **`IframeGrid.tsx` at 244 LOC** — add layout modes only after splitting.
- **`SharePopup.tsx` at 229 LOC** — split export format handlers before new export types.
- **`Icons.tsx` at 207 LOC** — over limit but exempt if only static SVG data. Do not add stateful logic.
- **Side panel pages are shared** — `sidepanel/main.tsx` imports `SettingsPage`/`HistoryPage` from `src/pages/`. Never duplicate.
