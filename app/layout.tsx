import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PWAProvider from "@/components/pwa/PWAProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import BottomNav from "@/components/layout/BottomNav";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <ThemeProvider>
            <PWAProvider>{children}</PWAProvider>
            <BottomNav />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
