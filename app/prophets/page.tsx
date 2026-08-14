"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, Users, ChevronRight } from "lucide-react";
import { PROPHETS, PROPHETS_TOTAL, getProphet, type Prophet } from "@/lib/prophets-data";

export default function ProphetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Prophet | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PROPHETS;
    return PROPHETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.arabic.includes(q) ||
        (p.title || "").toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 pb-32">
      <div className="mx-auto max-w-4xl px-5 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-2xl shadow-md">
              🕊️
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">Ambiya (Prophets)</h1>
              <p className="text-xs text-gray-500">
                Nabiyon ke halaat aur wilaadat
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/library")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            ← Library
          </button>
        </div>

        {/* Total count note */}
        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-gradient-to-r from-indigo-700 to-blue-800 p-6 text-white shadow-xl">
          <Users size={28} className="shrink-0 text-indigo-200" />
          <div>
            <p className="text-xl font-extrabold">1,24,000 (Ek Lakh Chauvais Hazaar)</p>
            <p className="mt-1 text-sm text-indigo-200">
              Allah ne 1,24,000 nabi bheje. Quran mein 25 ka zikr hai — unki kahaniyan neeche di gayi hain. Baqi nabiyon ke naam humein nahi bataye gaye.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nabi khojein — Musa, Isa, Muhammad..."
            className="w-full rounded-2xl bg-white py-3.5 pl-12 pr-4 text-sm font-medium shadow-lg ring-1 ring-emerald-50 outline-none transition focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Prophets list */}
        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-gray-400">Koi nabi nahi mila.</p>
          )}
          {filtered.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 4 }}
              onClick={() => setSelected(p)}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-xl ring-1 ring-emerald-50/50 transition"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-sm font-extrabold text-white shadow-md">
                {p.name.split(" ")[1]?.[0] || p.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-gray-800">{p.name}</h3>
                <p className="truncate text-xs text-gray-500">{p.title}</p>
              </div>
              <span className="shrink-0 text-right text-xs font-semibold text-indigo-600">
                {p.birth}
              </span>
              <ChevronRight size={18} className="shrink-0 text-gray-300" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Prophet detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950">
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <ChevronLeft size={16} /> Back
            </button>
            {getProphet(selected.id) && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                Ambiya
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mx-auto max-w-2xl">
              <div className="text-center">
                <p className="text-4xl">🕊️</p>
                <h2 className="mt-4 text-3xl font-extrabold text-amber-200">
                  {selected.name}
                </h2>
                <p className="mt-2 text-2xl" dir="rtl">
                  {selected.arabic}
                </p>
                <p className="mt-2 text-sm font-semibold text-indigo-200">
                  {selected.title}
                </p>
                <div className="mx-auto mt-4 h-0.5 w-24 rounded-full bg-amber-300/50" />
              </div>

              <div className="mt-8 space-y-4">
                {selected.birth && (
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">
                      🎂 Wilaadat / Aghaz
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">{selected.birth}</p>
                  </div>
                )}
                {selected.era && (
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">
                      🗓️ Dawat ka daur
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">{selected.era}</p>
                  </div>
                )}
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">
                    📖 Kahani
                  </p>
                  <p className="mt-2 text-base leading-8 text-emerald-50">
                    {selected.story}
                  </p>
                </div>
                {selected.events && selected.events.length > 0 && (
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">
                      ✨ Ahem Waqiaat
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.events.map((e) => (
                        <span
                          key={e}
                          className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
