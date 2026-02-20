import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Link } from "react-router-dom";
import { SearchIcon, SettingsIcon, HistoryIcon, NewChatIcon } from "../ui/Icons";
import { useGitHubStars } from "@/src/hooks/useGitHubStars";
import { useFloatMode } from "@/src/hooks/useFloatMode";
import { SidebarFooter } from "./SidebarFooter";

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
  const stars = useGitHubStars();
  const { isFloatActive } = useFloatMode();

  const handleFloat = () => {
    void chrome.runtime.sendMessage({ type: "DETACH_BATCH_SEARCH" });
  };

  const itemBase = collapsed ? "justify-center w-12 h-12 mx-auto" : "px-4 py-3";

  return (
    <aside
      className={`
        flex flex-col h-full bg-surface border-r border-border 
        transition-all duration-300 ease-in-out z-20
        ${collapsed ? "w-[72px]" : "w-64"}
      `}
    >
      <Link
        to="/?reset=true"
        className={`flex items-center h-14 border-b border-border/50 shrink-0 cursor-pointer hover:bg-surface-secondary/50 transition-colors ${collapsed ? "justify-center" : "px-5"}`}
        title="LLM Crosser"
      >
        <img
          src="/icons/icon-48.png"
          alt="LLM Crosser"
          className={`shrink-0 transition-all duration-300 ${collapsed ? "w-7 h-7" : "w-6 h-6 mr-2.5"}`}
        />
        {!collapsed && (
          <span className="font-bold text-primary text-base tracking-tight">LLM Crosser</span>
        )}
      </Link>

      <div className={`shrink-0 pt-3 pb-1 ${collapsed ? "px-2" : "px-3"}`}>
        <Link
          to="/?reset=true"
          className={`
            flex items-center rounded-lg transition-all duration-200 group
            bg-primary/10 text-primary hover:bg-primary/20 font-medium
            ${itemBase}
          `}
          title={collapsed ? t("nav.newChat") : undefined}
        >
          <NewChatIcon
            className={`w-[22px] h-[22px] shrink-0 group-hover:scale-105 transition-transform ${collapsed ? "" : "mr-3"}`}
          />
          {!collapsed && <span className="text-sm whitespace-nowrap">{t("nav.newChat")}</span>}
        </Link>
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

      <SidebarFooter
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        stars={stars}
        isFloatActive={isFloatActive}
        onFloat={handleFloat}
      />
    </aside>
  );
};
