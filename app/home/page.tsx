"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { auth } from "@/lib/firebase";
import { waitForAuthUser } from "@/lib/auth-state";
import { getUserProfile } from "@/lib/firestore";
import { getLastRead } from "@/lib/quran-history";
import {
  getPrayerTimings,
  PRAYER_ORDER,
  formatPrayerTime,
  prayerTimeInLocal,
  type PrayerTimings,
} from "@/lib/prayer-api";
import { getVerseAt, getRandomVerseIndex, getRandomVerse, type DailyVerse } from "@/lib/daily-verse";
import { getLocationByIP } from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import { useUnreadConversations } from "@/lib/use-unread";

interface UserData {
  fullName?: string;
  username?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  religion?: string;
  sect?: string;
  bio?: string;
  photoURL?: string;
}

interface NextPrayerInfo {
  name: string;
  arabic: string;
  time: string;
  remaining: string;
}

const LAST_VERSE_KEY = "last-verse-index";

function pickVerse(): DailyVerse {
  try {
    const last = Number(localStorage.getItem(LAST_VERSE_KEY));
    const index = Number.isFinite(last)
      ? getRandomVerseIndex(last)
      : getRandomVerseIndex();
    localStorage.setItem(LAST_VERSE_KEY, String(index));
    return getVerseAt(index);
  } catch {
    return getRandomVerse();
  }
}

const FEATURES = [
  { key: "quran", icon: "📖", path: "/quran" },
  { key: "read", icon: "📘", path: "/quran/read" },
  { key: "translate", icon: "🌍", path: "/quran/translation" },
  { key: "names", icon: "📿", path: "/names" },
  { key: "prayer", icon: "🕌", path: "/prayer" },
  { key: "dailyVerse", icon: "✨", path: "/quran/daily-verse" },
  { key: "calendar", icon: "🗓️", path: "/calendar" },
  { key: "qibla", icon: "🧭", path: "/qibla" },
  { key: "hadith", icon: "📚", path: "/hadith" },
  { key: "duas", icon: "🤲", path: "/dua" },
  { key: "tasbeeh", icon: "📿", path: "/tasbeeh" },
  { key: "books", icon: "📕", path: "/books" },
  { key: "history", icon: "🕋", path: "/history" },
  { key: "community", icon: "👥", path: "/community" },
  { key: "settings", icon: "⚙️", path: "/setting" },
] as const;

