"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackCurrentPath } from "@/lib/activity";

export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackCurrentPath(pathname ?? "/");
  }, [pathname]);

  return null;
}