export interface SiteResult {
  siteName: string;
  conversationUrl?: string;
  responsePreview?: string;
}

export interface HistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  siteResults: SiteResult[];
}

export type ExportType = "single" | "all";

export interface ExportHistoryEntry {
  id: string;
  name: string;
  siteName: string;
  content: string;
  timestamp: number;
  exportType: ExportType;
}
