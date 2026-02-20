import { useState } from "react";

interface SiteInfo {
  name: string;
  url: string;
}

interface ActiveSitesBarProps {
  sites: SiteInfo[];
  enabledSites: string[];
  onToggle: (siteName: string, enabled: boolean) => void;
}

const SITE_COLORS: Record<string, string> = {
  ChatGPT: "#10a37f",
  Gemini: "#4285f4",
  Grok: "#1d9bf0",
  Perplexity: "#20808d",
  Qwen: "#6236ff",
  "Z.ai": "#f97316",
};

function getFaviconUrl(siteUrl: string): string {
  try {
    const hostname = new URL(siteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return "";
  }
}

function getSiteColor(name: string): string {
  return SITE_COLORS[name] ?? "#6b7280";
}

interface SiteIconProps {
  site: SiteInfo;
  enabled: boolean;
  onToggle: () => void;
}

function SiteIcon({ site, enabled, onToggle }: SiteIconProps) {
  const [imgError, setImgError] = useState(false);
  const faviconUrl = getFaviconUrl(site.url);
  const color = getSiteColor(site.name);

  return (
    <button
      onClick={onToggle}
      title={`${site.name} — ${enabled ? "ON" : "OFF"}`}
      className={`
        w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer
        ${
          enabled
            ? "bg-surface border border-primary/40 shadow-sm shadow-primary/10"
            : "bg-surface-secondary/50 border border-border/30 opacity-40 grayscale"
        }
      `}
    >
      {faviconUrl && !imgError ? (
        <img
          src={faviconUrl}
          alt={site.name}
          className="w-4 h-4 rounded-sm"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {site.name[0]}
        </span>
      )}
    </button>
  );
}

export function ActiveSitesBar({ sites, enabledSites, onToggle }: ActiveSitesBarProps) {
  if (sites.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/30 bg-surface-secondary/30 shrink-0">
      {sites.map((site) => (
        <SiteIcon
          key={site.name}
          site={site}
          enabled={enabledSites.includes(site.name)}
          onToggle={() => onToggle(site.name, !enabledSites.includes(site.name))}
        />
      ))}
    </div>
  );
}
