"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { getSurahList, searchSurahs, type SurahMeta } from "@/lib/surah-list";
import { SURAH_PAGE_MAP } from "@/lib/surah-page-map";

export default function QuranSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const results = searchSurahs(surahs, query);

  const openSurah = (surah: SurahMeta) => {
    const mapped = SURAH_PAGE_MAP.find((s) => s.number === surah.number);
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
          <h1 className="text-2xl font-bold text-gray-800">Search</h1>
          <div className="w-10" />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg">
          <Search className="h-5 w-5 text-emerald-600" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a surah by name or number..."
            className="w-full bg-transparent outline-none text-gray-700"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          {loading && (
            <p className="py-10 text-center text-gray-400">Loading...</p>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="py-10 text-center text-gray-400">
              No surah found for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.map((surah) => (
            <button
              key={surah.number}
              onClick={() => openSurah(surah)}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-xl ring-1 ring-emerald-50/50 transition hover:ring-2 hover:ring-emerald-300"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-green-700 font-bold text-white">
                {surah.number}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-gray-800">
                  {surah.englishName}
                </h3>
                <p className="truncate text-sm text-gray-500">
                  {surah.englishNameTranslation} • {surah.revelationType}
                </p>
              </div>
              <p className="text-lg font-semibold text-emerald-700 arfont">
                {surah.name}
              </p>
            </button>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
