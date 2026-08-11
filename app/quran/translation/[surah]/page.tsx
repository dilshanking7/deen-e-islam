"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bookmark,
  Copy,
  Share2,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  Search,
  X,
} from "lucide-react";

import {
  getArabicSurah,
  getUrduTranslation,
  getTranslationByEdition,
  TRANSLATION_EDITIONS,
  TranslationLanguage,
} from "@/lib/translation-api";
import { getSurahList, searchSurahs, type SurahMeta } from "@/lib/surah-list";
import { saveLastRead } from "@/lib/quran-history";
import { toggleBookmark, isBookmarked } from "@/lib/quran-bookmark";
import { useTheme } from "@/providers/ThemeProvider";

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface SurahData {
  englishName: string;
  englishNameTranslation: string;
  name: string;
  number: number;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

const LANGUAGE_OPTIONS: { key: TranslationLanguage; label: string }[] = [
  { key: "English", label: "🇺🇸 English" },
  { key: "Hindi", label: "🇮🇳 Hindi" },
  { key: "Urdu", label: "☪️ Urdu" },
  { key: "Bengali", label: "🇧🇩 Bengali" },
  { key: "Indonesian", label: "🇮🇩 Indonesian" },
  { key: "Turkish", label: "🇹🇷 Turkish" },
  { key: "French", label: "🇫🇷 French" },
  { key: "Spanish", label: "🇪🇸 Spanish" },
  { key: "Arabic", label: "🇸🇦 Arabic" },
];

export default function TranslationReader() {
  const params = useParams();
  const router = useRouter();
  const surahNumber = Number(params.surah);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  const [arabic, setArabic] = useState<SurahData | null>(null);
  const [urdu, setUrdu] = useState<SurahData | null>(null);
  const [selectedLang, setSelectedLang] = useState<TranslationLanguage>("English");
  const [selectedTranslation, setSelectedTranslation] = useState<SurahData | null>(null);

  const [loading, setLoading] = useState(true);

  const [fontSize, setFontSize] = useState(36);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [surahQuery, setSurahQuery] = useState("");
  const [showSurahSearch, setShowSurahSearch] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());

  useEffect(() => {
    getSurahList().then(setSurahList).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ar, ur] = await Promise.all([
          getArabicSurah(surahNumber),
          getUrduTranslation(surahNumber),
        ]);

        setArabic(ar);
        setUrdu(ur);

        if (ar) {
          saveLastRead(surahNumber, ar.englishName, 1).catch(() => {});
        }

        const marks: Set<number> = new Set();
        for (const ayah of ar.ayahs) {
          if (await isBookmarked(surahNumber, ayah.numberInSurah)) {
            marks.add(ayah.numberInSurah);
          }
        }
        setBookmarkedAyahs(marks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (surahNumber) {
      load();
    }
  }, [surahNumber]);

  useEffect(() => {
    async function loadExtra() {
      try {
        const extra = await getTranslationByEdition(
          surahNumber,
          TRANSLATION_EDITIONS[selectedLang]
        );
        setSelectedTranslation(extra);
      } catch (err) {
        console.error(err);
      }
    }

    if (surahNumber && arabic) {
      loadExtra();
    }
  }, [selectedLang, surahNumber, arabic]);

  const surahResults = useMemo(() => searchSurahs(surahList, surahQuery), [surahList, surahQuery]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !arabic) return null;
    const indexes: number[] = [];
    arabic.ayahs.forEach((ayah, i) => {
      const urduText = urdu?.ayahs[i]?.text?.toLowerCase() || "";
      const extraText = selectedTranslation?.ayahs[i]?.text?.toLowerCase() || "";
      const arabicText = ayah.text.toLowerCase();
      if (
        urduText.includes(q) ||
        extraText.includes(q) ||
        arabicText.includes(q)
      ) {
        indexes.push(i);
      }
    });
    return indexes;
  }, [searchQuery, arabic, urdu, selectedTranslation]);

  function copyAyah(text: string) {
    navigator.clipboard.writeText(text);
  }

  async function bookmarkAyah(number: number) {
    const nowBookmarked = await toggleBookmark(surahNumber, arabic!.englishName, number);
    setBookmarkedAyahs((prev) => {
      const next = new Set(prev);
      if (nowBookmarked) next.add(number);
      else next.delete(number);
      return next;
    });
  }

  function shareAyah(text: string) {
    if (navigator.share) {
      navigator.share({
        title: "Holy Quran",
        text,
      });
    } else {
      copyAyah(text);
    }
  }

  function goToSurah(delta: number) {
    const next = Math.min(114, Math.max(1, surahNumber + delta));
    router.push(`/quran/translation/${next}`);
  }

  function jumpToSurah(n: number) {
    setSurahQuery("");
    setShowSurahSearch(false);
    router.push(`/quran/translation/${n}`);
  }

  function highlight(text: string): React.ReactNode {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded bg-yellow-300 px-0.5 text-inherit dark:bg-yellow-500/60">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  const isArabic = selectedLang === "Arabic";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          <h2 className="mt-5 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            Loading Translation...
          </h2>
        </div>
      </main>
    );
  }

  if (!arabic || !urdu || !selectedTranslation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50 dark:bg-zinc-950">
        <h2 className="text-3xl font-bold text-red-600">Failed To Load</h2>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 font-sans ${
        darkMode
          ? "bg-zinc-950 text-zinc-100"
          : "bg-gradient-to-br from-emerald-50 via-white to-green-100 text-zinc-900"
      }`}
    >
      {/* Dynamic Header */}
      <div
        className={`sticky top-0 z-50 border-b backdrop-blur transition-colors ${
          darkMode
            ? "border-zinc-800 bg-zinc-950/90"
            : "border-emerald-100 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-3xl">
              {arabic.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 sm:text-sm">
              {arabic.englishName} ({arabic.numberOfAyahs} Ayahs)
            </p>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowSurahSearch((v) => !v)}
              title="Surah Khojein (Search Surah)"
              className="rounded-xl bg-emerald-700 p-2 text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 sm:p-2.5"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setFontSize(fontSize + 2)}
              title="Increase Font Size"
              className="rounded-xl bg-emerald-700 p-2 text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 sm:p-2.5"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => setFontSize(Math.max(20, fontSize - 2))}
              title="Decrease Font Size"
              className="rounded-xl bg-emerald-700 p-2 text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 sm:p-2.5"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle Dark Mode"
              className="rounded-xl bg-emerald-700 p-2 text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 sm:p-2.5"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Surah Search Panel */}
        {showSurahSearch && (
          <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
            <div
              className={`relative rounded-2xl p-3 shadow-lg ${
                darkMode ? "bg-zinc-900 ring-1 ring-zinc-700" : "bg-white ring-1 ring-emerald-100"
              }`}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                <input
                  autoFocus
                  value={surahQuery}
                  onChange={(e) => setSurahQuery(e.target.value)}
                  placeholder="Surah ka naam likhein — Al-Fatiha, Baqarah, 36, Yusuf..."
                  className={`w-full rounded-xl py-3 pl-12 pr-10 text-sm outline-none ${
                    darkMode
                      ? "bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                      : "bg-emerald-50 text-gray-800 placeholder:text-gray-400"
                  }`}
                />
                <button
                  onClick={() => setShowSurahSearch(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {surahResults.length > 0 && (
                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl">
                  {surahResults.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => jumpToSurah(s.number)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                        darkMode
                          ? "text-zinc-200 hover:bg-zinc-800"
                          : "text-gray-700 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="font-semibold">
                        {s.number}. {s.englishName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {s.englishNameTranslation}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {surahQuery.trim() && surahResults.length === 0 && (
                <p className="mt-2 px-4 py-3 text-sm text-gray-500">
                  Koi surah nahi mila. English name ya number try karein.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Language Picker */}
      <div className="sticky top-[76px] z-40 mx-auto max-w-5xl px-4 pt-4 sm:px-6">
        <div className="relative">
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className={`flex w-full items-center justify-between rounded-2xl px-5 py-3.5 font-semibold shadow-lg transition ${
              darkMode
                ? "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700"
                : "bg-white text-emerald-800 ring-1 ring-emerald-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe size={18} className="text-emerald-600" />
              Translation Language:
            </span>
            <span className="flex items-center gap-2">
              {LANGUAGE_OPTIONS.find((l) => l.key === selectedLang)?.label}
              <ChevronRight
                size={16}
                className={`transition ${showLangPicker ? "rotate-90" : ""}`}
              />
            </span>
          </button>

          {showLangPicker && (
            <div
              className={`absolute left-0 right-0 top-full z-50 mt-2 grid grid-cols-2 gap-2 rounded-2xl p-3 shadow-2xl sm:grid-cols-3 ${
                darkMode ? "bg-zinc-900 ring-1 ring-zinc-700" : "bg-white ring-1 ring-emerald-50"
              }`}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => {
                    setSelectedLang(lang.key);
                    setShowLangPicker(false);
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    selectedLang === lang.key
                      ? "bg-emerald-700 text-white"
                      : darkMode
                      ? "text-zinc-200 hover:bg-zinc-800"
                      : "text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Translation Search Bar */}
      <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Is surah ke andar tarjuma khojein... (Urdu / English / Arabic)"
            className={`w-full rounded-2xl py-3 pl-11 pr-10 text-sm shadow outline-none transition focus:ring-2 focus:ring-emerald-300 ${
              darkMode
                ? "bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 ring-1 ring-zinc-700"
                : "bg-white text-gray-800 placeholder:text-gray-400 ring-1 ring-emerald-100"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchResults && (
          <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {searchResults.length > 0
              ? `${searchResults.length} aayat miliyein "${searchQuery}" ke liye`
              : `"${searchQuery}" ke liye koi aayat nahi mili`}
          </p>
        )}
      </div>

      {/* Surah Navigation */}
      <div className="mx-auto mt-4 flex max-w-5xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => goToSurah(-1)}
          disabled={surahNumber <= 1}
          className="flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <Image
          src="/logo-icon.png"
          alt="Islaam-E-Deen"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />

        <button
          onClick={() => goToSurah(1)}
          disabled={surahNumber >= 114}
          className="flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Ayahs List */}
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {arabic.ayahs.map((ayah, index) => {
          const isBookmarked = bookmarkedAyahs.has(ayah.numberInSurah);
          const urduText = urdu.ayahs[index]?.text;
          const extraText = selectedTranslation.ayahs[index]?.text;
          const isMatch = searchResults?.includes(index);

          if (searchResults && !isMatch) return null;

          return (
            <div
              key={ayah.numberInSurah}
              className={`overflow-hidden rounded-3xl shadow-lg transition-all ${
                isMatch && searchQuery
                  ? "ring-2 ring-yellow-400"
                  : ""
              } ${
                darkMode
                  ? "bg-zinc-900 border border-zinc-800 shadow-black/40"
                  : "bg-white border border-emerald-50/50"
              }`}
            >
              {/* Card header */}
              <div
                className={`flex items-center justify-between px-6 py-3 ${
                  darkMode ? "bg-zinc-900/70" : "bg-emerald-50/50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                    isBookmarked ? "bg-amber-500" : "bg-emerald-700 dark:bg-emerald-600"
                  }`}
                >
                  {ayah.numberInSurah}
                </div>
                {isBookmarked && (
                  <span className="text-xs font-semibold rounded-full bg-amber-500/20 px-3 py-1 text-amber-600 dark:text-amber-400">
                    Bookmarked
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8">
                {/* 1. Arabic Ayah Text (top) */}
                <p
                  dir="rtl"
                  style={{ fontSize: `${fontSize}px` }}
                  className="text-right leading-loose font-[Amiri] transition-all"
                >
                  {highlight(ayah.text)}
                </p>

                <div
                  className={`my-6 h-px ${darkMode ? "bg-zinc-800" : "bg-emerald-100"}`}
                />

                {/* 2. Urdu Translation (always shown) */}
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    ☪️ Urdu
                  </span>
                  <p
                    dir="rtl"
                    className="mt-3 text-right text-xl leading-loose text-gray-800 dark:text-zinc-200"
                  >
                    {highlight(urduText)}
                  </p>
                </div>

                {/* 3. Selected Language Translation */}
                {!isArabic && extraText && (
                  <div className="mt-6">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        darkMode
                          ? "bg-zinc-800 text-emerald-300"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      🌍 {selectedLang}
                    </span>
                    <p className="mt-3 text-lg leading-8 text-gray-700 dark:text-zinc-300">
                      {highlight(extraText)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => copyAyah(ayah.text)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600"
                  >
                    <Copy size={18} />
                    Copy
                  </button>
                  <button
                    onClick={() => shareAyah(ayah.text)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                  <button
                    onClick={() => bookmarkAyah(ayah.numberInSurah)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition active:scale-95 ${
                      isBookmarked
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    <Bookmark size={18} />
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
