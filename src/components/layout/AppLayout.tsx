import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import BatchSearchPage from "@/src/pages/BatchSearchPage";
import { useSettings } from "@/src/hooks/useSettings";
import { useTheme } from "@/src/hooks/useTheme";
import { i18n } from "@/src/i18n";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { settings } = useSettings();
  const location = useLocation();
  useTheme(settings?.theme);

  const isBatchSearch = location.pathname === "/";

  useEffect(() => {
    if (settings?.language) {
      void i18n.changeLanguage(settings.language);
    }
  }, [settings?.language]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* BatchSearchPage stays mounted — hidden via CSS to preserve iframe state */}
        <div className={isBatchSearch ? "flex-1 min-h-0 flex flex-col" : "hidden"}>
          <BatchSearchPage />
        </div>
        {!isBatchSearch && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
