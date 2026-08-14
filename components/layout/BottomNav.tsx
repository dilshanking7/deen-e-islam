"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Plus, BookOpen, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/welcome",
  "/language",
  "/onboarding",
  "/country",
  "/state",
  "/city",
  "/pincode",
  "/privacy",
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (hidden || pathname === "/") return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const items = [
    { path: "/home", icon: Home, label: t("bottom.home") },
    { path: "/community", icon: Users, label: t("bottom.community") },
    { path: "/library", icon: BookOpen, label: t("bottom.library") },
    { path: "/profile", icon: User, label: t("bottom.profile") },
  ];

  const openCreate = () => {
    router.push("/community?create=1");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-100/60 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.slice(0, 2).map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="relative flex flex-col items-center gap-0.5 py-2.5"
          >
            <item.icon
              size={22}
              className={
                isActive(item.path)
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-zinc-500"
              }
              strokeWidth={isActive(item.path) ? 2.4 : 2}
            />
            <span
              className={`text-[10px] font-semibold ${
                isActive(item.path)
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            >
              {item.label}
            </span>
            {isActive(item.path) && (
              <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>
        ))}

        <button
          onClick={openCreate}
          className="relative flex items-center justify-center py-2.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition active:scale-90">
            <Plus size={26} />
          </span>
          <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-transparent" />
        </button>

        {items.slice(2).map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="relative flex flex-col items-center gap-0.5 py-2.5"
          >
            <item.icon
              size={22}
              className={
                isActive(item.path)
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-zinc-500"
              }
              strokeWidth={isActive(item.path) ? 2.4 : 2}
            />
            <span
              className={`text-[10px] font-semibold ${
                isActive(item.path)
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            >
              {item.label}
            </span>
            {isActive(item.path) && (
              <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
