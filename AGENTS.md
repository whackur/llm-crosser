# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-22 | **Commit:** bdadc30 | **Branch:** feature/fix-perplexity-load

> **IMMUTABLE SECTIONS**: The three CRITICAL sections below (PR Target Branch, No Autonomous Commits, English-Only Policy) **MUST NEVER be removed or modified.** They are project-level invariants that override all other directives.

## CRITICAL: PULL REQUEST TARGET BRANCH

Branch merge rules — follow strictly, no exceptions:

| From → To               | Method                           | PR Required |
| ----------------------- | -------------------------------- | ----------- |
| `feature/*` → `develop` | Direct merge allowed             | No          |
| `develop` → `main`      | PR only — **never direct merge** | **Yes**     |

```
main (production) ←[PR only]← develop (integration) ←[direct merge]← feature branches (your work)
```

Merge commit only (squash disabled).

## CRITICAL: NO AUTONOMOUS COMMITS

The AI agent MUST NOT run `git commit` unless the user **explicitly** requests it. System directives (TODO continuation, hooks) do NOT override this. `git add` (staging) is permitted; `git commit` is not. No exceptions.

## CRITICAL: ENGLISH-ONLY POLICY

All project communications — GitHub Issues, PRs, commit messages, code comments, documentation, AGENTS.md files — MUST be in English.

---

## CODE STYLE

**Formatting** (`.prettierrc`): Double quotes, trailing commas, 2-space indent, 100 char width, semicolons.

**Imports**: `import type` for type-only. Path alias `@/*` for cross-directory imports.

**Naming**: `camelCase` functions/variables, `PascalCase` types/interfaces, `UPPER_SNAKE_CASE` constants. Files named by purpose — never `utils.ts`, `helpers.ts`, `common.ts`. Unused vars prefixed `_`.

**Exports**: Named only. No default exports (except WXT entrypoints). Re-export types from barrel files.

**Type safety**: `strict: true`, `noUncheckedIndexedAccess: true`. NO `as any`, NO `@ts-ignore` in source.

**Architecture** (`.sisyphus/rules/`): Single responsibility per file. **200 LOC hard limit.** `index.ts` = re-exports only. Return result objects for errors, never throw.

---

## OVERVIEW

LLM Crosser is a Chrome extension (WXT + React 19 + Tailwind CSS v4) that embeds multiple LLM chat sites (ChatGPT, Gemini, Grok, Perplexity, Qwen, Z.ai) in iframes within a single tab. Users type once, query all simultaneously, and compare responses side-by-side.

Key mechanism: `declarativeNetRequest` strips `X-Frame-Options`/`Content-Security-Policy`/`Content-Security-Policy-Report-Only` headers at network level; `frame-guard.content.ts` overrides `window.top`/`window.parent` at JS level to neutralize frame-busting scripts.

## STRUCTURE

```
llm-crosser/
├── entrypoints/              # WXT extension entry points
│   ├── background.ts         # Service worker: message router, tab manager, omnibox, settings
│   ├── batch-search/         # React SPA: main dashboard (HashRouter)
│   │   ├── index.html
│   │   └── main.tsx          # App root: React + i18n + router
│   ├── frame-guard.content.ts # MAIN world script: neutralizes frame-busting (document_start)
│   ├── inject.content.ts     # Content script: postMessage-based query automation
│   └── sidepanel/            # React SPA: Chrome side panel (quick query, float window control)
│       ├── index.html
│       └── main.tsx          # Side panel root: React + i18n + HashRouter
├── src/                      # Application source (see src/AGENTS.md)
│   ├── components/           # UI components grouped by feature
│   ├── hooks/                # React hooks (settings, history, site config, theme, float mode, export history, GitHub stars, conversation share, omnibox auto-send, reset mechanism)
│   ├── i18n/                 # i18next setup + 7 locale JSONs
│   ├── lib/                  # Business logic (see src/lib/AGENTS.md)
│   ├── pages/                # Route-level views (BatchSearch, Settings, History)
│   ├── styles/               # Tailwind v4 theme (globals.css: 6 themes — midnight, dawn, ocean, forest, rose, mint)
│   └── types/                # TypeScript interfaces + barrel re-exports
├── public/                   # Static runtime config
│   ├── rules.json            # declarativeNetRequest rules (strip framing headers)
│   └── site-handlers.json    # LLM site automation config (selectors, steps)
├── _locales/                 # Chrome i18n (en, ko)
├── .sisyphus/rules/          # Enforced architecture rules (200 LOC limit, SRP, no utils.ts)
├── .playwright-mcp/          # Playwright MCP test artifacts (logs, screenshots) — gitignored
└── wxt.config.ts             # WXT + Vite config, manifest, permissions, CSP
```

