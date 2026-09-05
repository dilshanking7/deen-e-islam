"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export const FONT_STYLE_KEY = "islaam-font-style";
export const TEXT_SIZE_KEY = "islaam-text-size";

export const FONT_STYLES = [
  { key: "nastaliq", label: "Urdu Nastaliq (خطِ نستعلیق)" },
  { key: "naskh", label: "Arabic Naskh (نسخ)" },
  { key: "system", label: "System (Default)" },
] as const;

export type FontStyleKey = (typeof FONT_STYLES)[number]["key"];

export function getFontStyle(): FontStyleKey {
  if (typeof window === "undefined") return "nastaliq";
  const v = localStorage.getItem(FONT_STYLE_KEY);
  return FONT_STYLES.some((f) => f.key === v) ? (v as FontStyleKey) : "nastaliq";
}

export default function LanguageDir() {
  const { lang, dir } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute("data-font", getFontStyle());
      const size = localStorage.getItem(TEXT_SIZE_KEY) || "normal";
      document.documentElement.setAttribute(
        "data-textsize",
        ["normal", "large", "xlarge"].includes(size) ? size : "normal"
      );
    };
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);

  return null;
}