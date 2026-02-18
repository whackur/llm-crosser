import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import fr from "./locales/fr.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
    ja: { translation: ja },
    zh: { translation: zh },
    pt: { translation: pt },
    ru: { translation: ru },
    fr: { translation: fr },
  },
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export { i18n };
