import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import deDE from "./locales/de-DE/common.json";
import enUS from "./locales/en-US/common.json";
import esES from "./locales/es-ES/common.json";
import esMX from "./locales/es-MX/common.json";
import frFR from "./locales/fr-FR/common.json";
import jaJP from "./locales/ja-JP/common.json";
import ptBR from "./locales/pt-BR/common.json";

export const supportedLanguages = [
  "en-US",
  "es-MX",
  "es-ES",
  "fr-FR",
  "de-DE",
  "pt-BR",
  "ja-JP",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  "en-US": "language.names.enUS",
  "es-MX": "language.names.esMX",
  "es-ES": "language.names.esES",
  "fr-FR": "language.names.frFR",
  "de-DE": "language.names.deDE",
  "pt-BR": "language.names.ptBR",
  "ja-JP": "language.names.jaJP",
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "de-DE": { translation: deDE },
      "en-US": { translation: enUS },
      "es-ES": { translation: esES },
      "es-MX": { translation: esMX },
      "fr-FR": { translation: frFR },
      "ja-JP": { translation: jaJP },
      "pt-BR": { translation: ptBR },
    },
    fallbackLng: "en-US",
    supportedLngs: supportedLanguages,
    load: "currentOnly",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "securecampus-language",
      caches: ["localStorage"],
    },
  });

export default i18n;
