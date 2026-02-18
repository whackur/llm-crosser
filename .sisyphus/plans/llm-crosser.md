# LLM Crosser - Multi-LLM Chrome Extension

## TL;DR

> **Quick Summary**: Build a Chrome extension (Manifest V3) using WXT + React + TypeScript that embeds multiple LLM sites (ChatGPT, Grok, Gemini, z.ai, Qwen) in iframes within a single tab, enabling simultaneous batch querying with users' existing login sessions. Architecture follows AICompare's config-driven iframe orchestrator pattern adapted to modern WXT/React stack.
> 
> **Deliverables**:
> - Chrome extension installable via `chrome://extensions` (dev mode) or packaged for Chrome Web Store
> - Full-tab batch search page with flexible 1/2/3/4 column iframe grid
> - Config-driven site handler system supporting 5 LLM sites (ChatGPT, Grok, Gemini, z.ai, Qwen)
> - Step-based automation engine for query injection into diverse LLM input types
> - Settings (search engine toggles, prompt templates, 7-language i18n)
> - History with search and conversation re-navigation
> - Per-iframe conversation export as Markdown
> - File upload via clipboard paste to all LLMs simultaneously
> - Omnibox "llmc" keyword trigger
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 6 waves + final verification
> **Critical Path**: T1(scaffold) → T7(PoC) → T13(UI shell) → T19(messaging bridge) → T20(batch query flow) → F1-F4(verification)

---

## Development Environment (MANDATORY)

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 22+ (LTS) | Required. Use `node --version` to verify. |
| **React** | 19.x (latest stable) | Use `react@latest` and `react-dom@latest` at install time. |
| **TypeScript** | 5.x (latest stable) | Strict mode enabled. |
| **WXT** | latest | `npx wxt@latest init` ensures latest. |
| **Vite** | 6.x (bundled with WXT) | WXT manages Vite internally. |
| **Tailwind CSS** | 4.x (latest stable) | v4 if WXT/Vite compatible; fallback to v3 if issues. |
| **Package Manager** | npm or pnpm | pnpm preferred for speed, npm acceptable. |
| **Chrome** | 120+ | Required for Manifest V3 + declarativeNetRequest modifyHeaders. |

> **IMPORTANT**: When running `npm install` or `pnpm install`, always use `@latest` tags for React:
> ```bash
> npm install react@latest react-dom@latest
> npm install -D @types/react@latest @types/react-dom@latest
> ```

---

## Context

### Original Request
Build "LLM Crosser" — a Chrome extension similar to AICompare/ChatHub that embeds multiple LLM sites (ChatGPT, Gemini, Grok, z.ai, Qwen) in iframes for simultaneous batch querying. Uses existing web login sessions (not API keys). Tech stack: WXT + React + TypeScript + Vite.

### Interview Summary
**Key Discussions**:
- Grid layout: Flexible 1/2/3/4 columns (user chose recommended)
- Side Panel: Full-tab page only, no sidePanel API
- File upload: Included in v1 scope (clipboard paste to all LLMs)
- Additional features excluded from v1: context menu, floating ball, selection toolbar, search engine toolbar
- Test strategy: No unit tests; agent-executed QA via Playwright

**Research Findings**:
- **AICompare architecture**: Config-driven with `siteHandlers.json` (selectors/steps), `rules.json` (DNR), `inject.js` (automation engine). Vanilla JS, no framework.
- **WXT framework**: File-based entrypoints, auto manifest generation, `public/` for static assets, hash-mode routing, `@wxt-dev/module-react` for React.
- **declarativeNetRequest**: Remove X-Frame-Options + CSP headers, spoof Sec-Fetch-Dest/Mode/Site/User. Rules go in `public/rules.json`.
- **Cookie/session challenge**: SameSite=Lax prevents cross-origin iframe cookies. Two-layer fix: (1) DNR modify Set-Cookie headers, (2) chrome.cookies.getAll → inject Cookie request header.
- **Frame-busting**: All major LLMs use JS `window.top !== window` checks. Fix: sandbox attribute + content script override at document_start.
- **ChatGPT input**: `#prompt-textarea` is actually contenteditable div (per AICompare's latest config 2026-01-19).
- **Gemini Shadow DOM**: Some UI components wrapped in Shadow DOM, needs piercing selectors.
- **z.ai = Zhipu AI**: No known DOM selectors; requires research spike.

### Metis Review
**Identified Gaps** (addressed):
- **CRITICAL: SameSite cookie two-layer problem** → Added cookie management tasks to PoC wave and background service
- **CRITICAL: Frame-busting JavaScript** → Added dedicated content script task with window.top override at document_start
- **HIGH: Anti-automation CAPTCHAs** → Added error handling UI task with CAPTCHA detection state
- **HIGH: Chrome Web Store policy** → DNR rules scoped to specific LLM domains, not wildcards
- **MEDIUM: Gemini Shadow DOM** → Automation engine includes Shadow DOM piercing capability
- **MEDIUM: z.ai no known selectors** → Deferred to Wave 5 research spike
- **Phase 0 PoC recommended** → Wave 2 includes dedicated PoC validation tasks before full build

---

## Work Objectives

### Core Objective
Build a production-ready Chrome extension that lets users query multiple LLM services simultaneously through a unified interface, leveraging their existing web sessions for seamless authentication.

### Concrete Deliverables
- WXT Chrome extension project with React + TypeScript
- `public/rules.json` — declarativeNetRequest rules for iframe embedding
- `public/site-handlers.json` — Config-driven site definitions for 5 LLM sites
- `entrypoints/background.ts` — Service worker for lifecycle, omnibox, messaging
- `entrypoints/batch-search.html` + React app — Main full-tab batch search page
- `entrypoints/inject.content.ts` — Automation engine content script (all_frames)
- `entrypoints/frame-guard.content.ts` — Frame-busting mitigation content script
- Settings, History, Conversation Export UI components
- i18n resource files for 7 languages (EN, KR, JP, CN, PT, RU, FR)

### Definition of Done
- [ ] Extension loads in Chrome without errors (`chrome://extensions` → Load unpacked)
- [ ] Batch search page opens via extension icon click
- [ ] At least 3 LLM sites (ChatGPT, Grok, Gemini) embed and display in iframes
- [ ] User's existing login sessions work in embedded iframes
- [ ] Query typed in unified input appears in all enabled LLM chat inputs
- [ ] Omnibox "llmc {query}" opens batch search with pre-filled query
- [ ] Settings persist across sessions (enabled sites, language, prompt templates)
- [ ] History entries saved and navigable
- [ ] Conversation export produces valid Markdown
- [ ] `wxt build` produces error-free production build

### Must Have
- Config-driven architecture (adding new LLM site = JSON config only, no code changes)
- declarativeNetRequest header manipulation for iframe embedding
- User session sharing (same cookies as direct site visit)
- Flexible column grid (1/2/3/4)
- Omnibox "llmc" keyword trigger
- 7-language i18n support
- Per-iframe share button with Markdown export
- File upload via clipboard paste

### Must NOT Have (Guardrails)
- **NO API key integration** — v1 uses web sessions only
- **NO sidePanel API** — full-tab page only
- **NO floating ball, selection toolbar, context menu, search engine toolbar** — excluded from v1
- **NO wildcard DNR rules** — rules MUST target specific LLM domains for Chrome Web Store compliance
- **NO hardcoded selectors in TypeScript** — ALL site-specific selectors MUST live in site-handlers.json
- **NO `any` types in TypeScript** — strict typing throughout
- **NO inline styles** — use Tailwind CSS utility classes or CSS modules
- **NO direct DOM manipulation in React components** — DOM automation limited to content scripts only
- **NO synchronous storage calls** — all chrome.storage access must be async
- **NO console.log in production** — use structured logging utility or remove

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (greenfield project)
- **Automated tests**: None
- **Framework**: None
- **Agent QA**: Every task verified via Playwright (browser UI), Bash (build/lint), or tmux (CLI)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

| Deliverable Type | Verification Tool | Method |
|------------------|-------------------|--------|
| Extension pages/UI | Playwright (playwright skill) | Load extension, navigate, interact, screenshot |
| Content scripts | Playwright | Navigate to LLM site, verify injection, screenshot |
| Build/Config | Bash | `wxt build`, `tsc --noEmit`, check output |
| Background logic | Bash (chrome logs) | Load extension, trigger actions, check console output |
| DNR rules | Playwright | Load iframe page, verify sites embed without X-Frame-Options errors |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — project foundation, 6 parallel):
├── Task 1: WXT project scaffolding + React + TS + Vite [quick]
├── Task 2: TypeScript types/interfaces for all domains [quick]
├── Task 3: DNR rules.json + manifest permissions + CSP [quick]
├── Task 4: Site handlers JSON config (4 initial sites) [quick]
├── Task 5: i18n resource files (7 languages, keys only) [quick]
└── Task 6: Tailwind CSS setup + design tokens [quick]

Wave 2 (After Wave 1 — PoC validation + core engines, 6 parallel):
├── Task 7: PoC iframe embedding page (validate DNR + sessions) [deep]
├── Task 8: Frame-busting mitigation content script [deep]
├── Task 9: Automation engine (step executor) [deep]
├── Task 10: Content extraction engine (DOM → Markdown) [unspecified-high]
├── Task 11: Background service worker (lifecycle + messaging) [unspecified-high]
└── Task 12: Storage service (chrome.storage.local wrapper) [quick]

Wave 3 (After Wave 2 — main UI shell, 6 parallel):
├── Task 13: Batch search page layout + React Router [visual-engineering]
├── Task 14: Left sidebar component [visual-engineering]
├── Task 15: Iframe grid component (1/2/3/4 columns) [visual-engineering]
├── Task 16: Iframe wrapper component (per-iframe controls) [visual-engineering]
├── Task 17: Query input bar + prompt template selector [visual-engineering]
└── Task 18: Settings page — search engine toggles [visual-engineering]

Wave 4 (After Wave 3 — feature integration, 6 parallel):
├── Task 19: Iframe ↔ Extension messaging bridge [deep]
├── Task 20: Batch query execution flow [deep]
├── Task 21: Settings — prompt templates CRUD [unspecified-high]
├── Task 22: Settings — language switcher + i18n integration [unspecified-high]
├── Task 23: History — save/load/list/search [unspecified-high]
└── Task 24: Conversation share/export (Markdown popup) [unspecified-high]

Wave 5 (After Wave 4 — advanced features, 5 parallel):
├── Task 25: File upload via clipboard paste [deep]
├── Task 26: History — click-to-navigate past conversations [unspecified-high]
├── Task 27: Error handling UI (CAPTCHA, load failure, timeout) [visual-engineering]
├── Task 28: z.ai site handler research + implementation [deep]
└── Task 29: Omnibox "llmc" integration [quick]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real QA — Playwright (unspecified-high + playwright skill)
└── Task F4: Scope fidelity check (deep)

