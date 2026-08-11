"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuranPage() {
  const router = useRouter();

  const features = [
    {
      title: "Read Quran",
      icon: "📖",
      desc: "Read the complete Holy Quran with beautiful Arabic text.",
    },
    {
      title: "Translations",
      icon: "🌍",
      desc: "Read Quran in English, Hindi and Urdu.",
    },
    {
      title: "Audio Recitation",
      icon: "🎧",
      desc: "Listen to beautiful recitations from famous Qaris.",
    },
    {
      title: "Bookmarks",
      icon: "🔖",
      desc: "Save your favourite Surahs and Ayahs.",
    },
    {
      title: "Daily Verse",
      icon: "✨",
      desc: "Receive a new Quran verse every day.",
    },
    {
      title: "Search",
      icon: "🔍",
      desc: "Search any Surah, Ayah or keyword instantly.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/quran/read")}
            className="rounded-xl bg-emerald-700 px-6 py-3 text-white shadow-lg transition hover:bg-emerald-800"
          >
            Open →
          </button>

          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <h1 className="text-2xl font-bold text-emerald-700">
              📖 Holy Quran
            </h1>
          </div>

          <div className="w-20" />
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-[35px] bg-gradient-to-r from-emerald-700 to-green-900 p-10 text-center text-white shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto inline-block overflow-hidden rounded-full bg-white/10 p-3 ring-2 ring-white/20"
          >
            <Image
              src="/logo.png"
              alt="Islaam-E-Deen Logo"
              width={90}
              height={90}
              className="h-20 w-20 object-contain"
            />
          </motion.div>

          <h2 className="mt-6 text-5xl font-bold">القرآن الكريم</h2>

          <p className="mt-4 text-lg text-emerald-100">
            Read, Listen and Understand the Holy Quran beautifully.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 md:grid-cols-2 xl:grid-cols-3">
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            className="cursor-pointer rounded-3xl bg-white p-8 shadow-xl transition"
          >
            <div className="text-5xl">{item.icon}</div>

            <h3 className="mt-5 text-2xl font-bold text-gray-800">
              {item.title}
            </h3>

            <p className="mt-3 text-gray-500">{item.desc}</p>

            <Link
              href={
                item.title === "Read Quran"
                  ? "/quran/read"
                  : item.title === "Translations"
                  ? "/quran/translation"
                  : item.title === "Audio Recitation"
                  ? "/quran/audio"
                  : item.title === "Bookmarks"
                  ? "/quran/bookmarks"
                  : item.title === "Daily Verse"
                  ? "/quran/daily-verse"
                  : "/quran/search"
              }
              className="mt-8 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              Open →
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  );
}