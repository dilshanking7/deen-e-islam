"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, Sparkles, BookOpen, X } from "lucide-react";
import { NAMES_99, searchNames } from "@/lib/names-data";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/providers/ThemeProvider";

export default function NamesPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const results = useMemo(() => searchNames(query), [query]);
  const active = selected !== null ? NAMES_99.find((n) => n.no === selected) || null : null;

  const title = t("names.title");
  const subtitle = t("names.subtitle");

  return (
    <main
      className={
        dark
          ? "min-h-screen bg-zinc-950 text-zinc-100"
          : "min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 text-zinc-900"
      }
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className={`absolute left-0 top-0 h-72 w-72 rounded-full blur-[120px] ${
            dark ? "bg-emerald-900/40" : "bg-emerald-300/30"
          }`}
        />
        <div
          className={`absolute bottom-0 right-0 h-72 w-72 rounded-full blur-[120px] ${
            dark ? "bg-purple-900/40" : "bg-purple-300/30"
          }`}
        />
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-28 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <h1 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {title}
            </h1>
          </div>
          <button
            onClick={() => router.push("/home")}
            className={`flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow transition ${
              dark
                ? "bg-zinc-900 text-zinc-200 ring-1 ring-zinc-700"
                : "bg-white text-emerald-700 ring-1 ring-emerald-100"
            }`}
          >
            <ChevronLeft size={16} /> {t("common.back")}
          </button>
        </div>

        <div
          className={`mt-6 overflow-hidden rounded-3xl bg-gradient-to-br ${
            dark
              ? "from-emerald-900 to-green-950 ring-1 ring-emerald-800"
              : "from-emerald-700 to-green-800"
          } p-8 text-white shadow-2xl`}
        >
          <div className="text-5xl">📿</div>
          <h2 className="mt-4 text-3xl font-extrabold" dir="rtl">
            ٱلْأَسْمَاءُ ٱلْحُسْنَىٰ
          </h2>
          <p className="mt-2 text-lg font-semibold text-emerald-100">{subtitle}</p>
          <p className="mt-3 text-sm leading-7 text-white/80">
            {t("names.intro")}
          </p>
        </div>

        <div className="relative mt-6">
          <Search
            className={`absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 ${
              dark ? "text-zinc-400" : "text-emerald-600"
            }`}
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder={t("names.search")}
            className={`w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-lg outline-none transition focus:ring-2 focus:ring-emerald-500 ${
              dark
                ? "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700 placeholder:text-zinc-500"
                : "bg-white text-gray-800 ring-1 ring-emerald-50 placeholder:text-gray-400"
            }`}
          />
        </div>

        <p className={`mt-4 text-sm ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          {results.length} / 99
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((name, index) => (
              <motion.button
                key={name.no}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(name.no)}
                className={`relative overflow-hidden rounded-3xl p-5 text-left shadow-lg transition ${
                  dark
                    ? "bg-zinc-900 ring-1 ring-zinc-700 hover:ring-emerald-600"
                    : "bg-white ring-1 ring-emerald-50/50 hover:ring-emerald-300"
                }`}
              >
                <span
                  className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    dark
                      ? "bg-emerald-900 text-emerald-300"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {name.no}
                </span>
                <h3
                  className={`text-2xl font-bold ${dark ? "text-emerald-300" : "text-emerald-800"}`}
                  dir="rtl"
                >
                  {name.arabic}
                </h3>
                <p className="mt-2 font-bold text-gray-800 dark:text-zinc-100">
                  {name.translit}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{name.meaning}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && (
          <div
            className={`mt-6 rounded-3xl p-10 text-center shadow-xl ${
              dark ? "bg-zinc-900" : "bg-white"
            }`}
          >
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-semibold text-gray-500 dark:text-zinc-400">
              {t("names.noResult")}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-5"
            onClick={() => setSelected(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 26 }}
              className={`w-full max-w-lg rounded-t-3xl p-7 shadow-2xl sm:rounded-3xl ${
                dark ? "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700" : "bg-white text-gray-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    dark ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {active.no}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className={`rounded-full p-2 ${
                    dark ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="mt-4 text-4xl font-bold text-emerald-700 dark:text-emerald-400" dir="rtl">
                {active.arabic}
              </h3>
              <h4 className="mt-3 text-2xl font-extrabold">{active.translit}</h4>
              <p className={`mt-1 text-lg font-semibold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
                {active.meaning}
              </p>

              <div className={`mt-6 rounded-2xl p-5 ${dark ? "bg-zinc-800" : "bg-emerald-50"}`}>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-600" />
                  <h5 className="font-bold text-emerald-700 dark:text-emerald-400">{t("names.wazifa")}</h5>
                </div>
                <p className={`mt-3 text-sm leading-7 ${dark ? "text-zinc-200" : "text-gray-700"}`}>
                  {active.wazifa}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const prev = active.no === 1 ? 99 : active.no - 1;
                    setSelected(prev);
                  }}
                  className={`rounded-2xl py-3 text-sm font-bold transition ${
                    dark
                      ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ← {NAMES_99[active.no - 2]?.translit || "..."}
                </button>
                <button
                  onClick={() => {
                    const next = active.no === 99 ? 1 : active.no + 1;
                    setSelected(next);
                  }}
                  className="rounded-2xl bg-emerald-700 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  {NAMES_99[active.no]?.translit || "..."} →
                </button>
              </div>

              <p className={`mt-5 flex items-center gap-2 text-center text-xs ${dark ? "text-zinc-500" : "text-gray-400"}`}>
                <BookOpen size={14} /> {t("names.reminder")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="hidden" lang={lang}>
        {lang}
      </span>
    </main>
  );
}
