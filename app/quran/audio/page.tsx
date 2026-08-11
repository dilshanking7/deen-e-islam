"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Search, Music } from "lucide-react";
import { getSurahs } from "@/lib/quran-api";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  audio?: string;
}

export default function AudioPage() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState(0);

  // Fetch Surah list
  useEffect(() => {
    async function load() {
      try {
        const data = await getSurahs();
        setSurahs(data);
      } catch (err) {
        console.error("Failed to fetch surahs:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Audio helper function using high quality CDN
  function getAudioUrl(surahNumber: number) {
    // Pads number with leading zeros e.g. 1 -> 001, 114 -> 114
    const paddedNumber = String(surahNumber).padStart(3, "0");
    return `https://server8.mp3quran.net/afs/${paddedNumber}.mp3`;
  }

  function playAudio(surah: Surah) {
    if (!audioRef.current) return;

    const url = getAudioUrl(surah.number);
    audioRef.current.src = url;
    audioRef.current.play();

    setCurrentSurah(surah);
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

  // Audio progress and ended event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onEnded() {
      setPlaying(false);
      setProgress(0);
    }

    function onTimeUpdate() {
      if (audio && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.number.toString().includes(search)
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
          <h2 className="mt-5 text-2xl font-bold text-emerald-700">
            Loading Surahs...
          </h2>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 pb-32">
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-emerald-700">
            <Music className="h-8 w-8" /> Quran Audio
          </h1>

          {/* Search Input */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Surah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-emerald-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </header>

      {/* Surah List Grid */}
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSurahs.map((surah) => {
            const isSelected = currentSurah?.number === surah.number;

            return (
              <div
                key={surah.number}
                className={`rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/50 shadow-md"
                    : "border-emerald-100 bg-white shadow-lg"
                }`}
              >
                {/* Top Info */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">
                    {surah.number}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {surah.revelationType}
                  </span>
                </div>

                {/* Arabic Name */}
                <h2 className="mt-4 text-right text-3xl font-bold text-gray-800">
                  {surah.name}
                </h2>

                {/* English Info */}
                <h3 className="mt-2 text-xl font-bold text-emerald-800">
                  {surah.englishName}
                </h3>
                <p className="text-sm text-gray-500">
                  {surah.englishNameTranslation}
                </p>

                <div className="mt-3">
                  <span className="rounded-xl bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {surah.numberOfAyahs} Ayahs
                  </span>
                </div>

                {/* Play Button */}
                <div className="mt-6">
                  {isSelected && playing ? (
                    <button
                      onClick={togglePlayPause}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-semibold text-white transition hover:bg-amber-700"
                    >
                      <Pause size={18} /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => playAudio(surah)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800"
                    >
                      <Play size={18} /> Play Recitation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Audio Player Bar */}
      {currentSurah && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 px-6 py-4 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            {/* Surah Metadata */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 font-bold text-white">
                {currentSurah.number}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {currentSurah.englishName} ({currentSurah.name})
                </h4>
                <p className="text-xs text-gray-500">
                  Mishary Rashid Alafasy
                </p>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex flex-1 max-w-md flex-col items-center gap-1">
              <button
                onClick={togglePlayPause}
                className="rounded-full bg-emerald-700 p-3 text-white transition hover:bg-emerald-800"
              >
                {playing ? <Pause size={22} /> : <Play size={22} />}
              </button>

              {/* Progress Line */}
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-emerald-700 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-gray-500">
              <Volume2 size={20} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}