Critical Path: T1 → T7 → T13 → T19 → T20 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 6 (Waves 1-4)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|------------|--------|------|
| 1 | — | 7-12 | 1 |
| 2 | — | 9, 10, 11, 12 | 1 |
| 3 | — | 7, 8, 11 | 1 |
| 4 | — | 7, 9, 10 | 1 |
| 5 | — | 22 | 1 |
| 6 | — | 13-18 | 1 |
| 7 | 1, 3, 4 | 13-18 (validates approach) | 2 |
| 8 | 1, 3 | 19, 20 | 2 |
| 9 | 1, 2, 4 | 19, 20 | 2 |
| 10 | 1, 2, 4 | 24 | 2 |
| 11 | 1, 2, 3 | 19, 20, 29 | 2 |
| 12 | 1, 2 | 18, 21, 22, 23 | 2 |
| 13 | 1, 6, 7 | 14-17 (layout host) | 3 |
| 14 | 6, 13 | — | 3 |
| 15 | 6, 13 | 19, 20 | 3 |
| 16 | 6, 13 | 19, 20, 24, 27 | 3 |
| 17 | 6, 13, 12 | 20 | 3 |
| 18 | 6, 12, 13 | — | 3 |
| 19 | 8, 9, 11, 15, 16 | 20, 25 | 4 |
| 20 | 9, 11, 15, 16, 17, 19 | 25, 26 | 4 |
| 21 | 12 | — | 4 |
| 22 | 5, 12 | — | 4 |
| 23 | 12 | 26 | 4 |
| 24 | 10, 16 | — | 4 |
| 25 | 19, 20 | — | 5 |
| 26 | 20, 23 | — | 5 |
| 27 | 16 | — | 5 |
| 28 | 4, 9 | — | 5 |
| 29 | 11 | — | 5 |
| F1-F4 | ALL | — | FINAL |

### Agent Dispatch Summary

| Wave | # Parallel | Tasks → Agent Category |
|------|------------|----------------------|
| 1 | **6** | T1-T6 → `quick` |
| 2 | **6** | T7 → `deep`, T8 → `deep`, T9 → `deep`, T10 → `unspecified-high`, T11 → `unspecified-high`, T12 → `quick` |
| 3 | **6** | T13-T18 → `visual-engineering` |
| 4 | **6** | T19-T20 → `deep`, T21-T24 → `unspecified-high` |
| 5 | **5** | T25 → `deep`, T26 → `unspecified-high`, T27 → `visual-engineering`, T28 → `deep`, T29 → `quick` |
| FINAL | **4** | F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

- [x] 1. WXT Project Scaffolding + React + TypeScript + Vite

  **What to do**:
  - Verify Node.js 22+ is available (`node --version` must show v22.x or higher)
  - Initialize WXT project: `npx wxt@latest init llm-crosser --template react`
  - Install React 19 (latest): `npm install react@latest react-dom@latest` and `npm install -D @types/react@latest @types/react-dom@latest`
  - Configure `wxt.config.ts` with all manifest properties:
    - `name: "LLM Crosser"`, `version: "0.1.0"`
    - `permissions`: `["storage", "declarativeNetRequest", "declarativeNetRequestWithHostAccess", "scripting", "cookies", "webNavigation", "activeTab", "tabs", "clipboardRead", "omnibox"]`
    - `host_permissions`: `["https://chatgpt.com/*", "https://gemini.google.com/*", "https://grok.com/*", "https://chat.qwen.ai/*", "https://chat.z.ai/*"]`
    - `content_security_policy.extension_pages`: `"script-src 'self'; object-src 'self'; frame-src https://chatgpt.com https://gemini.google.com https://grok.com https://chat.qwen.ai https://chat.z.ai;"`
    - `declarative_net_request.rule_resources`: reference `rules.json`
    - `omnibox.keyword`: `"llmc"`
    - `web_accessible_resources`: icons, config files
  - Install dependencies: `tailwindcss`, `react-router-dom`, `react-i18next`, `i18next`, `@webext-core/messaging`
  - Create `entrypoints/batch-search/index.html` + `main.tsx` (React entry)
  - Create `entrypoints/background.ts` (empty defineBackground)
  - Create empty content script stubs: `entrypoints/inject.content.ts`, `entrypoints/frame-guard.content.ts`
  - Verify `wxt dev` runs without errors and extension loads in Chrome

  **Must NOT do**:
  - Do NOT add any UI components yet (just entry stubs)
  - Do NOT use `<all_urls>` in host_permissions — use specific LLM domains
  - Do NOT install testing libraries

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard project initialization with well-documented commands
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI work in this task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-6)
  - **Blocks**: Tasks 7-12
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - AICompare `manifest.json`: https://github.com/taoAIGC/AICompare/blob/main/manifest.json — Permission model, CSP config, DNR declaration to replicate in WXT format

  **External References**:
  - WXT init guide: https://wxt.dev/guide/installation — Project initialization
  - WXT manifest config: https://wxt.dev/guide/essentials/config/manifest — How to set permissions, CSP, DNR in wxt.config.ts
  - WXT entrypoints: https://wxt.dev/guide/essentials/entrypoints — File naming conventions

  **WHY Each Reference Matters**:
  - AICompare's manifest shows exact permissions needed for iframe embedding extensions
  - WXT docs show how to translate vanilla manifest.json into wxt.config.ts format

  **Acceptance Criteria**:

  ```
  Scenario: Project builds and extension loads
    Tool: Bash
    Preconditions: Node.js 22+ installed (verify with `node --version`)
    Steps:
      1. Run `wxt build` in project root
      2. Verify build completes without errors (exit code 0)
      3. Verify `.output/chrome-mv3/manifest.json` exists and contains all declared permissions
      4. Verify `.output/chrome-mv3/manifest.json` contains `declarative_net_request` key
      5. Verify `.output/chrome-mv3/manifest.json` contains `omnibox` key with keyword "llmc"
    Expected Result: Build succeeds, manifest.json contains all required fields
    Failure Indicators: Build errors, missing permissions in output manifest
    Evidence: .sisyphus/evidence/task-1-build-success.txt

  Scenario: Extension loads in Chrome without errors
    Tool: Playwright (playwright skill)
    Preconditions: Chrome installed, extension built
    Steps:
      1. Launch Chrome with `--load-extension=.output/chrome-mv3` flag
      2. Navigate to `chrome://extensions`
      3. Verify "LLM Crosser" appears in extension list
      4. Verify no error badges or warnings on extension card
      5. Click extension icon, verify batch-search page opens
    Expected Result: Extension loads cleanly, batch-search.html accessible
    Failure Indicators: "Errors" badge on extension, page fails to load
    Evidence: .sisyphus/evidence/task-1-extension-loads.png
  ```

  **Commit**: YES
  - Message: `feat(scaffold): init WXT project with React, TypeScript, and manifest config`
  - Files: `wxt.config.ts`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `entrypoints/**`
  - Pre-commit: `wxt build`

---

- [x] 2. TypeScript Types/Interfaces for All Domains

  **What to do**:
  - Create `src/types/site.ts`:
    - `SiteConfig` interface: name, url, enabled, supportUrlQuery, region, hidden, supportIframe, note, searchHandler, fileUploadHandler, contentExtractor, historyHandler, userPromptButton
    - `SearchStep` interface: action (union type: 'focus'|'setValue'|'triggerEvents'|'click'|'wait'|'sendKeys'|'paste'|'custom'), selector (string|string[]), inputType?, events?, keys?, duration?, maxAttempts?, retryInterval?, waitForElement?, retryOnDisabled?, description?
    - `ContentExtractor` interface: messageContainer?, contentSelectors?, selectors?, excludeSelectors?, thinkingSelector?, extractThinking?, fallbackSelectors?, urlExtractor?
  - Create `src/types/settings.ts`:
    - `UserSettings`: enabledSites (string[]), gridColumns (1|2|3|4), language (LanguageCode), promptTemplates (PromptTemplate[])
    - `PromptTemplate`: id, name, template (string with {query}), order
    - `LanguageCode`: 'en'|'ko'|'ja'|'zh'|'pt'|'ru'|'fr'
  - Create `src/types/history.ts`:
    - `HistoryEntry`: id, query, timestamp, siteResults (SiteResult[])
    - `SiteResult`: siteName, conversationUrl?, responsePreview?
  - Create `src/types/messaging.ts`:
    - Message types for extension page ↔ content script ↔ background communication
    - `InjectQueryMessage`, `ExtractContentMessage`, `QueryResultMessage`, etc.
  - Create `src/types/i18n.ts`:
    - Translation key types for type-safe i18n

  **Must NOT do**:
  - Do NOT implement any logic — types only
  - Do NOT use `any` or `unknown` as escape hatches
  - Do NOT couple types to specific libraries (keep them plain TypeScript)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure type definitions, no logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-6)
  - **Blocks**: Tasks 9, 10, 11, 12
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - AICompare `config/siteHandlers.json`: https://github.com/taoAIGC/AICompare/blob/main/config/siteHandlers.json — Full schema of site config including all step actions, selector formats, content extractor shapes. This is the PRIMARY reference for `SiteConfig` and `SearchStep` types.

  **WHY Each Reference Matters**:
  - siteHandlers.json defines the exact shape of site configurations — types must match this schema precisely to ensure JSON config compatibility

  **Acceptance Criteria**:

  ```
  Scenario: Types compile without errors
    Tool: Bash
    Preconditions: Project from Task 1 exists
    Steps:
      1. Run `npx tsc --noEmit`
      2. Verify exit code 0
      3. Verify no type errors in output
    Expected Result: All type files compile cleanly
    Failure Indicators: TypeScript compiler errors
    Evidence: .sisyphus/evidence/task-2-tsc-check.txt

  Scenario: Types cover all siteHandlers.json fields
    Tool: Bash
    Preconditions: Types created
    Steps:
      1. Create a temporary test file that imports SiteConfig and attempts to type-assert a ChatGPT config object from siteHandlers.json
      2. Run `npx tsc --noEmit` on the test file
      3. Verify no type errors (config is assignable to SiteConfig)
    Expected Result: AICompare's ChatGPT config object is valid SiteConfig
    Failure Indicators: Type assertion fails
    Evidence: .sisyphus/evidence/task-2-type-coverage.txt
  ```

  **Commit**: YES
  - Message: `feat(types): add TypeScript interfaces for sites, settings, history, messaging, i18n`
  - Files: `src/types/*.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 3. DeclarativeNetRequest Rules + Manifest Permissions + CSP

  **What to do**:
  - Create `public/rules.json` with domain-specific DNR rules (NOT wildcard):
    - For each LLM domain (chatgpt.com, gemini.google.com, grok.com, chat.qwen.ai, chat.z.ai):
      - Remove response headers: `x-frame-options`, `content-security-policy`
      - Set request headers: `Sec-Fetch-Dest: document`, `Sec-Fetch-Mode: navigate`, `Sec-Fetch-Site: same-origin`, `Sec-Fetch-User: ?1`, `Upgrade-Insecure-Requests: 1`
    - Each domain gets its own rule ID (1-5) with proper `urlFilter` condition
    - `resourceTypes`: `["sub_frame"]` (NOT `main_frame` — only affect iframes)
  - Add rule for cookie SameSite workaround:
    - Modify `Set-Cookie` response headers to append `SameSite=None; Secure` for LLM domains
  - Verify `wxt.config.ts` correctly references `rules.json` in `declarative_net_request.rule_resources`
  - Add `declarativeNetRequestFeedback` to dev-only permissions for debugging

  **Must NOT do**:
  - Do NOT use wildcard `*://*/*` urlFilter — Chrome Web Store will reject
  - Do NOT modify headers for `main_frame` resource type — only `sub_frame`
  - Do NOT remove headers from non-LLM domains

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: JSON configuration file creation with known patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4-6)
  - **Blocks**: Tasks 7, 8, 11
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - AICompare `config/rules.json`: https://github.com/taoAIGC/AICompare/blob/main/config/rules.json — Working DNR rules that successfully strip X-Frame-Options and spoof Sec-Fetch-* headers. NOTE: AICompare uses wildcard — we must convert to domain-specific rules.

  **External References**:
  - Chrome DNR API: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest — Official rule format, action types, condition options
  - MV3 DNR X-Frame-Options bypass: https://stackoverflow.com/questions/74391398/ — Community examples of modifyHeaders for iframe embedding

  **WHY Each Reference Matters**:
  - AICompare's rules.json is a proven working configuration — adapt its structure but scope to specific domains
  - Chrome DNR docs define the exact JSON schema for rules

  **Acceptance Criteria**:

  ```
  Scenario: Rules JSON is valid and builds into extension
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. Verify `public/rules.json` is valid JSON (node -e "JSON.parse(require('fs').readFileSync('public/rules.json'))")
      2. Run `wxt build`
      3. Verify `.output/chrome-mv3/rules.json` exists in build output
      4. Verify manifest.json references ruleset correctly
    Expected Result: Rules file included in build, manifest references it
    Failure Indicators: JSON parse error, missing from build output
    Evidence: .sisyphus/evidence/task-3-rules-valid.txt

  Scenario: Rules only target specific LLM domains
    Tool: Bash
    Preconditions: rules.json created
    Steps:
      1. Parse rules.json and extract all urlFilter values
      2. Verify each urlFilter contains a specific domain (chatgpt.com, gemini.google.com, etc.)
      3. Verify NO rule uses wildcard "*://*/*"
      4. Verify all rules have resourceTypes: ["sub_frame"] (not main_frame)
    Expected Result: All rules domain-scoped, sub_frame only
    Failure Indicators: Wildcard urlFilter found, main_frame in resourceTypes
    Evidence: .sisyphus/evidence/task-3-rules-scoped.txt
  ```

  **Commit**: YES
  - Message: `feat(dnr): add domain-specific declarativeNetRequest rules for iframe embedding`
  - Files: `public/rules.json`, `wxt.config.ts` (updated)
  - Pre-commit: `wxt build`

---

- [x] 4. Site Handlers JSON Config (4 Initial Sites)

  **What to do**:
  - Create `public/site-handlers.json` with configs for: ChatGPT, Grok, Gemini, Qwen
  - For each site, define:
    - `name`, `url`, `enabled` (default true for ChatGPT/Gemini/Grok, false for Qwen), `supportIframe: true`, `region`
    - `searchHandler.steps[]`: Automation steps adapted from AICompare's siteHandlers.json
    - `fileUploadHandler.steps[]`: Clipboard paste steps
    - `contentExtractor`: Message container selector, content selectors, exclude selectors, thinking selectors
    - `historyHandler`: URL feature pattern for conversation detection
  - ChatGPT steps: focus `#prompt-textarea` → setValue (contenteditable) → triggerEvents → wait 100ms → click `button[data-testid="send-button"]`
  - Gemini steps: focus `[contenteditable="true"]` → setValue (contenteditable) → triggerEvents → wait 100ms → sendKeys Enter
  - Grok steps: focus `div[contenteditable="true"].tiptap` → setValue (contenteditable) → triggerEvents → wait 100ms → sendKeys Enter
  - Qwen steps: Research needed — use textarea pattern as initial guess, refine during Wave 5
  - z.ai: NOT included yet (deferred to Task 28)

  **Must NOT do**:
  - Do NOT invent selectors — copy from AICompare's tested siteHandlers.json (updated 2026-01-19)
  - Do NOT include z.ai in this task (separate research task)
  - Do NOT add more than 4 sites — keep focused

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: JSON configuration adapted from known working reference
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-6)
  - **Blocks**: Tasks 7, 9, 10
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - AICompare `config/siteHandlers.json`: https://github.com/taoAIGC/AICompare/blob/main/config/siteHandlers.json — PRIMARY REFERENCE. Copy ChatGPT, Gemini, Grok configs directly. Adapt Qwen (千问) config.
  - Qwen chat site: https://chat.qwen.ai/ — Target site for Qwen selectors

  **WHY Each Reference Matters**:
  - AICompare's siteHandlers.json contains battle-tested, production-verified selectors for ChatGPT, Gemini, Grok. These were last updated 2026-01-19. Do NOT guess new selectors.

  **Acceptance Criteria**:

  ```
  Scenario: Config file is valid and parseable
    Tool: Bash
    Preconditions: None
    Steps:
      1. Verify `public/site-handlers.json` is valid JSON
      2. Parse and verify 4 site entries exist (ChatGPT, Gemini, Grok, Qwen)
      3. Verify each site has searchHandler.steps array with at least 3 steps
      4. Verify each site has contentExtractor with at least one selector
    Expected Result: Valid JSON with 4 complete site configs
    Failure Indicators: JSON parse error, missing required fields
    Evidence: .sisyphus/evidence/task-4-config-valid.txt

  Scenario: Config matches TypeScript types from Task 2
    Tool: Bash
    Preconditions: Task 2 types exist
    Steps:
      1. Create temp script importing SiteConfig[] type and loading site-handlers.json
      2. Type-assert the JSON against SiteConfig[]
      3. Run tsc --noEmit
    Expected Result: JSON data conforms to TypeScript types
    Failure Indicators: Type errors
    Evidence: .sisyphus/evidence/task-4-type-match.txt
  ```

  **Commit**: YES
  - Message: `feat(config): add site handler configs for ChatGPT, Gemini, Grok, Qwen`
  - Files: `public/site-handlers.json`
  - Pre-commit: `wxt build`

