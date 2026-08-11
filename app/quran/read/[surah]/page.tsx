"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { SURAH_PAGE_MAP } from "@/lib/surah-page-map";

export default function SurahReadPage() {
  const router = useRouter();

  const params = useParams();

  useEffect(() => {
    const surahNumber = Number(params.surah);

    const surah = SURAH_PAGE_MAP.find(
      (item) => item.number === surahNumber
    );

    if (!surah) {
      router.replace("/quran");
      return;
    }

    router.replace(
      `/quran/mushaf?page=${surah.page}`
    );
  }, [params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />

        <h1 className="text-3xl font-bold text-emerald-700">
          Opening Quran...
        </h1>

        <p className="mt-3 text-gray-600">
          Please wait...
        </p>
      </div>
    </main>
  );
}