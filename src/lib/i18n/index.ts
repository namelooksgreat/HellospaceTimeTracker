import { en } from "./locales/en";
import { tr } from "./locales/tr";

export type Language = "en" | "tr";

export const languages = {
  en,
  tr,
};

export type TranslationKey = keyof typeof en;

export function t(key: string, lang: Language = "tr"): string {
  const keys = key.split(".");
  let value: any = languages[lang];

  for (const k of keys) {
    if (value === undefined) return key;
    value = value[k];
  }

  return value || key;
}

export const useTranslation = (lang: Language = "tr") => {
  return {
    t: (key: string) => t(key, lang),
  };
};
