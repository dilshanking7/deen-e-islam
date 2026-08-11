"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  brightness: number;
  setBrightness: (v: number) => void;
  resetBrightness: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  brightness: 100,
  setBrightness: () => {},
  resetBrightness: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function safeStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    try {
      const t = localStorage.getItem("theme");
      if (t === "dark" || t === "light") return t;
    } catch {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });
  const [brightness, setBrightnessState] = useState(() => {
    if (typeof window === "undefined") return 100;
    try {
      const b = Number(localStorage.getItem("brightness"));
      if (b >= 20 && b <= 200) return b;
    } catch {}
    return 100;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    safeStorage()?.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    safeStorage()?.setItem("brightness", String(brightness));
  }, [brightness]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const setBrightness = useCallback((v: number) => {
    setBrightnessState(Math.min(200, Math.max(20, Math.round(v))));
  }, []);

  const resetBrightness = useCallback(() => setBrightnessState(100), []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        brightness,
        setBrightness,
        resetBrightness,
      }}
    >
      {children}
      <div
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{
          opacity:
            (brightness > 100
              ? (brightness - 100) * 0.0035
              : (100 - brightness) * 0.006) + 0,
          background: brightness > 100 ? "#ffffff" : "#000000",
          mixBlendMode: brightness > 100 ? "screen" : "multiply",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[99] bg-transparent" />
    </ThemeContext.Provider>
  );
}
