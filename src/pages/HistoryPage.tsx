import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHistory } from "@/src/hooks/useHistory";
import { useExportHistory } from "@/src/hooks/useExportHistory";
import { useFloatMode } from "@/src/hooks/useFloatMode";
import { ExportHistoryList } from "@/src/components/history/ExportHistoryList";
import { HistorySearchCard } from "@/src/components/history/HistorySearchCard";
import type { ExportHistoryEntry } from "@/src/types/history";

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16" />
  </svg>
);

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { history, loading: hLoading, clearHistory } = useHistory();
  const {
    exportHistory,
    loading: eLoading,
    deleteEntry,
    clearAll: clearExports,
  } = useExportHistory();
  const { isFloatActive } = useFloatMode();
  const [activeTab, setActiveTab] = useState<"search" | "export">("search");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState<string | null>(null);

  const loading = activeTab === "search" ? hLoading : eLoading;
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === "search") {
      return history.filter((h) => {
        const matchesSearch = !q || h.query.toLowerCase().includes(q);
        const matchesSite = !siteFilter || h.siteResults.some((sr) => sr.siteName === siteFilter);
        return matchesSearch && matchesSite;
      });
    }
    return exportHistory.filter(
      (e) => !q || e.name.toLowerCase().includes(q) || e.content.toLowerCase().includes(q),
    );
  }, [activeTab, history, exportHistory, search, siteFilter]);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNavigate = (id: string) => {
    navigate("/?historyId=" + encodeURIComponent(id));
  };

  if (loading)
    return (
      <div className="p-5 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );

  return (
    <div className="p-5 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text">{t("history.title")}</h1>
        {filtered.length > 0 && (
          <button
            onClick={() =>
              window.confirm(t("history.confirmClear")) &&
              (activeTab === "search" ? clearHistory() : clearExports())
            }
            className="text-xs text-error hover:bg-error/10 px-2 py-1 rounded transition-colors font-medium"
          >
            {t("history.clear")}
          </button>
        )}
      </div>

      <div className="flex bg-surface-secondary p-0.5 rounded-lg mb-4 self-start w-fit">
        {(["search", "export"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSiteFilter(null);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-surface text-text shadow-sm" : "text-text-secondary hover:text-text"}`}
          >
            {t(`history.${tab}Tab`)}
          </button>
        ))}
      </div>

      {siteFilter && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-text-secondary">{t("history.filteredBy")}</span>
          <button
            onClick={() => setSiteFilter(null)}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full border border-primary/20 hover:bg-primary/25 transition-colors"
          >
            {siteFilter}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="relative mb-4 group">
        <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("history.search")}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-secondary text-sm">
          {search || siteFilter
            ? t("history.noResults")
            : t(activeTab === "search" ? "history.empty" : "history.exportEmpty")}
        </div>
      ) : (
        <>
          {activeTab === "search" ? (
            <div className="space-y-2">
              {(filtered as typeof history).map((entry) => (
                <HistorySearchCard
                  key={entry.id}
                  entry={entry}
                  isFloatActive={isFloatActive}
                  siteFilter={siteFilter}
                  onNavigate={handleNavigate}
                  onSiteFilter={setSiteFilter}
                  getRelativeTime={getRelativeTime}
                />
              ))}
            </div>
          ) : (
            <ExportHistoryList
              entries={filtered as ExportHistoryEntry[]}
              expandedId={expandedId}
              copiedId={copiedId}
              onToggleExpand={setExpandedId}
              onCopy={handleCopy}
              onDelete={deleteEntry}
              getRelativeTime={getRelativeTime}
            />
          )}
        </>
      )}
    </div>
  );
}
