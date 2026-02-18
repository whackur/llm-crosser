import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHistory } from "@/src/hooks/useHistory";
import type { HistoryEntry } from "@/src/types/history";

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(timestamp).toLocaleDateString();
}

function HistoryCard({ entry, onClick }: { entry: HistoryEntry; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="p-4 bg-surface rounded-xl border border-border hover:border-primary/30 hover:shadow-md cursor-pointer transition-all mb-3 group animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium truncate min-w-0 text-text group-hover:text-primary transition-colors">
          {entry.query}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-secondary whitespace-nowrap opacity-70">
            {getRelativeTime(entry.timestamp)}
          </span>
          <svg
            className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
          </svg>
        </div>
      </div>
      {entry.siteResults.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {entry.siteResults.map((result) => (
            <span
              key={result.siteName}
              className="px-2 py-1 rounded-md text-xs font-medium bg-surface-secondary text-text-secondary border border-border group-hover:border-primary/20 group-hover:text-primary transition-colors"
            >
              {result.siteName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { history, loading, clearHistory } = useHistory();
  const [searchText, setSearchText] = useState("");

  const filteredEntries = useMemo(() => {
    if (!searchText.trim()) return history;
    const query = searchText.toLowerCase();
    return history.filter((entry) => entry.query.toLowerCase().includes(query));
  }, [history, searchText]);

  const handleClearAll = () => {
    if (window.confirm(t("history.confirmClear"))) {
      void clearHistory();
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="px-12 py-8 mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text">{t("history.title")}</h1>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-error hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-error/10 font-medium"
          >
            {t("history.clear")}
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="relative mb-6 group">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none group-focus-within:text-primary transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("history.search")}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <svg
            className="w-12 h-12 mb-3 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm">
            {searchText.trim() ? t("history.noResults") : t("history.empty")}
          </p>
        </div>
      ) : (
        <div>
          {filteredEntries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onClick={() => navigate("/?q=" + encodeURIComponent(entry.query))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
