import { useTranslation } from "react-i18next";
import type { SiteConfig } from "@/src/types";

interface SiteToggleSectionProps {
  availableSites: SiteConfig[];
  enabledSites: string[];
  onToggle: (siteName: string, isEnabled: boolean) => void;
}

export function SiteToggleSection({
  availableSites,
  enabledSites,
  onToggle,
}: SiteToggleSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="mb-7">
      <h2 className="text-sm font-semibold mb-1.5 text-text">{t("settings.searchEngines")}</h2>
      <p className="text-xs text-text-secondary mb-4 max-w-2xl">
        {t("settings.searchEnginesDesc")}
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {availableSites.map((site) => {
          const isEnabled = enabledSites.includes(site.name);

          return (
            <div
              key={site.name}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                isEnabled
                  ? "bg-surface border-primary/30 shadow-sm shadow-primary/5"
                  : "bg-surface/50 border-border hover:border-border/80"
              }`}
            >
              <div className="min-w-0 pr-3">
                <div
                  className={`text-sm font-medium truncate ${isEnabled ? "text-text" : "text-text-secondary"}`}
                >
                  {site.name}
                </div>
                <div className="text-[11px] text-text-secondary truncate opacity-70">
                  {site.url}
                </div>
              </div>

              <button
                onClick={() => onToggle(site.name, !isEnabled)}
                className={`w-10 h-6 rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 cursor-pointer ${
                  isEnabled
                    ? "bg-primary shadow-inner"
                    : "bg-surface-secondary border border-border"
                }`}
                type="button"
                aria-pressed={isEnabled}
              >
                <span
                  className={`absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
