/**
 * Site configuration types for LLM Crosser
 * Defines the structure of site handlers and their automation steps
 */

export type SearchActionType =
  | "focus"
  | "setValue"
  | "triggerEvents"
  | "click"
  | "wait"
  | "sendKeys"
  | "paste"
  | "custom";

export type InputType = "contenteditable" | "angular" | "special";

export interface SearchStep {
  action: SearchActionType;
  selector?: string | string[];
  inputType?: InputType;
  events?: string[];
  keys?: string;
  duration?: number;
  maxAttempts?: number;
  retryInterval?: number;
  waitForElement?: boolean;
  retryOnDisabled?: boolean;
  description?: string;
  customAction?: string;
  customSetValue?: string;
}

export interface UrlExtractor {
  alternateLinkSelector?: string;
  urlPattern?: string;
  removeParams?: string[];
}

export interface ContentExtractor {
  messageContainer?: string;
  contentSelectors?: string[];
  selectors?: string[];
  excludeSelectors?: string[];
  thinkingSelector?: string;
  extractThinking?: boolean;
  thinkingBlockFilters?: string[];
  fallbackSelectors?: string[];
  urlExtractor?: UrlExtractor;
  userMessageSelector?: string;
  editModeCheck?: string;
}

export interface SearchHandler {
  steps: SearchStep[];
}

export interface FileUploadHandler {
  steps: SearchStep[];
}

export interface HistoryHandler {
  urlFeature: string;
}

export interface UserPromptButton {
  containerSelector: string;
  textSelector: string;
}

export interface SiteConfig {
  name: string;
  url: string;
  enabled: boolean;
  supportUrlQuery: boolean;
  region: string;
  hidden: boolean;
  supportIframe: boolean;
  note: string;
  searchHandler: SearchHandler;
  fileUploadHandler?: FileUploadHandler;
  contentExtractor: ContentExtractor;
  historyHandler?: HistoryHandler;
  userPromptButton?: UserPromptButton;
}

export interface SiteHandlersConfig {
  version: string;
  lastUpdated?: string;
  description?: string;
  author?: string;
  sites: SiteConfig[];
}
