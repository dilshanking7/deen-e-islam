"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, BellRing, BellOff, MapPin, RefreshCw, Volume2, VolumeX } from "lucide-react";
import {
  PRAYER_ORDER,
  ADHAN_URL,
  FAJR_ADHAN_URL,
  CALCULATION_METHODS,
  formatPrayerTime,
  prayerTimeInLocal,
  getPrayerTimings,
  type PrayerDay,
  type PrayerTimings,
} from "@/lib/prayer-api";
import { getPlaceName, getLocationByIP } from "@/lib/geo";
import ThemeControls from "@/components/ui/ThemeControls";
import DownloadButton from "@/components/pwa/DownloadButton";
import { useI18n } from "@/lib/i18n";

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = target ? target.getTime() - now.getTime() : 0;
  if (diff <= 0) return { h: 0, m: 0, s: 0, done: true };
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: false,
  };
}

export default function PrayerPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<PrayerDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const saved = Number(localStorage.getItem("prayer-method") || "1");
    return saved >= 1 ? saved : 1;
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    if (typeof window === "undefined") return null;
    const savedLat = Number(localStorage.getItem("lat"));
    const savedLng = Number(localStorage.getItem("lng"));
    if (savedLat && savedLng) return { lat: savedLat, lng: savedLng };
    return null;
  });
  const [locationName, setLocationName] = useState("");
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("prayer-sound") !== "off";
  });
  const [alarms, setAlarms] = useState<Record<string, boolean>>(() => {
    const base = { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
    if (typeof window === "undefined") return base;
    try {
      const saved = localStorage.getItem("prayer-alarms");
      if (saved) return { ...base, ...JSON.parse(saved) };
    } catch {}
    return base;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedRef = useRef<Record<string, string>>({});
  const watchIdRef = useRef<number | null>(null);
  const ipTriedRef = useRef(false);
  const lastAppliedRef = useRef<{ lat: number; lng: number; at: number } | null>(null);

  function meaningfulMove(lat: number, lng: number): boolean {
    const last = lastAppliedRef.current;
    if (!last) return true;
    const R = 6371000;
    const dLat = ((lat - last.lat) * Math.PI) / 180;
    const dLng = ((lng - last.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((last.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const meters = 2 * R * Math.asin(Math.sqrt(a));
    return meters > 500 || Date.now() - last.at > 180000;
  }

  async function tryIpFallback() {
    if (ipTriedRef.current) return;
    ipTriedRef.current = true;
    try {
      setError("Geolocation mila nahi — IP ke zariye location dhoondh rahe hain...");
      const geo = await getLocationByIP();
      if (geo) {
        await applyPlace(geo.latitude, geo.longitude);
        setLocationName(geo.label || savedArea || "Your location");
        setError("");
      } else {
        setError("Location mil nahi payi. Saved city times dikha rahe hain.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Saved area (onboarding se) — jab geolocation nahi mile to yehi dikhega
  function getSavedArea(): string {
    if (typeof window === "undefined") return "";
    const c = localStorage.getItem("city") || "";
    const s = localStorage.getItem("state") || "";
    const p = localStorage.getItem("pincode") || "";
    return [c, s, p].filter(Boolean).join(", ");
  }
  const savedArea = getSavedArea();

  async function applyPlace(lat: number, lng: number) {
    if (!meaningfulMove(lat, lng)) return;
    lastAppliedRef.current = { lat, lng, at: Date.now() };
    localStorage.setItem("lat", String(lat));
    localStorage.setItem("lng", String(lng));
    setCoords({ lat, lng });
    const place = await getPlaceName(lat, lng);
    if (place) {
      setLocationName(place.label);
    } else {
      setLocationName(savedArea || "Your location");
    }
  }

  const fetchTimings = useCallback(
    async (lat: number, lng: number, m: number) => {
      setLoading(true);
      setError("");
      try {
        const day = await getPrayerTimings({ latitude: lat, longitude: lng, method: m });
        setData(day);
        if (!locationName) {
          const place = await getPlaceName(lat, lng);
          setLocationName(place?.label || savedArea || "Your location");
        }
      } catch {
        setError("Prayer times nahi mil paye. Internet check karein ya dobara try karein.");
      } finally {
        setLoading(false);
      }
    },
    [locationName, savedArea]
  );

  useEffect(() => {
    if (!coords) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTimings(coords.lat, coords.lng, method);
  }, [coords, method, fetchTimings]);

  // Auto-detect location on mount + LIVE tracking (watchPosition)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      tryIpFallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPlace(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        tryIpFallback();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        applyPlace(pos.coords.latitude, pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locateMe() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation supported nahi hai. Browser settings check karein.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        localStorage.setItem("lat", String(lat));
        localStorage.setItem("lng", String(lng));
        const place = await getPlaceName(lat, lng);
        setLocationName(place?.label || savedArea || "Your location");
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission deny hai. Settings se allow karein — isse aapke sehar ke exact namaz ke auqat milenge.");
          tryIpFallback();
        } else {
          setError("Location mil nahi payi. Saved city times dikha rahe hain.");
          tryIpFallback();
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function toggleSound() {
    setSoundOn((v) => {
      localStorage.setItem("prayer-sound", v ? "off" : "on");
      return !v;
    });
  }

  function toggleAlarm(key: string) {
    setAlarms((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("prayer-alarms", JSON.stringify(next));
      return next;
    });
  }

  const timings = useMemo(() => {
    if (!data) return null;
    return PRAYER_ORDER.map((p) => {
      const raw = (data.timings as PrayerTimings)[p.key] || "";
      return { ...p, time: formatPrayerTime(raw), date: prayerTimeInLocal(raw, data.meta.timezone) };
    });
  }, [data]);

  interface RangeInfo {
    key: string;
    name: string;
    arabic: string;
    icon: string;
    start: Date;
    end: Date;
    startLabel: string;
    endLabel: string;
  }

  const ranges = useMemo<RangeInfo[]>(() => {
    if (!timings) return [];
    const byKey = (k: string) => timings.find((t) => t.key === k);
    const fajr = byKey("Fajr");
    const sunrise = byKey("Sunrise");
    const dhuhr = byKey("Dhuhr");
    const asr = byKey("Asr");
    const maghrib = byKey("Maghrib");
    const isha = byKey("Isha");
    if (!fajr || !sunrise || !dhuhr || !asr || !maghrib || !isha) return [];

    const ishaEnd = new Date(fajr.date);
    ishaEnd.setDate(ishaEnd.getDate() + 1);

    const label = (d: Date) => formatPrayerTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`);

    const windows: RangeInfo[] = [
      { key: "Fajr", name: fajr.name, arabic: fajr.arabic, icon: fajr.icon, start: fajr.date, end: sunrise.date, startLabel: fajr.time, endLabel: label(sunrise.date) },
      { key: "Dhuhr", name: dhuhr.name, arabic: dhuhr.arabic, icon: dhuhr.icon, start: dhuhr.date, end: asr.date, startLabel: dhuhr.time, endLabel: label(asr.date) },
      { key: "Asr", name: asr.name, arabic: asr.arabic, icon: asr.icon, start: asr.date, end: maghrib.date, startLabel: asr.time, endLabel: label(maghrib.date) },
      { key: "Maghrib", name: maghrib.name, arabic: maghrib.arabic, icon: maghrib.icon, start: maghrib.date, end: isha.date, startLabel: maghrib.time, endLabel: label(isha.date) },
      { key: "Isha", name: isha.name, arabic: isha.arabic, icon: isha.icon, start: isha.date, end: ishaEnd, startLabel: isha.time, endLabel: label(ishaEnd) },
    ];

    return windows.map((w) => ({
      ...w,
      startLabel: formatPrayerTime(`${w.start.getHours()}:${String(w.start.getMinutes()).padStart(2, "0")}`),
    }));
  }, [timings]);

  const rangeFor = (key: string) => ranges.find((r) => r.key === key);

  const currentWindow = useMemo(() => {
    const m = now.getTime();
    return ranges.find((r) => r.start.getTime() <= m && m < r.end.getTime()) || null;
  }, [ranges, now]);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    const nowMs = now.getTime();
    const upcoming = timings.find((t) => t.date.getTime() > nowMs);
    if (upcoming) return upcoming;
    const first = timings.find((t) => t.key !== "Sunrise");
    if (first) {
      const tomorrow = new Date(first.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { ...first, date: tomorrow };
    }
    return null;
  }, [timings, now]);

  const countdown = useCountdown(nextPrayer ? nextPrayer.date : null);

  useEffect(() => {
    if (!timings || !alarms) return;
    const todayStr = now.toDateString();
    for (const t of timings) {
      if (t.key === "Sunrise" || !alarms[t.key]) continue;
      const prayerStr = `${todayStr}:${t.key}`;
      if (firedRef.current[t.key] === prayerStr) continue;
      const diff = t.date.getTime() - now.getTime();
      if (diff <= 60000 && diff > -20000) {
        firedRef.current[t.key] = prayerStr;
        if (soundOn) {
          if (audioRef.current) audioRef.current.pause();
          const url = t.key === "Fajr" ? FAJR_ADHAN_URL : ADHAN_URL;
          audioRef.current = new Audio(url);
          audioRef.current.play().catch(() => {});
        }
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🕌 ${t.name} ka waqt aa gaya`, {
            body: `${t.name} (${t.arabic}) namaz ka waqt ho gaya hai. Allah aapko qubool kare.`,
            icon: "/logo-icon.png",
          });
        }
      }
    }
  }, [timings, now, alarms, soundOn]);

  async function schedulePrayerNotifications() {
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (!reg) return;
      const supportsTrigger =
        "showTrigger" in Notification.prototype && !!(window as unknown as { NotificationTrigger?: unknown }).NotificationTrigger;
      if (!supportsTrigger) return;
      const Trigger = (window as unknown as { NotificationTrigger: new (o: { timestamp: number }) => unknown }).NotificationTrigger;
      for (const t of timings || []) {
        if (t.key === "Sunrise" || !alarms[t.key]) continue;
        const trigger = new Trigger({ timestamp: t.date.getTime() - 60000 });
        void reg.showNotification(`${t.name} ka waqt aa gaya 🕌`, {
          body: `${t.name} (${t.arabic}) namaz ka waqt ho gaya hai.`,
          icon: "/logo-icon.png",
          tag: `prayer-${t.key}-${t.date.toDateString()}`,
          showTrigger: trigger,
        } as NotificationOptions);
      }
    } catch {}
  }

  useEffect(() => {
    if (!timings) return;
    const todayStr = now.toDateString();
    const key = `islaam-notify-${todayStr}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      schedulePrayerNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timings]);

  function requestNotify() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  useEffect(() => {
    requestNotify();
  }, []);

  if (loading && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="mx-auto h-16 w-16 rounded-full border-4 border-emerald-600 border-t-transparent"
          />
          <p className="mt-6 text-lg font-semibold text-emerald-700">
            Aapki location ke real prayer times load ho rahe hain...
          </p>
        </div>
      </main>
    );
  }

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="fixed left-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-[120px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-yellow-300/30 blur-[120px]" />

      <div className="mx-auto max-w-3xl px-5 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">{t("prayer.title")}</h1>
              <p className="text-xs text-gray-500">
                {data?.hijri?.date || ""} • {data?.hijri?.month || ""} {data?.hijri?.year || ""} AH
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeControls />
            <DownloadButton />
            <button
              onClick={() => router.push("/home")}
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
            >
              {t("prayer.back")}
            </button>
          </div>
        </div>

        {/* Location bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-md ring-1 ring-emerald-50">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-semibold text-gray-800">{locationName || savedArea || "Your Location"}</p>
              <p className="text-xs text-gray-400">
                {data?.meta?.method?.name || CALCULATION_METHODS[method] || "Real-time"} •{" "}
                {coords ? `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}` : "…"}
              </p>
              {savedArea && locationName !== savedArea && (
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                  📍 {t("prayer.yourArea")}: {savedArea}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={locateMe}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw className="h-4 w-4" /> {t("prayer.liveLocation")}
          </button>
        </div>

        {/* Calculation method */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-gray-600">{t("prayer.calcMethod")}</label>
          <select
            value={method}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMethod(m);
              localStorage.setItem("prayer-method", String(m));
            }}
            className="flex-1 rounded-2xl border border-emerald-100 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 shadow outline-none focus:border-emerald-500"
          >
            {Object.entries(CALCULATION_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-700">
            {error}
          </div>
        )}

        {/* Next Prayer Banner */}
        {nextPrayer && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 overflow-hidden rounded-[35px] bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-900 p-8 text-white shadow-2xl"
          >
            <p className="text-sm text-emerald-200">
              {dateStr} • {locationName}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-emerald-200">{t("prayer.nextPrayer")}</p>
                <h2 className="mt-2 text-5xl font-extrabold">{nextPrayer.name}</h2>
                <p className="mt-2 text-lg text-emerald-100">
                  {nextPrayer.arabic} • {nextPrayer.time}
                </p>
                {rangeFor(nextPrayer.key) && (
                  <p className="mt-1 text-sm font-semibold text-yellow-200">
                    {t("prayer.rangeTo", {
                      from: rangeFor(nextPrayer.key)!.startLabel,
                      to: rangeFor(nextPrayer.key)!.endLabel,
                    })}
                  </p>
                )}
              </div>

              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="rounded-3xl bg-white/15 px-8 py-6 text-center backdrop-blur"
              >
                <p className="text-sm text-emerald-100">{t("prayer.timeRemaining")}</p>
                <h3 className="mt-2 text-4xl font-extrabold tracking-wide">
                  {String(countdown.h).padStart(2, "0")} : {String(countdown.m).padStart(2, "0")} :{" "}
                  {String(countdown.s).padStart(2, "0")}
                </h3>
                {alarms[nextPrayer.key] && (
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-yellow-200">
                    <BellRing className="h-3.5 w-3.5" /> {t("prayer.azanAlarmOn")}
                  </p>
                )}
              </motion.div>
            </div>

            {currentWindow && (
              <div className="mt-6 rounded-2xl bg-white/10 px-5 py-3 text-sm text-emerald-50 backdrop-blur">
                {t("prayer.windowActive", { name: currentWindow.name })} {currentWindow.startLabel}{" "}
                {t("prayer.till")} {currentWindow.endLabel} —
                {(() => {
                  const mins = Math.max(0, Math.floor((currentWindow.end.getTime() - now.getTime()) / 60000));
                  return mins > 0 ? ` ${t("prayer.remainingShort", { m: mins })}` : "";
                })()}
              </div>
            )}

            <div className="mt-8 h-2 rounded-full bg-white/15">
              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ repeat: Infinity, duration: 600, ease: "linear" }}
                className="h-2 rounded-full bg-yellow-300"
              />
            </div>
          </motion.div>
        )}

        {/* Sound toggle */}
        <div className="mt-6 flex items-center justify-between rounded-3xl bg-white p-5 shadow-md ring-1 ring-emerald-50">
          <div className="flex items-center gap-3">
            {soundOn ? (
              <Volume2 className="h-5 w-5 text-emerald-700" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-gray-800">{t("prayer.azanSound")}</p>
              <p className="text-xs text-gray-400">{t("prayer.azanSoundDesc")}</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
              soundOn
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            {soundOn ? t("prayer.on") : t("prayer.off")}
          </button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center gap-2 px-2 text-xs text-gray-500"
        >
          <BellRing className="h-3.5 w-3.5 text-emerald-600" />
          {t("prayer.notifyScheduled")}
        </motion.p>

        {/* All Prayers with alarm toggles */}
        <div className="mt-6 space-y-4">
          {timings?.map((prayer, index) => {
            const isActive = currentWindow ? prayer.key === currentWindow.key : false;
            const isNext = !isActive && nextPrayer && prayer.key === nextPrayer.key && !countdown.done;
            const isPast = !isActive && !isNext && prayer.date.getTime() < now.getTime();

            return (
              <motion.div
                key={prayer.key}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.06 }}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between rounded-3xl p-5 transition ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-green-700 text-white shadow-xl ring-2 ring-yellow-300"
                    : "bg-white shadow-md ring-1 ring-emerald-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{prayer.icon}</span>
                  <div>
                    <h3 className={`text-lg font-bold ${isActive ? "text-white" : "text-gray-800"}`}>
                      {prayer.name}
                    </h3>
                    <p className={`text-xs ${isActive ? "text-emerald-100" : "text-gray-400"}`}>
                      {prayer.arabic}
                      {isActive
                        ? ` • ${t("prayer.activeBadge")}`
                        : isPast
                        ? ` • ${t("prayer.done")}`
                        : ""}
                    </p>
                    {rangeFor(prayer.key) && (
                      <p className={`mt-0.5 text-xs font-semibold ${isActive ? "text-yellow-200" : "text-emerald-700"}`}>
                        {t("prayer.rangeTo", {
                          from: rangeFor(prayer.key)!.startLabel,
                          to: rangeFor(prayer.key)!.endLabel,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-xl font-extrabold ${
                        isActive ? "text-white" : "text-emerald-700"
                      }`}
                    >
                      {prayer.time}
                    </p>
                    {isActive && (
                      <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">
                        {t("prayer.now")}
                      </span>
                    )}
                    {isNext && (
                      <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">
                        Next
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleAlarm(prayer.key)}
                    title={`${prayer.name} alarm ${alarms[prayer.key] ? "band karein" : "chalu karein"}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                      isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {alarms[prayer.key] ? (
                      <Bell className="h-5 w-5" />
                    ) : (
                      <BellOff className="h-5 w-5 opacity-40" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reminder Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center"
        >
          <p className="text-lg text-emerald-700">
            🤲 &ldquo;Verily, prayer keeps one away from immorality and evil.&rdquo;
          </p>
          <p className="mt-2 text-sm text-gray-500">— Surah Al-Ankabut 29:45</p>
        </motion.div>
      </div>
    </main>
  );
}
