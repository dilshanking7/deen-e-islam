import { getSurahList, type SurahMeta } from "./surah-list";
import { SURAH_PAGE_MAP } from "./surah-page-map";

export function surahStartPage(surahNumber: number): number {
  const hit = SURAH_PAGE_MAP.find((s) => s.number === surahNumber);
  return hit?.page ?? Math.min(604, Math.max(1, surahNumber * 8 - 6));
}

export interface VerseLookup {
  surahNumber: number;
  surahName: string;
  surahMeaning: string;
  arabic: string;
  urdu: string;
  hindi: string;
  english: string;
  ayahNumber: number;
  numberOfAyahs: number;
  revelationType: string;
  hasVerse: boolean;
}

async function fetchEdition(
  ref: string,
  edition: string
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${ref}/${edition}`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (!res.ok) return "";
    const data = (await res.json()) as { data?: { text?: string } };
    return data.data?.text || "";
  } catch {
    return "";
  }
}

function pickAyahNumber(q: string): number | null {
  const m = q.match(/ayah\s*(\d{1,3})|ayat\s*(\d{1,3})|verse\s*(\d{1,3})|:\s*(\d{1,3})/);
  if (!m) return null;
  const n = Number(m[1] || m[2] || m[3] || m[4]);
  return Number.isInteger(n) && n >= 1 && n <= 286 ? n : null;
}

function nameVariants(meta: SurahMeta): string[] {
  const out: string[] = [];
  const en = meta.englishName.toLowerCase();
  out.push(en);
  out.push(en.replace(/^[ae]l-/, "").replace(/^ar-/, ""));
  out.push(en.replace(/['’]/g, ""));
  const last = en.split(/[^a-z]/).filter(Boolean).pop() || "";
  if (last.length >= 3) out.push(last);
  return [...new Set(out)];
}

function matchScore(meta: SurahMeta, q: string): number {
  const nq = q.toLowerCase();
  let score = 0;
  if (meta.number === Number(q.trim())) score = 120;
  if (meta.name && nq.includes(meta.name.toLowerCase())) score = Math.max(score, 110);
  for (const v of nameVariants(meta)) {
    if (v.length >= 4 && nq.includes(v)) score = Math.max(score, 100);
  }
  if (
    meta.englishNameTranslation &&
    nq.includes(meta.englishNameTranslation.toLowerCase())
  )
    score = Math.max(score, 90);
  return score;
}

export async function lookupVerse(query: string): Promise<VerseLookup | null> {
  const qRaw = (query || "").trim();
  if (!qRaw) return null;
  const q = qRaw.toLowerCase();
  if (!/(surah|sura|soorah|verse|ayah|ayat|translation|tarjuma|meaning|matlab|tafsir|kya kahta hai|kya hai)/.test(q)) {
    return null;
  }

  const surahs = await getSurahList();
  let best: { meta: SurahMeta; score: number } | null = null;
  for (const meta of surahs) {
    const s = matchScore(meta, q);
    if (!best || s > best.score) best = { meta, score: s };
  }
  if (!best || best.score < 90) return null;

  const surah = best.meta;
  const ayahNumber = pickAyahNumber(q);

  // Ayah lookup (verse)
  if (ayahNumber !== null && ayahNumber <= surah.numberOfAyahs) {
    const ref = `${surah.number}:${ayahNumber}`;
    const [arabic, urdu, english, hindi] = await Promise.all([
      fetchEdition(ref, "quran-uthmani"),
      fetchEdition(ref, "ur.jalandhry"),
      fetchEdition(ref, "en.asad"),
      fetchEdition(ref, "hi.hindi"),
    ]);
    return {
      surahNumber: surah.number,
      surahName: surah.name,
      surahMeaning: surah.englishNameTranslation,
      arabic,
      urdu,
      hindi,
      english,
      ayahNumber,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType,
      hasVerse: true,
    };
  }

  // Surah info only
  return {
    surahNumber: surah.number,
    surahName: surah.name,
    surahMeaning: surah.englishNameTranslation,
    arabic: "",
    urdu: "",
    hindi: "",
    english: "",
    ayahNumber: 0,
    numberOfAyahs: surah.numberOfAyahs,
    revelationType: surah.revelationType,
    hasVerse: false,
  };
}

export function surahPageHint(surahNumber: number): number {
  return surahStartPage(surahNumber);
}