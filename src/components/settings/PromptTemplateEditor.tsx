import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "../ui/Icons";
import { TemplateListItem, TemplateItem } from "./TemplateListItem";

interface PromptTemplateEditorProps {
  templates: TemplateItem[];
  onSave: (templates: TemplateItem[]) => void;
}

interface FormState {
  name: string;
  template: string;
}

const EMPTY_FORM: FormState = { name: "", template: "" };

function reorder(list: TemplateItem[]): TemplateItem[] {
  return list.map((item, i) => ({ ...item, order: i }));
}

export const PromptTemplateEditor: React.FC<PromptTemplateEditorProps> = ({
  templates,
  onSave,
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(() => [...templates].sort((a, b) => a.order - b.order), [templates]);

  const handleAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (item: TemplateItem) => {
    setIsAdding(false);
    setDeletingId(null);
    setEditingId(item.id);
    setForm({ name: item.name, template: item.template });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(EMPTY_FORM);
  };

  const templateHasQuery = form.template.includes("{query}");

  const handleSaveNew = () => {
    if (!form.name.trim() || !form.template.trim() || !templateHasQuery) return;

    const newTemplate: TemplateItem = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      template: form.template.trim(),
      order: templates.length,
    };

    onSave(reorder([...templates, newTemplate]));
    setIsAdding(false);
    setForm(EMPTY_FORM);
  };

  const handleSaveEdit = () => {
    if (!editingId || !form.name.trim() || !form.template.trim() || !templateHasQuery) return;

    const updated = templates.map((t) =>
      t.id === editingId ? { ...t, name: form.name.trim(), template: form.template.trim() } : t,
    );

    onSave(updated);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    const filtered = templates.filter((t) => t.id !== id);
    onSave(reorder(filtered));
    setDeletingId(null);
    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...sorted];
    const prev = list[index - 1];
    const curr = list[index];
    if (prev && curr) {
      list[index - 1] = curr;
      list[index] = prev;
    }
    onSave(reorder(list));
  };

  const handleMoveDown = (index: number) => {
    if (index === sorted.length - 1) return;
    const list = [...sorted];
    const curr = list[index];
    const next = list[index + 1];
    if (curr && next) {
      list[index] = next;
      list[index + 1] = curr;
    }
    onSave(reorder(list));
  };

  const renderForm = (onSubmit: () => void) => {
    const showQueryError = form.template.trim().length > 0 && !templateHasQuery;
    const isSaveDisabled = !form.name.trim() || !form.template.trim() || !templateHasQuery;

    return (
      <div className="p-4 bg-surface-secondary/30 rounded-xl border border-border mb-3 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t("settings.templateName")}
          className="border border-border rounded-lg px-3 py-2.5 w-full bg-surface text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
        />
        <div>
          <textarea
            value={form.template}
            onChange={(e) => setForm((f) => ({ ...f, template: e.target.value }))}
            placeholder={t("settings.templatePlaceholder")}
            rows={3}
            className={`border rounded-lg px-3 py-2.5 w-full bg-surface text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none transition-all ${showQueryError ? "border-error focus:border-error focus:ring-error/20" : "border-border focus:border-primary"}`}
          />
          {showQueryError && (
            <p className="mt-1.5 text-xs text-error font-medium">
              {t("settings.templateQueryRequired")}
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors rounded-lg hover:bg-surface-secondary"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSaveDisabled}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
          >
            {t("settings.save")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {sorted.map((item, index) =>
        editingId === item.id ? (
          <React.Fragment key={item.id}>{renderForm(handleSaveEdit)}</React.Fragment>
        ) : (
          <TemplateListItem
            key={item.id}
            item={item}
            index={index}
            isLast={index === sorted.length - 1}
            isDeleting={deletingId === item.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRequestDelete={setDeletingId}
            onCancelDelete={() => setDeletingId(null)}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ),
      )}

      {isAdding ? (
        renderForm(handleSaveNew)
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:text-primary transition-all rounded-xl w-full justify-center border border-dashed border-border hover:border-primary/40 hover:bg-surface-secondary/30 group mt-4"
        >
          <div className="p-1 rounded-full bg-surface-secondary group-hover:bg-primary/10 transition-colors">
            <PlusIcon className="w-4 h-4" />
          </div>
          <span className="font-medium">{t("settings.addTemplate")}</span>
        </button>
      )}
    </div>
  );
};
