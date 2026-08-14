"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import Aurora from "./Aurora";
import Stars from "./Stars";
import Bismillah from "./Bismillah";
import { waitForAuthUser } from "@/lib/auth-state";
import { getUserProfile } from "@/lib/firestore";

const VERSES = [
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    ref: "Ash-Sharh 94:6",
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translation: "My Lord, increase me in knowledge.",
    ref: "Ta-Ha 20:114",
  },
  {
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "Do not lose heart, nor grieve — you will prevail if you are believers.",
    ref: "Aal-Imran 3:139",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Surely in the remembrance of Allah do hearts find rest.",
    ref: "Ar-Ra'd 13:28",
  },
];

export default function SplashScreen() {
  const router = useRouter();

  const [phase, setPhase] = useState<"logo" | "bismillah" | "title" | "verse">("logo");
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verseIndex, setVerseIndex] = useState(0);

  useEffect(() => {
    let targetPath = "/login";

    waitForAuthUser()
      .then(async (user) => {
        if (!user) return;
        const profile = await getUserProfile(user.uid);
        targetPath = profile?.completedOnboarding ? "/home" : "/welcome";
      })
      .catch(() => {
        targetPath = "/login";
      });

    const t1 = setTimeout(() => setPhase("bismillah"), 1100);
    const t2 = setTimeout(() => setPhase("title"), 2100);
    const t3 = setTimeout(() => setPhase("verse"), 3100);
    const t4 = setTimeout(() => setFadeOut(true), 5600);
    const t5 = setTimeout(() => router.push(targetPath), 6200);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 1.4));
    }, 90);

    const verseTimer = setInterval(() => {
      setVerseIndex((prev) => (prev + 1) % VERSES.length);
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearInterval(progressTimer);
      clearInterval(verseTimer);
    };
  }, [router]);

  const verse = VERSES[verseIndex];

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-black z-[999]"
        >
          <Aurora />
          <Stars />

          {/* Moon glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-400 opacity-90 shadow-[0_0_80px_30px_rgba(253,224,71,0.35)]" />
            <div className="absolute right-4 top-6 h-48 w-48 rounded-full bg-emerald-950/80" />
          </div>

          <div className="relative flex flex-col items-center px-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-0 m-auto h-32 w-32 rounded-full border-2 border-dashed border-emerald-400/60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.6 }}
                className="absolute inset-0 m-auto h-32 w-32 rounded-full bg-emerald-400/40 blur-2xl"
              />
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="relative z-10 overflow-hidden rounded-full shadow-2xl ring-4 ring-emerald-400/50"
              >
                <Image
                  src="/logo.png"
                  alt="Islaam-E-Deen Logo"
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] object-contain"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Bismillah */}
            <AnimatePresence>
              {phase !== "logo" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mt-6"
                >
                  <Bismillah />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <AnimatePresence>
              {phase === "title" || phase === "verse" ? (
                <motion.div
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9 }}
                  className="mt-2 text-center"
                >
                  <h1 className="text-4xl font-extrabold tracking-tight text-emerald-50 sm:text-5xl">
                    Islaam
                    <span className="text-emerald-400">-</span>
                    E
                    <span className="text-emerald-400">-</span>
                    Deen
                  </h1>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold tracking-wide text-emerald-200/90"
                  >
                    <span>Learn</span>
                    <span className="text-emerald-500">•</span>
                    <span>Practice</span>
                    <span className="text-emerald-500">•</span>
                    <span>Share Islam</span>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Rotating Verse */}
            <AnimatePresence mode="wait">
              {phase === "verse" && (
                <motion.div
                  key={verseIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                  className="mt-12 max-w-md text-center"
                >
                  <p className="text-3xl font-semibold leading-[1.9] text-emerald-100" dir="rtl">
                    {verse.arabic}
                  </p>
                  <p className="mt-4 text-base text-emerald-200/80">
                    &ldquo;{verse.translation}&rdquo;
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-400">
                    — {verse.ref}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loading bar */}
          <div className="absolute bottom-10 left-1/2 w-64 -translate-x-1/2">
            <div className="h-1.5 overflow-hidden rounded-full bg-emerald-900">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
              />
            </div>
            <p className="mt-3 text-center text-xs font-medium tracking-wide text-emerald-200/70">
              Bismillah — Opening your journey to deen
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
