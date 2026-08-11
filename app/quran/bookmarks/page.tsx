"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bookmark, Trash2 } from "lucide-react";
import { getBookmarks, removeBookmark, type BookmarkData } from "@/lib/quran-bookmark";
import { SURAH_PAGE_MAP } from "@/lib/surah-page-map";

export default function QuranBookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then((b) =>
        setBookmarks(
          b.sort((x, y) => x.createdAt - y.createdAt).reverse()
        )
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(surahNumber: number, ayahNumber: number) {
    await removeBookmark(surahNumber, ayahNumber);
    setBookmarks((prev) =>
      prev.filter(
        (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
      )
    );
  }

  const openSurah = (surahNumber: number) => {
    const mapped = SURAH_PAGE_MAP.find((s) => s.number === surahNumber);
    if (mapped) {
      router.push(`/quran/mushaf?page=${mapped.page}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/quran")}
            className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 font-semibold text-emerald-700 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
            Quran
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Bookmarks</h1>
          <div className="w-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          {loading && (
            <p className="py-10 text-center text-gray-400">Loading...</p>
          )}

          {!loading && bookmarks.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
              <p className="text-5xl">🔖</p>
              <p className="mt-4 font-semibold text-gray-700">
                No bookmarks yet.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Tap the bookmark icon while reading the Quran to save an ayah here.
              </p>
            </div>
          )}

          {bookmarks.map((b) => (
            <div
              key={`${b.surahNumber}_${b.ayahNumber}`}
              className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-emerald-50/50"
            >
              <button onClick={() => openSurah(b.surahNumber)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-white">
                  <Bookmark size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-gray-800">{b.surahName}</h3>
                  <p className="text-sm text-gray-500">
                    Ayah {b.ayahNumber}
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleRemove(b.surahNumber, b.ayahNumber)}
                className="rounded-xl bg-red-50 p-3 text-red-500 transition hover:bg-red-100"
                title="Remove bookmark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
