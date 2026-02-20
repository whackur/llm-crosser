import React from "react";
import { useTranslation } from "react-i18next";
import { DetachIcon } from "../ui/Icons";

export const FloatModePlaceholder: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <DetachIcon className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-text mb-2">{t("float.placeholder.title")}</h2>
      <p className="text-sm text-text-secondary max-w-md">{t("float.placeholder.description")}</p>
    </div>
  );
};