const QUICK_ACTIONS = [
  { key: "prayer", icon: "🕌", path: "/prayer" },
  { key: "quran", icon: "📖", path: "/quran/read" },
  { key: "names", icon: "📿", path: "/names" },
  { key: "duas", icon: "🤲", path: "/dua" },
  { key: "tasbeeh", icon: "📿", path: "/tasbeeh" },
  { key: "books", icon: "📕", path: "/books" },
] as const;

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { count: unreadCount } = useUnreadConversations();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({});
  const [search, setSearch] = useState("");
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [lastRead, setLastRead] = useState<{ number: number; name: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationFailed, setLocationFailed] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [dailyVerse, setDailyVerse] = useState<DailyVerse>(() => pickVerse());

  const loadPrayerTimings = useCallback(async () => {
    const savedLat = Number(localStorage.getItem("lat"));
    const savedLng = Number(localStorage.getItem("lng"));
    if (!savedLat || !savedLng) return;

    try {
      const day = await getPrayerTimings({ latitude: savedLat, longitude: savedLng, method: 1 });
      const now = new Date();
      const timings = PRAYER_ORDER.map((p) => ({
        ...p,
        date: prayerTimeInLocal((day.timings as PrayerTimings)[p.key] || "", day.meta.timezone),
      }));
      const upcoming = timings.find((t) => t.date.getTime() > now.getTime());
      if (upcoming) {
        const diff = upcoming.date.getTime() - now.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setNextPrayer({
          name: upcoming.name,
          arabic: upcoming.arabic,
          time: formatPrayerTime((day.timings as PrayerTimings)[upcoming.key] || ""),
          remaining: `${h}h ${m}m`,
        });
      }
    } catch {}
  }, []);

  const applyLocation = useCallback(
    async (latitude: number, longitude: number, label: string) => {
      localStorage.setItem("lat", String(latitude));
      localStorage.setItem("lng", String(longitude));
      setLocationLabel(label);
      setLocationFailed(false);
      await loadPrayerTimings();
    },
    [loadPrayerTimings]
  );

  const fetchIpLocation = useCallback(async () => {
    setLocationLoading(true);
    const geo = await getLocationByIP();
    if (geo) {
      await applyLocation(geo.latitude, geo.longitude, geo.label);
    } else {
      setLocationFailed(true);
    }
    setLocationLoading(false);
  }, [applyLocation]);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      fetchIpLocation();
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        applyLocation(pos.coords.latitude, pos.coords.longitude, "");
      },
      () => {
        setLocationLoading(false);
        fetchIpLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  }, [applyLocation, fetchIpLocation]);

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser || (await waitForAuthUser());

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await getUserProfile(user.uid);

      if (profile) {
        setUserData(profile);
      }

      try {
        const last = await getLastRead();
        if (last) setLastRead({ number: last.surahNumber, name: last.surahName });
      } catch {}

      await loadPrayerTimings();

      const hasLocation = !!(localStorage.getItem("lat") && localStorage.getItem("lng"));
      if (!hasLocation && !sessionStorage.getItem("location-tried")) {
        sessionStorage.setItem("location-tried", "1");
        fetchIpLocation();
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, loadPrayerTimings, fetchIpLocation]);

  const profileIncomplete = useMemo(() => {
    const p = userData;
    return !p.fullName || !p.country;
  }, [userData]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greetingMorning");
    if (hour < 17) return t("home.greetingAfternoon");
    return t("home.greetingEvening");
  }, [t]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-emerald-600 border-t-transparent"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-green-400/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-32 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/profile")} className="relative block h-12 w-12">
              {userData.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt="profile"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-200"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-xl font-bold text-white">
                  {userData.fullName?.[0] || "U"}
                </div>
              )}
            </button>
            <div>
              <p className="text-sm text-gray-500">{greeting} {t("home.salam")}</p>
              <h2 className="text-lg font-bold sm:text-xl">{userData.fullName || t("home.guest")}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/notifications")}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-emerald-50"
              aria-label="Notifications"
            >
              <Bell size={22} className="text-emerald-700" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push("/prayer")}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
            >
              {t("home.prayer")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-1.5 rounded-3xl bg-white p-3 shadow-lg ring-1 ring-emerald-50/50 transition hover:ring-2 hover:ring-emerald-300 active:scale-95"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-center text-[11px] font-bold text-gray-700">
                {t(`feature.${item.key}`)}
              </span>
            </button>
          ))}
        </div>

        {profileIncomplete && (
          <button
            onClick={() => router.push("/profile")}
            className="mt-6 flex w-full items-center justify-between rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 text-left shadow-md"
          >
            <div>
              <p className="font-bold text-red-700">{t("home.profileCompleteTitle")}</p>
              <p className="text-sm text-red-500">{t("home.profileCompleteDesc")}</p>
            </div>
            <span className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">
              {t("home.editProfile")}
            </span>
          </button>
        )}

        {!nextPrayer && (
          <button
            onClick={requestLocation}
            className="mt-6 flex w-full items-center justify-between rounded-2xl border-2 border-emerald-200 bg-white px-5 py-4 text-left shadow-md"
          >
            <div>
              <p className="font-bold text-emerald-700">
                {locationLoading ? t("home.locating") : t("home.locationTitle")}
              </p>
              <p className="text-sm text-gray-500">
                {locationFailed
                  ? t("home.locationFailed")
                  : t("home.locationDesc")}
              </p>
            </div>
            <span className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
              {locationLoading ? "..." : t("home.enable")}
            </span>
          </button>
        )}

        <div className="mt-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-md">
              <span className="pl-2 text-lg">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    window.location.href = "/search";
                  }
                }}
                placeholder={t("home.searchPlaceholder")}
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <p className="text-lg font-bold text-emerald-50">{t("home.verseOfTheDay")}</p>
          </div>
          <p className="mt-6 text-right text-2xl font-semibold leading-[1.9] arfont" dir="rtl">
            {dailyVerse.arabic}
          </p>
          <p className="mt-5 text-lg leading-8 text-emerald-50">
            &ldquo;{dailyVerse.translation}&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-between">
            <p className="font-semibold">{dailyVerse.reference}</p>
            <button
              onClick={() => {
                const index = getRandomVerseIndex();
                setDailyVerse(getVerseAt(index));
                try {
                  localStorage.setItem(LAST_VERSE_KEY, String(index));
                } catch {}
              }}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
            >
              {t("home.anotherVerse")}
            </button>
          </div>
        </div>

        {/* Explore / Feature grid */}
        <div className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-3xl">{t("home.explore")}</h2>
            <p className="hidden text-gray-500 sm:block">{t("home.exploreDesc")}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURES.map((item, index) => (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(item.path)}
                className="relative flex items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-lg ring-1 ring-emerald-50/50 transition"
              >
                {item.key === "community" && unreadCount > 0 && (
                  <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-2xl shadow-md">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-gray-800">{t(`feature.${item.key}`)}</h3>
                  <p className="truncate text-xs text-gray-500">{t(`feature.${item.key}Desc`)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-3xl">{t("home.dashboardTitle")}</h2>
            <p className="hidden text-gray-500 sm:block">{t("home.dashboardSubtitle")}</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 p-8 text-white shadow-2xl">
              <div className="text-5xl">🕌</div>
              <h3 className="mt-5 text-2xl font-bold">{t("home.nextPrayer")}</h3>
              {nextPrayer ? (
                <>
                  <h1 className="mt-8 text-5xl font-extrabold">{nextPrayer.name}</h1>
                  <p className="mt-2 text-lg text-emerald-100">
                    {nextPrayer.arabic} • {t("home.today")} • {nextPrayer.time}
                  </p>
                  {locationLabel && (
                    <p className="mt-1 text-xs text-emerald-200">
                      {t("home.basedOn")} {locationLabel}
                    </p>
                  )}
                  <div className="mt-10 rounded-2xl bg-white/20 p-4">
                    <p className="text-lg">{t("home.remaining")}</p>
                    <h2 className="mt-2 text-3xl font-bold">{nextPrayer.remaining}</h2>
                  </div>
                </>
              ) : (
                <div className="mt-8">
                  <p className="text-lg text-emerald-100">--:--</p>
                  <button
                    onClick={requestLocation}
                    className="mt-6 rounded-2xl bg-white px-5 py-3 font-bold text-emerald-700 hover:bg-gray-100"
                  >
                    {t("home.enableLocation")}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="text-5xl">🌙</div>
              <h3 className="mt-5 text-2xl font-bold">{t("home.todaysAyah")}</h3>
              <p className="mt-6 text-right text-xl font-semibold leading-10 arfont" dir="rtl">
                {dailyVerse.arabic}
              </p>
              <p className="mt-5 text-gray-600 leading-8">
                &ldquo;{dailyVerse.translation}&rdquo;
              </p>
              <p className="mt-4 font-semibold text-emerald-700">{dailyVerse.reference}</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 p-8 text-white shadow-2xl">
              <div className="text-5xl">❤️</div>
              <h3 className="mt-5 text-2xl font-bold">{t("home.communityTitle")}</h3>
              <p className="mt-3 text-emerald-100">{t("home.communityDesc")}</p>
              <button
                onClick={() => router.push("/community")}
                className="mt-6 rounded-xl bg-white px-5 py-3 font-bold text-emerald-700 hover:bg-gray-100 transition"
              >
                {t("home.join")}
              </button>
            </div>
          </div>

          {lastRead && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t("home.lastRead")}</p>
                  <h3 className="text-lg font-bold">{lastRead.name}</h3>
                </div>
                <button
                  onClick={() => router.push(`/quran/read/${lastRead.number}`)}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700"
                >
                  {t("home.continue")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
