"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
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
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";

import { PDF_FILES } from "@/lib/pdfs-data";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
  const docRef = useRef<{ numPages: number; getPage: (n: number) => Promise<{ render: (p: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<void>; getViewport: (s: { scale: number }) => { width: number; height: number } }> } | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [showSideArrows, setShowSideArrows] = useState(false);

  const lastPageKey = `pdf-last-${id}`;

  // Open PDF
  const openPdf = useCallback(async () => {
    if (!entry) return;
    setLoading(true);
    setError("");
    try {
      const task = pdfjsLib.getDocument(entry.file);
      const doc = await task.promise;
      docRef.current = doc as unknown as typeof docRef.current;
      setNumPages(doc.numPages);
      const saved = parseInt(localStorage.getItem(lastPageKey) || "1", 10);
      const startPage = saved >= 1 && saved <= doc.numPages ? saved : 1;
      setPage(startPage);
    } catch {
      setError(
        "PDF load nahi ho paya. Check karein ke file public/pdfs me mojood hai."
      );
    } finally {
      setLoading(false);
    }
  }, [entry, lastPageKey]);

  useEffect(() => {
    openPdf();
    return () => {
      renderTaskRef.current?.cancel();
    };
  }, [openPdf]);

  // Render page on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !docRef.current || page < 1) return;
    let cancelled = false;

    (async () => {
      try {
        const pdfPage = await docRef.current!.getPage(page);
        const viewport = pdfPage.getViewport({ scale: zoom });

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        renderTaskRef.current?.cancel();
        const task = pdfPage.render({
          canvasContext: canvas.getContext("2d")!,
          viewport: {
            width: viewport.width * dpr,
            height: viewport.height * dpr,
          } as unknown as { width: number; height: number },
        });
        renderTaskRef.current = task as unknown as { cancel: () => void };
        await task.promise;
        if (!cancelled) setLoading(false);
      } catch (e) {
        if ((e as Error)?.name !== "RenderingCancelledException" && !cancelled) {
          setError("Page render nahi ho paya.");
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [page, zoom, loading]);

  // URL sync (replace, so back exits directly)
  useEffect(() => {
    if (page > 0 && numPages > 0) {
      router.replace(`/pdf/${id}?p=${page}`, { scroll: false });
    }
  }, [page, id, numPages, router]);

  // Restore page from URL on mount
  useEffect(() => {
    const qp = new URLSearchParams(window.location.search).get("p");
    if (qp) {
      const n = parseInt(qp, 10);
      if (n >= 1 && n <= (docRef.current?.numPages ?? n)) setPage(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShowSideArrows(
      typeof window !== "undefined" &&
        window.matchMedia("(min-width: 768px)").matches
    );
  }, []);

  useEffect(() => {
    if (page >= 1) localStorage.setItem(lastPageKey, String(page));
  }, [page, lastPageKey]);

  function goTo(n: number) {
    if (!docRef.current) return;
    const target = Math.max(1, Math.min(n, docRef.current.numPages));
    setPage(target);
    setPageInput(String(target));
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
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard: left/right arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextPage(),
    onSwipedRight: () => prevPage(),
    preventScrollOnSwipe: false,
    trackMouse: true,
  });

  if (!entry) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
          <BookOpen className="mx-auto text-gray-300" size={48} />
          <h2 className="mt-4 text-lg font-bold text-gray-800">PDF not found</h2>
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

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ee]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push("/books")}
            className="rounded-full bg-emerald-100 p-2 text-emerald-800 transition hover:bg-emerald-200"
            aria-label="Back to books"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold text-gray-800">{entry.title}</h1>
            <p className="text-xs text-gray-400">
              {loading ? "Loading…" : `Page ${page} / ${numPages}`}
            </p>
          </div>

          <form onSubmit={onJumpSubmit} className="flex items-center gap-1.5">
            <input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
              placeholder={String(page)}
              className="w-14 rounded-xl border border-emerald-200 px-2 py-1.5 text-center text-sm font-semibold text-gray-700 outline-none focus:border-emerald-500"
            />
            <span className="text-sm text-gray-400">/ {numPages || "—"}</span>
            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800"
            >
              Go
            </button>
          </form>

          {/* Zoom + Fullscreen */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom(1)}
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
        {...swipeHandlers}
        className="relative flex flex-1 flex-col items-center justify-center overflow-auto px-4 py-6"
        onTouchMove={() => {}}
      >
        {/* Side arrows (desktop) */}
        {showSideArrows && (
          <>
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="fixed left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl ring-1 ring-emerald-100 transition hover:bg-emerald-50 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={24} className="text-emerald-800" />
            </button>
            <button
              onClick={nextPage}
              disabled={!numPages || page >= numPages}
              className="fixed right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl ring-1 ring-emerald-100 transition hover:bg-emerald-50 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={24} className="text-emerald-800" />
            </button>
          </>
        )}

        {error ? (
          <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
            <X className="mx-auto text-red-400" size={40} />
            <h2 className="mt-4 text-lg font-bold text-gray-800">Kuch problem hui</h2>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => router.push("/books")}
              className="mt-5 rounded-2xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              ← Books
            </button>
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              </div>
            )}
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-gray-200"
            >
              <canvas ref={canvasRef} className="block bg-white" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <footer className="sticky bottom-0 z-30 border-t border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={prevPage}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <span className="text-sm font-semibold text-gray-500">
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

      {/* Loading overlay when switching pages */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-white/40 backdrop-blur-sm"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
