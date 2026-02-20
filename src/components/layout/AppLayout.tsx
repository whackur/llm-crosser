import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BatchSearchPage from "@/src/pages/BatchSearchPage";
import { useSettings } from "@/src/hooks/useSettings";
import { useTheme } from "@/src/hooks/useTheme";
import { i18n } from "@/src/i18n";

export default function AppLayout() {
  const { settings } = useSettings();
  const location = useLocation();
  useTheme(settings?.theme);

  const isBatchSearch = location.pathname === "/";

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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface">
      {isBatchSearch ? (
        <BatchSearchPage />
      ) : (
        <>
          <header className="h-11 px-3 flex items-center border-b border-border/50 shrink-0">
            <img src="/icons/icon-48.png" alt="LLM Crosser" className="w-5 h-5" />
            <span className="ml-2 font-bold text-primary text-sm">LLM Crosser</span>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
          </main>
        </>
      )}
    </div>
  );
}
