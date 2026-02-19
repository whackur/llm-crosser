import { useState, useEffect } from "react";

const REPO = "whackur/llm-crosser";
const CACHE_KEY = "llm-crosser-github-stars";
const CACHE_TTL_12H_MS = 12 * 60 * 60 * 1000;

interface StarCache {
  stars: number;
  fetchedAt: number;
}

async function fetchStarCount(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count: number };
    return data.stargazers_count;
  } catch {
    return null;
  }
}

async function loadFromCache(): Promise<StarCache | null> {
  const result = await chrome.storage.local.get(CACHE_KEY);
  const cached = result[CACHE_KEY] as StarCache | undefined;
  if (!cached) return null;
  return cached;
}

async function saveToCache(stars: number): Promise<void> {
  const cache: StarCache = { stars, fetchedAt: Date.now() };
  await chrome.storage.local.set({ [CACHE_KEY]: cache });
}

export function useGitHubStars(): number | null {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = await loadFromCache();
      const isStale = !cached || Date.now() - cached.fetchedAt > CACHE_TTL_12H_MS;

      if (cached && !cancelled) {
        setStars(cached.stars);
      }

      if (isStale) {
        const fresh = await fetchStarCount();
        if (fresh !== null && !cancelled) {
          setStars(fresh);
          await saveToCache(fresh);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stars;
}
