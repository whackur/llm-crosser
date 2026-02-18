import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!query.trim() || disabled) return;

    onSend(query);
    setQuery("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTemplateClick = (template: string) => {
    const newQuery = template.replace("{query}", query || "");
    setQuery(newQuery);

    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(adjustHeight, 0);
    }
  };

  const isSendDisabled = disabled || !query.trim();

  return (
    <div className="w-full flex flex-col gap-3">
      {promptTemplates.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-linear-fade">
          {promptTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template.template)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-surface-secondary border border-border text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer transition-all active:scale-95"
              type="button"
              title={template.template}
            >
              {template.name}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full group">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={t("batch.inputPlaceholder")}
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-xl border border-border bg-surface-secondary/50 px-4 py-3.5 pr-12 text-base text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm disabled:bg-surface-secondary disabled:text-text-secondary min-h-[52px] max-h-[200px] backdrop-blur-sm"
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
