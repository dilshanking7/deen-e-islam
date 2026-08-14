"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Globe,
  Bookmark,
  Search,
  Sparkles,
  Grid3x3,
} from "lucide-react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

const POPULAR = [1, 36, 55, 67, 78, 18];

export default function QuranPage() {
  const router = useRouter();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<Surah | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          setSurahs(
            d.data.map((s: { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number }) => ({
              number: s.number,
              name: s.name,
              englishName: s.englishName,
              englishNameTranslation: s.englishNameTranslation,
              numberOfAyahs: s.numberOfAyahs,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  function getAudioUrl(n: number) {
    return `https://server8.mp3quran.net/afs/${String(n).padStart(3, "0")}.mp3`;
  }

  function playSurah(surah: Surah) {
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.pause();
    audioRef.current.src = getAudioUrl(surah.number);
    audioRef.current.play().catch(() => {});
    setCurrent(surah);
    setPlaying(true);
  }

  function togglePlayPause() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  function playAdjacent(delta: number) {
    if (!current) return;
    const target = surahs.find((s) => s.number === current.number + delta);
    if (target) playSurah(target);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function onEnded() {
      setPlaying(false);
      setProgress(0);
    }
    function onTime() {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    }
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const popularSurahs = POPULAR.map((n) => surahs.find((s) => s.number === n)).filter(
    (s): s is Surah => Boolean(s)
  );

  const quickLinks = [
    { label: "Read Quran", icon: BookOpen, path: "/quran/read" },
    { label: "Mushaf", icon: Grid3x3, path: "/quran/mushaf" },
    { label: "Translation", icon: Globe, path: "/quran/translation" },
    { label: "Bookmarks", icon: Bookmark, path: "/quran/bookmarks" },
    { label: "Daily Verse", icon: Sparkles, path: "/quran/daily-verse" },
    { label: "Search", icon: Search, path: "/quran/search" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 pb-32">
      <div className="mx-auto max-w-3xl px-5 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Islaam-E-Deen"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">Holy Quran</h1>
              <p className="text-xs text-gray-500">Pardhain, Sunein, Samjhein</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/home")}
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow ring-1 ring-emerald-100 transition hover:bg-emerald-50"
          >
            ← Home
          </button>
        </div>

        {/* Hero */}
        <div className="mt-6 overflow-hidden rounded-[30px] bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-950 p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold">القرآن الكريم</h2>
          <p className="mt-2 text-emerald-100">
            Allah ka kalaam — 114 surah, 604 pages
          </p>
        </div>

        {/* Audio section on top */}
        <div className="mt-6 rounded-[30px] bg-white p-6 shadow-2xl ring-1 ring-emerald-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-emerald-800">🎧 Audio Recitation</h2>
              <p className="text-xs text-gray-500">
                Mishary Rashid Alafasy — mashhoor surahs
              </p>
            </div>
          </div>

          {current && (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-emerald-50 p-4">
              <button
                onClick={() => playAdjacent(-1)}
                disabled={!current || current.number <= 1}
                className="rounded-full bg-emerald-100 p-2.5 text-emerald-800 transition hover:bg-emerald-200 active:scale-95 disabled:opacity-30"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={togglePlayPause}
                className="rounded-full bg-emerald-700 p-3.5 text-white transition hover:bg-emerald-800"
              >
                {playing ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button
                onClick={() => playAdjacent(1)}
                disabled={!current || current.number >= 114}
                className="rounded-full bg-emerald-100 p-2.5 text-emerald-800 transition hover:bg-emerald-200 active:scale-95 disabled:opacity-30"
              >
                <SkipForward size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-gray-800">
                  {current.number}. {current.englishName}
                </p>
                <p className="truncate text-xs text-gray-500">{current.name}</p>
              </div>
              <div className="w-20 sm:w-28">
                <div className="h-1.5 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-emerald-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {popularSurahs.map((s, i) => {
              const isActive = current?.number === s.number;
              return (
                <motion.button
                  key={s.number}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => playSurah(s)}
                  className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition active:scale-95 ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-lg"
                      : "bg-emerald-50/70 text-gray-800 hover:bg-emerald-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-emerald-700 text-white"
                    }`}
                  >
                    {isActive && playing ? <Pause size={15} /> : <Play size={15} />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{s.englishName}</p>
                    <p className={`text-xs ${isActive ? "text-emerald-100" : "text-gray-500"}`}>
                      {s.englishNameTranslation} • {s.numberOfAyahs} ayahs
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => router.push("/quran/audio")}
            className="mt-4 w-full rounded-2xl bg-emerald-700 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            All 114 Surahs →
          </button>
        </div>

        {/* Quick links (no nested cards) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => router.push(link.path)}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-lg ring-1 ring-emerald-50/50 transition hover:ring-2 hover:ring-emerald-300 active:scale-95"
            >
              <link.icon size={18} className="shrink-0 text-emerald-700" />
              <span className="text-sm font-bold text-gray-700">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
