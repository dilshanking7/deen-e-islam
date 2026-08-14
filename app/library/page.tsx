"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, FileText, Heart, Leaf } from "lucide-react";
import { BOOKS } from "@/lib/books-data";
import { useI18n } from "@/lib/i18n";

export default function LibraryPage() {
  const router = useRouter();
  const { t } = useI18n();

  const sections = [
    {
      title: t("library.quran"),
      desc: t("library.quranDesc"),
      icon: "📖",
      color: "from-emerald-600 to-green-700",
      items: [
        { label: t("library.readQuran"), path: "/quran/read" },
        { label: t("library.translation"), path: "/quran/translation" },
        { label: t("library.mushaf"), path: "/quran/mushaf" },
        { label: t("library.dailyVerse"), path: "/quran/daily-verse" },
      ],
    },
    {
      title: t("library.names"),
      desc: t("library.namesDesc"),
      icon: "📿",
      color: "from-purple-600 to-violet-700",
      items: [
        { label: t("library.names99"), path: "/names" },
        { label: t("library.namesWazifa"), path: "/names" },
      ],
    },
    {
      title: t("library.duas"),
      desc: t("library.duasDesc"),
      icon: "🤲",
      color: "from-amber-500 to-orange-600",
      items: [{ label: t("library.essentialDuas"), path: "/dua" }],
    },
    {
      title: t("library.hadith"),
      desc: t("library.hadithDesc"),
      icon: "📚",
      color: "from-sky-500 to-blue-700",
      items: [{ label: t("library.hadithLibrary"), path: "/hadith" }],
    },
    {
      title: "Naat Sharif",
      desc: "Naatein likhein, parhein aur download karein",
      icon: "🎵",
      color: "from-teal-500 to-cyan-600",
      items: [{ label: "Naat Sharif Library", path: "/naat" }],
    },
    {
      title: "Ambiya (Prophets)",
      desc: "Nabiyon ki kahaniyan aur wilaadat",
      icon: "🕊️",
      color: "from-indigo-500 to-blue-600",
      items: [{ label: "Prophets ke halaat", path: "/prophets" }],
    },
    {
      title: t("library.books"),
      desc: t("library.booksDesc"),
      icon: "📕",
      color: "from-rose-500 to-pink-600",
      items: [
        { label: t("library.allBooks"), path: "/books" },
        ...BOOKS.map((b) => ({ label: b.titleEn, path: `/books/${b.slug}` })),
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-300/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-28 pt-8">
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
              {t("library.title")}
            </h1>
            <p className="text-xs text-gray-500">{t("library.subtitle")}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-emerald-50/50"
            >
              <div className={`flex items-center gap-3 bg-gradient-to-r ${section.color} p-5 text-white`}>
                <span className="text-3xl">{section.icon}</span>
                <div>
                  <h2 className="text-xl font-extrabold">{section.title}</h2>
                  <p className="text-sm text-white/85">{section.desc}</p>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-emerald-50/60"
                  >
                    <span className="flex items-center gap-3 font-semibold text-gray-700">
                      <BookOpen size={16} className="shrink-0 text-emerald-600" />
                      {item.label}
                    </span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-gray-500">
          <Heart size={15} className="text-emerald-600" />
          <Leaf size={15} className="text-green-600" />
          <span>{t("library.blessing")}</span>
          <FileText size={15} className="text-purple-500" />
        </div>
      </div>
    </main>
  );
}
