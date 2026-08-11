"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { usePWA } from "@/components/pwa/PWAProvider";

interface DownloadButtonProps {
  className?: string;
  label?: string;
}

export default function DownloadButton({
  className = "",
  label = "Download App",
}: DownloadButtonProps) {
  const { canInstall, installApp, isStandalone } = usePWA();
  const [installInstructions, setInstallInstructions] = useState(false);

  if (isStandalone) return null;

  const isIOS =
    typeof window !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(navigator as Navigator & { standalone?: boolean }).standalone;

  async function handleClick() {
    if (canInstall) {
      const ok = await installApp();
      if (!ok) setInstallInstructions(true);
    } else if (isIOS) {
      setInstallInstructions((v) => !v);
    } else {
      setInstallInstructions((v) => !v);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3 font-bold text-emerald-950 shadow-lg transition hover:from-amber-400 hover:to-yellow-400"
      >
        <Download className="h-5 w-5" />
        {label}
      </motion.button>

      {installInstructions && (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl bg-white p-5 text-left shadow-2xl ring-1 ring-emerald-100">
          <h4 className="font-bold text-gray-800">
            {canInstall
              ? "Install Islaam-E-Deen"
              : isIOS
                ? "Install on iPhone/iPad"
                : "Install the App"}
          </h4>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {canInstall
              ? "Your browser is ready. Tap install again to add the app to your device home screen."
              : isIOS
                ? "Tap the Share button (📤) in Safari, then tap “Add to Home Screen” to install Islaam-E-Deen."
                : "Open this site in your browser and use the browser menu → “Install app” / “Add to Home screen” to download it."}
          </p>
          <button
            onClick={() => setInstallInstructions(false)}
            className="mt-3 w-full rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
