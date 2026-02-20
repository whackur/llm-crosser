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
    <div className="p-5 max-w-4xl mx-auto animate-in fade-in duration-300">
      <h1 className="text-xl font-bold mb-5 text-text">{t("settings.title")}</h1>

      <section className="mb-7">
        <h2 className="text-sm font-semibold mb-1.5 text-text">{t("settings.searchEngines")}</h2>
        <p className="text-xs text-text-secondary mb-4 max-w-2xl">
          {t("settings.searchEnginesDesc")}
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {availableSites.map((site) => {
            const isEnabled = settings?.enabledSites?.includes(site.name) ?? false;

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
                  onClick={() => handleToggle(site.name, !isEnabled)}
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

      <section className="mb-7">
        <h2 className="text-sm font-semibold mb-1.5 text-text">
          {t("settings.defaultExportName")}
        </h2>
        <p className="text-xs text-text-secondary mb-3 max-w-2xl">
          {t("settings.defaultExportNameDesc")}
        </p>
        <input
          type="text"
          value={settings?.defaultExportName ?? ""}
          onChange={(e) => void updateSettings({ defaultExportName: e.target.value })}
          placeholder={t("settings.defaultExportNamePlaceholder")}
          className="w-full max-w-sm px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </section>

      <section className="mb-7">
        <h2 className="text-sm font-semibold mb-1.5 text-text">{t("settings.promptTemplates")}</h2>
        <p className="text-xs text-text-secondary mb-3 max-w-2xl">
          {t("settings.promptTemplatesDesc")}
        </p>
        <div className="mb-3 px-2.5 py-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-text-secondary leading-relaxed max-w-2xl">
          <span className="font-semibold text-primary">{"{query}"}</span>{" "}
          {t("settings.promptTemplatesHint")}
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 shadow-sm">
          <PromptTemplateEditor
            templates={settings?.promptTemplates ?? []}
            onSave={(templates: PromptTemplate[]) =>
              void updateSettings({ promptTemplates: templates })
            }
          />
        </div>
      </section>

      <section className="mb-7">
        <h2 className="text-sm font-semibold mb-1.5 text-text">
          {t("settings.exportAllTemplates")}
        </h2>
        <p className="text-xs text-text-secondary mb-3 max-w-2xl">
          {t("settings.exportAllTemplatesDesc")}
        </p>
        <div className="mb-3 px-2.5 py-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-text-secondary leading-relaxed max-w-2xl">
          <span className="font-semibold text-primary">{"{query}"}</span>{" "}
          {t("settings.exportAllTemplatesHint")}
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 shadow-sm">
          <PromptTemplateEditor
            templates={settings?.exportAllTemplates ?? []}
            onSave={(templates: PromptTemplate[]) =>
              void updateSettings({ exportAllTemplates: templates })
            }
          />
        </div>
      </section>

      <section className="mb-7">
        <h2 className="text-sm font-semibold mb-1.5 text-text">{t("settings.theme")}</h2>
        <p className="text-xs text-text-secondary mb-4 max-w-2xl">{t("settings.themeDesc")}</p>
        <ThemeSelector
          currentTheme={settings?.theme ?? "midnight"}
          onThemeChange={(theme: ThemeId) => {
            void updateSettings({ theme });
          }}
        />
      </section>

      <section className="mb-7">
        <h2 className="text-sm font-semibold mb-1.5 text-text">{t("settings.language")}</h2>
        <p className="text-xs text-text-secondary mb-4 max-w-2xl">{t("settings.languageDesc")}</p>
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

      <div className="pt-4 border-t border-border/30 text-center">
        <p className="text-[11px] text-text-secondary/50">
          LLM Crosser v{browser.runtime.getManifest().version}
        </p>
      </div>
    </div>
  );
}
