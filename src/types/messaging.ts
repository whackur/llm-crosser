export type MessageType =
  | "INJECT_QUERY"
  | "INJECT_FILE"
  | "EXTRACT_CONTENT"
  | "QUERY_STATUS"
  | "SITE_READY"
  | "GET_SITE_CONFIG"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "DETACH_BATCH_SEARCH";

export interface InjectQueryMessage {
  type: "INJECT_QUERY";
  siteName: string;
  query: string;
}

export interface InjectFileMessage {
  type: "INJECT_FILE";
  siteName: string;
  fileData: string;
}

export interface ExtractContentMessage {
  type: "EXTRACT_CONTENT";
  siteName: string;
}

export interface QueryStatusMessage {
  type: "QUERY_STATUS";
  siteName: string;
  status: "started" | "completed" | "error";
  error?: string;
}

export interface SiteReadyMessage {
  type: "SITE_READY";
  siteName: string;
}

export interface GetSiteConfigMessage {
  type: "GET_SITE_CONFIG";
  siteName: string;
}

export interface GetSettingsMessage {
  type: "GET_SETTINGS";
}

export interface UpdateSettingsMessage {
  type: "UPDATE_SETTINGS";
  settings: Record<string, unknown>;
}

export interface DetachBatchSearchMessage {
  type: "DETACH_BATCH_SEARCH";
}

export type ExtensionMessage =
  | InjectQueryMessage
  | InjectFileMessage
  | ExtractContentMessage
  | QueryStatusMessage
  | SiteReadyMessage
  | GetSiteConfigMessage
  | GetSettingsMessage
  | UpdateSettingsMessage
  | DetachBatchSearchMessage;
