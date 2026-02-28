# src/ — React Application Layer

The React SPA that powers the batch-search dashboard. Renders inside `entrypoints/batch-search/`.

## STRUCTURE

```
src/
├── components/           # UI grouped by feature domain
│   ├── grid/             # IframeGrid (layout modes), IframeWrapper (per-site frame), ActiveSitesBar
│   ├── history/          # ExportHistoryList (shared export entries list)
│   ├── layout/           # AppLayout (shell), Sidebar (nav), SidebarFooter, FloatModePlaceholder
│   ├── query/            # QueryInputBar (bottom input), FileUploadButton
│   ├── settings/         # LanguageSelector, PromptTemplateEditor, TemplateListItem, ThemeSelector, SiteToggleSection
│   ├── share/            # SharePopup (export results modal)
│   ├── sidepanel/        # SidepanelLayout (shell + bottom nav), SidepanelHome (quick query + viral card)
│   └── ui/               # ErrorBanner (generic error), Icons (SVG icon set: GitHubIcon, NewChatIcon, etc.)
├── hooks/                # State encapsulation (see hooks/AGENTS.md)
│   ├── useSettings.ts    # Reactive chrome.storage.local wrapper (settings)
│   ├── useHistory.ts     # CRUD for search history entries
│   ├── useSiteConfig.ts  # Fetches site-handlers.json from extension bundle
│   ├── useSiteConfig.ts  # Fetches site-handlers.json from extension bundle
│   ├── useTheme.ts       # Applies data-theme attribute to document root
│   ├── useFloatMode.ts   # Float window state: isPopupWindow, isFloatActive
│   ├── useExportHistory.ts # CRUD for export history entries (optimistic updates)
│   ├── useGitHubStars.ts # GitHub star count with 12h cache in chrome.storage
│   ├── useConversationShare.ts # Share popup state: extract, format, copy, isExtracting (195 LOC)
│   ├── useOmniboxAutoSend.ts   # Auto-send query from omnibox ?q= param (68 LOC)
│   └── useResetMechanism.ts    # Handle /?reset=true → clear overrides + remount (33 LOC)
├── i18n/                 # i18next config + 7 locale JSONs (en/ko/ja/zh/pt/ru/fr)
├── lib/                  # Pure logic + side-effect handlers (see lib/AGENTS.md)
│   ├── constants.ts               # DEFAULT_SETTINGS, STORAGE_KEYS — single source of truth
│   ├── url-utils.ts               # normalizeHostname() — URL normalization (used across 4+ modules)
│   ├── automation-engine.ts       # Step orchestrator: delegates to step-actions
│   ├── step-actions.ts            # Action router: delegates to input-actions + keyboard-actions
│   ├── input-actions.ts           # Input actions: setValue, paste, contenteditable dispatch
│   ├── keyboard-actions.ts        # Keyboard actions: sendKeys, triggerEvents
│   ├── contenteditable-handler.ts # Contenteditable input: Lexical, Tiptap/ProseMirror, generic
│   ├── element-finder.ts          # Shadow DOM-piercing element selector
│   ├── content-extractor.ts       # Extracts LLM responses from iframes
│   ├── html-node-converter.ts     # Converts DOM nodes to structured HTML
│   ├── html-to-markdown.ts        # Converts extracted HTML to Markdown for export
│   ├── content-script-handlers.ts # Handler logic extracted from inject.content.ts
│   ├── background-frame-router.ts # Finds batch-search tab (tabs.query)
│   ├── site-frame-message-router.ts # Broadcasts messages from background to batch-search tab
│   ├── conversation-url-capture.ts # Polls iframes for per-site conversation URLs post-query
│   ├── float-state.ts             # Float window state: get/set/clear/onChange (chrome.storage)
│   ├── storage.ts                 # chrome.storage.local CRUD (settings + history)
│   ├── export-history-storage.ts  # Export history CRUD (split from storage.ts)
│   └── viral-comparison-examples.ts # 100 curated LLM comparison queries (8 categories) for sidepanel
├── pages/                # Route-level views (one per HashRouter route)
│   ├── BatchSearchPage.tsx   # Main: IframeGrid + QueryInputBar + omnibox auto-send
│   ├── SettingsPage.tsx      # Site toggles, layout, language, theme, prompt templates
│   └── HistoryPage.tsx       # Search history with delete/clear/search
├── styles/
│   └── globals.css       # Tailwind v4 @theme block (6 themes: midnight, dawn, ocean, forest, rose, mint)
└── types/                # Domain interfaces, barrel re-exported via index.ts
    ├── site.ts           # SiteConfig, SearchHandler, SearchStep, FileUploadHandler
    ├── settings.ts       # UserSettings, GridLayout, PromptTemplate, LanguageCode, ThemeId (midnight|dawn|ocean|forest|rose|mint)
    ├── history.ts        # HistoryEntry, SiteResult
    ├── messaging.ts      # All message types (INJECT_QUERY, QUERY_STATUS, etc.)
    ├── i18n.ts           # TranslationKeys type
    └── index.ts          # Barrel: re-exports all types
```