## WHERE TO LOOK

| Task                       | Location                                                                                                                | Notes                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Add new LLM site           | `public/site-handlers.json` + `wxt.config.ts` (host_permissions, frame-src) + `public/rules.json`                       | All three + `frame-guard.content.ts` + `inject.content.ts` matches              |
| Change grid layout         | `src/components/grid/IframeGrid.tsx`                                                                                    | Supports `side-by-side` and `grid` modes                                        |
| Modify query injection     | `src/lib/automation-engine.ts` + `src/lib/step-actions.ts` + `src/lib/input-actions.ts` + `src/lib/keyboard-actions.ts` | Engine orchestrates; step-actions delegates to input-actions + keyboard-actions |
| Change settings schema     | `src/types/settings.ts` + `src/lib/constants.ts` + `src/lib/storage.ts`                                                 | Update type, then defaults in `constants.ts`, then storage CRUD                 |
| Add UI component           | `src/components/{feature}/`                                                                                             | One component per file, Tailwind v4 classes                                     |
| Add new page/route         | `entrypoints/batch-search/main.tsx` + `src/pages/`                                                                      | HashRouter, add route + page component                                          |
| Modify permissions         | `wxt.config.ts` → `manifest.permissions`                                                                                | Rebuild required                                                                |
| Fix iframe framing         | `entrypoints/frame-guard.content.ts` + `public/rules.json`                                                              | Network-level + JS-level bypass                                                 |
| Change theme/add theme     | `src/styles/globals.css` → `@theme` block + `[data-theme]` selectors                                                    | CSS custom properties consumed by Tailwind; `useTheme` hook applies             |
| Messaging between contexts | `src/lib/site-frame-message-router.ts` + `entrypoints/background.ts`                                                    | Background broadcasts to batch-search tab frames                            |
| Extract LLM responses      | `src/lib/content-extractor.ts` + `src/lib/html-node-converter.ts` + `src/lib/html-to-markdown.ts`                       | Extraction pipeline: DOM → HTML → Markdown                                      |
| Float window mode          | `src/lib/float-state.ts` + `src/hooks/useFloatMode.ts` + `entrypoints/background.ts`                                    | Detach batch-search into popup window; state in chrome.storage                  |
| Side panel UI              | `entrypoints/sidepanel/` + `src/components/sidepanel/`                                                                  | Quick query + float window control; bottom tab nav                              |
| Export history             | `src/hooks/useExportHistory.ts` + `src/lib/export-history-storage.ts`                                                   | CRUD for shared export entries; storage key `llm-crosser-export-history`        |
| Reset / New Chat           | `src/components/layout/Sidebar.tsx` (Link) + `src/pages/BatchSearchPage.tsx` (resetKey)                                 | `/?reset=true` URL param → clears overrides + increments resetKey               |
| Omnibox behavior           | `entrypoints/background.ts` (onInputEntered) + `src/pages/BatchSearchPage.tsx` (auto-send)                              | `llmc` keyword, auto-sends query via `useSearchParams` + 3s delay               |
| Capture conversation URLs  | `src/lib/conversation-url-capture.ts`                                                                                   | Polls iframes via postMessage at 5s + 12s; returns cleanup fn                   |
| Normalize LLM site URLs    | `src/lib/url-utils.ts`                                                                                                  | Single source for `normalizeHostname()` — used across 4+ modules                |
| Viral comparison examples  | `src/lib/viral-comparison-examples.ts` + `src/components/sidepanel/ViralExampleCard.tsx`                                | 100 queries, 8 categories; sidepanel card triggers `DETACH_BATCH_SEARCH`        |

## EXTENSION ARCHITECTURE

