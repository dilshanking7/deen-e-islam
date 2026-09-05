"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="text-5xl">😔</div>
        <h1 className="mt-4 text-2xl font-bold text-gray-800">
          Kuch problem ho gayi
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Internat check karein ya dobara try karein. Agar issue rehta hai to
          app dobara khol dein.
        </p>
        <button
          onClick={reset}
          className="mt-6 w-full rounded-2xl bg-emerald-700 py-3.5 font-bold text-white transition hover:bg-emerald-800"
        >
          Dobara Try Karein
        </button>
      </div>
    </main>
  );
}