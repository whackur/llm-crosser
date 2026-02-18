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
