# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-18 | **Commit:** 29134db | **Branch:** feature/init

## CRITICAL: PULL REQUEST TARGET BRANCH (NEVER DELETE THIS SECTION)

> **THIS SECTION MUST NEVER BE REMOVED OR MODIFIED**

### Git Workflow

```
main (deployed/published)
   ↑
develop (integration branch)
   ↑
feature branches (your work)
```

### Rules (MANDATORY)

| Rule                                 | Description                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| **ALL PRs → `develop`**              | Every pull request MUST target the `develop` branch                                  |
| **NEVER PR → `main`**                | PRs to `main` are **automatically rejected** by CI                                   |
| **"Create a PR" = target `develop`** | When asked to create a new PR, it ALWAYS means targeting `develop`                   |
| **Merge commit ONLY**                | Squash merge is **disabled** in this repo. Always use merge commit when merging PRs. |

### Why This Matters

- `main` = production/published npm package
- `develop` = integration branch where features are merged and tested
- Feature branches → `develop` → (after testing) → `main`
- Squash merge is disabled at the repository level — attempting it will fail

## CRITICAL: ENGLISH-ONLY POLICY (NEVER DELETE THIS SECTION)

> **THIS SECTION MUST NEVER BE REMOVED OR MODIFIED**

### All Project Communications MUST Be in English

| Context             | Language Requirement                        |
| ------------------- | ------------------------------------------- |
| **GitHub Issues**   | English ONLY                                |
| **Pull Requests**   | English ONLY (title, description, comments) |
| **Commit Messages** | English ONLY                                |
| **Code Comments**   | English ONLY                                |
| **Documentation**   | English ONLY                                |
| **AGENTS.md files** | English ONLY                                |

**If you're not comfortable writing in English, use translation tools. Broken English is fine. Non-English is not acceptable.**

## CODE STYLE

**Formatting** (`.prettierrc`): Double quotes, trailing commas, 2-space indent, 100 char width, semicolons.

**Imports**: Use `import type` for type-only imports: `import type { UserSettings } from "../types/settings";`. Path alias `@/*` for cross-directory imports: `import type { ExtensionMessage } from "@/src/types/messaging";`.

**Naming**: `camelCase` functions/variables, `PascalCase` types/interfaces, `UPPER_SNAKE_CASE` exported constants. Files named by purpose — never `utils.ts`, `helpers.ts`, `common.ts`.

**Unused variables**: Prefix with `_` (e.g., `_unused`). ESLint enforces `argsIgnorePattern: "^_"`.

**Exports**: Named exports only. No default exports (except WXT entrypoints which require `export default`). Re-export types from barrel files.

## TYPE SAFETY

- `strict: true`, `noUncheckedIndexedAccess: true`, module resolution `bundler`
- **NO** `as any` in source (allowed in tests only for mocks)
- **NO** `@ts-ignore` — use `@ts-expect-error` with description (tests only)
- Path alias `@/*` maps to project root (e.g., `@/src/components/...`)

## ARCHITECTURE RULES

Enforced by `.sisyphus/rules/modular-code-enforcement.md` (BLOCKING):

1. `index.ts` = entry point only (re-exports + wiring, ≤5 lines)
2. Every file = single responsibility; name by purpose
3. **200 LOC hard limit** on logic per file (exempt: static data arrays, template literals)
4. I/O separate from pure logic (CLI execution vs. output parsing)
5. Complex prompt logic split into `*-logic.ts` files

## ERROR HANDLING

**Core functions**: Return result objects (`{ success: boolean; error?: string }`), never throw for expected failures.

```typescript
try {
  const response = await sendToBackground({ type: "INJECT_QUERY", siteName, query });
  return response as { success: boolean; error?: string };
} catch (error) {
  const msg = error instanceof Error ? error.message : "Unknown error";
  return { success: false, error: msg };
}
```

---

## OVERVIEW

LLM Crosser is a Chrome extension (WXT + React 19 + Tailwind CSS v4) that embeds multiple LLM chat sites (ChatGPT, Gemini, Grok, Perplexity, Qwen, Z.ai) in iframes within a single tab. Users type once, query all simultaneously, and compare responses side-by-side.

Key mechanism: `declarativeNetRequest` strips `X-Frame-Options`/CSP headers at network level; `frame-guard.content.ts` overrides `window.top`/`window.parent` at JS level to neutralize frame-busting scripts.

## STRUCTURE

