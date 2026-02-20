import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHistory } from "@/src/hooks/useHistory";
import { useExportHistory } from "@/src/hooks/useExportHistory";
import { useFloatMode } from "@/src/hooks/useFloatMode";
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

const Icon = ({ d, className = "w-4 h-4" }: { d: string; className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
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

  const loading = activeTab === "search" ? hLoading : eLoading;
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === "search")
      return history.filter((h) => !q || h.query.toLowerCase().includes(q));
    return exportHistory.filter(
      (e) => !q || e.name.toLowerCase().includes(q) || e.content.toLowerCase().includes(q),
    );
  }, [activeTab, history, exportHistory, search]);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-surface text-text shadow-sm" : "text-text-secondary hover:text-text"}`}
          >
            {t(`history.${tab}Tab`)}
          </button>
        ))}
      </div>

      <div className="relative mb-4 group">
        <Icon
          d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16"
          className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors"
        />
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
          {search
            ? t("history.noResults")
            : t(activeTab === "search" ? "history.empty" : "history.exportEmpty")}
        </div>
      ) : (
        <div className="space-y-2">
          {activeTab === "search"
            ? (filtered as typeof history).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() =>
                    !isFloatActive && navigate("/?historyId=" + encodeURIComponent(entry.id))
                  }
                  className={`p-3 bg-surface-secondary/50 hover:bg-surface-secondary border border-border/50 rounded-lg transition-all flex justify-between items-center group ${!isFloatActive ? "cursor-pointer" : ""}`}
                >
                  <span className="font-medium text-sm text-text truncate">{entry.query}</span>
                  <span className="text-xs text-text-secondary">
                    {getRelativeTime(entry.timestamp)}
                  </span>
                </div>
              ))
            : (filtered as ExportHistoryEntry[]).map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="p-3 bg-surface-secondary/50 hover:bg-surface-secondary border border-border/50 rounded-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-text truncate">{entry.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-surface rounded text-text-secondary border border-border">
                          {entry.siteName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${entry.exportType === "all" ? "bg-primary/10 text-primary border-primary/20" : "bg-surface text-text-secondary border-border"}`}
                        >
                          {entry.exportType === "all" ? "All" : "Single"}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {getRelativeTime(entry.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleCopy(e, entry.content, entry.id)}
                        className="p-1.5 hover:bg-surface rounded text-text-secondary hover:text-primary transition-colors"
                      >
                        <Icon
                          d={
                            copiedId === entry.id
                              ? "M20 6 9 17l-5-5"
                              : "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"
                          }
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="p-1.5 hover:bg-error/10 rounded text-text-secondary hover:text-error transition-colors"
                      >
                        <Icon d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                      </button>
                      <Icon
                        d="m6 9 6 6 6-6"
                        className={`w-4 h-4 text-text-secondary transition-transform ${expandedId === entry.id ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                  {expandedId === entry.id && (
                    <div className="mt-3 pt-3 border-t border-border/50 text-xs text-text-secondary font-mono whitespace-pre-wrap">
                      {entry.content.length > 200
                        ? `${entry.content.slice(0, 200)}...`
                        : entry.content}
                    </div>
                  )}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
