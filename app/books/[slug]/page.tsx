"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Globe, ChevronLeft, ChevronRight, Copy, Loader2, FileText } from "lucide-react";
import { getPdfByFile } from "@/lib/pdfs-data";
import { getBook } from "@/lib/books-data";
import {
  translateBookContent,
  TRANSLATE_LANGS,
} from "@/lib/books-translate";
import { useTheme } from "@/providers/ThemeProvider";
import ThemeControls from "@/components/ui/ThemeControls";

interface HistoryEntry {
  book: string;
  chapter: string;
  at: number;
}

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const book = getBook(String(params.slug));

  const [chapterId, setChapterId] = useState(() => {
    if (typeof window === "undefined" || !book) return "";
    const saved = localStorage.getItem(`book-last-${book.slug}`);
    return saved && book.chapters.some((c) => c.id === saved)
      ? saved
      : book.chapters[0]?.id || "";
  });

  useEffect(() => {
    if (!book) return;
    const params = new URLSearchParams(window.location.search);
    const chapter = params.get("chapter");
    if (chapter && book.chapters.some((c) => c.id === chapter)) {
      setChapterId(chapter);
      window.history.replaceState({}, "", `/books/${book.slug}`);
    }
  }, [book]);
  const [search, setSearch] = useState("");
  const [showChapters, setShowChapters] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [translated, setTranslated] = useState<string[] | null>(null);
  const [targetLang, setTargetLang] = useState("Hindi");
  const [translating, setTranslating] = useState(false);
  const [fontSize, setFontSize] = useState(20);

  const chapter = useMemo(
    () => book?.chapters.find((c) => c.id === chapterId) || null,
    [book, chapterId]
  );

  const filteredChapters = useMemo(() => {
    if (!book) return [];
    const q = search.trim().toLowerCase();
    if (!q) return book.chapters;
    return book.chapters.filter(
      (c) =>
        c.titleUr.includes(q) ||
        c.titleEn.toLowerCase().includes(q) ||
        c.contentUr.some((p) => p.toLowerCase().includes(q))
    );
  }, [book, search]);

  function openChapter(id: string) {
    setChapterId(id);
    setTranslated(null);
    setShowChapters(false);
    setSearch("");
    if (book) {
      localStorage.setItem(`book-last-${book.slug}`, id);
      try {
        const history = JSON.parse(localStorage.getItem("book-history") || "[]") as HistoryEntry[];
        // eslint-disable-next-line react-hooks/purity
        const entry: HistoryEntry = { book: book.slug, chapter: id, at: Date.now() };
        const next = [entry, ...history.filter((h) => !(h.book === book.slug && h.chapter === id))].slice(0, 50);
        localStorage.setItem("book-history", JSON.stringify(next));
      } catch {}
    }
  }

  async function handleTranslate(lang: string) {
    if (!chapter) return;
    setTranslating(true);
    setTargetLang(lang);
    try {
      const result = await translateBookContent(chapter.contentUr, lang);
      setTranslated(result);
    } finally {
      setTranslating(false);
    }
  }

  function copyChapter() {
    if (!chapter) return;
    const text = (translated || chapter.contentUr).join("\n\n");
    navigator.clipboard.writeText(text);
  }

  if (!book) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50 dark:bg-zinc-950">
        <h2 className="text-2xl font-bold text-red-600">Book nahi mili.</h2>
      </main>
    );
  }

  const dark = darkMode;

  return (
    <main className={dark ? "min-h-screen bg-zinc-950 text-zinc-100" : "min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 text-zinc-900"}>
      <div className={`fixed left-0 top-0 -z-10 h-72 w-72 rounded-full blur-[120px] ${dark ? "bg-emerald-900/40" : "bg-emerald-300/30"}`} />

      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/books")}
            className={`flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow transition ${
              dark ? "bg-zinc-900 text-zinc-200 ring-1 ring-zinc-700" : "bg-white text-emerald-700 ring-1 ring-emerald-100"
            }`}
          >
            <ChevronLeft size={16} /> Books
          </button>
          <ThemeControls />
        </div>

        {/* Book Header */}
        <div className={`mt-6 overflow-hidden rounded-3xl bg-gradient-to-r ${book.accent} p-7 text-white shadow-2xl`}>
          <div className="text-5xl">{book.icon}</div>
          <h1 className="mt-3 text-3xl font-extrabold" dir="rtl">
            {book.titleUr}
          </h1>
          <h2 className="mt-1 text-lg font-semibold text-white/90">{book.titleEn}</h2>
          <p className="mt-1 text-sm text-white/80">{book.authorEn}</p>
          <p className="mt-3 text-sm leading-6 text-white/85">{book.descriptionEn}</p>
          {book.pdf && getPdfByFile(book.pdf) && (
            <button
              onClick={() => router.push(`/pdf/${getPdfByFile(book.pdf)!.id}`)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
            >
              <FileText size={16} />
              Read PDF Version (page by page)
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowChapters((v) => !v)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold shadow-lg transition ${
              dark ? "bg-zinc-900 text-emerald-300 ring-1 ring-zinc-700" : "bg-white text-emerald-800 ring-1 ring-emerald-100"
            }`}
          >
            <Search size={16} /> Chapters Khojein
          </button>
          <button
            onClick={() => setShowLang((v) => !v)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold shadow-lg transition ${
              dark ? "bg-zinc-900 text-emerald-300 ring-1 ring-zinc-700" : "bg-white text-emerald-800 ring-1 ring-emerald-100"
            }`}
          >
            <Globe size={16} /> Translate ({targetLang})
          </button>
        </div>

        {showChapters && (
          <div className={`mt-4 overflow-hidden rounded-3xl shadow-2xl ${dark ? "bg-zinc-900 ring-1 ring-zinc-700" : "bg-white ring-1 ring-emerald-50"}`}>
            <div className="relative border-b p-4 dark:border-zinc-800">
              <Search className={`absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 ${dark ? "text-zinc-400" : "text-emerald-600"}`} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Chapter ya topic khojein..."
                className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none ${
                  dark ? "bg-zinc-800 text-zinc-100 placeholder:text-zinc-500" : "bg-emerald-50 text-gray-800 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="max-h-96 overflow-y-auto p-3">
              {filteredChapters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openChapter(c.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition ${
                    c.id === chapterId
                      ? "bg-emerald-700 text-white"
                      : dark
                      ? "text-zinc-200 hover:bg-zinc-800"
                      : "text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  <span className="font-semibold" dir="rtl">{c.titleUr}</span>
                  <span className={`text-xs ${c.id === chapterId ? "text-emerald-100" : "text-gray-400"}`}>
                    {c.titleEn}
                  </span>
                </button>
              ))}
              {filteredChapters.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">
                  Is topic par kuch nahi mila.
                </p>
              )}
            </div>
          </div>
        )}

        {showLang && (
          <div className={`mt-4 rounded-3xl p-4 shadow-2xl ${dark ? "bg-zinc-900 ring-1 ring-zinc-700" : "bg-white ring-1 ring-emerald-50"}`}>
            <p className="mb-3 text-sm font-bold text-gray-500 dark:text-zinc-400">
              Is chapter ko kisi bhi language me translate karein:
            </p>
            <div className="flex flex-wrap gap-2">
              {TRANSLATE_LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleTranslate(lang)}
                  disabled={translating}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    targetLang === lang && translated
                      ? "bg-emerald-700 text-white"
                      : dark
                      ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {translating && (
              <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <Loader2 size={16} className="animate-spin" /> Translate ho raha hai...
              </p>
            )}
          </div>
        )}

        {/* Reading Progress line */}
        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-zinc-800">
          <div
            className="h-1.5 rounded-full bg-emerald-600 transition-all"
            style={{
              width: chapter
                ? `${((book.chapters.findIndex((c) => c.id === chapterId) + 1) / book.chapters.length) * 100}%`
                : "0%",
            }}
          />
        </div>

        {/* Chapter Content */}
        {chapter && (
          <motion.div
            key={chapterId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 overflow-hidden rounded-3xl shadow-2xl ${dark ? "bg-zinc-900 ring-1 ring-zinc-800" : "bg-white ring-1 ring-emerald-50"}`}
          >
            <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${dark ? "bg-zinc-900/70" : "bg-emerald-50/50"}`}>
              <div>
                <h2 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400" dir="rtl">
                  {chapter.titleUr}
                </h2>
                <p className="text-xs text-gray-400">{chapter.titleEn}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 1))}
                  className={`rounded-xl px-3 py-2 text-sm font-bold ${dark ? "bg-zinc-800 text-zinc-200" : "bg-emerald-100 text-emerald-700"}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(Math.min(30, fontSize + 1))}
                  className={`rounded-xl px-3 py-2 text-sm font-bold ${dark ? "bg-zinc-800 text-zinc-200" : "bg-emerald-100 text-emerald-700"}`}
                >
                  A+
                </button>
                <button
                  onClick={copyChapter}
                  className={`rounded-xl px-3 py-2 ${dark ? "bg-zinc-800 text-zinc-200" : "bg-emerald-100 text-emerald-700"}`}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {(translated || chapter.contentUr).map((para, i) => (
                <p
                  key={i}
                  dir="rtl"
                  style={{ fontSize: `${fontSize}px` }}
                  className="leading-10 text-gray-800 first:mt-0 dark:text-zinc-200"
                >
                  {para}
                </p>
              ))}

              {translated && (
                <p className="mt-8 text-xs text-gray-400">
                  ✓ {targetLang} me machine translation — Asli Urdu text upar ke baad hai.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Prev/Next chapter */}
        {chapter && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => {
                const idx = book.chapters.findIndex((c) => c.id === chapterId);
                if (idx > 0) openChapter(book.chapters[idx - 1].id);
              }}
              disabled={book.chapters.findIndex((c) => c.id === chapterId) <= 0}
              className="flex items-center gap-1 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Pichla Baab
            </button>
            <button
              onClick={() => {
                const idx = book.chapters.findIndex((c) => c.id === chapterId);
                if (idx < book.chapters.length - 1) openChapter(book.chapters[idx + 1].id);
              }}
              disabled={book.chapters.findIndex((c) => c.id === chapterId) >= book.chapters.length - 1}
              className="flex items-center gap-1 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Agla Baab <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
