"use client";

import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Square,
  CheckCircle2,
  Bookmark,
} from "lucide-react";

import {
  toggleBookmark as toggleQuranBookmark,
  isBookmarked,
} from "@/lib/quran-bookmark";

import { getMushafPage, TOTAL_PAGES } from "@/lib/mushaf-api";
import { getSurahByPage, SURAH_PAGE_MAP } from "@/lib/surah-page-map";
import {
  getMushafProgress,
  saveMushafProgress,
  setLocalPage,
} from "@/lib/mushaf-progress";
import {
  getAyahAudioUrl,
  getOnlineAyahAudioUrl,
  getPageAyahs,
} from "@/lib/quran-page-audio";
import { useI18n } from "@/lib/i18n";

function MushafContent() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();

  // Explicit ?page= from URL (surah search, continue reading, etc.)
  const rawPage = searchParams.get("page");
  const urlPage = useMemo(() => {
    const n = Number(rawPage);
    return rawPage && Number.isFinite(n) && n >= 1 && n <= TOTAL_PAGES
      ? Math.round(n)
      : null;
  }, [rawPage]);

  // Helper to Sync URL with page number (replace = back button seedha bahar jayega)
  const updateURL = useCallback(
    (newPage: number) => {
      router.replace(`/quran/mushaf?page=${newPage}`, { scroll: false });
    },
    [router]
  );

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [playingPage, setPlayingPage] = useState(false);
  const [playingAyah, setPlayingAyah] = useState("");
  const [progressSaved, setProgressSaved] = useState(false);
  const [restoreChecked, setRestoreChecked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Zoom States
  const [zoomScale, setZoomScale] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAudioRef = useRef(false);

  // React to URL page changes (suraho se search/continue reading ke liye)
  useEffect(() => {
    if (urlPage !== null) {
      stopPageAudio();
      const t = setTimeout(() => {
        setZoomScale(1);
        setLoading(false);
        setPage(urlPage);
        setPageInput(String(urlPage));
      }, 0);
      return () => clearTimeout(t);
    }

    // No ?page= in URL -> resume last reading position (once)
    if (restoreChecked) return;
    const rt = setTimeout(() => setRestoreChecked(true), 0);
    let cancelled = false;
    (async () => {
      const saved = await getMushafProgress();
      if (cancelled || !saved) return;
      setPage(saved);
      setPageInput(String(saved));
      setLoading(false);
      updateURL(saved);
    })();
    return () => {
      cancelled = true;
      clearTimeout(rt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, restoreChecked]);

  const image = useMemo(() => {
    return getMushafPage(page);
  }, [page]);

  const surah = useMemo(() => getSurahByPage(page), [page]);

  // Save reading progress locally + to Firestore (auto, debounced) -> tick mark
  useEffect(() => {
    const t1 = setTimeout(() => {
      setLocalPage(page);
      setProgressSaved(false);
    }, 0);
    const timer = setTimeout(() => {
      saveMushafProgress(page).then(() => setProgressSaved(true));
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(timer);
    };
  }, [page]);

  useEffect(() => {
    stopPageAudio();
  }, [page]);

  // Bookmark status for the first ayah on this page
  useEffect(() => {
    const first = getPageAyahs(page)[0];
    if (!first) return;
    isBookmarked(first.surah, first.ayah).then(setBookmarked);
  }, [page]);

  async function handleToggleBookmark() {
    const first = getPageAyahs(page)[0];
    if (!first) return;
    const nowBookmarked = await toggleQuranBookmark(
      first.surah,
      surah.name,
      first.ayah
    );
    setBookmarked(nowBookmarked);
  }

  useEffect(() => {
    return () => stopPageAudio();
  }, []);

  // Preload Next & Previous Pages
  useEffect(() => {
    const next = new window.Image();
    next.src = getMushafPage(Math.min(page + 1, TOTAL_PAGES));

    const prev = new window.Image();
    prev.src = getMushafPage(Math.max(page - 1, 1));
  }, [page]);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }

  const goToPage = useCallback(
    (targetPage: number) => {
      const valid = Math.max(1, Math.min(TOTAL_PAGES, Math.round(targetPage)));
      setLoading(true);
      setZoomScale(1);
      stopPageAudio();
      setTimeout(() => {
        setPage(valid);
        setPageInput(String(valid));
        updateURL(valid);
        setLoading(false);
      }, 80);
    },
    [updateURL]
  );

  const goNext = useCallback(() => {
    if (page >= TOTAL_PAGES) return;
    goToPage(page + 1);
  }, [page, goToPage]);

  const goPrevious = useCallback(() => {
    if (page <= 1) return;
    goToPage(page - 1);
  }, [page, goToPage]);

  function stopPageAudio() {
    stopAudioRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingPage(false);
    setPlayingAyah("");
  }

  async function playAudioSource(src: string) {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject();
      audio.play().catch(reject);
    });
  }

  async function playCurrentPage() {
    if (playingPage) {
      stopPageAudio();
      return;
    }
    const ayahs = getPageAyahs(page);
    if (ayahs.length === 0) return;
    stopAudioRef.current = false;
    setPlayingPage(true);
    for (const item of ayahs) {
      if (stopAudioRef.current) break;
      setPlayingAyah(`${item.surah}:${item.ayah}`);
      await playAudioSource(getAyahAudioUrl(item.surah, item.ayah)).catch(() =>
        playAudioSource(getOnlineAyahAudioUrl(item.surah, item.ayah)).catch(() => {})
      );
    }
    if (!stopAudioRef.current) {
      setPlayingPage(false);
      setPlayingAyah("");
    }
  }

  function handlePageJump(e: React.FormEvent) {
    e.preventDefault();
    const targetPage = Number(pageInput);
    if (targetPage >= 1 && targetPage <= TOTAL_PAGES) {
      goToPage(targetPage);
    } else {
      setPageInput(page.toString());
    }
  }

  function jumpToSurah(surahNumber: number) {
    const target = SURAH_PAGE_MAP.find((s) => s.number === surahNumber);
    if (target) goToPage(target.page);
  }

  // Keyboard Navigation (RTL: left = next page, right = previous page)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrevious();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrevious]);

  // Mouse Wheel Zoom
  const handleWheelZoom = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomScale((prev) => Math.min(prev + 0.25, 2.5));
      } else {
        setZoomScale((prev) => Math.max(prev - 0.25, 1));
      }
    }
  };

  // Double Click / Double Tap Zoom
  const handleDoubleClick = () => {
    setZoomScale((prev) => (prev > 1 ? 1 : 1.8));
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (zoomScale === 1) goNext();
    },
    onSwipedRight: () => {
      if (zoomScale === 1) goPrevious();
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <main
      {...handlers}
      className={`min-h-screen transition-colors duration-300 font-sans ${
        darkMode ? "bg-zinc-950 text-zinc-100" : "bg-emerald-50/30 text-zinc-900"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${
          darkMode
            ? "border-zinc-800/80 bg-zinc-950/80"
            : "border-emerald-100 bg-white/80"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                {t("quran.mushafTitle")}
              </h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {surah.number}. {surah.name} — {surah.englishName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setZoomScale((s) => Math.min(s + 0.25, 2.5))}
              title="Zoom In"
              className={`rounded-xl p-2 transition active:scale-95 ${
                darkMode
                  ? "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                  : "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <ZoomIn size={19} />
            </button>

            <button
              onClick={() => setZoomScale((s) => Math.max(s - 0.25, 1))}
              title="Zoom Out"
              className={`rounded-xl p-2 transition active:scale-95 ${
                darkMode
                  ? "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                  : "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <ZoomOut size={19} />
            </button>

            {zoomScale > 1 && (
              <button
                onClick={() => setZoomScale(1)}
                title="Reset Zoom"
                className="rounded-xl bg-amber-100 p-2 text-amber-800 transition active:scale-95 dark:bg-amber-900/40 dark:text-amber-300"
              >
                <RotateCcw size={19} />
              </button>
            )}

            <div className="h-5 w-[1px] bg-zinc-300 dark:bg-zinc-800 mx-1" />

            <button
              onClick={playCurrentPage}
              title={playingPage ? "Stop Page Audio" : "Play Page Audio"}
              className={`rounded-xl p-2 transition active:scale-95 ${
                playingPage
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                  : darkMode
                  ? "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                  : "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {playingPage ? <Square size={19} /> : <Play size={19} />}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              className={`rounded-xl p-2 transition active:scale-95 ${
                darkMode
                  ? "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                  : "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className={`rounded-xl p-2 transition active:scale-95 ${
                darkMode
                  ? "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                  : "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="mx-auto max-w-6xl px-3 py-4 sm:py-6">
        <div className="relative flex items-center justify-center">
          {/* Next Navigation Arrow — LEFT (RTL reading) */}
          <button
            onClick={goNext}
            disabled={page === TOTAL_PAGES}
            className="absolute left-0 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border bg-white/90 text-emerald-800 shadow-lg backdrop-blur transition hover:scale-110 active:scale-95 disabled:opacity-20 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-emerald-400 md:-left-5"
            title={t("quran.next")}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Quran Page Card Container */}
          <div
            ref={imageContainerRef}
            onWheel={handleWheelZoom}
            onDoubleClick={handleDoubleClick}
            className={`w-full max-w-2xl overflow-auto rounded-3xl border shadow-xl transition-all ${
              darkMode
                ? "border-zinc-800 bg-zinc-900 shadow-black/60"
                : "border-emerald-100 bg-white shadow-emerald-950/5"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: zoomScale }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center p-2 sm:p-4 origin-center cursor-zoom-in"
              >
                {loading ? (
                  <div className="flex h-[600px] sm:h-[750px] w-full items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                  </div>
                ) : (
                  <>
                    <Image
                      src={image}
                      alt={`Quran Page ${page}`}
                      width={1200}
                      height={1800}
                      quality={100}
                      priority
                      draggable={false}
                      unoptimized
                      className="w-full h-auto rounded-xl object-contain"
                    />

                    {/* Page Number Indicator below Image */}
                    <div className="mt-2 text-center text-sm text-gray-500 font-medium">
                      {t("quran.page")} {page} / {TOTAL_PAGES}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Previous Navigation Arrow — RIGHT (RTL reading) */}
          <button
            onClick={goPrevious}
            disabled={page === 1}
            className="absolute right-0 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border bg-white/90 text-emerald-800 shadow-lg backdrop-blur transition hover:scale-110 active:scale-95 disabled:opacity-20 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-emerald-400 md:-right-5"
            title={t("quran.previous")}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Bottom Control Box */}
        <div className="mt-6 flex justify-center">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-4 shadow-sm ${
              darkMode
                ? "border-zinc-800 bg-zinc-900/90"
                : "border-emerald-100 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                  {Math.round((page / TOTAL_PAGES) * 100)}% {t("quran.completed")}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {surah.number}. {surah.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleToggleBookmark}
                  title={bookmarked ? t("quran.removeBookmark") : t("quran.addBookmark")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    bookmarked
                      ? "bg-yellow-400 text-yellow-950 shadow"
                      : darkMode
                        ? "border border-zinc-700 bg-zinc-800 text-zinc-200"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Bookmark size={14} className={bookmarked ? "fill-yellow-950" : ""} />
                  {bookmarked ? t("quran.bookmarked") : t("quran.addBookmark")}
                </motion.button>

                <select
                  value={surah.number}
                  onChange={(e) => jumpToSurah(Number(e.target.value))}
                  className={`max-w-[160px] rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? "border-zinc-700 bg-zinc-800 text-zinc-100"
                      : "border-zinc-200 bg-zinc-50 text-zinc-900"
                  }`}
                >
                  {SURAH_PAGE_MAP.map((s) => (
                    <option key={s.number} value={s.number} className="bg-white dark:bg-zinc-800">
                      {s.number}. {s.englishName}
                    </option>
                  ))}
                </select>

                <form onSubmit={handlePageJump} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("quran.goToPage")}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={TOTAL_PAGES}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className={`w-16 rounded-lg border px-2 py-1 text-center text-sm font-semibold outline-none transition focus:ring-2 focus:ring-emerald-500 ${
                      darkMode
                        ? "border-zinc-700 bg-zinc-800 text-zinc-100"
                        : "border-zinc-200 bg-zinc-50 text-zinc-900"
                    }`}
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-700 px-3.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {t("quran.go")}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              {/* Next — LEFT (RTL) */}
              <button
                onClick={goNext}
                disabled={page === TOTAL_PAGES}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-95 disabled:opacity-30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {t("quran.next")}
                <ChevronLeft size={18} />
              </button>

              <div className="flex flex-col items-center px-1">
                <span className="flex items-center gap-1.5 text-base font-bold text-emerald-800 dark:text-emerald-400">
                  {t("quran.page")} {page}
                  {progressSaved && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      {t("quran.progressSaved")}
                    </span>
                  )}
                </span>
                <span className="text-xs text-zinc-400">
                  {playingAyah
                    ? `${t("quran.playing")} ${playingAyah}`
                    : `${t("quran.of")} ${TOTAL_PAGES}`}
                </span>
              </div>

              {/* Previous — RIGHT (RTL) */}
              <button
                onClick={goPrevious}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-95 disabled:opacity-30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <ChevronRight size={18} />
                {t("quran.previous")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MushafPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Mushaf...</div>}>
      <MushafContent />
    </Suspense>
  );
}