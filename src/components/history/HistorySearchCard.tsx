import type { HistoryEntry } from "@/src/types/history";

interface HistorySearchCardProps {
  entry: HistoryEntry;
  isFloatActive: boolean;
  siteFilter: string | null;
  onNavigate: (id: string) => void;
  onSiteFilter: (siteName: string | null) => void;
  getRelativeTime: (timestamp: number) => string;
}

export function HistorySearchCard({
  entry,
  isFloatActive,
  siteFilter,
  onNavigate,
  onSiteFilter,
  getRelativeTime,
}: HistorySearchCardProps) {
  return (
    <div
      onClick={() => !isFloatActive && onNavigate(entry.id)}
      className={`p-3 bg-surface-secondary/50 hover:bg-surface-secondary border border-border/50 rounded-lg transition-all group ${!isFloatActive ? "cursor-pointer" : ""}`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-medium text-sm text-text truncate flex-1">{entry.query}</span>
        <span
          className="text-xs text-text-secondary whitespace-nowrap"
          title={new Date(entry.timestamp).toLocaleString()}
        >
          {getRelativeTime(entry.timestamp)}
        </span>
      </div>
      {entry.siteResults.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {entry.siteResults.map((sr) => (
            <button
              key={sr.siteName}
              onClick={(e) => {
                e.stopPropagation();
                onSiteFilter(siteFilter === sr.siteName ? null : sr.siteName);
              }}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                siteFilter === sr.siteName
                  ? "bg-primary/20 text-primary border-primary/30"
                  : sr.conversationUrl
                    ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                    : "bg-surface text-text-secondary border-border hover:bg-surface-secondary"
              }`}
            >
              {sr.siteName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
