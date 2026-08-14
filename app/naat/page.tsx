"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Download,
  Trash2,
  Search,
  Music2,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import {
  loadNaats,
  saveNaat,
  deleteNaat,
  downloadNaat,
  type Naat,
} from "@/lib/naat-data";

export default function NaatPage() {
  const router = useRouter();
  const [naats, setNaats] = useState<Naat[]>(() => loadNaats());
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [poet, setPoet] = useState("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [reading, setReading] = useState<Naat | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return naats;
    return naats.filter(
      (n) => n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q)
    );
  }, [naats, search]);

  function handleAdd() {
    if (!title.trim() || !text.trim()) {
      alert("Naat ka title aur text dono likhna zaroori hai.");
      return;
    }
    const next = saveNaat({ title: title.trim(), poet: poet.trim(), text: text.trim() });
    setNaats(next);
    setTitle("");
    setPoet("");
    setText("");
    setShowAdd(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 pb-32">
      <div className="mx-auto max-w-4xl px-5 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-2xl shadow-md">
              🎵
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">Naat Sharif</h1>
              <p className="text-xs text-gray-500">
                Naatein likhein, parhein aur download karein
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-800"
            >
              <Plus size={16} /> New Naat
            </button>
            <button
              onClick={() => router.push("/library")}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              ← Library
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Naat khojein..."
            className="w-full rounded-2xl bg-white py-3.5 pl-12 pr-4 text-sm font-medium shadow-lg ring-1 ring-emerald-50 outline-none transition focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Add form */}
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-emerald-50"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-emerald-800">Nayi Naat likhein</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Naat ka naam *"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <input
                value={poet}
                onChange={(e) => setPoet(e.target.value)}
                placeholder="Shaair ka naam (optional)"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Naat ka kalam likhein (Urdu/Hindi) *"
                rows={6}
                dir="rtl"
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-right text-base leading-8 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                onClick={handleAdd}
                className="w-full rounded-2xl bg-emerald-700 py-3.5 font-bold text-white transition hover:bg-emerald-800"
              >
                ✓ Naat Add Karein
              </button>
            </div>
          </motion.div>
        )}

        {/* Naat list */}
        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-gray-400">
              Koi naat nahi mili. Naya naat add karein.
            </p>
          )}
          {filtered.map((naat, i) => (
            <motion.div
              key={naat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-50/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-lg text-white shadow-md">
                    <Music2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800">{naat.title}</h3>
                    <p className="text-xs text-gray-500">
                      {naat.poet || "Naat Sharif"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => downloadNaat(naat)}
                    title="Download"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Kya aap ye naat delete karna chahte hain?")) {
                        setNaats(deleteNaat(naat.id));
                      }
                    }}
                    title="Delete"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p
                dir="rtl"
                className="mt-4 line-clamp-3 text-right text-base leading-8 text-gray-700"
              >
                {naat.text}
              </p>

              <button
                onClick={() => setReading(naat)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                <BookOpen size={16} /> Parhein
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full-screen reader */}
      {reading && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950">
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={() => setReading(null)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => downloadNaat(reading)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Download size={16} /> Download
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-2xl">🎵</p>
              <h2 className="mt-3 text-2xl font-extrabold text-amber-200">
                {reading.title}
              </h2>
              {reading.poet && (
                <p className="mt-1 text-sm text-emerald-200">{reading.poet}</p>
              )}
              <div className="mx-auto mt-4 h-0.5 w-24 rounded-full bg-amber-300/50" />
              <p
                dir="rtl"
                className="mt-8 text-right text-xl leading-[2.2] text-emerald-50"
                style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
              >
                {reading.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
