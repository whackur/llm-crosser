---
globs: ["src/**/*.ts"]
alwaysApply: false
description: "Enforces strict modular code architecture: SRP, no monolithic index.ts, 200 LOC hard limit"
---

<MANDATORY_ARCHITECTURE_RULE severity="BLOCKING" priority="HIGHEST">

# Modular Code Architecture — Zero Tolerance Policy

This rule is NON-NEGOTIABLE. Violations BLOCK all further work until resolved.

## Rule 1: index.ts is an ENTRY POINT, NOT a dumping ground

`index.ts` files MUST ONLY contain:
rules

- Re-exports (`export { ... } from "./module"`)
- Factory function calls that compose modules (e.g., `registerXxxTools(server)`)
- Top-level wiring/registration (MCP server setup, transport connection)

`index.ts` MUST NEVER contain:

- Business logic implementation
- Helper/utility functions
- Type definitions beyond simple re-exports
- Tool handler bodies or parsing logic

**If you find mixed logic in index.ts**: Extract each responsibility into its own dedicated file BEFORE making any other changes. This is not optional.

**Good** (`src/index.ts`):

```typescript
import { registerCompileTools } from "./tools/compile.js";
registerCompileTools(server);
```

**Bad** (`src/index.ts`):

```typescript
server.tool("compile_contract", schema, async ({ path }) => {
  // 50 lines of compilation logic directly in index.ts
});
```

## Rule 2: No Catch-All Files — utils.ts / common.ts are CODE SMELLS

A single `utils.ts`, `helpers.ts`, `common.ts` is a **gravity well** — every unrelated function gets tossed in, and it grows into an untestable, unreviewable blob.

**These file names are BANNED as top-level catch-alls.** Instead:

| Anti-Pattern                                                              | Refactor To                                                              |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `utils.ts` with `checkInstalled()`, `parseJson()`, `formatMarkdown()`     | `tool-checker.ts`, `json-parser.ts`, `markdown-formatter.ts`             |
| `knowledge/index.ts` handling parsing + indexing + searching + formatting | `scwe-parser.ts`, `scwe-index.ts`, `scwe-search.ts`, `scwe-formatter.ts` |
| `tools/common.ts` with 10 shared helpers                                  | One file per logical concern (`cli-executor.ts`, `output-parser.ts`)     |

**Design for reusability from the start.** Each module should be:

- **Independently importable** — no consumer should need to pull in unrelated code
- **Self-contained** — its dependencies are explicit, not buried in a shared grab-bag
- **Nameable by purpose** — the filename alone tells you what it does

If you catch yourself typing `utils.ts` or `common.ts`, STOP and name the file after what it actually does.

## Rule 3: Single Responsibility Principle — ABSOLUTE

Every `.ts` file MUST have exactly ONE clear, nameable responsibility.

**Self-test**: If you cannot describe the file's purpose in ONE short phrase (e.g., "parses SCWE YAML frontmatter", "wraps forge build CLI", "defines vulnerability regex patterns"), the file does too much. Split it.

| Signal                                                            | Action                                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| File has 2+ unrelated exported functions                          | **SPLIT NOW** — each into its own module                                    |
| File mixes I/O (child_process) with pure logic (parsing)          | **SPLIT NOW** — separate CLI execution from output parsing                  |
| File has both types and implementation                            | **SPLIT NOW** — types.ts + implementation.ts                                |
| Tool file contains both MCP registration and heavy business logic | **SPLIT NOW** — `compile.ts` (registration) + `compile-parser.ts` (parsing) |

## Rule 4: 200 LOC Hard Limit — CODE SMELL DETECTOR

Any `.ts` file exceeding **200 lines of code** (excluding data definitions, template literals, and comments) is an **immediate code smell**.

**When you detect a file > 200 LOC**:

1. **STOP** current work
2. **Identify** the multiple responsibilities hiding in the file
3. **Extract** each responsibility into a focused module
4. **Verify** each resulting file is < 200 LOC and has a single purpose
5. **Resume** original work

### Exemptions

These file types are EXEMPT from the 200 LOC limit for their **data content only** — their non-data logic must still be < 200 LOC:

- **Pattern definition files** (`vulnerability-patterns.ts`, `slither-mappings.ts`) where the bulk is static data arrays
- **Style rule files** (`style-rules.ts`) where the bulk is rule definitions with regex patterns
- **Prompt template files** where the bulk is template literal text

### How to Count LOC

**Count these** (= actual logic):

- Import statements
- Variable/constant declarations
- Function/class/interface/type definitions
- Control flow (`if`, `for`, `while`, `switch`, `try/catch`)
- Expressions, assignments, return statements
- Closing braces `}` that belong to logic blocks

**Exclude these** (= not logic):

- Blank lines
- Comment-only lines (`//`, `/* */`, `/** */`)
- Lines inside static data arrays (e.g., `VULNERABILITY_PATTERNS` entries, `SLITHER_SCWE_MAPPINGS` entries)
- Lines inside template literals used as prompt/instruction content

When in doubt, **round up** — err on the side of splitting.

## How to Apply

When reading, writing, or editing ANY `.ts` file in `src/`:

1. **Check the file you're touching** — does it violate any rule above?
2. **If YES** — refactor FIRST, then proceed with your task
3. **If creating a new file** — ensure it has exactly one responsibility and stays under 200 LOC
4. **If adding code to an existing file** — verify the addition doesn't push the file past 200 LOC or add a second responsibility. If it does, extract into a new module.

</MANDATORY_ARCHITECTURE_RULE>
