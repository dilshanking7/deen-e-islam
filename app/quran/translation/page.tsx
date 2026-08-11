"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TranslationHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quran/translation/1");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading Translation...
    </div>
  );
}