```
User clicks icon / types "llmc <query>" in omnibox
    → background.ts opens/focuses batch-search tab (with #/?q= hash for omnibox)
        → BatchSearchPage renders IframeGrid
            → Each iframe loads an LLM site
            → frame-guard.content.ts neutralizes frame-busting (MAIN world)
            → inject.content.ts registers dual listeners (ISOLATED world)


**Messaging**: Primary channel is `postMessage` from extension page to child iframe (`contentWindow.postMessage`). Background fallback broadcasts `tabs.sendMessage` to the batch-search tab without frame targeting.

**Storage**: `chrome.storage.local` with keys `llm-crosser-settings`, `llm-crosser-history`, `llm-crosser-export-history`, `llm-crosser-float-state`, `llm-crosser-github-stars`. `useSettings` hook provides reactive access with `onChanged` listener.

## COMMANDS

```bash
pnpm dev              # WXT dev mode (hot reload, loads in Chrome)
pnpm build            # Production build → .output/chrome-mv3/
pnpm build:firefox    # Firefox build
pnpm build:safari     # Safari build
pnpm zip              # Package for Chrome Web Store
```

**No test runner, linter, or formatter CLI configured.** Code style enforced by convention (see CODE STYLE above).

## NOTES

- **`DEFAULT_SETTINGS` unified**: Single source of truth in `src/lib/constants.ts`. Both `storage.ts` and `background.ts` import from there. No dual-sync needed.
- **Site selectors are fragile**: `public/site-handlers.json` contains hardcoded DOM selectors for each LLM site. These break when target sites update their UI. Test after any site update.
- **Adding a new LLM site requires 4+ files**: `site-handlers.json` (selectors + steps), `wxt.config.ts` (host_permissions + frame-src CSP), `rules.json` (header stripping), `frame-guard.content.ts` (matches array), `inject.content.ts` (matches array).
- **`IframeGrid.tsx` at 258 LOC**: **OVER the 200 LOC limit.** Split layout logic before adding new grid modes.
- **`SharePopup.tsx` at 248 LOC**: **OVER the 200 LOC limit.** Split export format logic before adding new export types. Has explicit "Save to History" button (Copy/Download no longer auto-save).
- **`Icons.tsx` at 207 LOC**: Exempt from 200 LOC rule (static SVG definitions only).
- **`PromptTemplateEditor.tsx` at 202 LOC**: **AT the 200 LOC limit.** Do not add more logic without extracting.
- **Chrome-only APIs**: The React app uses `chrome.storage.local` and `browser.runtime` — it cannot be tested outside a Chrome extension context.
- **No test runner or CI configured**: Code quality enforced by convention + `.sisyphus/rules/`.
- **Playwright MCP test artifacts**: All Playwright test outputs MUST be saved to `.playwright-mcp/`. This directory is gitignored.
- **Omnibox auto-send**: `BatchSearchPage` reads `?q=` from hash via `useSearchParams`, auto-triggers `handleSend` after 3s delay (for iframes to load). Clears param after send to prevent re-trigger on navigation.
- **History session restore**: Clicking a search history entry navigates to `/?historyId=<id>`. `useOmniboxAutoSend` waits for history data to load (race condition safe), extracts per-site `conversationUrl`s from the entry, sets `siteUrlOverrides` to reload iframes with those URLs, and restores the original query text in the input bar.
- **Reset mechanism**: Sidebar "New Chat" link navigates to `/?reset=true`. `BatchSearchPage` detects this URL param, clears `siteUrlOverrides`, increments `resetKey` state (number counter), and cleans up URL. The `resetKey` is included in each `IframeWrapper`'s React key, forcing complete iframe remount.
- **Language persistence**: `AppLayout.tsx` syncs `i18n.changeLanguage()` with stored `settings.language` on mount via `useEffect`. Without this, page refresh reverts to fallback language (`en`).
- **GitHub link**: Static link to repo in Sidebar footer, alongside existing "Report Issue" link. No API integration.
- **Viral comparison examples**: 100 curated LLM comparison queries across 8 categories (Brain Teaser, AI Identity, Creative Writing, Coding Challenge, Practical Advice, Knowledge Test, Hot Take, Fun & Personality). Displayed randomly one-at-a-time in sidepanel via `ViralExampleCard`. Clicking "Try this" triggers `DETACH_BATCH_SEARCH` — reuses existing omnibox pipeline. Static data only, no API. `viral-comparison-examples.ts` is exempt from 200 LOC rule (static data, like `Icons.tsx`).
 **DNR `requestDomains` must use apex domains**: Use `perplexity.ai` (not `www.perplexity.ai`) in `rules.json` `requestDomains`. Chrome DNR automatically matches all subdomains of listed domains, so apex domains provide the broadest coverage. Same applies to any future LLM site additions.
 **Both apex and www domains configured for Perplexity**: `host_permissions`, `frame-src`, content script `matches`, and `web_accessible_resources` all include both `https://www.perplexity.ai/*` and `https://perplexity.ai/*` to handle potential redirects or domain variations.
 **CSP-Report-Only also stripped**: `rules.json` removes both `content-security-policy` and `content-security-policy-report-only` response headers. Some sites (e.g., Perplexity behind Cloudflare) may send either or both.
