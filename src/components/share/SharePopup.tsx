import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PromptTemplate } from "@/src/types/settings";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  markdownContent: string;
  exportAllTemplates?: PromptTemplate[];
  defaultExportName?: string;
  onSave?: (name: string, content: string, siteName: string) => void;
}

export const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  siteName,
  markdownContent,
  exportAllTemplates = [],
  defaultExportName = "",
  onSave,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [exportName, setExportName] = useState("");

  const isExportAll = siteName === "All Sites";
  const templates = isExportAll ? exportAllTemplates : [];

  const displayContent = useMemo(() => {
    if (!activeTemplateId) return markdownContent;
    const tpl = templates.find((tp) => tp.id === activeTemplateId);
    if (!tpl) return markdownContent;
    return tpl.template.replace("{query}", markdownContent);
  }, [markdownContent, activeTemplateId, templates]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTemplateId(null);
      setSaved(false);
      return;
    }
    const timestamp = new Date().toISOString().slice(0, 10);
    setExportName(defaultExportName || `${siteName} - ${timestamp}`);
  }, [isOpen, defaultExportName, siteName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const saveToHistory = useCallback(() => {
    if (saved || !onSave) return;
    onSave(exportName.trim() || siteName, displayContent, siteName);
    setSaved(true);
  }, [saved, onSave, exportName, displayContent, siteName]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = displayContent;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
      } catch {
        /* clipboard fallback failed */
      }
    }
    saveToHistory();
  }, [displayContent, saveToHistory]);

  const handleDownload = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `${siteName}-conversation-${timestamp}.md`;
    const blob = new Blob([displayContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    saveToHistory();
  }, [siteName, displayContent, saveToHistory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Export — ${siteName}`}
    >
      <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border border-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-text text-base">
            {t("share.title")} — {siteName}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-secondary transition-colors"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {templates.length > 0 && (
          <div className="px-4 pt-3 pb-2 flex gap-2 flex-wrap border-b border-border/50">
            <span className="text-xs text-text-secondary font-medium self-center mr-1">
              {t("share.wrapWith")}
            </span>
            {templates.map((tpl) => {
              const isActive = activeTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setActiveTemplateId(isActive ? null : tpl.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all active:scale-95 ${isActive ? "bg-primary text-white border border-primary shadow-sm shadow-primary/20" : "bg-surface-secondary border border-border text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30"}`}
                >
                  {tpl.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-surface-secondary/50 rounded-xl p-3 border border-border text-text-secondary selection:bg-primary/20 selection:text-primary">
            {displayContent}
          </pre>
        </div>

        <div className="flex items-center gap-2.5 p-4 border-t border-border bg-surface-secondary/30 rounded-b-2xl">
          <input
            type="text"
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
            placeholder={t("share.exportName")}
            className="flex-1 min-w-0 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            onClick={handleDownload}
            className="bg-surface text-text px-3 py-2 rounded-lg text-sm border border-border hover:bg-surface-secondary hover:border-primary/30 transition-all flex items-center gap-1.5 font-medium shadow-sm shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("share.download")}
          </button>
          <button
            onClick={handleCopy}
            className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-hover transition-all flex items-center gap-1.5 font-medium shadow-lg shadow-primary/20 active:scale-95 shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? t("share.copied") : t("share.copyMarkdown")}
          </button>
        </div>
      </div>
    </div>
  );
};
