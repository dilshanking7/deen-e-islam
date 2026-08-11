"use client";

import { useCallback, useEffect, useMemo, useState, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Moon,
  Sun,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

import { getMushafPage, TOTAL_PAGES } from "@/lib/mushaf-api";
import { saveBookmark, getBookmark } from "@/lib/mushaf-bookmark";

function MushafContent() {
  const router = useRouter();

  // Helper to Sync URL with page number
  const updateURL = useCallback(
    (newPage: number) => {
      router.push(`/quran/mushaf?page=${newPage}`, { scroll: false });
    },
    [router]
  );

  const [page, setPage] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const match = window.location.search.match(/[?&]page=(\d+)/);
    if (match) {
      const parsedPage = Number(match[1]);
      if (parsedPage >= 1 && parsedPage <= TOTAL_PAGES) {
        return parsedPage;
      }
    }
    return 1;
  });
  const [pageInput, setPageInput] = useState(() => {
    if (typeof window === "undefined") return "1";
    const match = window.location.search.match(/[?&]page=(\d+)/);
    return match ? match[1] : "1";
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Zoom States
  const [zoomScale, setZoomScale] = useState(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Load saved page from bookmark on mount (skip when opened via ?page= URL)
  useEffect(() => {
    const match = window.location.search.match(/[?&]page=(\d+)/);
    if (match) return;

    async function loadSavedPage() {
      const saved = await getBookmark();
      if (saved) {
        setPage(saved);
        setPageInput(saved.toString());
        updateURL(saved);
        return;
      }
      const last = localStorage.getItem("last-mushaf-page");
      if (last) {
        const lastPage = Number(last);
        if (lastPage >= 1 && lastPage <= TOTAL_PAGES) {
          setPage(lastPage);
          setPageInput(lastPage.toString());
          updateURL(lastPage);
        }
      }
    }
    loadSavedPage();
  }, [updateURL]);

  const image = useMemo(() => {
    return getMushafPage(page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("last-mushaf-page", page.toString());
  }, [page]);

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

  const goNext = useCallback(() => {
    if (page >= TOTAL_PAGES) return;
    const nextPage = page + 1;
    setLoading(true);
    setZoomScale(1);
    setTimeout(() => {
      setPage(nextPage);
      setPageInput(String(nextPage));
      updateURL(nextPage);
      setLoading(false);
    }, 100);
  }, [page, updateURL]);

  const goPrevious = useCallback(() => {
    if (page <= 1) return;
    const prevPage = page - 1;
    setLoading(true);
    setZoomScale(1);
    setTimeout(() => {
      setPage(prevPage);
      setPageInput(String(prevPage));
      updateURL(prevPage);
      setLoading(false);
    }, 100);
  }, [page, updateURL]);

  function handlePageJump(e: React.FormEvent) {
    e.preventDefault();
    const targetPage = Number(pageInput);
    if (targetPage >= 1 && targetPage <= TOTAL_PAGES) {
      setPage(targetPage);
      setPageInput(String(targetPage));
      updateURL(targetPage);
      setZoomScale(1);
    } else {
      setPageInput(page.toString());
    }
  }

  // Keyboard Navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrevious();
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
            <h1 className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
              Holy Quran
            </h1>
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
              onClick={async () => {
                await saveBookmark(page);
                alert(`Bookmark Saved: Page ${page}`);
              }}
              title="Save Bookmark"
              className={`rounded-xl p-2 transition active:scale-95 ${
                darkMode
                  ? "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                  : "bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <Bookmark size={19} />
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
          
          {/* Left Navigation Arrow */}
          <button
            onClick={goPrevious}
            disabled={page === 1}
            className="absolute left-0 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border bg-white/90 text-emerald-800 shadow-lg backdrop-blur transition hover:scale-110 active:scale-95 disabled:opacity-20 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-emerald-400 md:-left-5"
            title="Previous Page"
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
                      Page {page} / {TOTAL_PAGES}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={goNext}
            disabled={page === TOTAL_PAGES}
            className="absolute right-0 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border bg-white/90 text-emerald-800 shadow-lg backdrop-blur transition hover:scale-110 active:scale-95 disabled:opacity-20 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-emerald-400 md:-right-5"
            title="Next Page"
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
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {Math.round((page / TOTAL_PAGES) * 100)}% Completed
              </span>

              <form onSubmit={handlePageJump} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Go to page:
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
                  Go
                </button>
              </form>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={goPrevious}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-95 disabled:opacity-30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="text-center">
                <span className="text-base font-bold text-emerald-800 dark:text-emerald-400">
                  Page {page}
                </span>
                <span className="block text-xs text-zinc-400">
                  of {TOTAL_PAGES}
                </span>
              </div>

              <button
                onClick={goNext}
                disabled={page === TOTAL_PAGES}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-95 disabled:opacity-30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Next
                <ChevronRight size={18} />
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