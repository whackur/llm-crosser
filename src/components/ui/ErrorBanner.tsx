import React from "react";

interface ErrorBannerProps {
  variant: "error" | "warning" | "info";
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  variant,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
}) => {
  const variantStyles = {
    error: "bg-error/10 border-error/20 text-error",
    warning: "bg-warning/10 border-warning/20 text-warning",
    info: "bg-primary/10 border-primary/20 text-primary",
  };

  const icons = {
    error: (
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
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    ),
    warning: (
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
        className="shrink-0"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    info: (
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
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${variantStyles[variant]}`}
      role="alert"
    >
      {icons[variant]}

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight">{title}</div>
        {message && <div className="text-xs text-text-secondary mt-1 leading-tight">{message}</div>}
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs underline cursor-pointer hover:opacity-80 whitespace-nowrap font-medium"
          type="button"
        >
          {actionLabel}
        </button>
      )}

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          aria-label="Dismiss"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
