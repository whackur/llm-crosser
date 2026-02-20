import React from "react";
import { useTranslation } from "react-i18next";
import type { GridLayout } from "@/src/types/settings";

interface IframeGridProps {
  layout: GridLayout;
  columns: 1 | 2 | 3 | 4;
  onLayoutChange: (layout: GridLayout) => void;
  onColumnsChange: (columns: 1 | 2 | 3 | 4) => void;
  onShareAll?: () => void;
  sites: Array<{ name: string; url: string; enabled: boolean }>;
  renderIframe: (site: { name: string; url: string }) => React.ReactNode;
  headerSlot?: React.ReactNode;
}

export const IframeGrid: React.FC<IframeGridProps> = ({
  layout,
  columns,
  onLayoutChange,
  onColumnsChange,
  onShareAll,
  sites,
  renderIframe,
  headerSlot,
}) => {
  const { t } = useTranslation();
  const enabledSites = sites.filter((site) => site.enabled);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border bg-surface/50 backdrop-blur-sm">
        {headerSlot && <div className="flex items-center gap-1.5 shrink-0">{headerSlot}</div>}
        <div className="flex-1" />
        <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-0.5">
          <button
            onClick={() => onLayoutChange("side-by-side")}
            className={`
              w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer
              ${
                layout === "side-by-side"
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-text-secondary hover:bg-border hover:text-text"
              }
            `}
            title="Side by side"
            aria-label="Side by side layout"
          >
            <SideBySideIcon />
          </button>
          <button
            onClick={() => onLayoutChange("grid")}
            className={`
              w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer
              ${
                layout === "grid"
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-text-secondary hover:bg-border hover:text-text"
              }
            `}
            title="Grid"
            aria-label="Grid layout"
          >
            <GridLayoutIcon />
          </button>
        </div>

        {layout === "grid" && (
          <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-0.5">
            {([1, 2, 3, 4] as const).map((col) => (
              <button
                key={col}
                onClick={() => onColumnsChange(col)}
                className={`
                  w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer
                  ${
                    columns === col
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-text-secondary hover:bg-border hover:text-text"
                  }
                `}
                title={`${col} column${col > 1 ? "s" : ""}`}
                aria-label={`Set grid to ${col} column${col > 1 ? "s" : ""}`}
              >
                <ColumnIcon columns={col} />
              </button>
            ))}
          </div>
        )}

        {onShareAll && enabledSites.length > 0 && (
          <button
            onClick={onShareAll}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            title={t("share.exportAll")}
            aria-label={t("share.exportAll")}
          >
            <ExportAllIcon />
            <span className="hidden sm:inline">{t("share.exportAll")}</span>
          </button>
        )}
      </div>

      {enabledSites.length === 0 ? (
        <EmptyState message={t("batch.noSitesEnabled")} />
      ) : layout === "side-by-side" ? (
        <div className="flex flex-1 min-h-0 overflow-x-auto gap-2 p-2">
          {enabledSites.map((site) => (
            <div
              key={site.name}
              className="min-h-0 h-full overflow-hidden relative bg-surface rounded-lg border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/20 shrink-0"
              style={{ width: `max(320px, ${100 / enabledSites.length}%)` }}
            >
              {renderIframe(site)}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`
            grid gap-2 flex-1 min-h-0 overflow-hidden p-2
            ${columns === 1 ? "grid-cols-1" : ""}
            ${columns === 2 ? "grid-cols-2" : ""}
            ${columns === 3 ? "grid-cols-3" : ""}
            ${columns === 4 ? "grid-cols-4" : ""}
          `}
        >
          {enabledSites.map((site) => (
            <div
              key={site.name}
              className="min-h-0 overflow-hidden relative bg-surface rounded-lg border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              {renderIframe(site)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center">
    <div className="w-20 h-20 bg-surface-secondary/50 rounded-full flex items-center justify-center mb-6 border border-border/50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-text mb-2">No sites enabled</h3>
    <p className="text-sm max-w-xs mx-auto opacity-70">{message}</p>
  </div>
);

const ExportAllIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const SideBySideIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="4" height="14" rx="1" opacity="0.9" />
    <rect x="6" y="1" width="4" height="14" rx="1" opacity="0.9" />
    <rect x="11" y="1" width="4" height="14" rx="1" opacity="0.9" />
  </svg>
);

const GridLayoutIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="6" height="6" rx="1" opacity="0.9" />
    <rect x="9" y="1" width="6" height="6" rx="1" opacity="0.9" />
    <rect x="1" y="9" width="6" height="6" rx="1" opacity="0.9" />
    <rect x="9" y="9" width="6" height="6" rx="1" opacity="0.9" />
  </svg>
);

const ColumnIcon: React.FC<{ columns: 1 | 2 | 3 | 4 }> = ({ columns }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {columns === 1 && <rect x="2" y="2" width="12" height="12" rx="1" opacity="0.9" />}
    {columns === 2 && (
      <>
        <rect x="1" y="2" width="6" height="12" rx="1" opacity="0.9" />
        <rect x="9" y="2" width="6" height="12" rx="1" opacity="0.9" />
      </>
    )}
    {columns === 3 && (
      <>
        <rect x="0.5" y="2" width="4" height="12" rx="0.5" opacity="0.9" />
        <rect x="6" y="2" width="4" height="12" rx="0.5" opacity="0.9" />
        <rect x="11.5" y="2" width="4" height="12" rx="0.5" opacity="0.9" />
      </>
    )}
    {columns === 4 && (
      <>
        <rect x="0" y="2" width="3" height="12" rx="0.5" opacity="0.9" />
        <rect x="4.33" y="2" width="3" height="12" rx="0.5" opacity="0.9" />
        <rect x="8.66" y="2" width="3" height="12" rx="0.5" opacity="0.9" />
        <rect x="13" y="2" width="3" height="12" rx="0.5" opacity="0.9" />
      </>
    )}
  </svg>
);
