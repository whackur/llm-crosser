import React, { useState, useRef, useCallback } from "react";
import { injectFile } from "@/src/lib/messaging";

interface FileUploadButtonProps {
  enabledSites: string[];
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = "image/png,image/jpeg,image/gif,application/pdf,text/plain";
const STAGGER_MS = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  enabledSites,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read file as base64"));
        }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError("File too large (max 10MB)");
        return;
      }

      if (enabledSites.length === 0) {
        setError("No sites enabled");
        return;
      }

      setIsUploading(true);

      try {
        const base64String = await readFileAsBase64(file);

        for (let i = 0; i < enabledSites.length; i++) {
          if (i > 0) {
            await delay(STAGGER_MS);
          }
          await injectFile(enabledSites[i], base64String);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [enabledSites, readFileAsBase64],
  );

  const handleClick = useCallback(() => {
    setError(null);
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex items-center gap-1 pt-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="p-3 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-border active:scale-95"
        aria-label="Attach file"
      >
        {isUploading ? (
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
      />

      {error && (
        <span className="text-xs text-error animate-in fade-in slide-in-from-left-2">{error}</span>
      )}
    </div>
  );
};
