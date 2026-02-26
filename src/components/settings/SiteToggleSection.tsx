import { useTranslation } from "react-i18next";
import type { SiteConfig } from "@/src/types";

interface SiteToggleSectionProps {
  availableSites: SiteConfig[];
  enabledSites: string[];
  disabledAutomationSites: string[];
  onToggle: (siteName: string, isEnabled: boolean) => void;
  onAutomationToggle: (siteName: string, isDisabled: boolean) => void;
}

export function SiteToggleSection({
  availableSites,
  enabledSites,
  disabledAutomationSites,
  onToggle,
  onAutomationToggle,
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
          const isAutomationDisabled = disabledAutomationSites.includes(site.name);

          return (
            <div
              key={site.name}
              className={`rounded-lg border transition-all duration-200 ${
                isEnabled
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

              {isEnabled && (
                <div className="px-3 pb-2.5 pt-0">
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-surface-secondary/40 border border-border/30">
                    <div className="flex items-center gap-1.5">
                      <AutomationIcon disabled={isAutomationDisabled} />
                      <span className="text-[11px] text-text-secondary">
                        {t("settings.automation")}
                      </span>
                    </div>
                    <button
                      onClick={() => onAutomationToggle(site.name, !isAutomationDisabled)}
                      className={`w-8 h-[18px] rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 cursor-pointer ${
                        isAutomationDisabled
                          ? "bg-surface-secondary border border-border"
                          : "bg-primary/80 shadow-inner"
                      }`}
                      type="button"
                      title={
                        isAutomationDisabled
                          ? t("settings.automationDisabledTip")
                          : t("settings.automationEnabledTip")
                      }
                      aria-pressed={!isAutomationDisabled}
                    >
                      <span
                        className={`absolute top-[2px] left-0 h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          isAutomationDisabled ? "translate-x-[2px]" : "translate-x-[14px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AutomationIcon({ disabled }: { disabled: boolean }) {
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
