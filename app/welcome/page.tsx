"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import DownloadButton from "@/components/pwa/DownloadButton";

export default function WelcomePage() {
  const router = useRouter();

  const [name, setName] = useState("Friend");

  useEffect(() => {
    async function loadUser() {
      const user = auth.currentUser;

      if (!user) return;

      const profile = await getUserProfile(user.uid);

      if (profile?.fullName) {
        setName(profile.fullName);
      }
    }

    loadUser();

    const timer = setTimeout(() => {
      router.push("/language");
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 flex items-center justify-center px-6 overflow-hidden">
      <div className="fixed left-0 top-0 -z-10 h-80 w-80 rounded-full bg-emerald-300/30 blur-[120px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-green-400/30 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto inline-block"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="overflow-hidden rounded-full bg-white p-3 shadow-2xl ring-8 ring-emerald-500/20"
          >
            <Image
              src="/logo.png"
              alt="Islaam-E-Deen Logo"
              width={140}
              height={140}
              className="h-[110px] w-[110px] object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        <h2 className="mt-8 text-2xl text-emerald-700 font-semibold">
          السلام عليكم
        </h2>

        <h1 className="mt-3 text-4xl font-bold text-gray-800">
          Welcome, {name}
        </h1>

        <p className="mt-5 text-gray-500 text-lg">
          May Allah bless your day with peace, mercy and happiness.
        </p>

        <motion.div
          className="mt-8"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-5 py-2.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-emerald-700 border-t-transparent"
            />
            <span className="text-sm font-medium text-emerald-700">
              Setting up your experience...
            </span>
          </div>
        </motion.div>

        <div className="mt-6">
          <DownloadButton />
        </div>
      </motion.div>
    </main>
  );
}