## DATA FLOW

```
Pages (orchestrate) → Components (render) → Hooks (state) → Lib (logic) → Types (contracts)
```

- **Pages** compose components and wire hooks. They own route-level state.
- **Components** receive props + call hooks. No direct chrome API access.
- **Hooks** wrap `chrome.storage` and `browser.runtime` behind React-friendly APIs.
- **Lib** contains pure functions and side-effect handlers. No React imports.
- **Types** are consumed everywhere. Changed via `types/` → re-exported from `types/index.ts`.

## WHERE TO LOOK

| Task                       | File(s)                                                                          | Notes                                                             |
| -------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Add a new component        | `components/{feature}/NewComponent.tsx`                                          | One file per component, Tailwind classes                          |
| Change grid behavior       | `components/grid/IframeGrid.tsx`                                                 | `side-by-side` (flex-row) vs `grid` (CSS grid)                    |
| Add settings field         | `types/settings.ts` → `lib/constants.ts` → `hooks/useSettings.ts`                | Update type, default in constants, then hook                      |
| Change theme               | `styles/globals.css` @theme block + `[data-theme]` selectors                     | CSS vars: `--color-*`, `--spacing-*`, `--radius-*`                |
| Reset / New Chat           | `components/layout/Sidebar.tsx` + `pages/BatchSearchPage.tsx`                    | `/?reset=true` param → resetKey counter → iframe remount          |
| Add translation key        | `i18n/locales/*.json` (all 7) + `types/i18n.ts`                                  | Key must exist in all locales                                     |
| Add automation action      | `lib/step-actions.ts` + `lib/input-actions.ts` or `lib/keyboard-actions.ts`      | Router in step-actions, impl in input/keyboard                    |
| Find elements (Shadow DOM) | `lib/element-finder.ts`                                                          | Pierces shadow roots recursively                                  |
| Wire new message type      | `types/messaging.ts` → `background.ts`                                           | Add type to union, add case to background switch                  |
| Capture conversation URLs  | `lib/conversation-url-capture.ts`                                                | Single export `startConversationUrlCapture()`; returns cleanup fn |
| Float window state         | `lib/float-state.ts` → `hooks/useFloatMode.ts`                                   | State in `chrome.storage`; hook provides reactive access          |
| Export history             | `lib/export-history-storage.ts` → `hooks/useExportHistory.ts`                    | Storage key `llm-crosser-export-history`; optimistic updates      |
| Side panel UI              | `components/sidepanel/`                                                          | Reuses `SettingsPage`/`HistoryPage`; own `SidepanelHome`          |
| Viral comparison examples  | `lib/viral-comparison-examples.ts` + `components/sidepanel/ViralExampleCard.tsx` | 100 queries, 8 categories; triggers `DETACH_BATCH_SEARCH`         |

## CONVENTIONS

- **Styling**: Tailwind v4 utility classes only. Theme vars from `globals.css` @theme. Classes like `bg-surface`, `text-text`, `border-border` reference CSS custom properties directly.
- **State**: No Redux/Zustand. Settings via `useSettings` hook (chrome.storage.local + onChanged listener). Local state via `useState`/`useReducer`.
- **Routing**: `createHashRouter` in `entrypoints/batch-search/main.tsx`. Hash-based because extension pages don't support History API.
- **Imports**: Path alias `@/*` maps to project root. e.g., `@/src/components/...`.

## ANTI-PATTERNS

- **Never import `chrome.*` directly in components** — go through hooks or lib.
- **Never add routes here** — routes live in `entrypoints/batch-search/main.tsx`.
