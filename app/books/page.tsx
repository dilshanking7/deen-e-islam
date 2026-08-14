"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, FileText, BookOpen, ChevronRight } from "lucide-react";
import { BOOKS, getBook } from "@/lib/books-data";
import { PDF_FILES } from "@/lib/pdfs-data";
import { useI18n } from "@/lib/i18n";

interface SearchResult {
  bookSlug: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
}

export default function BooksPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const found: SearchResult[] = [];
    BOOKS.forEach((book) => {
      book.chapters.forEach((c) => {
        const matches =
          c.titleUr.toLowerCase().includes(q) ||
          c.titleEn.toLowerCase().includes(q) ||
          c.contentUr.some((p) => p.toLowerCase().includes(q));
        if (matches) {
          found.push({
            bookSlug: book.slug,
            chapterId: c.id,
            bookTitle: book.titleEn,
            chapterTitle: c.titleEn,
          });
        }
      });
    });
    return found.slice(0, 20);
  }, [search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-300/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-28 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
                {t("books.title")}
              </h1>
              <p className="text-xs text-gray-500">{t("books.subtitle")}</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/library")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            ← {t("books.back")}
          </button>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-600">
          {t("books.about")}
        </p>

        {/* Global search */}
        <div className="relative mt-6">
          <Search
            className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("books.searchPlaceholder")}
            className="w-full rounded-2xl bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-lg ring-1 ring-emerald-50 outline-none transition focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {search.trim() && (
          <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-emerald-50">
            <div className="border-b border-gray-100 px-5 py-3">
              <p className="text-sm font-bold text-gray-700">
                {results.length > 0
                  ? `${results.length} ${t("books.results")}`
                  : t("books.noResults")}
              </p>
            </div>
            {results.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {results.map((r) => (
                  <button
                    key={`${r.bookSlug}-${r.chapterId}`}
                    onClick={() =>
                      router.push(`/books/${r.bookSlug}?chapter=${r.chapterId}`)
                    }
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-emerald-50/60"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{r.chapterTitle}</p>
                      <p className="text-xs text-gray-500">{r.bookTitle}</p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-gray-300" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-gray-400">{t("books.noResults")}</p>
            )}
          </div>
        )}

        {/* Books grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {BOOKS.map((book, i) => (
            <motion.div
              key={book.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => router.push(`/books/${book.slug}`)}
              className="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-xl transition"
            >
              <div className={`bg-gradient-to-r ${book.accent} p-6 text-white`}>
                <div className="text-5xl">{book.icon}</div>
                <h2 className="mt-4 text-2xl font-extrabold" dir="rtl">
                  {book.titleUr}
                </h2>
                <h3 className="mt-1 text-sm font-semibold text-white/90">
                  {book.titleEn}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-gray-500">{book.authorEn}</p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {book.descriptionEn}
                </p>
                <button className="mt-5 w-full rounded-2xl bg-emerald-700 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                  {t("books.readBook")} →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PDF Library */}
        <div className="mt-14">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-emerald-700" />
            <h2 className="text-xl font-bold sm:text-2xl">{t("books.pdfLibrary")}</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">{t("books.pdfDesc")}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {PDF_FILES.map((pdf) => (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-emerald-50/50"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-2xl shadow-md">
                  {pdf.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-gray-800">{pdf.title}</h3>
                  <p className="truncate text-xs text-gray-500">{pdf.subtitle}</p>
                  <button
                    onClick={() => router.push(`/pdf/${pdf.id}`)}
                    className="mt-2 inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <BookOpen size={13} />
                    {t("books.readPdf")}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {getBook("kaanoon-e-shariat") && (
            <p className="mt-4 text-xs text-gray-400">{t("books.pdfNote")}</p>
          )}
        </div>
      </div>
    </main>
  );
}
