"use client";

import type { LastReadData } from "@/lib/quran-history";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getSurahs } from "@/lib/quran-api";
import { getLastRead } from "@/lib/quran-history";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export default function QuranReadPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastRead, setLastRead] = useState<LastReadData | null>(null);

  async function loadSurahs() {
    try {
      setLoading(true);
      setError("");

      const data = await getSurahs();

      setSurahs(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load Quran.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => loadSurahs());
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    async function loadLastRead() {
      const data = await getLastRead();

      if (data) {
        setLastRead(data);
      }
    }

    loadLastRead();
  }, []);

  const filtered = useMemo(() => {
    return surahs.filter((item) => {
      const value = search.toLowerCase();

      return (
        item.englishName.toLowerCase().includes(value) ||
        item.name.includes(search) ||
        item.number.toString() === search
      );
    });
  }, [search, surahs]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700">
              📖 Holy Quran
            </h1>
            <p className="text-gray-500">Read the complete Holy Quran</p>
          </div>

          <button
            onClick={loadSurahs}
            className="rounded-xl bg-emerald-700 p-3 text-white hover:bg-emerald-800"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero Section */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-[35px] bg-gradient-to-r from-emerald-700 to-green-900 p-10 text-white shadow-2xl"
        >
          <div className="flex items-center gap-5">
            <BookOpen size={60} />

            <div>
              <h2 className="text-4xl font-bold">القرآن الكريم</h2>

              <p className="mt-2 text-emerald-100">
                Search and read all 114 Surahs
              </p>
            </div>
          </div>
        </motion.div>

        {/* LAST READ CARD (Placed Right After Hero Section) */}
        {lastRead && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-10 rounded-[30px] bg-gradient-to-r from-emerald-700 to-green-900 p-8 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">📖 Continue Reading</h2>

                <p className="mt-2 text-emerald-100">
                  Surah {lastRead.surahName}
                </p>

                <p className="mt-1 text-emerald-200">
                  Ayah {lastRead.ayahNumber}
                </p>
              </div>

              <Link
                href={`/quran/read/${lastRead.surahNumber}`}
                className="rounded-2xl bg-white px-6 py-4 font-bold text-emerald-700 transition hover:scale-105"
              >
                Continue →
              </Link>
            </div>
          </motion.div>
        )}

        {/* Search Input */}
        <div className="relative mt-10">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            size={22}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Surah..."
            className="w-full rounded-2xl border bg-white py-5 pl-14 pr-5 shadow-md outline-none focus:border-emerald-600"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(12)].map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: index * 0.08,
                }}
                className="h-40 rounded-3xl bg-white shadow-xl"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 rounded-3xl bg-red-50 p-10 text-center shadow-lg">
            <div className="text-6xl">😢</div>

            <h2 className="mt-5 text-3xl font-bold text-red-700">
              Something went wrong
            </h2>

            <p className="mt-3 text-gray-600">{error}</p>

            <button
              onClick={loadSurahs}
              className="mt-8 rounded-2xl bg-red-600 px-8 py-4 font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Surah Grid */}
        {!loading && !error && (
          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((surah, index) => (
              <motion.div
                key={surah.number}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.03,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
              >
                <Link href={`/quran/read/${surah.number}`}>
                  <div className="group rounded-[30px] border border-emerald-100 bg-white p-7 shadow-xl transition-all hover:border-emerald-400 hover:shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                        {surah.number}
                      </div>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {surah.revelationType}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h2 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-700">
                        {surah.englishName}
                      </h2>

                      <p className="mt-1 text-gray-500">
                        {surah.englishNameTranslation}
                      </p>
                    </div>

                    <div className="mt-7 flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-emerald-700">
                          {surah.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {surah.numberOfAyahs} Ayahs
                        </p>
                      </div>

                      <div className="rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white transition group-hover:bg-emerald-800">
                        Read →
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Search Result */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="mt-16 rounded-[35px] bg-white p-12 text-center shadow-2xl"
          >
            <div className="text-7xl">🔍</div>

            <h2 className="mt-6 text-3xl font-bold text-gray-800">
              No Surah Found
            </h2>

            <p className="mt-4 text-lg text-gray-500">
              Try another Surah name or Surah number.
            </p>
          </motion.div>
        )}
      </section>

      {/* Floating Stats */}
      <div className="fixed bottom-8 left-8 z-40">
        <motion.div
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="rounded-full bg-emerald-700 px-6 py-4 text-white shadow-2xl"
        >
          <h2 className="font-bold">
            {filtered.length} / {surahs.length}
          </h2>

          <p className="text-xs opacity-90">Surahs</p>
        </motion.div>
      </div>

      {/* Scroll To Top */}
      <motion.button
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-3xl text-white shadow-2xl hover:bg-emerald-800"
      >
        ↑
      </motion.button>

      {/* Footer */}
      <footer className="mt-24 border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h2 className="text-2xl font-bold text-emerald-700">
                📖 Holy Quran
              </h2>

              <p className="mt-4 leading-8 text-gray-600">
                Read the complete Holy Quran with beautiful Arabic script,
                translations, audio recitation, bookmarks and many more
                features inside Islaam-E-Deen.
              </p>
            </div>

            <div>
              <h3 className="mb-5 text-xl font-bold">Quick Links</h3>

              <div className="space-y-3">
                <Link
                  href="/quran"
                  className="block text-gray-600 hover:text-emerald-700"
                >
                  Quran Home
                </Link>

                <Link
                  href="/hadith"
                  className="block text-gray-600 hover:text-emerald-700"
                >
                  Hadith
                </Link>

                <Link
                  href="/dua"
                  className="block text-gray-600 hover:text-emerald-700"
                >
                  Daily Dua
                </Link>

                <Link
                  href="/prayer-times"
                  className="block text-gray-600 hover:text-emerald-700"
                >
                  Prayer Times
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-xl font-bold">Statistics</h3>

              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <h2 className="text-2xl font-bold text-emerald-700">114</h2>

                  <p className="text-gray-500">Total Surahs</p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <h2 className="text-2xl font-bold text-emerald-700">6236</h2>

                  <p className="text-gray-500">Total Ayahs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t pt-8 text-center text-gray-500">
            © 2026 Islaam-E-Deen • Built with ❤️ for the Ummah
          </div>
        </div>
      </footer>
    </main>
  );
}