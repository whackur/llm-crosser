import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getRandomExample,
  preloadQueries,
  VIRAL_CATEGORIES,
  type ViralExample,
} from "@/src/lib/viral-examples";

export function ViralExampleCard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [example, setExample] = useState<ViralExample>(() => getRandomExample(lang));

  useEffect(() => {
    preloadQueries(lang).then(() => {
      setExample(getRandomExample(lang));
    });
  }, [lang]);

  const category = VIRAL_CATEGORIES[example.categoryId];

  const handleShuffle = useCallback(() => {
    setExample(getRandomExample(lang));
  }, [lang]);

  const handleTry = useCallback(() => {
    chrome.runtime.sendMessage({ type: "DETACH_BATCH_SEARCH", query: example.query });
  }, [example.query]);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{category?.icon ?? "🔥"}</span>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
              {category ? t(category.labelKey) : ""}
            </span>
          </div>
          <button
            onClick={handleShuffle}
            className="text-[10px] text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            ↻ {t("viral.shuffle")}
          </button>
        </div>

        <p className="text-xs leading-relaxed text-text line-clamp-3">{example.query}</p>
      </div>

      <button
        onClick={handleTry}
        className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-all cursor-pointer border-t border-primary/10"
      >
        {t("viral.tryThis")} →
      </button>
    </div>
  );
}
