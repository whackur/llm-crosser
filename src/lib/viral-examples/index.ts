export { VIRAL_CATEGORIES } from "./categories";
export { VIRAL_EXAMPLE_DEFS } from "./example-defs";
export { loadQueries, getQueriesSync, en as enQueries } from "./queries";
export type { ViralCategory, ViralExample, ViralExampleDef, LocalizedQueries } from "./types";

import type { ViralExample } from "./types";
import { VIRAL_EXAMPLE_DEFS } from "./example-defs";
import { getQueriesSync, loadQueries } from "./queries";

export function getRandomExample(lang: string): ViralExample {
  const index = Math.floor(Math.random() * VIRAL_EXAMPLE_DEFS.length);
  const def = VIRAL_EXAMPLE_DEFS[index] ?? VIRAL_EXAMPLE_DEFS[0]!;
  const queries = getQueriesSync(lang);
  const query = queries[def.queryKey] ?? "";

  return { query, categoryId: def.categoryId };
}

export async function preloadQueries(lang: string): Promise<void> {
  await loadQueries(lang);
}
