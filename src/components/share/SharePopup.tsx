import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  markdownContent: string;
}

export const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  siteName,
  markdownContent,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = markdownContent;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
      } catch {
        /* clipboard fallback — copy failure is non-fatal */
      }
    }
  }, [markdownContent]);

  const handleDownload = useCallback(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `${siteName}-conversation-${timestamp}.md`;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [siteName, markdownContent]);

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
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text text-lg">
            {t("share.title")} — {siteName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

        <div className="flex-1 overflow-y-auto p-5">
          <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-surface-secondary/50 rounded-xl p-4 border border-border text-text-secondary selection:bg-primary/20 selection:text-primary">
            {markdownContent}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-border bg-surface-secondary/30 rounded-b-2xl">
          <button
            onClick={handleDownload}
            className="bg-surface text-text px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-surface-secondary hover:border-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center gap-2 font-medium shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm hover:bg-primary-hover transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center gap-2 font-medium shadow-lg shadow-primary/20 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
