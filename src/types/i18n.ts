export interface TranslationKeys {
  common: {
    appName: string;
    settings: string;
    close: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
  };
  popup: {
    title: string;
    query: string;
    submit: string;
    selectSites: string;
    noSitesSelected: string;
    loading: string;
    error: string;
  };
  settings: {
    title: string;
    language: string;
    gridColumns: string;
    enabledSites: string;
    promptTemplates: string;
    addTemplate: string;
    templateName: string;
    templateContent: string;
  };
  history: {
    title: string;
    noHistory: string;
    clearHistory: string;
    confirmClear: string;
    query: string;
    timestamp: string;
    results: string;
  };
  errors: {
    loadingFailed: string;
    savingFailed: string;
    invalidInput: string;
    networkError: string;
  };
}
