import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
  SearchIcon,
  SettingsIcon,
  HistoryIcon,
  IssueIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../ui/Icons";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", labelKey: "nav.batchSearch", icon: SearchIcon },
  { path: "/history", labelKey: "nav.history", icon: HistoryIcon },
  { path: "/settings", labelKey: "nav.settings", icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { t } = useTranslation();

  const itemBase = collapsed ? "justify-center w-12 h-12 mx-auto" : "px-4 py-3";

  return (
    <aside
      className={`
        flex flex-col h-full bg-surface border-r border-border 
        transition-all duration-300 ease-in-out z-20
        ${collapsed ? "w-[72px]" : "w-64"}
      `}
    >
      <div
        className={`flex items-center h-14 border-b border-border/50 shrink-0 ${collapsed ? "justify-center" : "px-5"}`}
      >
        <img
          src="/icons/icon-48.png"
          alt="LLM Crosser"
          className={`shrink-0 transition-all duration-300 ${collapsed ? "w-7 h-7" : "w-6 h-6 mr-2.5"}`}
        />
        {!collapsed && (
          <span className="font-bold text-primary text-base tracking-tight">LLM Crosser</span>
        )}
      </div>

      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 ${collapsed ? "px-2" : "px-3"}`}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center rounded-lg transition-all duration-200 group
              ${itemBase}
              ${
                isActive
                  ? "bg-primary/15 text-primary font-medium shadow-sm shadow-primary/5"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text"
              }
            `}
            title={collapsed ? t(item.labelKey) : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-[22px] h-[22px] shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"} ${collapsed ? "" : "mr-3"}`}
                />
                {!collapsed && (
                  <span className="text-sm whitespace-nowrap">{t(item.labelKey)}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

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
    </aside>
  );
};