---

- [x] 5. i18n Resource Files (7 Languages)

  **What to do**:
  - Create `src/i18n/` directory structure:
    - `src/i18n/locales/en.json`, `ko.json`, `ja.json`, `zh.json`, `pt.json`, `ru.json`, `fr.json`
    - `src/i18n/index.ts` — i18next configuration (lazy loading, fallback: 'en')
  - Define translation keys for all UI strings:
    - Navigation: `nav.batchSearch`, `nav.settings`, `nav.history`
    - Settings: `settings.searchEngines`, `settings.promptTemplates`, `settings.language`
    - Batch search: `batch.inputPlaceholder`, `batch.send`, `batch.columns`
    - History: `history.title`, `history.search`, `history.empty`, `history.clear`
    - Share/Export: `share.title`, `share.copyMarkdown`, `share.copied`
    - Errors: `error.loadFailed`, `error.captchaDetected`, `error.timeout`
  - EN and KO translations fully filled in; other languages can have EN fallback initially
  - Create `_locales/en/messages.json` and `_locales/ko/messages.json` for Chrome extension i18n (extension name, description)

  **Must NOT do**:
  - Do NOT use machine translation for other languages — leave as EN fallback
  - Do NOT hardcode any UI strings in components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Repetitive file creation with known structure
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6)
  - **Blocks**: Task 22
  - **Blocked By**: None

  **References**:

  **External References**:
  - react-i18next docs: https://react.i18next.com/ — React integration patterns
  - Chrome extension i18n: https://developer.chrome.com/docs/extensions/reference/api/i18n — _locales format
  - AICompare `_locales/`: https://github.com/taoAIGC/AICompare/tree/main/_locales — Chrome extension locale file structure

  **WHY Each Reference Matters**:
  - react-i18next provides the integration pattern for React components
  - Chrome i18n API defines the _locales format for extension name/description

  **Acceptance Criteria**:

  ```
  Scenario: All locale files are valid JSON with matching keys
    Tool: Bash
    Preconditions: None
    Steps:
      1. Parse all 7 locale JSON files
      2. Extract keys from en.json
      3. Verify all other locale files have the same key set
      4. Verify en.json has no empty string values
      5. Verify ko.json has no empty string values
    Expected Result: All files valid, en/ko fully translated, keys match
    Failure Indicators: Missing keys, empty values in en/ko
    Evidence: .sisyphus/evidence/task-5-i18n-valid.txt
  ```

  **Commit**: YES
  - Message: `feat(i18n): add translation resource files for 7 languages`
  - Files: `src/i18n/**`, `_locales/**`
  - Pre-commit: `wxt build`

---

- [x] 6. Tailwind CSS Setup + Design Tokens

  **What to do**:
  - Install and configure Tailwind CSS v4 (or v3 if v4 not stable with WXT):
    - `tailwind.config.ts` with custom theme tokens
    - `postcss.config.js`
    - Base CSS file imported in batch-search entry
  - Define design tokens:
    - Colors: primary, secondary, surface, background, border, text, error, success
    - Dark mode support via `class` strategy (prepare for future toggle)
    - Spacing scale, border radius, font sizes
    - Sidebar width: `w-64` (256px) collapsed `w-16` (64px)
    - Grid gaps for iframe layout
  - Create `src/styles/globals.css` with Tailwind directives and base resets
  - Create `src/components/ui/` directory (empty, for future shared components)

  **Must NOT do**:
  - Do NOT create any React components yet
  - Do NOT use inline styles — Tailwind utilities only
  - Do NOT import external component libraries (shadcn, MUI, etc.) — keep lightweight

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Tailwind configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5)
  - **Blocks**: Tasks 13-18
  - **Blocked By**: None

  **References**:

  **External References**:
  - Tailwind CSS with Vite: https://tailwindcss.com/docs/guides/vite — Setup guide
  - WXT + Tailwind: Search `wxt.config.ts tailwind` on GitHub for examples

  **Acceptance Criteria**:

  ```
  Scenario: Tailwind compiles and classes work
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. Run `wxt build`
      2. Verify CSS output exists in build
      3. Verify tailwind utility classes are present in compiled CSS
    Expected Result: Build includes compiled Tailwind CSS
    Failure Indicators: Build fails, no CSS in output
    Evidence: .sisyphus/evidence/task-6-tailwind-build.txt
  ```

  **Commit**: YES
  - Message: `feat(ui): configure Tailwind CSS with design tokens`
  - Files: `tailwind.config.ts`, `postcss.config.js`, `src/styles/globals.css`
  - Pre-commit: `wxt build`

---

