import type { UserSettings } from "../types/settings";

export const SETTINGS_KEY = "llm-crosser-settings";
export const HISTORY_KEY = "llm-crosser-history";
export const EXPORT_HISTORY_KEY = "llm-crosser-export-history";

export const DEFAULT_SETTINGS: UserSettings = {
  enabledSites: ["ChatGPT", "Gemini", "Grok"],
  gridLayout: "side-by-side",
  gridColumns: 2,
  language: "en",
  theme: "midnight",
  promptTemplates: [],
  exportAllTemplates: [],
  defaultExportName: "",
  disabledAutomationSites: [],
};
