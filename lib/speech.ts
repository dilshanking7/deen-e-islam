"use client";

import type { TranslationLanguage } from "./translation-api";

const LANG_CODES: Record<TranslationLanguage, string> = {
  English: "en-US",
  Urdu: "ur-PK",
  Hindi: "hi-IN",
  Bengali: "bn-BD",
  Indonesian: "id-ID",
  Turkish: "tr-TR",
  French: "fr-FR",
  Spanish: "es-ES",
  Arabic: "ar-SA",
};

export function stopSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function speakText(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function languageToSpeechCode(language: TranslationLanguage) {
  return LANG_CODES[language] || "en-US";
}

