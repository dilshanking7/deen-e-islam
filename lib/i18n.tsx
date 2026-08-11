"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  getTranslationKey,
  type LanguageCode,
} from "./translation/ui-strings";

export const STORAGE_KEY = "islaam-language";

export function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_LANGUAGE;
  if (LANGUAGE_OPTIONS.some((l) => l.code === saved)) return saved as LanguageCode;
  return DEFAULT_LANGUAGE;
}

let currentLang: LanguageCode =
  typeof window === "undefined" ? DEFAULT_LANGUAGE : getStoredLanguage();

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return currentLang;
}

function getServerSnapshot() {
  return DEFAULT_LANGUAGE;
}

function setStoreLang(code: LanguageCode) {
  currentLang = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {}
  listeners.forEach((cb) => cb());
}

interface I18nContextValue {
  lang: LanguageCode;
  dir: "ltr" | "rtl";
  setLang: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languageOptions: typeof LANGUAGE_OPTIONS;
}

const I18nContext = createContext<I18nContextValue>({
  lang: DEFAULT_LANGUAGE,
  dir: "ltr",
  setLang: () => {},
  t: (key) => key,
  languageOptions: LANGUAGE_OPTIONS,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((code: LanguageCode) => {
    setStoreLang(code);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str = getTranslationKey(lang, key);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    },
    [lang]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir: lang === "ur" || lang === "ar" ? "rtl" : "ltr",
      setLang,
      t,
      languageOptions: LANGUAGE_OPTIONS,
    }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