- [x] 7. PoC: Iframe Embedding Page (Validate DNR + Sessions)

  **What to do**:
  - Create a minimal PoC page at `entrypoints/batch-search/` that:
    - Renders 2 iframes side-by-side: ChatGPT + Gemini
    - Each iframe has `sandbox="allow-scripts allow-forms allow-same-origin allow-popups"` attribute
    - Verify the DNR rules strip X-Frame-Options (sites load in iframes without errors)
    - Verify user's existing login session works (if logged into ChatGPT in main browser, the iframe should show logged-in state)
    - Test cookie sending: Check DevTools Network tab that session cookies are sent with iframe requests
    - Document which sites work / fail and any workarounds needed
  - If SameSite cookies fail:
    - Implement dynamic DNR rule in background.ts to inject Cookie header using chrome.cookies.getAll()
    - Test this fallback approach
  - Create `COMPATIBILITY_REPORT.md` documenting results for each site

  **Must NOT do**:
  - Do NOT build full UI — this is a bare-bones validation page
  - Do NOT skip cookie verification — this is the #1 risk
  - Do NOT proceed to Wave 3 if both ChatGPT AND Gemini fail to embed

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex browser-level debugging, cookie inspection, multiple failure modes
  - **Skills**: [`playwright`]
    - `playwright`: Needed for browser automation to verify iframe embedding works

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-12)
  - **Blocks**: Tasks 13-18 (validates the entire approach)
  - **Blocked By**: Tasks 1, 3, 4

  **References**:

  **Pattern References**:
  - AICompare `iframe/iframe.html`: https://github.com/taoAIGC/AICompare/blob/main/iframe/iframe.html — How AICompare structures its iframe page
  - Task 3 output: `public/rules.json` — DNR rules to test

  **External References**:
  - MV3 iframe embedding blog: https://safinaskar.writeas.com/mv3-chrome-extension-with-iframe-which-embeds-any-site — Detailed walkthrough of iframe embedding with hacks
  - SameSite cookie workaround: Use chrome.cookies API to read and re-inject cookies

  **WHY Each Reference Matters**:
  - AICompare's iframe.html proves the approach works in production
  - The blog post documents real-world iframe hacks needed for various sites

  **Acceptance Criteria**:

  ```
  Scenario: ChatGPT loads in iframe with user session
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded in Chrome, user logged into ChatGPT in main browser
    Steps:
      1. Navigate to chrome-extension://<id>/batch-search.html
      2. Wait for ChatGPT iframe to load (timeout: 15s)
      3. Check iframe does NOT show X-Frame-Options error
      4. Check iframe shows ChatGPT interface (not login page if user was logged in)
      5. Screenshot the iframe content
    Expected Result: ChatGPT renders inside iframe, shows authenticated state
    Failure Indicators: Blank iframe, "Refused to display" error, login page when already logged in
    Evidence: .sisyphus/evidence/task-7-chatgpt-iframe.png

  Scenario: Gemini loads in iframe
    Tool: Playwright (playwright skill)
    Preconditions: Same as above, user logged into Google account
    Steps:
      1. Navigate to batch-search page
      2. Wait for Gemini iframe to load (timeout: 15s)
      3. Verify Gemini interface renders (not blocked)
      4. Screenshot
    Expected Result: Gemini renders inside iframe
    Failure Indicators: Blank iframe, connection refused
    Evidence: .sisyphus/evidence/task-7-gemini-iframe.png

  Scenario: iframe embedding fails gracefully
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Navigate to batch-search page
      2. If any iframe fails to load, verify it shows an error state (not blank white)
      3. Check browser console for specific error messages
      4. Document failure reason
    Expected Result: Failures documented, not silent
    Evidence: .sisyphus/evidence/task-7-error-handling.txt
  ```

  **Commit**: YES
  - Message: `feat(poc): validate iframe embedding with DNR rules and session sharing`
  - Files: `entrypoints/batch-search/**`, `COMPATIBILITY_REPORT.md`
  - Pre-commit: `wxt build`

---

- [x] 8. Frame-Busting Mitigation Content Script

  **What to do**:
  - Create `entrypoints/frame-guard.content.ts`:
    - Runs at `document_start` with `all_frames: true`
    - Matches all LLM domain URLs
    - World: `MAIN` (to access page's window object, not isolated world)
    - Overrides `window.top` getter to return `window.self` (prevents frame-busting checks)
    - Intercepts `window.parent` to return `window.self`
    - Neutralizes common frame-busting patterns:
      - `if (window.top !== window) window.top.location = ...`
      - `if (window.self !== window.top) ...`
    - Must run BEFORE any site JavaScript executes
  - Handle edge cases:
    - Some sites use `window.frameElement` check — override to return null
    - Some sites check `document.referrer` — may need spoofing
  - Ensure the script does NOT interfere when the site is visited normally (not in iframe)
    - Only activate overrides when `window !== window.top` (i.e., actually in an iframe)

  **Must NOT do**:
  - Do NOT override window properties when NOT in an iframe (breaks normal browsing)
  - Do NOT use `ISOLATED` world — must be `MAIN` to override page's window object
  - Do NOT block legitimate site functionality (login, navigation within the site)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Low-level browser API manipulation, tricky edge cases with window object
  - **Skills**: [`playwright`]
    - `playwright`: Needed to test frame-busting in real browsers

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9-12)
  - **Blocks**: Tasks 19, 20
  - **Blocked By**: Tasks 1, 3

  **References**:

  **External References**:
  - Blog: frame-busting iframe hacks: https://safinaskar.writeas.com/mv3-chrome-extension-with-iframe-which-embeds-any-site — Documents window.top, window.parent overrides
  - WXT content script MAIN world: https://wxt.dev/guide/essentials/entrypoints — `world: 'MAIN'` config

  **WHY Each Reference Matters**:
  - The blog documents real-world frame-busting bypass techniques used in production extensions
  - WXT docs show how to configure MAIN world content scripts

  **Acceptance Criteria**:

  ```
  Scenario: Frame-busting script prevents redirect
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, frame-guard.content.ts active
    Steps:
      1. Create a test page with an iframe pointing to a site that uses frame-busting (e.g., ChatGPT)
      2. Load the page
      3. Verify the iframe content loads WITHOUT the top-level page being redirected
      4. Verify the iframe content is interactive
    Expected Result: Iframe stays embedded, no top-level redirect
    Failure Indicators: Page redirects to LLM site, iframe goes blank
    Evidence: .sisyphus/evidence/task-8-frame-guard.png

  Scenario: Script does not activate outside iframes
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Navigate directly to chatgpt.com in a normal tab
      2. Verify the site works normally (can type, navigate)
      3. Verify window.top === window (not overridden)
    Expected Result: Normal browsing unaffected
    Failure Indicators: Site behaves abnormally, login fails
    Evidence: .sisyphus/evidence/task-8-normal-browsing.png
  ```

  **Commit**: YES
  - Message: `feat(security): add frame-busting mitigation content script`
  - Files: `entrypoints/frame-guard.content.ts`
  - Pre-commit: `wxt build`

---

- [x] 9. Automation Engine (Step Executor)

  **What to do**:
  - Create `src/lib/automation-engine.ts`:
    - `executeSteps(steps: SearchStep[], query: string): Promise<boolean>` — Main entry point
    - Step handlers for each action type:
      - `focus`: querySelector → element.focus(). Support string[] selectors (try each).
      - `setValue`: Handle 3 input types:
        - `textarea`: Set .value, dispatch input/change events
        - `contenteditable`: Clear innerHTML, create text node or use document.execCommand('insertText'), dispatch InputEvent
        - `angular`: Set value via Angular's ngModel/FormControl (nativeElement.value + dispatchEvent)
      - `triggerEvents`: Dispatch specified events (input, change, blur, focus, keydown, keyup)
      - `click`: querySelector → element.click(). Support string[] selectors. Handle retryOnDisabled.
      - `wait`: setTimeout with specified duration
      - `sendKeys`: Dispatch KeyboardEvent for Enter, Ctrl+Enter, etc.
      - `paste`: Dispatch ClipboardEvent with DataTransfer
    - Retry logic: maxAttempts + retryInterval for each step
    - waitForElement: Poll for selector existence before acting
    - Shadow DOM piercing: For selectors that don't match, try `element.shadowRoot?.querySelector()`
  - Create `entrypoints/inject.content.ts`:
    - Content script that runs in `ISOLATED` world, `all_frames: true`, `document_idle`
    - Listens for messages from extension page via `chrome.runtime.onMessage`
    - On `INJECT_QUERY` message: load site config → call `executeSteps(searchHandler.steps, query)`
    - On `INJECT_FILE` message: call `executeSteps(fileUploadHandler.steps)`
    - Determines current site by matching `window.location.hostname` against site configs

  **Must NOT do**:
  - Do NOT hardcode any selectors — ALL selectors come from site-handlers.json
  - Do NOT skip retry logic — LLM sites load dynamically, elements may not exist immediately
  - Do NOT use eval() or Function() for dynamic code execution

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex DOM manipulation, multiple input paradigms, retry logic, Shadow DOM
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not testing here, just building the engine

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 10-12)
  - **Blocks**: Tasks 19, 20
  - **Blocked By**: Tasks 1, 2, 4

  **References**:

  **Pattern References**:
  - AICompare `iframe/inject.js`: https://github.com/taoAIGC/AICompare/blob/main/iframe/inject.js — The working automation engine. Study how it handles contenteditable, React state, Angular forms, and event simulation.
  - AICompare `config/siteHandlers.json` — Step definitions that the engine must execute

  **WHY Each Reference Matters**:
  - inject.js is the proven implementation of the step-based automation pattern. Study its edge case handling for contenteditable (Lexical, Tiptap), event dispatching, and retry mechanisms.

  **Acceptance Criteria**:

  ```
  Scenario: Engine executes ChatGPT steps correctly
    Tool: Bash
    Preconditions: Engine module exists, site config loaded
    Steps:
      1. Create a test script that imports executeSteps and a mock DOM environment
      2. Verify the function processes all 5 ChatGPT steps without throwing
      3. Verify it handles missing elements gracefully (returns false, not throws)
    Expected Result: Engine processes steps, handles missing elements
    Failure Indicators: Unhandled exceptions, infinite loops in retry
    Evidence: .sisyphus/evidence/task-9-engine-test.txt

  Scenario: Engine handles contenteditable input
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, inject.content.ts active
    Steps:
      1. Navigate to a test page with a contenteditable div
      2. Send INJECT_QUERY message with test text
      3. Verify the contenteditable div contains the test text
      4. Verify input events were fired (check via event listener)
    Expected Result: Text injected into contenteditable, events fired
    Failure Indicators: Empty div, no events, wrong text
    Evidence: .sisyphus/evidence/task-9-contenteditable.png
  ```

  **Commit**: YES
  - Message: `feat(engine): implement step-based automation engine with retry and Shadow DOM support`
  - Files: `src/lib/automation-engine.ts`, `entrypoints/inject.content.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 10. Content Extraction Engine (DOM → Markdown)

  **What to do**:
  - Create `src/lib/content-extractor.ts`:
    - `extractConversation(config: ContentExtractor): ConversationData` — Reads DOM using config selectors
    - Find message containers using `messageContainer` selector
    - Extract assistant messages using `contentSelectors` (try each in order)
    - Filter out excluded elements using `excludeSelectors`
    - Handle thinking blocks: if `extractThinking` is true, extract separately
    - Fallback chain: try `fallbackSelectors` if primary selectors fail
    - Return structured data: `{ messages: [{role, content_html}] }`
  - Create `src/lib/html-to-markdown.ts`:
    - Convert extracted HTML to clean Markdown
    - Handle: headings, bold/italic, code blocks (with language), lists (ul/ol), links, images, tables
    - Strip UI artifacts: copy buttons, action buttons, feedback widgets
    - Format output as `**user**: question\n\n**assistant**: response\n\n---`
  - Wire into content script: On `EXTRACT_CONTENT` message, run extraction and return Markdown string

  **Must NOT do**:
  - Do NOT use external Markdown libraries (turndown, etc.) — keep bundle small, write custom converter
  - Do NOT hardcode selectors — use config from site-handlers.json
  - Do NOT include user interface elements in extraction (buttons, inputs)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: DOM traversal logic + HTML-to-Markdown conversion requires careful handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-9, 11-12)
  - **Blocks**: Task 24
  - **Blocked By**: Tasks 1, 2, 4

  **References**:

  **Pattern References**:
  - AICompare `iframe/export-responses.js`: https://github.com/taoAIGC/AICompare/blob/main/iframe/export-responses.js — Working HTML-to-Markdown converter. Study its `convertHtmlToMarkdown` function and how it handles code blocks, lists, tables.

  **WHY Each Reference Matters**:
  - export-responses.js is a production-tested HTML→Markdown converter specifically tuned for LLM output formatting

  **Acceptance Criteria**:

  ```
  Scenario: Markdown output is well-formatted
    Tool: Bash
    Preconditions: Extractor module exists
    Steps:
      1. Create test HTML fixtures mimicking ChatGPT response format (headings, code blocks, lists)
      2. Run html-to-markdown converter on fixtures
      3. Verify output contains proper Markdown syntax (##, ```, -, etc.)
      4. Verify no HTML tags remain in output
      5. Verify code blocks preserve language annotation
    Expected Result: Clean Markdown output matching expected fixtures
    Failure Indicators: Residual HTML tags, broken code blocks, missing content
    Evidence: .sisyphus/evidence/task-10-markdown-output.txt
  ```

  **Commit**: YES
  - Message: `feat(extract): implement content extraction engine with HTML-to-Markdown conversion`
  - Files: `src/lib/content-extractor.ts`, `src/lib/html-to-markdown.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 11. Background Service Worker

  **What to do**:
  - Implement `entrypoints/background.ts` with `defineBackground`:
    - **Extension lifecycle**:
      - `browser.action.onClicked`: Open batch-search page in new tab (or focus existing)
      - `browser.runtime.onInstalled`: Initialize default settings in chrome.storage
    - **Omnibox handler**:
      - `browser.omnibox.onInputEntered`: Open batch-search page with query parameter
      - `browser.omnibox.onInputChanged`: Show suggestion "Search with LLM Crosser"
    - **Messaging hub**:
      - Route messages between extension page ↔ content scripts
      - Handle `GET_SITE_CONFIG`, `GET_SETTINGS`, `UPDATE_SETTINGS` messages
    - **Cookie management** (if needed per PoC findings):
      - `chrome.cookies.getAll()` for LLM domains
      - Dynamic DNR rules to inject Cookie headers if SameSite workaround is needed
    - **Tab management**:
      - Track which tab has the batch-search page open
      - Prevent opening duplicate batch-search tabs

  **Must NOT do**:
  - Do NOT make the background script async at top level (WXT limitation for MV3 service workers)
  - Do NOT use persistent background (MV3 service workers are non-persistent)
  - Do NOT store state in module-level variables (service worker may be terminated)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple browser APIs, messaging patterns, lifecycle management
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-10, 12)
  - **Blocks**: Tasks 19, 20, 29
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - AICompare `background.js`: https://github.com/taoAIGC/AICompare/blob/main/background.js — Working background script with lifecycle, omnibox, tab management, dynamic DNR rules

  **External References**:
  - WXT background: https://wxt.dev/guide/essentials/entrypoints — defineBackground usage
  - @webext-core/messaging: https://github.com/aklinker1/webext-core/tree/main/packages/messaging — Type-safe messaging

  **WHY Each Reference Matters**:
  - AICompare's background.js shows the exact lifecycle events and tab management needed
  - WXT docs show correct defineBackground pattern for MV3

  **Acceptance Criteria**:

  ```
  Scenario: Extension icon opens batch search page
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded in Chrome
    Steps:
      1. Click extension icon in toolbar
      2. Verify new tab opens with batch-search.html URL
      3. Click icon again
      4. Verify it focuses the existing tab (not opening duplicate)
    Expected Result: Single batch-search tab, icon toggles focus
    Failure Indicators: Multiple tabs opened, no tab opens
    Evidence: .sisyphus/evidence/task-11-icon-click.png

  Scenario: Omnibox triggers batch search
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Click address bar
      2. Type "llmc " (with space after keyword)
      3. Type "test query"
      4. Press Enter
      5. Verify batch-search page opens with "test query" visible
    Expected Result: Batch search page with pre-filled query
    Failure Indicators: Nothing happens, wrong page opens
    Evidence: .sisyphus/evidence/task-11-omnibox.png
  ```

  **Commit**: YES
  - Message: `feat(background): implement service worker with lifecycle, omnibox, and messaging`
  - Files: `entrypoints/background.ts`
  - Pre-commit: `wxt build`

