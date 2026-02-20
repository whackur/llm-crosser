import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { FloatModePlaceholder } from "./FloatModePlaceholder";
import BatchSearchPage from "@/src/pages/BatchSearchPage";
import { useSettings } from "@/src/hooks/useSettings";
import { useFloatMode } from "@/src/hooks/useFloatMode";
import { useTheme } from "@/src/hooks/useTheme";
import { i18n } from "@/src/i18n";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { settings } = useSettings();
  const { isPopupWindow, isFloatActive, loading: floatLoading } = useFloatMode();
  const location = useLocation();
  useTheme(settings?.theme);

  const isBatchSearch = location.pathname === "/";

  useEffect(() => {
    if (settings?.language) {
      void i18n.changeLanguage(settings.language);
    }
  }, [settings?.language]);

  if (floatLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isPopupWindow) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-surface">
        <main className="flex-1 overflow-hidden flex flex-col">
          <BatchSearchPage />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        {isFloatActive ? (
          isBatchSearch ? (
            <FloatModePlaceholder />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Outlet />
            </div>
          )
        ) : (
          <>
            <div className={isBatchSearch ? "flex-1 min-h-0 flex flex-col" : "hidden"}>
              <BatchSearchPage />
            </div>
            {!isBatchSearch && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <Outlet />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
