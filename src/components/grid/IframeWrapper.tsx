import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface IframeWrapperProps {
  siteName: string;
  siteUrl: string;
  automationDisabled?: boolean;
  onAutomationToggle?: (siteName: string) => void;
  onShare?: (siteName: string) => void;
  onRetry?: (siteName: string) => void;
}

const IframeWrapperInner: React.FC<IframeWrapperProps> = ({
  siteName,
  siteUrl,
  automationDisabled = false,
  onAutomationToggle,
  onShare,
  onRetry,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    setIframeKey((prev) => prev + 1);
  }, [siteUrl]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading && !isError) {
      timeoutId = setTimeout(() => {
        setIsError(true);
        setIsLoading(false);
      }, 15000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, isError, iframeKey]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
  }, []);

  const handleRetryClick = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setIframeKey((prev) => prev + 1);
    onRetry?.(siteName);
  }, [siteName, onRetry]);

  const handleShareClick = useCallback(() => {
    onShare?.(siteName);
  }, [siteName, onShare]);

  const handleAutomationClick = useCallback(() => {
    onAutomationToggle?.(siteName);
  }, [siteName, onAutomationToggle]);

  const getStatusColor = () => {
    if (isError) return "bg-error";
    if (isLoading) return "bg-warning";
    if (automationDisabled) return "bg-warning/60";
    return "bg-success";
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-surface border border-border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="h-9 bg-surface-secondary/50 border-b border-border flex items-center px-3 gap-2 shrink-0 backdrop-blur-sm">
        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getStatusColor()}`} />
        <span
          className="text-sm font-medium truncate text-text select-none flex-1"
          title={siteName}
        >
          {siteName}
        </span>

        {automationDisabled && (
          <span className="text-[10px] text-warning font-medium px-1.5 py-0.5 rounded bg-warning/10 border border-warning/20 shrink-0 select-none">
            {t("batch.manualMode")}
          </span>
        )}

        <button
          onClick={handleAutomationClick}
          className={`p-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            automationDisabled
              ? "text-warning/70 hover:text-warning hover:bg-warning/10"
              : "text-text-secondary hover:text-primary hover:bg-primary/10"
          }`}
          title={automationDisabled ? t("batch.automationOff") : t("batch.automationOn")}
          aria-label={`Toggle automation for ${siteName}`}
        >
          <AutomationToggleIcon disabled={automationDisabled} />
        </button>

        <button
          onClick={handleShareClick}
          className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-primary/10 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          title={t("share.title")}
          aria-label={`Export ${siteName} conversation`}
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
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative w-full min-h-0 bg-surface">
        {!isError && (
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={siteUrl}
            className="w-full h-full border-none block"
            allow="clipboard-read; clipboard-write; microphone; camera; geolocation; autoplay; fullscreen; picture-in-picture; storage-access; web-share; compute-pressure"
            onLoad={handleIframeLoad}
            title={`${siteName} Interface`}
          />
        )}

        {isLoading && !isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 z-10 backdrop-blur-[2px]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3 shadow-lg shadow-primary/20"></div>
            <span className="text-sm text-text-secondary font-medium animate-pulse">
              {t("batch.loading")}
            </span>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-20 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error border border-error/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-text font-medium mb-1 text-lg">
              {t("error.loadFailed", { siteName })}
            </h3>
            <p className="text-sm text-text-secondary mb-6 max-w-[240px]">
              {t("error.timeout", { siteName })}
            </p>
            <button
              onClick={handleRetryClick}
              className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-lg shadow-primary/20 active:transform active:scale-95"
            >
              {t("error.retry")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function AutomationToggleIcon({ disabled }: { disabled: boolean }) {
  if (disabled) {
    return (
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
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    );
  }

  return (
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export const IframeWrapper = React.memo(IframeWrapperInner);