---

- [x] 12. Storage Service (chrome.storage.local Wrapper)

  **What to do**:
  - Create `src/lib/storage.ts`:
    - Type-safe wrapper around `chrome.storage.local`
    - `getSettings(): Promise<UserSettings>` — with defaults fallback
    - `updateSettings(partial: Partial<UserSettings>): Promise<void>`
    - `getHistory(): Promise<HistoryEntry[]>`
    - `addHistoryEntry(entry: HistoryEntry): Promise<void>`
    - `deleteHistoryEntry(id: string): Promise<void>`
    - `clearHistory(): Promise<void>`
    - `searchHistory(query: string): Promise<HistoryEntry[]>`
    - `getPromptTemplates(): Promise<PromptTemplate[]>`
    - `savePromptTemplates(templates: PromptTemplate[]): Promise<void>`
  - Default settings:
    - `enabledSites`: ["ChatGPT", "Gemini", "Grok"]
    - `gridColumns`: 2
    - `language`: "en"
    - `promptTemplates`: [] (empty)
  - Create React hooks:
    - `useSettings()` — Returns settings + updateSettings
    - `useHistory()` — Returns history entries + CRUD operations
  - Storage change listener for cross-tab sync

  **Must NOT do**:
  - Do NOT use synchronous storage APIs
  - Do NOT store large data (conversation content) — only metadata and URLs
  - Do NOT use IndexedDB — chrome.storage.local is sufficient for this scope

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard CRUD wrapper with well-defined API
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-11)
  - **Blocks**: Tasks 18, 21, 22, 23
  - **Blocked By**: Tasks 1, 2

  **References**:

  **External References**:
  - chrome.storage API: https://developer.chrome.com/docs/extensions/reference/api/storage — Official docs
  - WXT storage utilities: https://wxt.dev/guide/essentials/storage — WXT's built-in storage helpers

  **Acceptance Criteria**:

  ```
  Scenario: Settings persist across extension reload
    Tool: Bash
    Preconditions: Storage module exists
    Steps:
      1. Load extension, set gridColumns to 3 via storage API
      2. Reload extension
      3. Read settings via storage API
      4. Verify gridColumns is still 3
    Expected Result: Settings persist
    Failure Indicators: Settings reset to defaults
    Evidence: .sisyphus/evidence/task-12-storage-persist.txt
  ```

  **Commit**: YES
  - Message: `feat(storage): add typed chrome.storage.local wrapper with React hooks`
  - Files: `src/lib/storage.ts`, `src/hooks/useSettings.ts`, `src/hooks/useHistory.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [x] 13. Batch Search Page Layout + React Router

  **What to do**:
  - Set up React Router (hash mode) in `entrypoints/batch-search/main.tsx`:
    - Routes: `#/` (batch search), `#/settings` (settings), `#/history` (history)
    - `createHashRouter` with layout component wrapping all routes
  - Create `src/components/layout/AppLayout.tsx`:
    - Flex container: left sidebar (fixed width) + main content area (flex-1)
    - Sidebar receives current route for active state highlighting
    - Main content renders `<Outlet />` for route children
  - Create `src/pages/BatchSearchPage.tsx` (shell only):
    - Placeholder for iframe grid (implemented in Task 15)
    - Placeholder for query input bar (implemented in Task 17)
  - Create `src/pages/SettingsPage.tsx` (shell only)
  - Create `src/pages/HistoryPage.tsx` (shell only)
  - Ensure all pages render without errors

  **Must NOT do**:
  - Do NOT use path-based routing (extension pages require hash routing)
  - Do NOT implement page contents yet — shells only with placeholders
  - Do NOT add state management beyond React Router

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Page layout, routing, visual structure
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Layout design and responsive structure

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14-18)
  - **Blocks**: Tasks 14-17 (layout host)
  - **Blocked By**: Tasks 1, 6, 7

  **References**:

  **External References**:
  - WXT hash routing: https://wxt.dev/guide/essentials/frontend-frameworks — Hash mode routing requirement
  - React Router hash: https://reactrouter.com/en/main/routers/create-hash-router — createHashRouter API

  **Acceptance Criteria**:

  ```
  Scenario: All routes render without errors
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Navigate to batch-search.html
      2. Verify layout renders with sidebar + main area
      3. Navigate to batch-search.html#/settings
      4. Verify settings page shell renders
      5. Navigate to batch-search.html#/history
      6. Verify history page shell renders
      7. Screenshot each page
    Expected Result: All 3 routes render, sidebar shows active state
    Failure Indicators: White screen, routing errors, missing sidebar
    Evidence: .sisyphus/evidence/task-13-routes.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add page layout with React Router hash routing and page shells`
  - Files: `entrypoints/batch-search/main.tsx`, `src/components/layout/AppLayout.tsx`, `src/pages/*.tsx`
  - Pre-commit: `wxt build`

---

- [x] 14. Left Sidebar Component

  **What to do**:
  - Create `src/components/layout/Sidebar.tsx`:
    - Navigation items: Batch Search (icon + label), Settings (icon + label), History (icon + label)
    - Each item links to its hash route
    - Active item highlighted with primary color background
    - Settings has sub-items: Search Engines, Prompt Templates, Language (collapsed by default)
    - Sidebar width: 256px (w-64), collapsible to icon-only (w-16) with toggle button
    - Bottom section: extension version, optional links
  - Use Tailwind classes for styling (no inline styles)
  - Use Lucide React or simple SVG icons (keep bundle small)
  - Responsive: Sidebar overlays on narrow screens (< 768px)

  **Must NOT do**:
  - Do NOT use heavy icon libraries (FontAwesome, Material Icons)
  - Do NOT add functionality to nav items (just routing)
  - Do NOT hardcode strings — use i18n keys (can use placeholder text that Task 22 will wire up)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with visual design
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 15-18)
  - **Blocks**: None
  - **Blocked By**: Tasks 6, 13

  **References**:

  **Pattern References**:
  - AICompare sidebar: Reference AICompare's history/favorites drawer pattern for sidebar UX

  **Acceptance Criteria**:

  ```
  Scenario: Sidebar renders with navigation
    Tool: Playwright (playwright skill)
    Preconditions: Task 13 layout exists
    Steps:
      1. Open batch-search page
      2. Verify sidebar visible on left with 3 main nav items
      3. Click "Settings" nav item
      4. Verify URL changes to #/settings
      5. Verify Settings item is highlighted
      6. Click sidebar collapse toggle
      7. Verify sidebar collapses to icon-only mode
      8. Screenshot both states
    Expected Result: Sidebar navigates correctly, collapses/expands
    Failure Indicators: Navigation broken, collapse not working
    Evidence: .sisyphus/evidence/task-14-sidebar.png
  ```

  **Commit**: YES (grouped with Task 13)
  - Message: `feat(ui): add collapsible sidebar with navigation`
  - Files: `src/components/layout/Sidebar.tsx`

---

