import type { ExportHistoryEntry } from "@/src/types/history";

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

interface ExportHistoryListProps {
  entries: ExportHistoryEntry[];
  expandedId: string | null;
  copiedId: string | null;
  onToggleExpand: (id: string | null) => void;
  onCopy: (e: React.MouseEvent, text: string, id: string) => void;
  onDelete: (id: string) => void;
  getRelativeTime: (timestamp: number) => string;
}

export function ExportHistoryList({
  entries,
  expandedId,
  copiedId,
  onToggleExpand,
  onCopy,
  onDelete,
  getRelativeTime,
}: ExportHistoryListProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onToggleExpand(expandedId === entry.id ? null : entry.id)}
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
              <div className="text-xs text-text-secondary">{getRelativeTime(entry.timestamp)}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => onCopy(e, entry.content, entry.id)}
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
                  onDelete(entry.id);
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
              {entry.content.length > 200 ? `${entry.content.slice(0, 200)}...` : entry.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
