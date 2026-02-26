export type LanguageCode = "en" | "ko" | "ja" | "zh" | "pt" | "ru" | "fr";

export type GridLayout = "side-by-side" | "grid";

export type ThemeId = "midnight" | "dawn" | "ocean" | "forest" | "rose" | "mint";

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  order: number;
}

export interface UserSettings {
  enabledSites: string[];
  gridLayout: GridLayout;
  gridColumns: 1 | 2 | 3 | 4;
  language: LanguageCode;
  theme: ThemeId;
  promptTemplates: PromptTemplate[];
  exportAllTemplates: PromptTemplate[];
  defaultExportName: string;
  disabledAutomationSites: string[];
}
