"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ThemeControls from "@/components/ui/ThemeControls";

const TIMELINE = [
  {
    era: "Creation & Early Prophets",
    items: [
      "Adam (عليه السلام): first human and first prophet.",
      "Nuh (عليه السلام): called his people to Tawheed with patience.",
      "Ibrahim (عليه السلام): rebuilt the Kaaba with Ismail (عليه السلام).",
    ],
  },
  {
    era: "Bani Israel & Prophetic Line",
    items: [
      "Musa (عليه السلام): given the Tawrah and sent to Pharaoh.",
      "Dawud (عليه السلام): prophet and just king, given the Zabur.",
      "Isa (عليه السلام): born miraculously to Maryam (عليها السلام).",
    ],
  },
  {
    era: "Seerah of Prophet Muhammad ﷺ",
    items: [
      "570 CE: birth in Makkah, from the noble Quraysh.",
      "610 CE: first revelation in Cave Hira.",
      "622 CE: Hijrah to Madinah, beginning of the Islamic calendar.",
      "632 CE: final sermon and passing away in Madinah.",
    ],
  },
  {
    era: "Rightly Guided Caliphs",
    items: [
      "Abu Bakr (رضي الله عنه): preserved unity after the Prophet ﷺ.",
      "Umar (رضي الله عنه): justice, administration and expansion.",
      "Uthman (رضي الله عنه): standard mushaf compilation.",
      "Ali (رضي الله عنه): knowledge, courage and wisdom.",
    ],
  },
];

const PROPHETS = [
  "Adam", "Idris", "Nuh", "Hud", "Salih", "Ibrahim", "Lut", "Ismail", "Ishaq",
  "Yaqub", "Yusuf", "Ayyub", "Shuayb", "Musa", "Harun", "Dhul-Kifl", "Dawud",
  "Sulayman", "Ilyas", "Al-Yasa", "Yunus", "Zakariya", "Yahya", "Isa", "Muhammad ﷺ",
];

export default function HistoryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filteredProphets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROPHETS;
    return PROPHETS.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <ThemeControls />
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl bg-emerald-800 p-7 text-white shadow-2xl">
          <div className="flex items-center gap-4">
            <Image src="/logo-icon.png" alt="Islaam-E-Deen" width={52} height={52} />
            <div>
              <h1 className="text-3xl font-extrabold">Islamic Timeline & Prophets</h1>
              <p className="mt-1 text-sm text-emerald-100">
                Nabi, Rasool, Seerah aur Islamic history ka quick learning hub.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-lg ring-1 ring-emerald-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Prophet name search karein..."
              className="w-full rounded-2xl bg-emerald-50 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProphets.map((name) => (
              <div key={name} className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="font-bold text-emerald-800">{name}</p>
                <p className="mt-1 text-xs text-gray-500">Quran me mentioned prophet</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {TIMELINE.map((group, index) => (
            <motion.div
              key={group.era}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-50"
            >
              <h2 className="text-xl font-extrabold text-emerald-800">{group.era}</h2>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <p key={item} className="rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-gray-700">
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          Detailed biographies aur masail ke liye authentic kitab/PDF add karna behtar hoga. Main app reader me import-ready structure bana chuka hoon.
        </p>
      </div>
    </main>
  );
}

