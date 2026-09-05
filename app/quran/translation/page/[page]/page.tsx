"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";

import { getPageAyahs } from "@/lib/quran-page-audio";
import { getSurahByPage } from "@/lib/surah-page-map";
import { getSurah, getTranslation } from "@/lib/quran-api";
import { TOTAL_PAGES } from "@/lib/mushaf-api";

interface TranslatedAyah {
  number: number;
  arabic: string;
  english: string;
}

const cache = new Map<
  number,
  { number: number; name: string; englishName: string; ayahs: TranslatedAyah[] }
>();

async function loadSurah(n: number) {
  if (cache.has(n)) return cache.get(n)!;
  const [ar, en] = await Promise.all([
    getSurah(n).catch(() => null),
    getTranslation(n).catch(() => null),
  ]);
  const count = Math.max(ar?.ayahs?.length || 0, en?.ayahs?.length || 0, 1);
  const ayahs: TranslatedAyah[] = Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    arabic: ar?.ayahs?.[i]?.text || "",
    english: en?.ayahs?.[i]?.text || "",
  }));
  const data = {
    number: n,
    name: ar?.name || en?.name || "",
    englishName: ar?.englishName || en?.englishName || "",
    ayahs,
  };
  cache.set(n, data);
  return data;
}

export default function PageTranslation() {
  const params = useParams();
  const router = useRouter();

  const page = useMemo(() => {
    const n = Number(params.page);
    return n >= 1 && n <= TOTAL_PAGES ? Math.round(n) : 1;
  }, [params.page]);

  const surah = useMemo(() => getSurahByPage(page), [page]);
  const ayahs = useMemo(() => getPageAyahs(page), [page]);

  const [loading, setLoading] = useState(true);
  const [surahs, setSurahs] = useState<
    Awaited<ReturnType<typeof loadSurah>>[]
  >([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      setFailed(false);

      const unique = [...new Set(ayahs.map((a) => a.surah))];

      Promise.all(unique.map((n) => loadSurah(n)))
        .then((list) => {
          if (cancelled) return;
          setSurahs(list);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [page, ayahs]);

  const goToPage = (n: number) => {
    const target = Math.max(1, Math.min(TOTAL_PAGES, n));
    router.push(`/quran/translation/page/${target}`);
  };

  const surahForAyah = (n: number) => surahs.find((s) => s.number === n);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 pb-32">
      <div className="mx-auto max-w-3xl px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">
                Page Translation
              </h1>
              <p className="text-xs text-gray-500">
                {surah.number}. {surah.name} — {surah.englishName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-2xl bg-white p-2.5 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= TOTAL_PAGES}
              className="rounded-2xl bg-white p-2.5 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Page banner */}
        <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-green-800 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <Landmark className="h-8 w-8 text-emerald-200" />
            <p className="text-lg font-extrabold">
              Mushaf Page {page} / {TOTAL_PAGES}
            </p>
          </div>
          <p className="mt-1 text-xs text-emerald-100">
            Translation of the ayahs appearing on this page
          </p>
        </div>

        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <span className="ml-3 font-semibold text-emerald-700">
              Loading translations...
            </span>
          </div>
        )}

        {failed && (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-gray-700">
              Translation nahi mil payi. Internet check karein.
            </p>
          </div>
        )}

        {!loading && !failed && (
          <div className="mt-6 space-y-4">
            {surahs.map((s) => (
              <div key={s.number} className="rounded-3xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
                  <h2 className="text-lg font-extrabold text-emerald-800">
                    {s.number}. {s.englishName}
                  </h2>
                  <p className="text-xl font-bold arfont" dir="rtl">
                    {s.name}
                  </p>
                </div>

                <div className="mt-4 space-y-5">
                  {s.ayahs
                    .filter((a) =>
                      ayahs.some(
                        (x) => x.surah === s.number && x.ayah === a.number
                      )
                    )
                    .map((a) => (
                      <div key={a.number} className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className="flex-1 text-right text-xl font-semibold leading-[1.9] arfont"
                            dir="rtl"
                          >
                            {a.arabic}
                          </p>
                          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            {surahForAyah(s.number)?.number || s.number}:{a.number}
                          </span>
                        </div>
                        <p className="text-sm leading-7 text-gray-600">
                          {a.english}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Page {Math.max(page - 1, 1)}
          </button>
          <button
            onClick={() => router.push("/quran/translation")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100"
          >
            Surahs
          </button>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= TOTAL_PAGES}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-30"
          >
            Page {Math.min(page + 1, TOTAL_PAGES)} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}