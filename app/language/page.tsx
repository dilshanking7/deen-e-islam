"use client";

import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n, STORAGE_KEY } from "@/lib/i18n";

export default function LanguagePage() {
  const router = useRouter();
  const { t, lang, setLang, languageOptions } = useI18n();

  const [selected, setSelected] = useState(lang);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleContinue = async () => {
    const user = auth.currentUser;

    if (!user) {
      localStorage.setItem(STORAGE_KEY, selected);
      setLang(selected);
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile(user.uid, {
        language: selected,
      });

      localStorage.setItem(STORAGE_KEY, selected);
      setLang(selected);
      setSaved(true);

      setTimeout(() => router.push("/country"), 600);
    } catch (error) {
      console.error(error);
      alert("Failed to save language.");
      setLoading(false);
    }
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
          {loading ? t("language.saving") : t("language.continue")}
        </motion.button>
      </motion.div>
    </main>
  );
}
