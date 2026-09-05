"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import Aurora from "./Aurora";
import Stars from "./Stars";
import { waitForAuthUser } from "@/lib/auth-state";
import { getUserProfile } from "@/lib/firestore";

export default function SplashScreen() {
  const router = useRouter();

  const [greeting, setGreeting] = useState("Assalamu Alaikum");
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigatedRef = useRef(false);

  // greetingSetter ko salaam — greeting ab welcome page use karta hai
  void setGreeting;

  useEffect(() => {
    let detach = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const go = (path: string) => {
      if (navigatedRef.current || detach) return;
      navigatedRef.current = true;
      setFadeOut(true);
      timers.push(setTimeout(() => router.push(path), 450));
    };

    waitForAuthUser()
      .then(async (user) => {
        if (detach) return;
        if (!user) {
          // Guests (guest-mode flag) skip the login screen and go straight home
          const guestFlag = (() => {
            try {
              return localStorage.getItem("guest-mode") === "1";
            } catch {
              return false;
            }
          })();
          // Still let the greeting breathe before routing
          timers.push(setTimeout(() => setReady(true), 400));
          timers.push(setTimeout(() => go(guestFlag ? "/home" : "/login"), 1400));
          return;
        }
        const profile = await getUserProfile(user.uid).catch(() => null);
        if (detach) return;
        setName(user.displayName || profile?.fullName || "");
        setReady(true);
        const localComplete = (() => {
          try {
            return localStorage.getItem("islaam-onboarding-complete") === "1";
          } catch {
            return false;
          }
        })();
        const complete = profile?.completedOnboarding || localComplete;
        const path = complete ? "/community" : "/welcome";
        timers.push(setTimeout(() => go(path), 1400));
      })
      .catch(() => {
        if (detach) return;
        timers.push(setTimeout(() => setReady(true), 400));
        timers.push(setTimeout(() => go("/login"), 1400));
      });

    // Hard fail-safe: never trap the user on the splash
    timers.push(setTimeout(() => go("/home"), 3500));

    return () => {
      detach = true;
      timers.forEach(clearTimeout);
    };
  }, [router]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-black"
        >
          <Aurora />
          <Stars />

          <div className="relative flex flex-col items-center px-8 text-center">
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-emerald-400/40 blur-2xl"
              />
              <div className="relative z-10 overflow-hidden rounded-full shadow-2xl ring-2 ring-emerald-400/50">
                <Image
                  src="/logo.png"
                  alt="Islaam-E-Deen Logo"
                  width={96}
                  height={96}
                  className="h-24 w-24 object-contain"
                  priority
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {ready && (
                <motion.div
                  initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.45 }}
                  className="mt-8"
                >
                  <h1 className="text-3xl font-extrabold tracking-tight text-emerald-50">
                    {greeting}!{name ? (
                      <span className="mt-1 block bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                        {name}
                      </span>
                    ) : (
                      <span className="mt-1 block text-2xl font-semibold text-emerald-200/90">
                        Welcome to Islaam-E-Deen
                      </span>
                    )}
                  </h1>
                  <p className="mt-3 text-sm font-medium tracking-wide text-emerald-200/70">
                    Bismillah — opening your journey to deen
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-10 left-1/2 h-1 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-emerald-900">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-1 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}