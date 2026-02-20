import React from "react";
import { useTranslation } from "react-i18next";
import { IssueIcon, StarIcon, DetachIcon, ChevronLeftIcon, ChevronRightIcon } from "../ui/Icons";

function formatStarCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface SidebarFooterProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  stars: number | null;
  isFloatActive: boolean;
  onFloat: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  collapsed,
  onToggleCollapse,
  stars,
  isFloatActive,
  onFloat,
}) => {
  const { t } = useTranslation();
  const itemBase = collapsed ? "justify-center w-12 h-12 mx-auto" : "px-4 py-3";

  return (
    <div
      className={`border-t border-border/50 shrink-0 space-y-1 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}
    >
      {!collapsed && (
        <div className="px-4 pb-2 space-y-1">
          <div className="text-[10px] leading-tight text-text-secondary/40 select-none">
            {t("disclaimer.tos")}
          </div>
          <div className="text-[11px] text-text-secondary/50 select-none">v0.1.0</div>
        </div>
      )}

      <button
        onClick={onFloat}
        disabled={isFloatActive}
        className={`
          flex items-center rounded-lg transition-all duration-200 group
          ${isFloatActive ? "opacity-40 cursor-not-allowed text-text-secondary" : "text-primary hover:bg-primary/10"}
          ${itemBase} ${collapsed ? "" : "w-full"}
        `}
        title={collapsed ? t("nav.floatWindow") : undefined}
        aria-label={t("nav.floatWindow")}
      >
        <DetachIcon
          className={`w-[22px] h-[22px] shrink-0 group-hover:scale-105 transition-transform ${collapsed ? "" : "mr-3"}`}
        />
        {!collapsed && <span className="text-sm whitespace-nowrap">{t("nav.floatWindow")}</span>}
      </button>

      <a
        href="https://github.com/whackur/llm-crosser/stargazers"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex items-center rounded-lg transition-all duration-200 group
          text-amber-500 hover:bg-amber-500/10 hover:text-amber-400
          ${itemBase}
        `}
        title={
          collapsed
            ? stars !== null
              ? `Star us on GitHub! (${formatStarCount(stars)} ⭐)`
              : "Star us on GitHub!"
            : undefined
        }
      >
        <StarIcon
          className={`w-[20px] h-[20px] shrink-0 group-hover:scale-110 transition-transform ${collapsed ? "" : "mr-3"}`}
        />
        {!collapsed && (
          <span className="text-sm whitespace-nowrap font-medium flex-1">Star us!</span>
        )}
        {!collapsed && stars !== null && (
          <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 group-hover:bg-amber-500/25 transition-colors">
            {formatStarCount(stars)}
          </span>
        )}
      </a>

      <a
        href="https://github.com/whackur/llm-crosser/issues/new"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex items-center rounded-lg transition-all duration-200 group
          text-text-secondary hover:bg-surface-secondary hover:text-text
          ${itemBase}
        `}
        title={collapsed ? "Report Issue" : undefined}
      >
        <IssueIcon
          className={`w-[22px] h-[22px] shrink-0 group-hover:scale-105 transition-transform ${collapsed ? "" : "mr-3"}`}
        />
        {!collapsed && <span className="text-sm whitespace-nowrap">Report Issue</span>}
      </a>

      <button
        onClick={onToggleCollapse}
        className={`
          flex items-center rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text
          transition-all duration-200 focus:outline-none
          ${collapsed ? "justify-center w-12 h-12 mx-auto" : "px-4 py-3 w-full"}
        `}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRightIcon className="w-[22px] h-[22px]" />
        ) : (
          <>
            <ChevronLeftIcon className="w-[22px] h-[22px] shrink-0 mr-3" />
            <span className="text-sm whitespace-nowrap">Collapse</span>
          </>
        )}
      </button>
    </div>
  );
};
