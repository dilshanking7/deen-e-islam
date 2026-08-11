"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Landmark,
  HandHeart,
  BookMarked,
  CalendarDays,
  Compass,
  HeartHandshake,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { getRandomVerse } from "@/lib/daily-verse";

export default function DashboardPage() {
  const router = useRouter();

  const [userData, setUserData] = useState<{ fullName?: string }>({});
  const [verse, setVerse] = useState(() => getRandomVerse());

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (profile) setUserData(profile);
    }
    load();
  }, [router]);

  const date = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    []
  );

  const features = [
    {
      title: "Quran",
      desc: "Read Holy Quran",
      icon: BookOpen,
      color: "from-emerald-600 to-green-700",
      path: "/quran",
    },
    {
      title: "Hadith",
      desc: "Authentic hadiths",
      icon: Landmark,
      color: "from-blue-600 to-indigo-700",
      path: "/hadith",
    },
    {
      title: "Prayer Times",
      desc: "Daily salah timings",
      icon: HandHeart,
      color: "from-teal-600 to-emerald-700",
      path: "/prayer",
    },
    {
      title: "Daily Duas",
      desc: "Beautiful duas",
      icon: BookMarked,
      color: "from-yellow-500 to-amber-600",
      path: "/dua",
    },
    {
      title: "Tasbeeh",
      desc: "Dhikr counter",
      icon: HeartHandshake,
      color: "from-purple-600 to-violet-700",
      path: "/tasbeeh",
    },
    {
      title: "Calendar",
      desc: "Hijri calendar",
      icon: CalendarDays,
      color: "from-rose-500 to-pink-600",
      path: "/calendar",
    },
    {
      title: "Qibla",
      desc: "Find Qibla direction",
      icon: Compass,
      color: "from-cyan-600 to-sky-700",
      path: "/qibla",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-blue-300/30 blur-[120px]" />

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">
                Dashboard
              </h1>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            ← Back
          </button>
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[30px] bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-900 p-8 text-white shadow-2xl"
        >
          <p className="text-emerald-200">Assalamu Alaikum,</p>
          <h2 className="mt-1 text-4xl font-extrabold">
            {userData.fullName || "Dear Muslim"}
          </h2>
          <p className="mt-4 max-w-2xl text-emerald-100">
            Your daily Islamic journey awaits. Stay connected with Allah and
            grow in faith every single day. 🤍
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.path)}
              className="overflow-hidden rounded-3xl bg-white text-left shadow-lg ring-1 ring-emerald-50/50"
            >
              <div className={`flex h-20 items-center justify-center bg-gradient-to-br ${item.color}`}>
                <item.icon className="h-9 w-9 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  Open →
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Daily Verse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/60 p-6 text-center"
        >
          <p className="text-3xl text-emerald-800" dir="rtl">
            {verse.arabic}
          </p>
          <p className="mt-3 text-lg text-gray-700">
            &ldquo;{verse.translation}&rdquo;
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-700">
            — {verse.reference}
          </p>
          <button
            onClick={() => setVerse(getRandomVerse())}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            New Verse ⟳
          </button>
        </motion.div>
      </div>
    </main>
  );
}
