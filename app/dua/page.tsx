"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";

interface Dua {
  category: string;
  icon: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
}

const DUA_GROUPS: { name: string; icon: string }[] = [
  { name: "Morning", icon: "🌅" },
  { name: "Evening", icon: "🌇" },
  { name: "Sleeping", icon: "🌙" },
  { name: "Waking", icon: "☀️" },
  { name: "Eating", icon: "🍽️" },
  { name: "Travel", icon: "✈️" },
];

const DUAS: Dua[] = [
  {
    category: "Morning",
    icon: "🌅",
    title: "Morning Remembrance",
    arabic: "اَللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
    transliteration: "Allahumma bika asbahna wa bika amsayna",
    translation:
      "O Allah, by You we have entered the morning and by You we enter the evening.",
    reference: "Morning Adhkar",
  },
  {
    category: "Morning",
    icon: "🌅",
    title: "Protection for the Day",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay",
    translation:
      "In the name of Allah, with whose name nothing can harm on earth or in heaven.",
    reference: "Abu Dawud",
  },
  {
    category: "Evening",
    icon: "🌇",
    title: "Evening Remembrance",
    arabic: "اَللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا",
    transliteration: "Allahumma bika amsayna wa bika asbahna",
    translation:
      "O Allah, by You we have entered the evening and by You we enter the morning.",
    reference: "Evening Adhkar",
  },
  {
    category: "Sleeping",
    icon: "🌙",
    title: "Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amootu wa ahya",
    translation:
      "In Your name, O Allah, I die and I live.",
    reference: "Sahih al-Bukhari",
  },
  {
    category: "Waking",
    icon: "☀️",
    title: "After Waking",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana",
    translation:
      "Praise be to Allah who gave us life after He had taken it from us.",
    reference: "Sahih al-Bukhari",
  },
  {
    category: "Eating",
    icon: "🍽️",
    title: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    reference: "Sunan Abu Dawud",
  },
  {
    category: "Travel",
    icon: "✈️",
    title: "Before Traveling",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    transliteration: "Subhanal-ladhi sakh-khara lana hadha wama kunna lahu muqrinin",
    translation:
      "Glory be to Him who has subjected this to us, and we could never have it by our efforts.",
    reference: "Surah Az-Zukhruf 43:13",
  },
];

export default function DuaPage() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState("");

  const filtered =
    activeCategory === "All"
      ? DUAS
      : DUAS.filter((d) => d.category === activeCategory);

  async function copyDua(text: string, title: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(title);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-yellow-300/30 blur-[120px]" />

      <div className="mx-auto max-w-3xl px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <h1 className="text-2xl font-extrabold text-emerald-800">
              Daily Duas
            </h1>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            ← Back
          </button>
        </div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[30px] bg-gradient-to-br from-emerald-700 to-green-900 p-8 text-center text-white shadow-2xl"
        >
          <div className="text-6xl">🤲</div>
          <h2 className="mt-4 text-3xl font-bold">
            الدُّعَاءُ هُوَ الْعِبَادَةُ
          </h2>
          <p className="mt-3 text-emerald-100">
            &ldquo;Dua is the essence of worship.&rdquo;
          </p>
          <p className="mt-2 text-sm text-emerald-200">
            — Tirmidhi • Hadith 3371
          </p>
        </motion.div>

        {/* Categories */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {["All", ...DUA_GROUPS.map((g) => g.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-emerald-700 text-white shadow-lg"
                  : "bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-emerald-50"
              }`}
            >
              {DUA_GROUPS.find((g) => g.name === cat)?.icon}{" "}
              {cat}
            </button>
          ))}
        </div>

        {/* Duas */}
        <div className="mt-6 space-y-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((dua) => (
              <motion.div
                key={dua.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-emerald-50/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{dua.icon}</span>
                    <h3 className="text-xl font-bold text-gray-800">
                      {dua.title}
                    </h3>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyDua(dua.arabic, dua.title)}
                    className={`rounded-xl p-2.5 transition ${
                      copied === dua.title
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {copied === dua.title ? <Check size={18} /> : <Copy size={18} />}
                  </motion.button>
                </div>

                <p
                  dir="rtl"
                  className="mt-5 text-right text-2xl leading-loose text-emerald-800"
                >
                  {dua.arabic}
                </p>

                <p className="mt-4 text-sm italic text-gray-500">
                  {dua.transliteration}
                </p>

                <p className="mt-3 leading-relaxed text-gray-700">
                  {dua.translation}
                </p>

                <p className="mt-4 text-sm font-semibold text-emerald-700">
                  📖 {dua.reference}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
