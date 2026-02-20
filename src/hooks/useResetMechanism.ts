import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

interface UseResetMechanismOptions {
  onReset: () => void;
}

interface UseResetMechanismReturn {
  resetKey: number;
  siteUrlOverrides: Record<string, string>;
  setSiteUrlOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function useResetMechanism(options: UseResetMechanismOptions): UseResetMechanismReturn {
  const [resetKey, setResetKey] = useState(0);
  const [siteUrlOverrides, setSiteUrlOverrides] = useState<Record<string, string>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  const onResetRef = useRef(options.onReset);
  onResetRef.current = options.onReset;

  useEffect(() => {
    const resetParam = searchParams.get("reset");
    if (!resetParam) return;

    setSiteUrlOverrides({});
    setResetKey((prev) => prev + 1);
    onResetRef.current();
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  return { resetKey, siteUrlOverrides, setSiteUrlOverrides };
}
