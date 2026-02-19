import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface FileUploadButtonProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,text/csv";

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFilesSelected,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(null);

      const validFiles: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file) continue;

        if (file.size > MAX_FILE_SIZE) {
          setError(t("batch.fileTooLarge", { name: file.name }));
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      try {
        await onFilesSelected(validFiles);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [onFilesSelected, t],
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
        aria-label={t("batch.attachFile")}
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
        multiple
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
