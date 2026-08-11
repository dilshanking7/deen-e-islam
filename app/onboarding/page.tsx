"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";

const STEPS = [
  { label: "Language", path: "/language", icon: "🌍" },
  { label: "Country", path: "/country", icon: "🗺️" },
  { label: "State", path: "/state", icon: "🏛️" },
  { label: "City", path: "/city", icon: "🏙️" },
  { label: "Pincode", path: "/pincode", icon: "📮" },
  { label: "Religion & Sect", path: "/profile", icon: "🕌" },
  { label: "Profile Review", path: "/profile", icon: "👤" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [userData, setUserData] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (profile) setUserData(profile as unknown as Record<string, string>);
    }
    load();
  }, [router]);

  const completedCount = STEPS.filter((step) => {
    const key = step.label.toLowerCase();
    return key === "language"
      ? userData.language
      : key === "country"
      ? userData.country
      : key === "state"
      ? userData.state
      : key === "city"
      ? userData.city
      : key === "pincode"
      ? userData.pincode
      : key.includes("religion")
      ? userData.sect || userData.religion
      : userData.completedOnboarding;
  }).length;

  const progress = Math.round((completedCount / STEPS.length) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />

      <div className="mx-auto max-w-xl px-5 py-10">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="overflow-hidden rounded-full bg-white p-2 shadow-xl ring-4 ring-emerald-500/20">
            <Image
              src="/logo.png"
              alt="Islaam-E-Deen Logo"
              width={96}
              height={96}
              className="h-20 w-20 object-contain"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <h1 className="text-3xl font-extrabold text-emerald-800">
            Welcome to Islaam-E-Deen
          </h1>
          <p className="mt-2 text-gray-500">
            Complete your profile to unlock your full experience.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-50/50"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Your Progress</h2>
            <span className="text-2xl font-extrabold text-emerald-700">
              {progress}%
            </span>
          </div>

          <div className="mt-4 h-3 rounded-full bg-gray-100">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-700"
            />
          </div>
        </motion.div>

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {STEPS.map((step, index) => {
            const key = step.label.toLowerCase();
            const done = !!(key === "language"
              ? userData.language
              : key === "country"
              ? userData.country
              : key === "state"
              ? userData.state
              : key === "city"
              ? userData.city
              : key === "pincode"
              ? userData.pincode
              : key.includes("religion")
              ? userData.sect || userData.religion
              : userData.completedOnboarding);

            return (
              <motion.button
                key={step.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(step.path)}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-md ring-1 ring-emerald-50/50 transition"
              >
                <span className="text-3xl">{step.icon}</span>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">
                    Step {index + 1}: {step.label}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {done ? "Completed" : "Click to continue"}
                  </p>
                </div>

                {done ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Finish button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/home")}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-700 to-green-700 py-4 text-lg font-bold text-white shadow-xl"
        >
          Finish & Go to Home →
        </motion.button>
      </div>
    </main>
  );
}