- [x] 15. Iframe Grid Component (1/2/3/4 Columns)

  **What to do**:
  - Create `src/components/grid/IframeGrid.tsx`:
    - CSS Grid layout with configurable columns (1/2/3/4)
    - Column count controlled by settings (from useSettings hook)
    - Column switcher UI: 4 buttons showing column layout icons
    - Grid auto-adjusts: if 3 sites enabled and 4 columns selected, still shows 3
    - Each grid cell renders an IframeWrapper component (Task 16)
    - Gap between cells: 4px (or configurable)
    - Full height: grid fills remaining vertical space after query input bar
  - Grid responds to enabled/disabled sites from settings
  - Handle edge cases:
    - 0 sites enabled: show "No sites enabled" message
    - 1 site: single column regardless of setting
    - Sites added/removed: grid re-renders smoothly

  **Must NOT do**:
  - Do NOT implement iframe loading logic (Task 16 handles that)
  - Do NOT use flexbox for grid — CSS Grid is correct for this layout
  - Do NOT add drag-and-drop reordering (future feature)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS Grid layout, responsive design
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-14, 16-18)
  - **Blocks**: Tasks 19, 20
  - **Blocked By**: Tasks 6, 13

  **References**:

  **Pattern References**:
  - AICompare iframe grid: AICompare supports 1/2/3/4 column layout switching — study their CSS approach

  **Acceptance Criteria**:

  ```
  Scenario: Grid switches between column layouts
    Tool: Playwright (playwright skill)
    Preconditions: Grid component rendered with 4 mock iframe slots
    Steps:
      1. Open batch-search page
      2. Click "2 columns" button → verify 2-column layout
      3. Click "3 columns" button → verify 3-column layout
      4. Click "4 columns" button → verify 4-column layout
      5. Click "1 column" button → verify single column
      6. Screenshot each layout
    Expected Result: Grid correctly renders 1/2/3/4 columns
    Failure Indicators: Columns don't change, overflow, misalignment
    Evidence: .sisyphus/evidence/task-15-grid-layouts.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add responsive iframe grid with 1/2/3/4 column layout`
  - Files: `src/components/grid/IframeGrid.tsx`

---

- [x] 16. Iframe Wrapper Component (Per-Iframe Controls)

  **What to do**:
  - Create `src/components/grid/IframeWrapper.tsx`:
    - Header bar: Site name + icon, loading spinner, share button (top-right corner)
    - iframe element with:
      - `src` from site config URL
      - `sandbox="allow-scripts allow-forms allow-same-origin allow-popups"`
      - `allow="clipboard-read; clipboard-write"` for paste support
      - Loading state: show skeleton/spinner until iframe fires `load` event
    - Share button: Triggers conversation extraction (Task 24)
    - Error states:
      - iframe load timeout (15s): show "Failed to load" with retry button
      - CAPTCHA detected: show warning banner (Task 27 will enhance)
    - Resize handle: Allow vertical resizing of individual iframe (optional, nice-to-have)
  - Each wrapper manages its own iframe ref for messaging

  **Must NOT do**:
  - Do NOT implement messaging logic (Task 19)
  - Do NOT implement content extraction (Task 24)
  - Do NOT remove sandbox attribute — it prevents frame-busting

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Component UI with loading states, error states
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-15, 17-18)
  - **Blocks**: Tasks 19, 20, 24, 27
  - **Blocked By**: Tasks 6, 13

  **Acceptance Criteria**:

  ```
  Scenario: Iframe wrapper shows loading then content
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, DNR rules active
    Steps:
      1. Open batch-search page
      2. Verify iframe wrapper shows loading state (spinner/skeleton)
      3. Wait for iframe to load (timeout 15s)
      4. Verify loading state disappears, iframe content visible
      5. Verify header shows site name and share button
      6. Screenshot
    Expected Result: Loading → loaded transition, header with controls
    Failure Indicators: Perpetual loading, no header, blank iframe
    Evidence: .sisyphus/evidence/task-16-iframe-wrapper.png

  Scenario: Iframe wrapper handles load failure
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Point iframe to an unreachable URL
      2. Wait for timeout (15s)
      3. Verify error state shows "Failed to load" message
      4. Verify retry button is present
    Expected Result: Error state rendered with retry option
    Failure Indicators: Blank screen, no error message
    Evidence: .sisyphus/evidence/task-16-load-failure.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add iframe wrapper component with loading/error states`
  - Files: `src/components/grid/IframeWrapper.tsx`

---

- [x] 17. Query Input Bar + Prompt Template Selector

  **What to do**:
  - Create `src/components/query/QueryInputBar.tsx`:
    - Full-width input bar at top of batch search page (above iframe grid)
    - Text input (textarea, auto-expanding) with placeholder "Ask all LLMs..."
    - Send button (right side) — triggers batch query to all enabled iframes
    - Keyboard shortcut: Ctrl/Cmd + Enter to send
    - Prompt template pills: Row of clickable template buttons above input
      - Each pill shows template name
      - Clicking pill fills input with template text (replacing {query} with current input or empty)
    - Character count indicator (optional)
  - Read prompt templates from storage (useSettings hook)
  - On send: dispatch query to parent page component (lifted state or context)
  - Accept initial query from URL parameter (for omnibox integration)

  **Must NOT do**:
  - Do NOT implement the actual query broadcasting (Task 20)
  - Do NOT implement prompt template CRUD (Task 21) — just display existing templates
  - Do NOT use rich text editor — plain textarea

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Input component with UX considerations
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-16, 18)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 6, 12, 13

  **Acceptance Criteria**:

  ```
  Scenario: Query input accepts text and sends
    Tool: Playwright (playwright skill)
    Preconditions: Batch search page rendered
    Steps:
      1. Click input bar
      2. Type "Hello LLM"
      3. Press Ctrl+Enter (or click Send button)
      4. Verify send event dispatched (check via React state or callback)
    Expected Result: Input captures text, send triggers correctly
    Failure Indicators: Input not focusable, send not triggered
    Evidence: .sisyphus/evidence/task-17-query-input.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add query input bar with prompt template selector`
  - Files: `src/components/query/QueryInputBar.tsx`

---

- [x] 18. Settings Page — Search Engine Toggles

  **What to do**:
  - Implement `src/pages/SettingsPage.tsx` (replace shell from Task 13):
    - **Search Engines section**:
      - List all sites from site-handlers.json
      - Each site: icon + name + toggle switch (on/off)
      - Toggle updates `enabledSites` in storage
      - Show site URL below name in muted text
      - Sites grouped by region (US, China) or flat list
    - Read site list from public/site-handlers.json (loaded at build time or fetched)
    - Use `useSettings()` hook for state
    - Changes auto-save (no explicit save button)

  **Must NOT do**:
  - Do NOT implement Prompt Templates section (Task 21)
  - Do NOT implement Language section (Task 22)
  - Do NOT allow editing site-handlers.json from UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Settings form UI with toggle components
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13-17)
  - **Blocks**: None
  - **Blocked By**: Tasks 6, 12, 13

  **Acceptance Criteria**:

  ```
  Scenario: Toggle persists and reflects in batch search
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, settings page accessible
    Steps:
      1. Navigate to #/settings
      2. Verify 4 sites listed with toggle switches
      3. Toggle Grok OFF
      4. Navigate to #/ (batch search)
      5. Verify Grok iframe is NOT shown
      6. Navigate back to #/settings
      7. Verify Grok toggle is still OFF
    Expected Result: Toggle state persists, affects iframe grid
    Failure Indicators: Toggle resets, iframe still shows
    Evidence: .sisyphus/evidence/task-18-settings-toggle.png
  ```

  **Commit**: YES
  - Message: `feat(settings): add search engine toggle switches`
  - Files: `src/pages/SettingsPage.tsx`

---

- [x] 19. Iframe ↔ Extension Messaging Bridge

  **What to do**:
  - Create `src/lib/messaging.ts`:
    - Define message protocol using `@webext-core/messaging` or custom typed messaging:
      - `INJECT_QUERY { siteName, query }` — Extension page → content script in iframe
      - `INJECT_FILE { siteName, fileData }` — Extension page → content script for paste
      - `EXTRACT_CONTENT { siteName }` — Extension page → content script, returns Markdown
      - `QUERY_STATUS { siteName, status }` — Content script → extension page (started, completed, error)
      - `SITE_READY { siteName }` — Content script → extension page (iframe loaded and ready)
    - Use `chrome.tabs.sendMessage` with `frameId` targeting for iframe-specific messaging
    - Use `chrome.webNavigation.getAllFrames` to map iframes to frameIds
  - Create `src/hooks/useIframeManager.ts`:
    - React hook managing all iframe states (loading, ready, querying, error)
    - Maps site names to iframe frameIds
    - Handles message dispatch and response collection
    - Provides: `sendQueryToAll(query)`, `sendQueryToSite(siteName, query)`, `extractContent(siteName)`

  **Must NOT do**:
  - Do NOT use postMessage directly — use chrome extension messaging for reliability
  - Do NOT assume frameIds are stable — re-discover on iframe reload
  - Do NOT block on slow iframes — send to all, handle responses independently

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex async messaging, frame management, error handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20-24)
  - **Blocks**: Tasks 20, 25
  - **Blocked By**: Tasks 8, 9, 11, 15, 16

  **Acceptance Criteria**:

  ```
  Scenario: Message reaches content script in iframe
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, iframe with ChatGPT visible
    Steps:
      1. Open batch-search page
      2. Wait for ChatGPT iframe to load
      3. Send INJECT_QUERY message via messaging bridge
      4. Verify content script in iframe receives message (log evidence)
      5. Verify automation engine activates (focus event on input)
    Expected Result: Message successfully routed to iframe content script
    Failure Indicators: Message not received, wrong iframe targeted
    Evidence: .sisyphus/evidence/task-19-messaging.txt
  ```

  **Commit**: YES
  - Message: `feat(messaging): implement iframe-extension messaging bridge with frame management`
  - Files: `src/lib/messaging.ts`, `src/hooks/useIframeManager.ts`

---

- [x] 20. Batch Query Execution Flow

  **What to do**:
  - Wire together: QueryInputBar → useIframeManager → messaging → content scripts → automation engine
  - Implementation flow:
    1. User types query and presses Send (from Task 17)
    2. `BatchSearchPage` calls `iframeManager.sendQueryToAll(query)`
    3. For each enabled site: send `INJECT_QUERY` message to iframe's content script
    4. Content script runs automation engine steps (Task 9)
    5. Content script reports back status: `started`, `completed`, `error`
    6. UI shows per-iframe status indicators (spinning while querying, green check when done)
  - Handle timing:
    - Stagger sends by 100ms to avoid overwhelming browser
    - Per-site timeout: 30s for query injection (not response — just getting the query in)
    - If injection fails: show error state on that iframe, continue with others
  - Save to history: After all queries sent, create history entry with query + site list + timestamp

  **Must NOT do**:
  - Do NOT wait for LLM responses — just inject the query, the iframe handles the rest
  - Do NOT retry failed injections automatically — show error, let user retry manually
  - Do NOT block the UI during query injection

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: End-to-end integration across 5 subsystems
  - **Skills**: [`playwright`]
    - `playwright`: E2E verification of the full flow

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19, 21-24)
  - **Blocks**: Tasks 25, 26
  - **Blocked By**: Tasks 9, 11, 15, 16, 17, 19

  **Acceptance Criteria**:

  ```
  Scenario: Query appears in all enabled LLM inputs
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, user logged into ChatGPT and Gemini
    Steps:
      1. Open batch-search page
      2. Type "What is TypeScript?" in query input
      3. Click Send
      4. Wait 5s for injection
      5. Check ChatGPT iframe: verify input field contains "What is TypeScript?"
      6. Check Gemini iframe: verify input field contains "What is TypeScript?"
      7. Verify status indicators show completion
    Expected Result: Query injected into all enabled LLM inputs
    Failure Indicators: Query missing in any iframe, status stuck on loading
    Evidence: .sisyphus/evidence/task-20-batch-query.png

  Scenario: Failed injection shows error per-iframe
    Tool: Playwright (playwright skill)
    Preconditions: One iframe fails to load
    Steps:
      1. Enable a site that fails to embed
      2. Type query and send
      3. Verify working iframes receive query
      4. Verify failed iframe shows error indicator (not blocking others)
    Expected Result: Partial success, failed iframe shows error
    Failure Indicators: All iframes fail, no error indication
    Evidence: .sisyphus/evidence/task-20-partial-failure.png
  ```

  **Commit**: YES
  - Message: `feat(core): implement batch query execution flow across all iframes`
  - Files: `src/pages/BatchSearchPage.tsx` (updated), integration wiring

