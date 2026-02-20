import { useState, useEffect, useCallback } from "react";
import type { FloatState } from "../lib/float-state";
import { getFloatState, onFloatStateChanged } from "../lib/float-state";

interface UseFloatModeReturn {
  isPopupWindow: boolean;
  isFloatActive: boolean;
  floatState: FloatState | null;
  loading: boolean;
}

export function useFloatMode(): UseFloatModeReturn {
  const [isPopupWindow, setIsPopupWindow] = useState(false);
  const [floatState, setFloatState] = useState<FloatState | null>(null);
  const [loading, setLoading] = useState(true);

  const handleFloatStateChange = useCallback(async (state: FloatState | null) => {
    setFloatState(state);
    const currentWindow = await chrome.windows.getCurrent();
    setIsPopupWindow(currentWindow.type === "popup");
  }, []);

  useEffect(() => {
    const init = async () => {
      const [currentWindow, state] = await Promise.all([
        chrome.windows.getCurrent(),
        getFloatState(),
      ]);

      setIsPopupWindow(currentWindow.type === "popup");
      setFloatState(state);
      setLoading(false);
    };

    void init();

    const cleanup = onFloatStateChanged(handleFloatStateChange);
    return cleanup;
  }, [handleFloatStateChange]);

  return {
    isPopupWindow,
    isFloatActive: floatState?.active ?? false,
    floatState,
    loading,
  };
}
