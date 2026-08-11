"use client";

import { LANGUAGES, LanguageCode } from "@/lib/translation/languages";
import {
  getUserLanguage,
  setUserLanguage,
} from "@/lib/translation/user-language";
import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

interface Props {
  onChange?: (language: LanguageCode) => void;
}

export default function LanguageSelector({
  onChange,
}: Props) {
  const [language, setLanguage] =
    useState<LanguageCode>("ur");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLanguage(getUserLanguage()));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleChange(lang: LanguageCode) {
    setLanguage(lang);

    setUserLanguage(lang);

    onChange?.(lang);
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-md">

      <Languages className="text-emerald-700" />

      <select
        value={language}
        onChange={(e) =>
          handleChange(e.target.value as LanguageCode)
        }
        className="rounded-xl border px-4 py-2 outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
          >
            {lang.name}
          </option>
        ))}
      </select>

    </div>
  );
}