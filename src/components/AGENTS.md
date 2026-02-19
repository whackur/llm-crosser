# src/components/ — UI Layer

React components grouped by feature domain. No direct `chrome.*` access — go through hooks or lib.

## STRUCTURE

```
components/
├── grid/
│   ├── IframeGrid.tsx        # Layout engine: side-by-side (flex) vs grid (CSS grid). 240 LOC — OVER LIMIT
│   └── IframeWrapper.tsx     # Per-site iframe: loading state, postMessage bridge, status overlay
├── layout/
│   ├── AppLayout.tsx         # Shell: Sidebar + <Outlet>. Syncs i18n language on mount.
│   └── Sidebar.tsx           # Nav: site toggles, layout toggle, New Chat, GitHub link, Report Issue
├── query/
│   ├── QueryInputBar.tsx     # Bottom input: text area, template picker, submit, file upload
│   └── FileUploadButton.tsx  # File picker + preview chip; emits file data to parent
├── settings/
│   ├── LanguageSelector.tsx  # Dropdown: 7 locales via i18next
│   ├── ThemeSelector.tsx     # Visual theme picker (6 themes: midnight/dawn/ocean/forest/rose/mint)
│   ├── PromptTemplateEditor.tsx # CRUD modal for prompt templates. 202 LOC — AT LIMIT
│   └── TemplateListItem.tsx  # Single template row with edit/delete actions
├── share/
│   └── SharePopup.tsx        # Export modal: copies Markdown or per-site conversation URLs. 213 LOC — OVER LIMIT
└── ui/
    ├── ErrorBanner.tsx       # Generic dismissible error display
    └── Icons.tsx             # SVG icon set: GitHubIcon, NewChatIcon, LayoutIcon, etc. (pure, no state)
```

## FEATURE OWNERSHIP

| Group       | Owns                                                | Consumes                                     |
| ----------- | --------------------------------------------------- | -------------------------------------------- |
| `grid/`     | iframe layout, loading states, postMessage dispatch | `useIframeManager`, `useSiteConfig`          |
| `layout/`   | app shell, sidebar collapse, language sync          | `useSettings`, `useTheme`, router `<Outlet>` |
| `query/`    | text input, file input, template selection          | `useSettings` (templates), parent `onSend`   |
| `settings/` | all settings UI forms                               | `useSettings`                                |
| `share/`    | Markdown export, URL copy                           | `useIframeManager` (extraction results)      |
| `ui/`       | reusable primitives (errors, icons)                 | nothing — zero dependencies                  |

## LOC STATUS

| File                                | LOC | Status                                            |
| ----------------------------------- | --- | ------------------------------------------------- |
| `grid/IframeGrid.tsx`               | 240 | **OVER** — split layout logic before adding modes |
| `share/SharePopup.tsx`              | 213 | **OVER** — split export format logic              |
| `settings/PromptTemplateEditor.tsx` | 202 | **AT LIMIT** — do not add more logic              |
| `layout/Sidebar.tsx`                | 176 | OK                                                |
| `ui/Icons.tsx`                      | 179 | OK (static SVG data exempt)                       |
| `query/QueryInputBar.tsx`           | 173 | OK                                                |

## WHERE TO LOOK

| Task                       | File                                | Notes                                                        |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Change grid column count   | `grid/IframeGrid.tsx`               | `side-by-side`: flex-row equal widths; `grid`: CSS grid cols |
| Fix iframe loading overlay | `grid/IframeWrapper.tsx`            | Status: `idle`/`loading`/`ready`/`error`                     |
| Add sidebar nav item       | `layout/Sidebar.tsx`                | Check collapse logic; icon in `ui/Icons.tsx`                 |
| Change language sync       | `layout/AppLayout.tsx`              | `useEffect` → `i18n.changeLanguage()` on mount               |
| Add template feature       | `settings/PromptTemplateEditor.tsx` | At 202 LOC — extract first                                   |
| Change export format       | `share/SharePopup.tsx`              | At 213 LOC — split format logic                              |
| Add new icon               | `ui/Icons.tsx`                      | Add SVG component; export named                              |

## CONVENTIONS

- Tailwind v4 utility classes only. Theme vars (`bg-surface`, `text-text`, `border-border`) from `globals.css @theme`.
- One component per file. File name = component name.
- No `chrome.*` or `browser.*` imports — use hooks.
- Props typed inline (not separate interface file) unless shared across components.

## ANTI-PATTERNS

- **Never import from `src/lib/` directly** — go through hooks.
- **Never put business logic in components** — extract to lib or hook.
- **`IframeGrid.tsx` at 240 LOC** — add layout modes only after splitting.
- **`SharePopup.tsx` at 213 LOC** — split export format handlers before new export types.
