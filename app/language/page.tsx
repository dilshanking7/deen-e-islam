"use client";

import { auth } from "@/lib/firebase";
import { getUserProfile, updateUserProfile, isOnboardingComplete } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n, STORAGE_KEY } from "@/lib/i18n";

export default function LanguagePage() {
  const router = useRouter();
  const { t, lang, setLang, languageOptions } = useI18n();

  const [selected, setSelected] = useState(lang);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const user = auth.currentUser;
      if (!user) {
        setIsOnboarding(true);
        return;
      }
      let localComplete = false;
      try {
        localComplete = localStorage.getItem("islaam-onboarding-complete") === "1";
      } catch {}
      if (localComplete) {
        setIsOnboarding(false);
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        setIsOnboarding(!isOnboardingComplete(profile));
      } catch {
        setIsOnboarding(false);
      }
    }
    checkUser();
  }, []);

  const handleContinue = async () => {
    localStorage.setItem(STORAGE_KEY, selected);
    setLang(selected);
    setSaved(true);

    const user = auth.currentUser;

    if (!user) {
      setTimeout(() => router.push("/login"), 700);
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(user.uid, { language: selected });
    } catch (error) {
      console.error(error);
    }

    setLoading(false);

    setTimeout(
      () => router.push(isOnboarding ? "/country" : "/setting"),
      700
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg rounded-[35px] bg-white shadow-2xl p-8"
      >
        <div className="text-center">
          <div className="text-6xl">🌍</div>

          <h1 className="mt-5 text-3xl font-bold text-emerald-700">
            {t("language.choose")}
          </h1>

          <p className="mt-2 text-gray-500">
            {t("language.selectPref")}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {languageOptions.map((langOpt) => (
            <motion.button
              key={langOpt.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelected(langOpt.code);
                localStorage.setItem(STORAGE_KEY, langOpt.code);
                setLang(langOpt.code);
              }}
              className={`w-full rounded-2xl border p-5 flex items-center justify-between transition ${
                selected === langOpt.code
                  ? "border-emerald-700 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{langOpt.flag}</span>

                <div className="text-left">
                  <h2 className="font-semibold">{langOpt.label}</h2>

                  <p className="text-sm text-gray-500">
                    {langOpt.native}
                  </p>
                </div>
              </div>

              {selected === langOpt.code && (
                <span className="text-emerald-700 text-2xl">
                  ✓
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {saved && (
          <p className="mt-5 text-center text-sm font-semibold text-emerald-600">
            ✓ {t("language.saved")}
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-emerald-700 py-4 text-lg font-bold text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? t("language.saving")
            : isOnboarding
              ? t("language.continue")
              : t("profile.save")}
        </motion.button>

        {!isOnboarding && (
          <button
            onClick={() => router.push("/setting")}
            className="mt-4 w-full text-center text-sm font-semibold text-gray-400 transition hover:text-emerald-700"
          >
            {t("common.back")}
          </button>
        )}
      </motion.div>
    </main>
  );
}
