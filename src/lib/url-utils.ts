/**
 * Normalizes a hostname by lowercasing and removing www. prefix.
 */
export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Checks if two hosts match (exact or subdomain relationship).
 */
export function matchesHost(hostA: string, hostB: string): boolean {
  const a = normalizeHostname(hostA);
  const b = normalizeHostname(hostB);
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}
