import { useTranslation } from "react-i18next";
import { browser } from "wxt/browser";
import { useSettings } from "@/src/hooks/useSettings";
import { useSiteConfig } from "@/src/hooks/useSiteConfig";
import { SiteToggleSection } from "@/src/components/settings/SiteToggleSection";
import { PromptTemplateEditor } from "@/src/components/settings/PromptTemplateEditor";
import { ThemeSelector } from "@/src/components/settings/ThemeSelector";
import LanguageSelector from "@/src/components/settings/LanguageSelector";
import type { PromptTemplate, ThemeId } from "@/src/types/settings";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { siteConfigs, loading: configLoading } = useSiteConfig();

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

      <SiteToggleSection
        availableSites={siteConfigs}
        enabledSites={settings?.enabledSites ?? []}
        onToggle={handleToggle}
      />

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
