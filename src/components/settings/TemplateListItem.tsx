import React from "react";
import { useTranslation } from "react-i18next";
import { TrashIcon, ArrowUpIcon, ArrowDownIcon } from "../ui/Icons";

export interface TemplateItem {
  id: string;
  name: string;
  template: string;
  order: number;
}

interface TemplateListItemProps {
  item: TemplateItem;
  index: number;
  isLast: boolean;
  isDeleting: boolean;
  onEdit: (item: TemplateItem) => void;
  onDelete: (id: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const TemplateListItem: React.FC<TemplateListItemProps> = ({
  item,
  index,
  isLast,
  isDeleting,
  onEdit,
  onDelete,
  onRequestDelete,
  onCancelDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-3 bg-surface rounded-lg border border-border mb-2 group hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
      {isDeleting ? (
        <div className="flex items-center justify-between gap-2 animate-in fade-in">
          <span className="text-sm text-text-secondary font-medium">
            {t("settings.confirmDelete")}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelDelete}
              className="px-3 py-1.5 text-xs text-text-secondary hover:text-text transition-colors rounded-md hover:bg-surface-secondary"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="px-3 py-1.5 text-xs text-white bg-error hover:bg-error/90 transition-colors rounded-md shadow-sm shadow-error/20"
            >
              {t("settings.deleteTemplate")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex-1 text-left min-w-0 group-hover:text-primary transition-colors"
          >
            <p className="text-sm font-medium text-text truncate">{item.name}</p>
            <p className="text-xs text-text-secondary truncate mt-1 opacity-70 font-mono">
              {item.template}
            </p>
          </button>

          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-secondary/50 rounded-lg p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-1.5 text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-surface"
              aria-label="Move up"
            >
              <ArrowUpIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              className="p-1.5 text-text-secondary hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-surface"
              aria-label="Move down"
            >
              <ArrowDownIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              type="button"
              onClick={() => onRequestDelete(item.id)}
              className="p-1.5 text-text-secondary hover:text-error transition-colors rounded-md hover:bg-surface"
              aria-label="Delete template"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
