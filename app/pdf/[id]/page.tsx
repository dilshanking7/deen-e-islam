"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-500">Loading PDF reader…</p>
      </div>
    </main>
  ),
});

export default function PdfPage() {
  return <PdfViewer />;
}
