"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  BookOpen,
  LayoutGrid,
  BookmarkCheck,
  RotateCw,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";

import { PDF_FILES } from "@/lib/pdfs-data";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfEntry {
  id: string;
  file: string;
  title: string;
}

export default function PdfViewer() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const entry: PdfEntry | undefined = useMemo(
    () => PDF_FILES.find((p) => p.id === id),
    [id]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const docRef = useRef<{
    numPages: number;
    getPage: (
      n: number
    ) => Promise<{
      getViewport: (s: { scale: number }) => {
        width: number;
        height: number;
      };
      render: (p: {
        canvasContext: CanvasRenderingContext2D;
        viewport: { width: number; height: number };
      }) => { promise: Promise<void>; cancel: () => void };
    }>;
  } | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const pageCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const prefetchRunRef = useRef(false);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [fitWidth, setFitWidth] = useState(600);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const avail = Math.max(280, el.clientWidth - 32);
      setFitWidth(avail);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lastPageKey = `pdf-last-${id}`;

  async function buildPageCanvas(n: number, scale: number) {
    if (!docRef.current) return null;
    const pdfPage = await docRef.current.getPage(n);
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const viewport = pdfPage.getViewport({ scale: scale * dpr });
    const c = document.createElement("canvas");
    c.width = Math.floor(viewport.width);
    c.height = Math.floor(viewport.height);
    await pdfPage.render({
      canvasContext: c.getContext("2d")!,
      viewport,
    }).promise;
    return c;
  }

  function drawCanvas(src: HTMLCanvasElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = src.width;
    canvas.height = src.height;
    const renderW = src.width / dpr;
    const renderH = src.height / dpr;
    const displayW = Math.max(240, fitWidth * zoom);
    const displayH = displayW * (renderH / renderW);
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    canvas.style.maxWidth = "100%";
    if (canvas.getContext) {
      canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
      canvas.getContext("2d")!.drawImage(src, 0, 0);
    }
  }

  // Open PDF (restore last-read page)
  const openPdf = useCallback(async () => {
    if (!entry) return;
    setLoading(true);
    setError("");
    try {
      const task = pdfjsLib.getDocument({ url: entry.file });
      const doc = await task.promise;
      docRef.current = doc as unknown as typeof docRef.current;
      setNumPages(doc.numPages);
      pageCacheRef.current.clear();
      const saved = parseInt(localStorage.getItem(lastPageKey) || "1", 10);
      const startPage = saved >= 1 && saved <= doc.numPages ? saved : 1;
      setPage(startPage);
    } catch {
      setError(
        "Book load nahi ho paya. Check karein ke file public/pdfs me mojood hai."
      );
    } finally {
      setLoading(false);
    }
  }, [entry, lastPageKey]);

  useEffect(() => {
    const t = setTimeout(() => {
      openPdf();
    }, 0);
    const task = renderTaskRef.current;
    return () => {
      clearTimeout(t);
      task?.cancel();
    };
  }, [openPdf]);

  // Render current page onto the canvas (from cache when possible) + prefetch neighbours
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !docRef.current || page < 1) return;
    let cancelled = false;

    (async () => {
      const doc = docRef.current!;
      if (numPages <= 0) setNumPages(doc.numPages);

      let src: HTMLCanvasElement | null = pageCacheRef.current.get(page) ?? null;
      if (!src) {
        try {
          src = await buildPageCanvas(page, zoom);
          if (src) pageCacheRef.current.set(page, src);
        } catch {
          if (!cancelled) setError("Page render nahi ho paya.");
          setLoading(false);
          return;
        }
      }
      if (cancelled || !src) return;

      drawCanvas(src);
      setLoading(false);
      setReady(true);

      if (!prefetchRunRef.current) {
        prefetchRunRef.current = true;
        [page + 1, page + 2, page - 1, page - 2]
          .filter((n) => n >= 1 && n <= doc.numPages && !pageCacheRef.current.has(n))
          .forEach((n) => {
            buildPageCanvas(n, zoom)
              .then((c) => {
                if (c && !cancelled) {
                  if (!pageCacheRef.current.has(n)) pageCacheRef.current.set(n, c);
                }
              })
              .catch(() => {});
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, zoom, numPages, fitWidth]);

  // URL sync (replace, so back exits directly)
  useEffect(() => {
    if (page > 0 && numPages > 0) {
      router.replace(`/pdf/${id}?p=${page}`, { scroll: false });
    }
  }, [page, id, numPages, router]);

  // Restore page from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const qp = new URLSearchParams(window.location.search).get("p");
    if (qp) {
      const n = parseInt(qp, 10);
      const max = docRef.current?.numPages ?? n;
      if (n >= 1 && n <= max) setPage(n);
    }
  }, []);

  useEffect(() => {
    if (page >= 1 && typeof window !== "undefined") {
      localStorage.setItem(lastPageKey, String(page));
      const t1 = setTimeout(() => setIsSaved(true), 0);
      const t2 = setTimeout(() => setIsSaved(false), 2200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [page, lastPageKey]);

  function goTo(n: number) {
    if (!docRef.current) return;
    const target = Math.max(1, Math.min(n, docRef.current.numPages));
    if (!pageCacheRef.current.has(target)) setLoading(true);
    pageCacheRef.current.delete(target - 1);
    setPageInput(String(target));
    setPage(target);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }

  function nextPage() {
    if (docRef.current && page < docRef.current.numPages) goTo(page + 1);
  }
  function prevPage() {
    if (page > 1) goTo(page - 1);
  }

  function onJumpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) goTo(n);
  }

  function toggleFullscreen() {
    if (!wrapRef.current) return;
    if (!document.fullscreenElement) {
      wrapRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const touchXRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchXRef.current = e.touches[0].clientX;
    touchYRef.current = e.touches[0].clientY;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const x0 = touchXRef.current;
    const y0 = touchYRef.current;
    touchXRef.current = null;
    touchYRef.current = null;
    if (x0 === null || y0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextPage();
      else prevPage();
    }
  }

  if (!entry) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee]">
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
          <BookOpen className="mx-auto text-amber-400" size={48} />
          <h2 className="mt-4 text-lg font-bold text-gray-800">Book not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Yeh book app me registered nahi hai.
          </p>
          <button
            onClick={() => router.push("/books")}
            className="mt-5 rounded-2xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            ← Books
          </button>
        </div>
      </main>
    );
  }

  const pageSaved = isSaved && numPages > 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ee]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push("/books")}
            className="rounded-full bg-amber-100 p-2 text-amber-900 transition hover:bg-amber-200"
            aria-label="Back to books"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold text-gray-800">{entry.title}</h1>
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              {loading ? "Loading…" : `Page ${page} / ${numPages}`}
              {ready && pageSaved && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <BookmarkCheck size={11} /> saved
                </span>
              )}
            </p>
          </div>

          <form onSubmit={onJumpSubmit} className="hidden items-center gap-1.5 sm:flex">
            <input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
              placeholder={String(page)}
              className="w-14 rounded-xl border border-amber-200 px-2 py-1.5 text-center text-sm font-semibold text-gray-700 outline-none focus:border-amber-500"
            />
            <span className="text-sm text-gray-400">/ {numPages || "—"}</span>
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800"
            >
              Go
            </button>
          </form>

          <button
            onClick={() => setShowGrid(true)}
            className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-amber-100"
            aria-label="Page grid"
          >
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">Pages</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
              }}
              className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => {
                pageCacheRef.current.clear();
                setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
              }}
              className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => {
                pageCacheRef.current.clear();
                setZoom(1);
              }}
              className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Reset zoom"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Fullscreen"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Reader */}
      <div
        ref={wrapRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex flex-1 flex-col items-center justify-center overflow-auto px-4 py-6 [touch-action:pan-y]"
      >
        {numPages > 1 && (
          <>
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="fixed left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl ring-1 ring-amber-100 transition hover:bg-amber-50 disabled:opacity-30 sm:left-4"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} className="text-amber-900" />
            </button>
            <button
              onClick={nextPage}
              disabled={page >= numPages}
              className="fixed right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl ring-1 ring-amber-100 transition hover:bg-amber-50 disabled:opacity-30 sm:right-4"
              aria-label="Next page"
            >
              <ChevronRight size={24} className="text-amber-900" />
            </button>
          </>
        )}

        {error ? (
          <div className="w-full max-w-sm">
            <div className="mx-auto rounded-3xl bg-white p-6 text-center shadow-xl">
              <X className="mx-auto text-amber-400" size={40} />
              <h2 className="mt-3 text-lg font-bold text-gray-800">Kuch problem hui</h2>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <button
                  onClick={() => openPdf()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  <RotateCw size={16} /> Dobara try karein
                </button>
                <a
                  href={entry.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-gray-100 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Browser me kholen
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {!ready && loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              </div>
            )}
            <motion.div
              key={page}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-gray-200"
            >
              <canvas ref={canvasRef} className="block bg-white" />
            </motion.div>
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => setShowGrid(true)}
                className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow ring-1 ring-gray-200 transition hover:bg-amber-50"
              >
                🗂 Jaldi page kholein
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <footer className="sticky bottom-0 z-30 border-t border-amber-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={prevPage}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span
            className="cursor-pointer rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-amber-50"
            onClick={() => setShowGrid(true)}
            title="Page grid"
          >
            {numPages ? `${page} / ${numPages}` : "…"}
          </span>
          <button
            onClick={nextPage}
            disabled={!numPages || page >= numPages}
            className="flex items-center gap-1 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-30"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>

      {/* Page grid jump */}
      <AnimatePresence>
        {showGrid && numPages > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-5"
            onClick={() => setShowGrid(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 26 }}
              className="flex max-h-[75vh] w-full max-w-lg flex-col rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  {entry.title}
                  <span className="ml-2 text-sm font-medium text-gray-400">
                    {numPages} pages
                  </span>
                </h2>
                <button
                  onClick={() => setShowGrid(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      goTo(n);
                      setShowGrid(false);
                    }}
                    className={`rounded-xl py-3 text-sm font-bold transition ${
                      n === page
                        ? "bg-emerald-700 text-white shadow-lg"
                        : "bg-gray-50 text-gray-600 hover:bg-amber-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay when switching pages */}
      <AnimatePresence>
        {!ready && loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[#f5f3ee]/70 backdrop-blur-sm"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}