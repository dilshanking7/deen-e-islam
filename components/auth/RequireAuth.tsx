"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";
import { waitForAuthUser } from "@/lib/auth-state";
import { useI18n } from "@/lib/i18n";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const [status, setStatus] = useState<"loading" | "ok" | "blocked">("loading");

  useEffect(() => {
    let active = true;
    waitForAuthUser()
      .then((user) => {
        if (!active) return;
        if (user) {
          setStatus("ok");
        } else {
          setStatus("blocked");
        }
      })
      .catch(() => {
        if (!active) return;
        setStatus("blocked");
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  if (status === "blocked") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 p-5">
        <div className="flex min-h-[80vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Lock className="text-emerald-700" size={30} />
            </div>
            <h1 className="mt-5 text-xl font-bold text-gray-800">
              {t("guard.loginRequired")}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{t("guard.loginRequiredDesc")}</p>
            <button
              onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-700 py-3.5 text-sm font-bold text-white shadow-xl transition hover:opacity-90"
            >
              <LogIn size={18} />
              {t("guard.login")}
            </button>
            <button
              onClick={() => router.push("/register")}
              className="mt-3 w-full rounded-2xl border border-emerald-200 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              {t("guard.createAccount")}
            </button>
            <button
              onClick={() => router.push("/home")}
              className="mt-3 text-xs font-semibold text-gray-400 hover:underline"
            >
              {t("guard.continueBrowsing")}
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}