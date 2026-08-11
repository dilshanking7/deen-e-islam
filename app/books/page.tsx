"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BOOKS } from "@/lib/books-data";
import ThemeControls from "@/components/ui/ThemeControls";
import DownloadButton from "@/components/pwa/DownloadButton";

export default function BooksPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-purple-300/30 blur-[120px]" />

      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <h1 className="text-2xl font-extrabold text-emerald-800">Islaami Books</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeControls />
            <DownloadButton />
            <button
              onClick={() => router.push("/home")}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              ← Back
            </button>
          </div>
        </div>

        <p className="mt-6 max-w-2xl leading-8 text-gray-600">
          Masoom, kitaabein — kisi bhi bhaasha me padhein. Har kitaab ka apna reader hai,
          usme aap chapter search kar sakte hain aur kisi bhi language me translation dekh
          sakte hain.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {BOOKS.map((book, i) => (
            <motion.div
              key={book.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => router.push(`/books/${book.slug}`)}
              className="cursor-pointer overflow-hidden rounded-3xl bg-white shadow-xl transition"
            >
              <div
                className={`bg-gradient-to-r ${book.accent} p-6 text-white`}
              >
                <div className="text-5xl">{book.icon}</div>
                <h2 className="mt-4 text-2xl font-extrabold" dir="rtl">
                  {book.titleUr}
                </h2>
                <h3 className="mt-1 text-sm font-semibold text-white/90">
                  {book.titleEn}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gray-500">{book.authorEn}</p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {book.descriptionEn}
                </p>
                <button className="mt-5 w-full rounded-2xl bg-emerald-700 py-3 font-bold text-white transition hover:bg-emerald-800">
                  Padhna Shuru Karein →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
