import { useTranslation } from "react-i18next";
import type { ThemeId } from "@/src/types/settings";

interface ThemeOption {
  id: ThemeId;
  labelKey: string;
  preview: {
    bg: string;
    surface: string;
    primary: string;
    text: string;
  };
}

const THEMES: ThemeOption[] = [
  {
    id: "midnight",
    labelKey: "settings.themeMidnight",
    preview: { bg: "#0a0a0f", surface: "#13131f", primary: "#4f8aff", text: "#e2e2e8" },
  },
  {
    id: "dawn",
    labelKey: "settings.themeDawn",
    preview: { bg: "#f9fafb", surface: "#ffffff", primary: "#4f6df5", text: "#1f2937" },
  },
  {
    id: "ocean",
    labelKey: "settings.themeOcean",
    preview: { bg: "#020617", surface: "#0f172a", primary: "#22d3ee", text: "#e2e8f0" },
  },
  {
    id: "forest",
    labelKey: "settings.themeForest",
    preview: { bg: "#060d06", surface: "#0f1a10", primary: "#4ade80", text: "#dce8dc" },
  },
];

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((theme) => {
        const isSelected = currentTheme === theme.id;

        return (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            type="button"
            className={`group relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? "border-primary/50 bg-surface shadow-sm shadow-primary/10 ring-1 ring-primary/20"
                : "border-border bg-surface/50 hover:border-border/80 hover:bg-surface"
            }`}
          >
            <div
              className="w-full h-16 rounded-lg overflow-hidden border border-black/10 flex"
              style={{ backgroundColor: theme.preview.bg }}
            >
              <div className="w-1/4 h-full" style={{ backgroundColor: theme.preview.surface }} />
              <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-2">
                <div
                  className="w-full h-1.5 rounded-full opacity-40"
                  style={{ backgroundColor: theme.preview.text }}
                />
                <div
                  className="w-3/4 h-1.5 rounded-full opacity-25"
                  style={{ backgroundColor: theme.preview.text }}
                />
                <div
                  className="w-8 h-3 rounded-sm mt-1"
                  style={{ backgroundColor: theme.preview.primary }}
                />
              </div>
            </div>

            <span
              className={`text-sm font-medium transition-colors ${
                isSelected ? "text-primary" : "text-text-secondary group-hover:text-text"
              }`}
            >
              {t(theme.labelKey)}
            </span>

            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
