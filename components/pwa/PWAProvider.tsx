"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { completeGoogleRedirect } from "@/lib/auth";
import { getUserProfile } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

interface PWAContextValue {
  canInstall: boolean;
  installApp: () => Promise<boolean>;
  isStandalone: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const PWAContext = createContext<PWAContextValue>({
  canInstall: false,
  installApp: async () => false,
  isStandalone: false,
});

export function usePWA() {
  return useContext(PWAContext);
}

export default function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Android WebView app: Google redirect login complete karo agar pending ho
    completeGoogleRedirect()
      .then(async (loggedIn) => {
        if (!loggedIn) return;
        const profile = await getUserProfile(auth.currentUser?.uid ?? "");
        if (profile?.completedOnboarding) {
          window.location.href = "/home";
        } else {
          window.location.href = "/welcome";
        }
      })
      .catch(() => {});

    const media = window.matchMedia("(display-mode: standalone)");
    const onChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    media.addEventListener("change", onChange);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return result.outcome === "accepted";
  }, [deferredPrompt]);

  return (
    <PWAContext.Provider value={{ canInstall: !!deferredPrompt, installApp, isStandalone }}>
      {children}
    </PWAContext.Provider>
  );
}
