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
import ThemeControls from "@/components/ui/ThemeControls";
import DownloadButton from "@/components/pwa/DownloadButton";

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
  const [now, setNow] = useState(() => new Date());
  const [data, setData] = useState<PrayerDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const saved = Number(localStorage.getItem("prayer-method") || "1");
    return saved >= 1 ? saved : 1;
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (typeof window === "undefined") return { lat: 20.5937, lng: 78.9629 };
    const savedLat = Number(localStorage.getItem("lat"));
    const savedLng = Number(localStorage.getItem("lng"));
    if (savedLat && savedLng) return { lat: savedLat, lng: savedLng };
    return { lat: 20.5937, lng: 78.9629 };
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

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchTimings = useCallback(
    async (lat: number, lng: number, m: number) => {
      setLoading(true);
      setError("");
      try {
        const day = await getPrayerTimings({ latitude: lat, longitude: lng, method: m });
        setData(day);
        const city = day.meta?.location?.city || "";
        const country = day.meta?.location?.country || "";
        setLocationName([city, country].filter(Boolean).join(", ") || "Your location");
      } catch {
        setError("Prayer times nahi mil paye. Internet check karein ya dobara try karein.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!coords) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTimings(coords.lat, coords.lng, method);
  }, [coords, method, fetchTimings]);

  function locateMe() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation supported nahi hai. Browser settings check karein.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        localStorage.setItem("lat", String(lat));
        localStorage.setItem("lng", String(lng));
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission deny hai. Settings se allow karein — isse aapke sehar ke exact namaz ke auqat milenge.");
        } else {
          setError("Location mil nahi payi. Saved city times dikha rahe hain.");
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
      if (diff > 0 && diff <= 20000) {
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
              <h1 className="text-2xl font-extrabold text-emerald-800">Prayer Times</h1>
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
              ← Back
            </button>
          </div>
        </div>

        {/* Location bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-md ring-1 ring-emerald-50">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="font-semibold text-gray-800">{locationName || "Your Location"}</p>
              <p className="text-xs text-gray-400">
                {data?.meta?.method?.name || CALCULATION_METHODS[method] || "Real-time"} •{" "}
                {coords ? `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={locateMe}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw className="h-4 w-4" /> Auto-Detect
          </button>
        </div>

        {/* Calculation method */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-gray-600">Calculation Method:</label>
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
                <p className="text-emerald-200">Agli Namaz (Next Prayer)</p>
                <h2 className="mt-2 text-5xl font-extrabold">{nextPrayer.name}</h2>
                <p className="mt-2 text-lg text-emerald-100">
                  {nextPrayer.arabic} • {nextPrayer.time}
                </p>
              </div>

              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="rounded-3xl bg-white/15 px-8 py-6 text-center backdrop-blur"
              >
                <p className="text-sm text-emerald-100">Time Remaining</p>
                <h3 className="mt-2 text-4xl font-extrabold tracking-wide">
                  {String(countdown.h).padStart(2, "0")} : {String(countdown.m).padStart(2, "0")} :{" "}
                  {String(countdown.s).padStart(2, "0")}
                </h3>
                {alarms[nextPrayer.key] && (
                  <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-yellow-200">
                    <BellRing className="h-3.5 w-3.5" /> Azan alarm ON hai
                  </p>
                )}
              </motion.div>
            </div>

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
              <p className="font-semibold text-gray-800">Azan / Alarm Sound</p>
              <p className="text-xs text-gray-400">
                Jab namaz ka waqt ho to azan baj jayega aur notification milega
              </p>
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
            {soundOn ? "ON" : "OFF"}
          </button>
        </div>

        {/* All Prayers with alarm toggles */}
        <div className="mt-6 space-y-4">
          {timings?.map((prayer, index) => {
            const isNext = nextPrayer && prayer.key === nextPrayer.key && !countdown.done;
            const isPast =
              prayer.date.getTime() < now.getTime() &&
              !(nextPrayer && prayer.key === nextPrayer.key);

            return (
              <motion.div
                key={prayer.key}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.06 }}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between rounded-3xl p-5 transition ${
                  isNext
                    ? "bg-gradient-to-r from-emerald-700 to-green-700 text-white shadow-xl"
                    : "bg-white shadow-md ring-1 ring-emerald-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{prayer.icon}</span>
                  <div>
                    <h3 className={`text-lg font-bold ${isNext ? "text-white" : "text-gray-800"}`}>
                      {prayer.name}
                    </h3>
                    <p className={`text-xs ${isNext ? "text-emerald-100" : "text-gray-400"}`}>
                      {prayer.arabic}
                      {isPast ? " • done" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-xl font-extrabold ${
                        isNext ? "text-white" : "text-emerald-700"
                      }`}
                    >
                      {prayer.time}
                    </p>
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
                      isNext ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
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
