import type { LocalizedQueries } from "../types";
import { queries as en } from "./en";

const lazyLoaders: Record<string, () => Promise<{ queries: LocalizedQueries }>> = {
  ko: () => import("./ko"),
  ja: () => import("./ja"),
  zh: () => import("./zh"),
  pt: () => import("./pt"),
  ru: () => import("./ru"),
  fr: () => import("./fr"),
};

const queryCache = new Map<string, LocalizedQueries>();
queryCache.set("en", en);

export async function loadQueries(lang: string): Promise<LocalizedQueries> {
  const cached = queryCache.get(lang);
  if (cached) return cached;

  const loader = lazyLoaders[lang];
  if (!loader) return en;

  const mod = await loader();
  queryCache.set(lang, mod.queries);
  return mod.queries;
}

export function getQueriesSync(lang: string): LocalizedQueries {
  return queryCache.get(lang) ?? en;
}

export { en };
