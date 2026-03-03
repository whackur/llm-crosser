import { useTranslation } from "react-i18next";
import type { SiteConfig } from "@/src/types";

interface SiteToggleSectionProps {
  availableSites: SiteConfig[];
  enabledSites: string[];
  disabledAccessSites: string[];
  onToggle: (siteName: string, isEnabled: boolean) => void;
  onAccessToggle: (siteName: string, isAccessDisabled: boolean) => void;
}

export function SiteToggleSection({
  availableSites,
  enabledSites,
  disabledAccessSites,
  onToggle,
  onAccessToggle,
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
          const isAccessDisabled = disabledAccessSites.includes(site.name);

          return (
            <div
              key={site.name}
              className={`rounded-lg border transition-all duration-200 ${
                isAccessDisabled
                  ? "bg-surface border-border/50"
                  : isEnabled
                    ? "bg-surface border-primary/30 shadow-sm shadow-primary/5"
                    : "bg-surface/50 border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-center justify-between p-3">
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
                  disabled={isAccessDisabled}
                  className={`w-10 h-6 rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 ${
                    isAccessDisabled
                      ? "opacity-40 cursor-not-allowed bg-surface-secondary border border-border"
                      : isEnabled
                        ? "cursor-pointer bg-primary shadow-inner"
                        : "cursor-pointer bg-surface-secondary border border-border"
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

              <div className="px-3 pb-2.5 pt-0">
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-surface-secondary/40 border border-border/30">
                  <div className="flex items-center gap-1.5">
                    <SiteAccessIcon disabled={isAccessDisabled} />
                    <span className="text-[11px] text-text-secondary">
                      {t("settings.siteAccess")}
                    </span>
                  </div>
                  <button
                    onClick={() => onAccessToggle(site.name, !isAccessDisabled)}
                    className={`w-8 h-[18px] rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 cursor-pointer ${
                      isAccessDisabled
                        ? "bg-surface-secondary border border-border"
                        : "bg-primary/80 shadow-inner"
                    }`}
                    type="button"
                    title={
                      isAccessDisabled
                        ? t("settings.siteAccessDisabledTip")
                        : t("settings.siteAccessEnabledTip")
                    }
                    aria-pressed={!isAccessDisabled}
                  >
                    <span
                      className={`absolute top-[2px] left-0 h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isAccessDisabled ? "translate-x-[2px]" : "translate-x-[14px]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SiteAccessIcon({ disabled }: { disabled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${disabled ? "text-text-secondary/50" : "text-primary/70"} transition-colors`}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
