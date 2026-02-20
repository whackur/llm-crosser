import { useEffect } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/src/hooks/useSettings";
import { useTheme } from "@/src/hooks/useTheme";
import { useGitHubStars } from "@/src/hooks/useGitHubStars";
import { i18n } from "@/src/i18n";
import {
  SearchIcon,
  HistoryIcon,
  SettingsIcon,
  StarIcon,
  IssueIcon,
} from "@/src/components/ui/Icons";
import SidepanelHome from "./SidepanelHome";

export function SidepanelLayout() {
  const { settings } = useSettings();
  const location = useLocation();
  const { t } = useTranslation();
  const stars = useGitHubStars();

  useTheme(settings?.theme);

  useEffect(() => {
    if (settings?.language) {
      void i18n.changeLanguage(settings.language);
    }
  }, [settings?.language]);

  if (!settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col h-screen bg-surface text-text overflow-hidden">
      <header className="h-11 px-3 flex items-center border-b border-border/50 shrink-0">
        <img src="/icons/icon-48.png" alt="Logo" className="w-5 h-5" />
        <span className="ml-2 font-bold text-primary text-sm">LLM Crosser</span>
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        {isHome ? <SidepanelHome /> : <Outlet />}
      </main>

      <div className="px-3 py-2 border-t border-border/30 shrink-0 space-y-1.5">
        <p className="text-[10px] leading-tight text-text-secondary/40 select-none">
          {t("disclaimer.tos")}
        </p>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/whackur/llm-crosser/stargazers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <StarIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">
              Star{stars !== null ? ` (${stars})` : ""}
            </span>
          </a>
          <span className="text-border">·</span>
          <a
            href="https://github.com/whackur/llm-crosser/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-text-secondary hover:text-text transition-colors"
          >
            <IssueIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Issue</span>
          </a>
        </div>
      </div>

      <nav className="h-14 border-t border-border bg-surface flex flex-row shrink-0">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive ? "text-primary bg-primary/10" : "text-text-secondary hover:text-text"
            }`
          }
        >
          <SearchIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t("nav.batchSearch")}</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive ? "text-primary bg-primary/10" : "text-text-secondary hover:text-text"
            }`
          }
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t("nav.history")}</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive ? "text-primary bg-primary/10" : "text-text-secondary hover:text-text"
            }`
          }
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t("nav.settings")}</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default SidepanelLayout;
