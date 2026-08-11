"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import Aurora from "./Aurora";
import Stars from "./Stars";
import Bismillah from "./Bismillah";
import HadithCard from "./HadithCard";

export default function SplashScreen() {
  const router = useRouter();

  const [showLogo, setShowLogo] = useState(false);
  const [showBismillah, setShowBismillah] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showHadith, setShowHadith] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t0 = setTimeout(() => setShowLogo(true), 300);
    const t1 = setTimeout(() => setShowBismillah(true), 2600);
    const t2 = setTimeout(() => setShowTitle(true), 4200);
    const t3 = setTimeout(() => setShowHadith(true), 6400);
    const t4 = setTimeout(() => setFadeOut(true), 9200);
    const t5 = setTimeout(() => router.push("/login"), 10200);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 1));
    }, 100);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearInterval(progressTimer);
    };
  }, [router]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100 z-[999]"
        >
          <Aurora />
          <Stars />

          <div className="relative flex flex-col items-center">
            {/* Logo with glow ring */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                    y: -110,
                  }}
                  transition={{
                    duration: 1.4,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 14,
                      ease: "linear",
                    }}
                    className="absolute inset-0 m-auto h-40 w-40 rounded-full border-4 border-dashed border-emerald-400/50"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 m-auto h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="relative z-10 overflow-hidden rounded-full shadow-2xl ring-4 ring-emerald-500/40"
                  >
                    <Image
                      src="/logo.png"
                      alt="Islaam-E-Deen Logo"
                      width={140}
                      height={140}
                      className="h-[140px] w-[140px] object-contain"
                      priority
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bismillah */}
            <AnimatePresence>
              {showBismillah && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: -50 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <Bismillah />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Website Name */}
            <AnimatePresence>
              {showTitle && (
                <motion.div
                  initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1 }}
                >
                  <div className="flex flex-col items-center">
                    <motion.h1
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="text-4xl md:text-5xl font-extrabold text-emerald-800 tracking-tight"
                    >
                      Islaam-E-Deen
                    </motion.h1>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 flex gap-4 text-base font-semibold"
                    >
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="text-emerald-600"
                      >
                        Learn
                      </motion.span>
                      <span className="text-gray-300">•</span>
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, delay: 0.2 }}
                        className="text-blue-600"
                      >
                        Practice
                      </motion.span>
                      <span className="text-gray-300">•</span>
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, delay: 0.4 }}
                        className="text-yellow-600"
                      >
                        Share Islam
                      </motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Reminder */}
            <AnimatePresence>
              {showHadith && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="mt-12"
                >
                  <HadithCard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom loading bar */}
          <div className="absolute bottom-10 left-1/2 w-56 -translate-x-1/2">
            <div className="h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
              />
            </div>
            <p className="mt-2 text-center text-xs font-medium text-emerald-600">
              Islaam-E-Deen load ho raha hai...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
