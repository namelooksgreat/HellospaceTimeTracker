import { en } from "./locales/en";
import { tr } from "./locales/tr";

export type Language = "en" | "tr";

export const languages = {
  en,
  tr,
};

export type TranslationKey = keyof typeof en;

export function useTranslation(lang: Language = "tr") {
  return {
    t: (key: string) => {
      try {
        const keys = key.split(".");
        let value: any = languages[lang];

        for (const k of keys) {
          if (value === undefined) return key;
          value = value[k];
        }

        return value || key;
      } catch (error) {
        console.error(
          `Translation error for key: ${key}, language: ${lang}`,
          error,
        );
        return key;
      }
    },
  };
}
