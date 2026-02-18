import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { browser } from "wxt/browser";
import { useSettings } from "@/src/hooks/useSettings";
import { PromptTemplateEditor } from "@/src/components/settings/PromptTemplateEditor";
import { ThemeSelector } from "@/src/components/settings/ThemeSelector";
import LanguageSelector from "@/src/components/settings/LanguageSelector";
import type { PromptTemplate, ThemeId } from "@/src/types/settings";

interface SiteConfig {
  name: string;
  url: string;
}

interface SiteHandlersConfig {
  sites: SiteConfig[];
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [availableSites, setAvailableSites] = useState<SiteConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const url = browser.runtime.getURL("/site-handlers.json");
        const response = await fetch(url);
        const data = (await response.json()) as SiteHandlersConfig;
        setAvailableSites(data.sites);
      } catch {
        // Error handling suppressed
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleToggle = async (siteName: string, isEnabled: boolean) => {
    if (!settings) return;

    const currentEnabled = new Set(settings.enabledSites || []);
    if (isEnabled) {
      currentEnabled.add(siteName);
    } else {
      currentEnabled.delete(siteName);
    }

    await updateSettings({
      enabledSites: Array.from(currentEnabled),
    });
  };

  if (settingsLoading || configLoading) {
    return <div className="p-6">{t("batch.loading")}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold mb-8 text-text">{t("settings.title")}</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2 text-text">{t("settings.searchEngines")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-2xl">
          {t("settings.searchEnginesDesc")}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {availableSites.map((site) => {
            const isEnabled = settings?.enabledSites?.includes(site.name) ?? false;

            return (
              <div
                key={site.name}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isEnabled
                    ? "bg-surface border-primary/30 shadow-sm shadow-primary/5"
                    : "bg-surface/50 border-border hover:border-border/80"
                }`}
              >
                <div className="min-w-0 pr-4">
                  <div
                    className={`font-medium truncate ${isEnabled ? "text-text" : "text-text-secondary"}`}
                  >
                    {site.name}
                  </div>
                  <div className="text-xs text-text-secondary truncate opacity-70">{site.url}</div>
                </div>

                <button
                  onClick={() => handleToggle(site.name, !isEnabled)}
                  className={`w-12 h-7 rounded-full relative transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 cursor-pointer ${
                    isEnabled
                      ? "bg-primary shadow-inner"
                      : "bg-surface-secondary border border-border"
                  }`}
                  type="button"
                  aria-pressed={isEnabled}
                >
                  <span
                    className={`absolute top-1 left-0 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2 text-text">{t("settings.promptTemplates")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-2xl">
          {t("settings.promptTemplatesDesc")}
        </p>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <PromptTemplateEditor
            templates={settings?.promptTemplates ?? []}
            onSave={(templates: PromptTemplate[]) =>
              void updateSettings({ promptTemplates: templates })
            }
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2 text-text">{t("settings.theme")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-2xl">{t("settings.themeDesc")}</p>
        <div>
          <ThemeSelector
            currentTheme={settings?.theme ?? "midnight"}
            onThemeChange={(theme: ThemeId) => {
              void updateSettings({ theme });
            }}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2 text-text">{t("settings.language")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-2xl">{t("settings.languageDesc")}</p>
        <div className="max-w-xs">
          <LanguageSelector
            currentLanguage={settings?.language ?? "en"}
            onLanguageChange={(lang) => {
              void updateSettings({
                language: lang as "en" | "ko" | "ja" | "zh" | "pt" | "ru" | "fr",
              });
              void import("i18next").then((i18n) => i18n.default.changeLanguage(lang));
            }}
          />
        </div>
      </section>
    </div>
  );
}