---

- [x] 21. Settings — Prompt Templates CRUD

  **What to do**:
  - Add Prompt Templates section to SettingsPage:
    - List existing templates with name + preview of template text
    - Add button: Opens inline form (name + template text)
    - Template text supports `{query}` placeholder
    - Edit: Click template to edit inline
    - Delete: Trash icon with confirmation
    - Reorder: Drag handle or up/down arrows (simple)
    - Auto-save on change
  - Templates stored via storage service (Task 12)
  - Templates appear in QueryInputBar (Task 17) as clickable pills

  **Must NOT do**:
  - Do NOT implement complex rich text editing for templates
  - Do NOT add template categories or folders
  - Do NOT validate template syntax beyond checking {query} exists

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CRUD form with storage integration
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19-20, 22-24)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **Acceptance Criteria**:

  ```
  Scenario: Create, edit, delete prompt template
    Tool: Playwright (playwright skill)
    Preconditions: Settings page accessible
    Steps:
      1. Navigate to #/settings, scroll to Prompt Templates
      2. Click "Add Template"
      3. Enter name: "Code Review", template: "Review this code: {query}"
      4. Verify template appears in list
      5. Navigate to #/ (batch search)
      6. Verify "Code Review" pill appears above input
      7. Navigate back to settings, delete the template
      8. Verify it's removed
    Expected Result: Full CRUD lifecycle works, templates sync to batch search
    Failure Indicators: Template not saved, not appearing in batch search
    Evidence: .sisyphus/evidence/task-21-templates.png
  ```

  **Commit**: YES
  - Message: `feat(settings): add prompt template CRUD with storage`
  - Files: `src/pages/SettingsPage.tsx` (updated), `src/components/settings/PromptTemplateEditor.tsx`

---

- [x] 22. Settings — Language Switcher + i18n Integration

  **What to do**:
  - Add Language section to SettingsPage:
    - Dropdown selector with 7 language options (EN, KR, JP, CN, PT, RU, FR)
    - Each option shows native language name (e.g., "한국어", "日本語")
    - Selection updates `language` in storage
  - Wire react-i18next into all components:
    - Wrap app with `I18nextProvider`
    - Replace ALL hardcoded strings with `t('key')` calls
    - Dynamic language switching: changing language immediately updates all visible text
  - Load locale files from `src/i18n/locales/`
  - Set initial language from stored settings (or browser default)

  **Must NOT do**:
  - Do NOT translate site names (ChatGPT, Gemini, Grok stay as-is)
  - Do NOT add RTL support (no Arabic/Hebrew in scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: i18n wiring across all components
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19-21, 23-24)
  - **Blocks**: None
  - **Blocked By**: Tasks 5, 12

  **Acceptance Criteria**:

  ```
  Scenario: Language switch updates all UI text
    Tool: Playwright (playwright skill)
    Preconditions: i18n wired, locale files exist
    Steps:
      1. Open settings, change language to Korean (한국어)
      2. Verify sidebar items show Korean text (일괄검색, 설정, 히스토리)
      3. Navigate to batch search
      4. Verify input placeholder is in Korean
      5. Switch to Japanese
      6. Verify text updates to Japanese
    Expected Result: All UI text updates on language change
    Failure Indicators: Mixed languages, untranslated keys showing
    Evidence: .sisyphus/evidence/task-22-i18n-switch.png
  ```

  **Commit**: YES
  - Message: `feat(i18n): wire react-i18next with dynamic language switching`
  - Files: `src/i18n/index.ts` (updated), `src/pages/SettingsPage.tsx` (updated), all components updated with t() calls

---

- [x] 23. History — Save/Load/List/Search

  **What to do**:
  - Implement `src/pages/HistoryPage.tsx`:
    - Search bar at top: Filter history entries by query text
    - List of history entries: query text, timestamp (relative: "2 hours ago"), site icons
    - Each entry clickable (navigation handled in Task 26)
    - Empty state: "No search history yet" message
    - Clear all button with confirmation dialog
    - Pagination or virtual scroll if list gets long (> 100 entries)
  - History auto-saved when batch query executes (from Task 20):
    - Entry: { id, query, timestamp, siteResults: [{ siteName, conversationUrl }] }
  - Search: Full-text search on query field
  - Storage: Uses storage service from Task 12

  **Must NOT do**:
  - Do NOT store full conversation content — only query + metadata
  - Do NOT implement conversation re-navigation (Task 26)
  - Do NOT add categories, tags, or folders to history

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: List UI with search, storage integration, pagination
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19-22, 24)
  - **Blocks**: Task 26
  - **Blocked By**: Task 12

  **Acceptance Criteria**:

  ```
  Scenario: History entries appear after batch query
    Tool: Playwright (playwright skill)
    Preconditions: Batch query flow works (Task 20)
    Steps:
      1. Perform a batch query: "What is TypeScript?"
      2. Navigate to #/history
      3. Verify entry appears with "What is TypeScript?" text
      4. Verify timestamp shows "just now" or similar
      5. Verify site icons shown for queried sites
      6. Search for "TypeScript" in search bar
      7. Verify entry appears in results
    Expected Result: History captures queries, search works
    Failure Indicators: No entries, search returns nothing
    Evidence: .sisyphus/evidence/task-23-history.png
  ```

  **Commit**: YES
  - Message: `feat(history): add history page with search and listing`
  - Files: `src/pages/HistoryPage.tsx`, `src/components/history/HistoryList.tsx`

---

- [x] 24. Conversation Share/Export (Markdown Popup)

  **What to do**:
  - Implement share button functionality in IframeWrapper (Task 16):
    - Click share button → Send `EXTRACT_CONTENT` message to iframe content script
    - Content script runs content extraction engine (Task 10)
    - Returns Markdown string
  - Create `src/components/share/SharePopup.tsx`:
    - Modal/popup overlay showing extracted Markdown
    - Syntax-highlighted preview of the Markdown content
    - Copy to clipboard button (copies raw Markdown)
    - Download as .md file button
    - Close button
  - Format:
    ```
    **user**: [question text]
    
    **[siteName]**: [response in markdown]
    
    ---
    ```

  **Must NOT do**:
  - Do NOT implement "share to social media" features
  - Do NOT modify the extracted content (preserve as-is from LLM)
  - Do NOT export all iframes at once (per-iframe only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration between extraction engine and UI
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19-23)
  - **Blocks**: None
  - **Blocked By**: Tasks 10, 16

  **Acceptance Criteria**:

  ```
  Scenario: Share button extracts and displays Markdown
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, ChatGPT iframe has a conversation
    Steps:
      1. Open batch-search, wait for ChatGPT iframe
      2. Perform a query (or have existing conversation)
      3. Click share button on ChatGPT iframe wrapper
      4. Verify popup appears with Markdown content
      5. Verify content includes **user**: and **ChatGPT**: sections
      6. Click "Copy to Clipboard"
      7. Verify clipboard contains Markdown text
    Expected Result: Markdown extracted and copyable
    Failure Indicators: Empty popup, extraction fails, clipboard empty
    Evidence: .sisyphus/evidence/task-24-share-export.png
  ```

  **Commit**: YES
  - Message: `feat(share): add per-iframe conversation export as Markdown`
  - Files: `src/components/share/SharePopup.tsx`, `src/components/grid/IframeWrapper.tsx` (updated)

---

- [x] 25. File Upload via Clipboard Paste

  **What to do**:
  - Create `src/components/query/FileUploadButton.tsx`:
    - Button next to query input: "📎 Attach" or drag-and-drop zone
    - Accepts: images (png, jpg, gif), documents (pdf, txt)
    - On file select: Read file as DataTransfer/ClipboardItem
  - Implement paste broadcast:
    - For each enabled iframe: send `INJECT_FILE` message
    - Content script executes `fileUploadHandler.steps` from site config:
      - Focus the input field
      - Wait for focus
      - Simulate paste event with file data (ClipboardEvent + DataTransfer)
    - Different sites handle paste differently — rely on site config steps
  - Also support paste from clipboard:
    - Global Ctrl/Cmd+V in the query input area
    - Read clipboard data and broadcast to all iframes
  - Requires `clipboardRead` permission (already in manifest)

  **Must NOT do**:
  - Do NOT implement native file upload dialog per-iframe
  - Do NOT support files > 10MB
  - Do NOT store uploaded files — transient only

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex clipboard API, DataTransfer simulation, cross-iframe communication
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 26-29)
  - **Blocks**: None
  - **Blocked By**: Tasks 19, 20

  **Acceptance Criteria**:

  ```
  Scenario: File paste reaches all iframes
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded, multiple iframes visible
    Steps:
      1. Click attach button
      2. Select a test image file
      3. Verify paste event dispatched to ChatGPT iframe
      4. Verify paste event dispatched to Gemini iframe
      5. Verify at least one iframe shows file attachment UI
    Expected Result: File broadcast to all iframes
    Failure Indicators: Paste not dispatched, no file UI shown
    Evidence: .sisyphus/evidence/task-25-file-upload.png

  Scenario: Large file rejected gracefully
    Tool: Playwright (playwright skill)
    Steps:
      1. Attempt to attach a file > 10MB
      2. Verify error message shown (not silent failure)
    Expected Result: User-friendly error for oversized files
    Evidence: .sisyphus/evidence/task-25-large-file-error.png
  ```

  **Commit**: YES
  - Message: `feat(upload): implement file upload via clipboard paste to all iframes`
  - Files: `src/components/query/FileUploadButton.tsx`, content script paste handler

---