```
llm-crosser/
├── entrypoints/              # WXT extension entry points
│   ├── background.ts         # Service worker: message router, tab manager, omnibox, settings
│   ├── batch-search/         # React SPA: main dashboard (HashRouter)
│   │   ├── index.html
│   │   └── main.tsx          # App root: React + i18n + router
│   ├── frame-guard.content.ts # MAIN world script: neutralizes frame-busting (document_start)
│   └── inject.content.ts     # Content script: dual-channel (postMessage + runtime) automation
├── src/                      # Application source (see src/AGENTS.md)
│   ├── components/           # UI components grouped by feature
│   ├── hooks/                # React hooks (settings, history, iframe manager, site config, theme)
│   ├── i18n/                 # i18next setup + 7 locale JSONs
│   ├── lib/                  # Business logic (see src/lib/AGENTS.md)
│   ├── pages/                # Route-level views (BatchSearch, Settings, History)
│   ├── styles/               # Tailwind v4 theme (globals.css with @theme block, multi-theme)
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

| Task                       | Location                                                                                          | Notes                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Add new LLM site           | `public/site-handlers.json` + `wxt.config.ts` (host_permissions, frame-src) + `public/rules.json` | All three + `frame-guard.content.ts` + `inject.content.ts` matches   |
| Change grid layout         | `src/components/grid/IframeGrid.tsx`                                                              | Supports `side-by-side` and `grid` modes                             |
| Modify query injection     | `src/lib/automation-engine.ts` + `src/lib/step-actions.ts` + `entrypoints/inject.content.ts`      | Engine orchestrates; step-actions implements; content script listens |
| Change settings schema     | `src/types/settings.ts` + `src/lib/storage.ts` + `entrypoints/background.ts`                      | Update type, defaults in BOTH storage.ts and background.ts           |
| Add UI component           | `src/components/{feature}/`                                                                       | One component per file, Tailwind v4 classes                          |
| Add new page/route         | `entrypoints/batch-search/main.tsx` + `src/pages/`                                                | HashRouter, add route + page component                               |
| Modify permissions         | `wxt.config.ts` → `manifest.permissions`                                                          | Rebuild required                                                     |
| Fix iframe framing         | `entrypoints/frame-guard.content.ts` + `public/rules.json`                                        | Network-level + JS-level bypass                                      |
| Change theme/add theme     | `src/styles/globals.css` → `@theme` block + `[data-theme]` selectors                              | CSS custom properties consumed by Tailwind; `useTheme` hook applies  |
| Messaging between contexts | `src/lib/messaging.ts` + `entrypoints/background.ts`                                              | Hub-and-spoke: background routes to specific frameId                 |
| Extract LLM responses      | `src/lib/content-extractor.ts` + `src/lib/html-node-converter.ts` + `src/lib/html-to-markdown.ts` | Extraction pipeline: DOM → HTML → Markdown                           |
| Omnibox behavior           | `entrypoints/background.ts` (onInputEntered) + `src/pages/BatchSearchPage.tsx` (auto-send)        | `llmc` keyword, auto-sends query via `useSearchParams` + 3s delay    |

## EXTENSION ARCHITECTURE

```
User clicks icon / types "llmc <query>" in omnibox
    → background.ts opens/focuses batch-search tab (with #/?q= hash for omnibox)
        → BatchSearchPage renders IframeGrid
            → Each iframe loads an LLM site
            → frame-guard.content.ts neutralizes frame-busting (MAIN world)
            → inject.content.ts registers dual listeners (ISOLATED world)

User submits query (manual or auto-send from omnibox)
    → BatchSearchPage.handleSend() iterates enabled sites
        → postMessage(INJECT_QUERY_VIA_POST) to each iframe's contentWindow
            → inject.content.ts receives via window "message" listener
                → automation-engine.ts executes SearchStep[] from site-handlers.json
                    → step-actions.ts: focus → setValue → click

Fallback (if postMessage fails):
    → background.ts receives INJECT_QUERY via browser.runtime.sendMessage
        → site-frame-message-router.ts finds target frameId
            → browser.tabs.sendMessage(tabId, msg, {frameId})
                → inject.content.ts receives via browser.runtime.onMessage
```

**Dual messaging**: Primary channel is `postMessage` (reliable for extension page → child iframe). Fallback is `browser.runtime.sendMessage` routed through background (for non-iframe contexts).

**Storage**: `chrome.storage.local` with keys `llm-crosser-settings` and `llm-crosser-history`. `useSettings` hook provides reactive access with `onChanged` listener.

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

- **Settings defaults synced in TWO places**: `src/lib/storage.ts` and `entrypoints/background.ts` both define `DEFAULT_SETTINGS`. If you change the schema, update BOTH or settings will silently fall back to stale defaults.
- **Site selectors are fragile**: `public/site-handlers.json` contains hardcoded DOM selectors for each LLM site. These break when target sites update their UI. Test after any site update.
- **Adding a new LLM site requires 4+ files**: `site-handlers.json` (selectors + steps), `wxt.config.ts` (host_permissions + frame-src CSP), `rules.json` (header stripping), `frame-guard.content.ts` (matches array), `inject.content.ts` (matches array).
- **`step-actions.ts` at 238 LOC**: **OVER the 200 LOC limit.** Must be split before adding new action handlers.
- **Chrome-only APIs**: The React app uses `chrome.storage.local` and `browser.runtime` — it cannot be tested outside a Chrome extension context.
- **No test runner or CI configured**: Code quality enforced by convention + `.sisyphus/rules/`.
- **Playwright MCP test artifacts**: All Playwright test outputs MUST be saved to `.playwright-mcp/`. This directory is gitignored.
- **Omnibox auto-send**: `BatchSearchPage` reads `?q=` from hash via `useSearchParams`, auto-triggers `handleSend` after 3s delay (for iframes to load). Clears param after send to prevent re-trigger on navigation.
