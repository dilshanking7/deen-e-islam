"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, RefreshCw, Share2 } from "lucide-react";
import { getRandomVerse, getVerseOfTheDay, type DailyVerse } from "@/lib/daily-verse";

export default function DailyVersePage() {
  const router = useRouter();
  const [verse, setVerse] = useState<DailyVerse>(() => getRandomVerse());
  const [copied, setCopied] = useState(false);

  function nextVerse() {
    setVerse(getRandomVerse());
    setCopied(false);
  }

  async function shareVerse() {
    const text = `${verse.arabic}\n\n"${verse.translation}"\n\n— ${verse.reference}\n\nIslaam-E-Deen`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Verse of the Day", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 px-5 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/quran")}
            className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 font-semibold text-emerald-700 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
            Quran
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Verse of the Day</h1>
          <button
            onClick={shareVerse}
            className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 font-semibold text-emerald-700 shadow-lg"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          key={verse.reference}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-10 rounded-[35px] bg-white p-8 text-center shadow-2xl ring-1 ring-emerald-100"
        >
          <p className="text-6xl">📖</p>
          <p className="mt-8 text-3xl font-semibold leading-[1.9] text-emerald-900" dir="rtl">
            {verse.arabic}
          </p>
          <div className="mx-auto my-6 h-px w-24 bg-emerald-200" />
          <p className="text-xl leading-9 text-gray-700">
            &ldquo;{verse.translation}&rdquo;
          </p>
          <p className="mt-5 font-bold text-emerald-700">{verse.reference}</p>
          <p className="mt-1 text-sm text-gray-400">{getVerseOfTheDay().reference} — aaj ki aayat</p>
        </motion.div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={nextVerse}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-lg hover:bg-emerald-700"
          >
            <RefreshCw className="h-5 w-5" />
            Naya Verse Dekhein
          </button>
          <button
            onClick={shareVerse}
            className="flex-1 rounded-2xl bg-white px-5 py-4 font-bold text-emerald-700 shadow-lg ring-1 ring-emerald-100"
          >
            {copied ? "Copied ✓" : "Copy / Share"}
          </button>
        </div>
      </div>
    </main>
  );
}