- [x] 26. History — Click-to-Navigate Past Conversations

  **What to do**:
  - Enhance HistoryPage entries to be clickable:
    - Click entry → Navigate to batch search page
    - For each site in the history entry:
      - If `conversationUrl` exists: Set iframe src to that URL
      - If not: Show the site's default homepage
    - Re-enable the same sites that were active during that query
    - Show the original query in the input bar (read-only or editable)
  - Conversation URL capture:
    - After query injection, monitor iframe URL changes
    - When LLM creates a new conversation (URL changes from / to /c/xxx), capture the new URL
    - Store in history entry's siteResults
  - Use `historyHandler.urlFeature` from site config to detect conversation URLs

  **Must NOT do**:
  - Do NOT cache conversation content
  - Do NOT re-execute the query — just navigate to the URL
  - Do NOT break if conversation was deleted on the LLM site (show "conversation not found" if 404)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: URL monitoring, iframe navigation, storage integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 25, 27-29)
  - **Blocks**: None
  - **Blocked By**: Tasks 20, 23

  **Acceptance Criteria**:

  ```
  Scenario: History entry navigates to past conversation
    Tool: Playwright (playwright skill)
    Preconditions: History has at least one entry with conversation URLs
    Steps:
      1. Navigate to #/history
      2. Click on a history entry
      3. Verify batch-search page loads with the correct iframes
      4. Verify at least one iframe navigates to the conversation URL
      5. Verify the original query shows in the input bar
    Expected Result: Past conversation context restored
    Failure Indicators: Wrong URLs, iframes don't navigate
    Evidence: .sisyphus/evidence/task-26-history-navigate.png
  ```

  **Commit**: YES
  - Message: `feat(history): add click-to-navigate to past conversations`
  - Files: `src/pages/HistoryPage.tsx` (updated), `src/pages/BatchSearchPage.tsx` (updated)

---

- [x] 27. Error Handling UI (CAPTCHA, Load Failure, Timeout)

  **What to do**:
  - Enhance IframeWrapper with comprehensive error states:
    - **Loading timeout** (>15s): "Site is taking too long. [Retry] [Skip]"
    - **CAPTCHA detected**: "Security challenge detected. Please complete it in the iframe or [Open in new tab]"
      - Detection: Monitor iframe for known CAPTCHA selectors (Cloudflare challenge page, Arkose iframe)
      - Inject content script that checks for CAPTCHA indicators and reports back
    - **Connection error**: "Failed to connect to [site]. [Retry]"
    - **Session expired**: "Please log in to [site]. [Open login page]"
      - Detection: iframe loads login page instead of chat interface
  - Create `src/components/ui/ErrorBanner.tsx`:
    - Reusable error/warning banner component
    - Variants: error (red), warning (yellow), info (blue)
    - Optional action button
  - Status indicators per iframe:
    - 🔄 Loading (spinner)
    - ✅ Ready (green dot)
    - ⏳ Querying (pulsing)
    - ❌ Error (red with message)
    - ⚠️ Warning/CAPTCHA (yellow)

  **Must NOT do**:
  - Do NOT auto-solve CAPTCHAs
  - Do NOT hide errors silently
  - Do NOT auto-retry more than once

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Error state UI design
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 25-26, 28-29)
  - **Blocks**: None
  - **Blocked By**: Task 16

  **Acceptance Criteria**:

  ```
  Scenario: CAPTCHA state shows appropriate UI
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Simulate CAPTCHA detection (mock message from content script)
      2. Verify yellow warning banner appears on affected iframe
      3. Verify "Open in new tab" button is present and works
      4. Screenshot
    Expected Result: CAPTCHA state clearly indicated with actionable options
    Failure Indicators: No indication, user doesn't know what to do
    Evidence: .sisyphus/evidence/task-27-captcha-ui.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add comprehensive error handling states for iframes`
  - Files: `src/components/ui/ErrorBanner.tsx`, `src/components/grid/IframeWrapper.tsx` (updated)

---

- [x] 28. z.ai Site Handler Research + Implementation

  **What to do**:
  - Research z.ai (https://chat.z.ai/) DOM structure:
    - Open site in browser, inspect input field selectors
    - Identify: input type (textarea vs contenteditable), send button selector
    - Identify: response container selectors for content extraction
    - Test iframe embedding viability (does it work with DNR rules?)
  - Add z.ai configuration to `public/site-handlers.json`:
    - searchHandler steps based on discovered selectors
    - contentExtractor selectors
    - fileUploadHandler steps
    - historyHandler URL pattern
  - Add z.ai domain to DNR rules in `public/rules.json`
  - Add z.ai to host_permissions in `wxt.config.ts`
  - Test iframe embedding and query injection

  **Must NOT do**:
  - Do NOT guess selectors — must verify by inspecting the actual site
  - Do NOT modify the automation engine for z.ai-specific logic (config-only changes)
  - Do NOT block the release if z.ai doesn't work — mark as experimental

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Research spike with browser inspection and trial-and-error
  - **Skills**: [`playwright`]
    - `playwright`: Needed to inspect z.ai DOM and test selectors

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 25-27, 29)
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 9

  **Acceptance Criteria**:

  ```
  Scenario: z.ai embeds in iframe and accepts query
    Tool: Playwright (playwright skill)
    Preconditions: z.ai config added, DNR rules updated
    Steps:
      1. Enable z.ai in settings
      2. Open batch-search page
      3. Verify z.ai iframe loads
      4. Send a test query
      5. Verify query appears in z.ai input
    Expected Result: z.ai works like other sites
    Failure Indicators: iframe doesn't load, query injection fails
    Evidence: .sisyphus/evidence/task-28-zai.png
  ```

  **Commit**: YES
  - Message: `feat(sites): add z.ai site handler configuration`
  - Files: `public/site-handlers.json` (updated), `public/rules.json` (updated), `wxt.config.ts` (updated)

---

- [x] 29. Omnibox "llmc" Integration

  **What to do**:
  - Enhance background.ts omnibox handler (started in Task 11):
    - `browser.omnibox.onInputChanged`: Show default suggestion "Search with LLM Crosser: {input}"
    - `browser.omnibox.onInputEntered`: 
      - Open batch-search page with query as URL hash parameter: `batch-search.html#/?q=encodeURIComponent(query)`
      - If batch-search tab already open: Focus it and update query
    - `browser.omnibox.setDefaultSuggestion`: Set description text
  - Update BatchSearchPage to read `?q=` from hash params on mount:
    - If query present: Auto-fill input and optionally auto-send
    - Parse with `new URLSearchParams(window.location.hash.split('?')[1])`

  **Must NOT do**:
  - Do NOT auto-send without user confirmation (fill input, let user press Enter)
  - Do NOT register multiple omnibox keywords
  - Do NOT change omnibox keyword from "llmc"

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple API integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 25-28)
  - **Blocks**: None
  - **Blocked By**: Task 11

  **Acceptance Criteria**:

  ```
  Scenario: Omnibox triggers batch search with query
    Tool: Playwright (playwright skill)
    Preconditions: Extension loaded
    Steps:
      1. Click Chrome address bar
      2. Type "llmc " (keyword + space)
      3. Type "explain React hooks"
      4. Press Enter
      5. Verify batch-search page opens
      6. Verify query input contains "explain React hooks"
    Expected Result: Omnibox → batch search with pre-filled query
    Failure Indicators: Nothing happens, wrong page, empty input
    Evidence: .sisyphus/evidence/task-29-omnibox.png
  ```

  **Commit**: YES
  - Message: `feat(omnibox): wire llmc keyword to batch search page`
  - Files: `entrypoints/background.ts` (updated), `src/pages/BatchSearchPage.tsx` (updated)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, load extension, test feature). For each "Must NOT Have": search codebase for forbidden patterns (wildcard DNR rules, `any` types, inline styles, hardcoded selectors in .ts files, console.log) — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `wxt build`. Review all source files for: `as any`/`@ts-ignore`, empty catches, console.log in production, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic variable names (data/result/item/temp). Verify consistent code style. Check bundle size is reasonable.
  Output: `Build [PASS/FAIL] | TypeCheck [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state: Install extension from build output. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: query flow end-to-end, settings persistence, history after queries, share button after conversation. Test edge cases: empty state, 0 sites enabled, all sites enabled, rapid consecutive queries. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes. Verify no API key code, no sidePanel code, no floating ball code exists.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task(s) | Message | Key Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(scaffold): init WXT project` | wxt.config.ts, package.json | `wxt build` |
| 2 | `feat(types): add domain interfaces` | src/types/*.ts | `tsc --noEmit` |
| 3 | `feat(dnr): add iframe embedding rules` | public/rules.json | `wxt build` |
| 4 | `feat(config): add site handlers` | public/site-handlers.json | `wxt build` |
| 5 | `feat(i18n): add locale files` | src/i18n/**, _locales/** | `wxt build` |
| 6 | `feat(ui): configure Tailwind` | tailwind.config.ts | `wxt build` |
| 7 | `feat(poc): validate iframe embedding` | entrypoints/batch-search/** | `wxt build` |
| 8 | `feat(security): frame-busting mitigation` | entrypoints/frame-guard.content.ts | `wxt build` |
| 9 | `feat(engine): automation step executor` | src/lib/automation-engine.ts | `tsc --noEmit` |
| 10 | `feat(extract): content extraction + markdown` | src/lib/content-extractor.ts, html-to-markdown.ts | `tsc --noEmit` |
| 11 | `feat(background): service worker` | entrypoints/background.ts | `wxt build` |
| 12 | `feat(storage): typed storage wrapper` | src/lib/storage.ts, src/hooks/** | `tsc --noEmit` |
| 13-14 | `feat(ui): page layout + sidebar` | src/components/layout/**, src/pages/** | `wxt build` |
| 15-16 | `feat(ui): iframe grid + wrapper` | src/components/grid/** | `wxt build` |
| 17 | `feat(ui): query input bar` | src/components/query/** | `wxt build` |
| 18 | `feat(settings): search engine toggles` | src/pages/SettingsPage.tsx | `wxt build` |
| 19 | `feat(messaging): iframe bridge` | src/lib/messaging.ts | `tsc --noEmit` |
| 20 | `feat(core): batch query flow` | src/pages/BatchSearchPage.tsx | `wxt build` |
| 21 | `feat(settings): prompt templates` | src/components/settings/** | `wxt build` |
| 22 | `feat(i18n): dynamic language switching` | src/i18n/**, components | `wxt build` |
| 23 | `feat(history): history page` | src/pages/HistoryPage.tsx | `wxt build` |
| 24 | `feat(share): markdown export` | src/components/share/** | `wxt build` |
| 25 | `feat(upload): file paste broadcast` | src/components/query/** | `wxt build` |
| 26 | `feat(history): conversation navigation` | src/pages/** | `wxt build` |
| 27 | `feat(ui): error handling states` | src/components/ui/** | `wxt build` |
| 28 | `feat(sites): z.ai handler` | public/site-handlers.json | `wxt build` |
| 29 | `feat(omnibox): llmc keyword` | entrypoints/background.ts | `wxt build` |

---

## Success Criteria

### Verification Commands
```bash
wxt build                    # Expected: Build succeeds with no errors
npx tsc --noEmit             # Expected: No type errors
ls .output/chrome-mv3/       # Expected: manifest.json, rules.json, all entrypoints present
```

### Final Checklist
- [ ] Extension loads in Chrome without errors
- [ ] At least 3 LLM sites embed successfully in iframes
- [ ] User login sessions shared with iframes
- [ ] Batch query injection works for ChatGPT + Gemini + Grok
- [ ] Grid layout switches between 1/2/3/4 columns
- [ ] Settings persist (enabled sites, language, templates)
- [ ] History records queries and supports search
- [ ] History click navigates to past conversations
- [ ] Share button exports conversation as Markdown
- [ ] File paste broadcasts to all iframes
- [ ] Omnibox "llmc" opens batch search with query
- [ ] 7 languages available in settings
- [ ] No `any` types, no hardcoded selectors, no wildcard DNR rules
- [ ] `wxt build` produces clean production build
