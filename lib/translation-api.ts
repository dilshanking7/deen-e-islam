import axios from "axios";

const api = axios.create({
  baseURL: "https://api.alquran.cloud/v1",
  timeout: 10000,
});

export const TRANSLATION_EDITIONS = {
  English: "en.asad",
  Urdu: "ur.jalandhry",
  Hindi: "hi.hindi",
  Bengali: "bn.bengali",
  Indonesian: "id.indonesian",
  Turkish: "tr.diyanet",
  French: "fr.hamidullah",
  Spanish: "es.cortes",
  Arabic: "ar",
} as const;

export type TranslationLanguage = keyof typeof TRANSLATION_EDITIONS;

export async function getArabicSurah(number: number) {
  const { data } = await api.get(`/surah/${number}`);
  return data.data;
}

export async function getEnglishTranslation(number: number) {
  const { data } = await api.get(`/surah/${number}/en.asad`);
  return data.data;
}

export async function getUrduTranslation(number: number) {
  const { data } = await api.get(`/surah/${number}/ur.jalandhry`);
  return data.data;
}

export async function getTranslationByEdition(
  number: number,
  edition: string
) {
  const { data } = await api.get(`/surah/${number}/${edition}`);
  return data.data;
}