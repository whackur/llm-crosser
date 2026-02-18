import { useEffect } from "react";
import type { ThemeId } from "../types/settings";

export function useTheme(theme: ThemeId | undefined): void {
  useEffect(() => {
    if (!theme) return;

    if (theme === "midnight") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);
}
