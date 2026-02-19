import React, { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

interface QueryInputBarProps {
  onSend: (query: string) => void;
  initialQuery?: string;
  promptTemplates?: Array<{ id: string; name: string; template: string }>;
  disabled?: boolean;
}

export const QueryInputBar: React.FC<QueryInputBarProps> = ({
  onSend,
  initialQuery = "",
  promptTemplates = [],
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [modifierKey, setModifierKey] = useState("Ctrl");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      adjustHeight();
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      setModifierKey("Cmd");
    }
  }, []);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    adjustHeight();
  };

  const activeTemplate = promptTemplates.find((tp) => tp.id === activeTemplateId);

  const handleSend = useCallback(() => {
    if (!query.trim() || disabled) return;

    let finalQuery = query;
    if (activeTemplate) {
      finalQuery = activeTemplate.template.replace("{query}", query);
    }

    onSend(finalQuery);
    setQuery("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [query, disabled, activeTemplate, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateClick = (templateId: string) => {
    setActiveTemplateId((prev) => (prev === templateId ? null : templateId));
    textareaRef.current?.focus();
  };

  const isSendDisabled = disabled || !query.trim();

  return (
    <div className="w-full flex flex-col gap-3">
      {promptTemplates.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-linear-fade">
          {promptTemplates.map((tp) => {
            const isActive = activeTemplateId === tp.id;
            return (
              <button
                key={tp.id}
                onClick={() => handleTemplateClick(tp.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all active:scale-95 ${
                  isActive
                    ? "bg-primary text-white border border-primary shadow-sm shadow-primary/20"
                    : "bg-surface-secondary border border-border text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                }`}
                type="button"
                title={tp.template}
              >
                {tp.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative w-full group">
        {activeTemplate && (
          <div className="absolute left-3 top-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
            {activeTemplate.name}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            activeTemplate
              ? t("batch.templateActivePlaceholder", { name: activeTemplate.name })
              : t("batch.inputPlaceholder")
          }
          disabled={disabled}
          rows={1}
          className={`w-full resize-none rounded-xl border border-border bg-surface-secondary/50 px-4 pr-12 text-base text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm disabled:bg-surface-secondary disabled:text-text-secondary min-h-[52px] max-h-[200px] backdrop-blur-sm ${activeTemplate ? "pt-9 pb-3.5" : "py-3.5"}`}
        />

        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 active:scale-95"
          type="button"
          aria-label="Send query"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      <div className="flex justify-end px-1">
        <span className="text-xs text-text-secondary font-medium opacity-70">
          {modifierKey} + Enter to send
        </span>
      </div>
    </div>
  );
};
