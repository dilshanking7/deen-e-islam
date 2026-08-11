"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, History, BookOpen } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getBookmarks, type BookmarkData } from "@/lib/quran-bookmark";
import { getLastRead, type LastReadData } from "@/lib/quran-history";
import ThemeControls from "@/components/ui/ThemeControls";
import DownloadButton from "@/components/pwa/DownloadButton";

interface BookHistoryEntry {
  book: string;
  chapter: string;
  at: number;
}

export default function ProgressPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);
  const [bookHistory, setBookHistory] = useState<BookHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const [marks, last] = await Promise.all([getBookmarks(), getLastRead()]);
        setBookmarks(marks.sort((a, b) => b.createdAt - a.createdAt));
        setLastRead(last);
      } catch {}
      try {
        const bh = JSON.parse(localStorage.getItem("book-history") || "[]");
        setBookHistory(bh.slice(0, 20));
      } catch {}
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <h1 className="text-2xl font-extrabold text-emerald-800">My Progress</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeControls />
            <DownloadButton />
            <button
              onClick={() => router.push("/home")}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Last Read */}
        {lastRead && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-green-700 p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm text-emerald-100">
                  <BookOpen size={16} /> Last Read
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Surah {lastRead.surahName}
                </h2>
                <p className="mt-1 text-sm text-emerald-100">
                  Ayah {lastRead.ayahNumber}
                </p>
              </div>
              <button
                onClick={() => router.push(`/quran/translation/${lastRead.surahNumber}`)}
                className="rounded-2xl bg-white px-5 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Resume →
              </button>
            </div>
          </motion.div>
        )}

        {/* Bookmarks */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Bookmark className="h-5 w-5 text-amber-500" /> Bookmarks
            <span className="text-base font-semibold text-gray-400">({bookmarks.length})</span>
          </h2>
          <div className="mt-4 space-y-3">
            {bookmarks.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-gray-400 shadow">
                Abhi koi bookmark nahi hai. Quran me ayah bookmark karein.
              </p>
            )}
            {bookmarks.map((b) => (
              <button
                key={`${b.surahNumber}_${b.ayahNumber}`}
                onClick={() => router.push(`/quran/translation/${b.surahNumber}`)}
                className="flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left shadow transition hover:bg-emerald-50"
              >
                <div>
                  <p className="font-bold text-gray-800">Surah {b.surahName}</p>
                  <p className="text-sm text-gray-400">Ayah {b.ayahNumber}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600">
                  {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Book Reading History */}
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <History className="h-5 w-5 text-emerald-600" /> Books History
          </h2>
          <div className="mt-4 space-y-3">
            {bookHistory.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-gray-400 shadow">
                Abhi koi kitaab nahi padhi. Books section se shuru karein.
              </p>
            )}
            {bookHistory.map((h) => (
              <button
                key={`${h.book}-${h.chapter}`}
                onClick={() => router.push(`/books/${h.book}`)}
                className="flex w-full items-center justify-between rounded-2xl bg-white p-5 text-left shadow transition hover:bg-emerald-50"
              >
                <div>
                  <p className="font-bold capitalize text-gray-800">
                    {h.book.replace(/-/g, " ")}
                  </p>
                  <p className="text-sm text-gray-400">Chapter: {h.chapter}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(h.at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/quran")}
          className="mt-10 w-full rounded-2xl bg-emerald-700 py-4 font-bold text-white transition hover:bg-emerald-800"
        >
          Quran Padhna Jari Rakhein →
        </button>
      </div>
    </main>
  );
}
