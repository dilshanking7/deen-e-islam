"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, SunDim } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export default function ThemeControls() {
  const { theme, toggleTheme, brightness, setBrightness, resetBrightness } =
    useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme and brightness settings"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-700 shadow-lg ring-1 ring-emerald-100 transition hover:bg-emerald-50"
      >
        {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute right-0 top-full z-50 mt-3 w-72 rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-emerald-100"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800">Display</h4>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" /> Light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" /> Dark
                </>
              )}
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <SunDim className="h-4 w-4" /> Brightness
              </span>
              <span className="font-semibold text-emerald-700">{brightness}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-700"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Dim</span>
              <button
                onClick={resetBrightness}
                className="font-semibold text-emerald-600 hover:underline"
              >
                Reset
              </button>
              <span>Bright</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
