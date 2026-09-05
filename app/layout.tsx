import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri, Noto_Nastaliq_Urdu } from "next/font/google";
import PWAProvider from "@/components/pwa/PWAProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import BottomNav from "@/components/layout/BottomNav";
import EventNotifier from "@/components/notifications/EventNotifier";
import AssistantWidget from "@/components/ai/AssistantWidget";
import ActivityTracker from "@/components/ai/ActivityTracker";
import LanguageDir from "@/components/LanguageDir";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Islaam-E-Deen — Your Complete Islamic Companion",
  description:
    "Quran with translation, Hadith, real Prayer Times with Azan alarm, Dua, Qibla, Islamic Calendar, Books, Community & more.",
  manifest: "/manifest.webmanifest",
  applicationName: "Islaam-E-Deen",
  appleWebApp: {
    capable: true,
    title: "Islaam-E-Deen",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo-icon.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${nastaliq.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="d7b25234d1e376fb" />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <LanguageDir />
          <ThemeProvider>
            <PWAProvider>{children}</PWAProvider>
            <BottomNav />
            <EventNotifier />
            <ActivityTracker />
            <AssistantWidget />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
