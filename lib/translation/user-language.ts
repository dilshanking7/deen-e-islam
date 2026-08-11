import { DEFAULT_LANGUAGE, LanguageCode } from "./languages";

const STORAGE_KEY = "islaam-language";

export function getUserLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return DEFAULT_LANGUAGE;

  return saved as LanguageCode;
}

export function setUserLanguage(language: LanguageCode) {
  localStorage.setItem(STORAGE_KEY, language);
}

export function resetLanguage() {
  localStorage.removeItem(STORAGE_KEY);
}