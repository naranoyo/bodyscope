// app/layout.tsx

import type { Metadata, Viewport } from "next";

import "./globals.css";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

/* =========================================================
   METADATA
========================================================= */

export const metadata: Metadata = {
  title: {
    default: "BodyScope",
    template: "%s | BodyScope",
  },

  description:
    "TRAINING・FOOD・BODY・HEALTHをまとめて管理するボディコンディション管理アプリ",

  /* PWA */
  manifest: "/manifest.webmanifest",

  /* アイコン */
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/apple-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  /* iPhoneでホーム画面追加した場合 */
  appleWebApp: {
    capable: true,
    title: "BodyScope",
    statusBarStyle: "default",
  },
};

/* =========================================================
   VIEWPORT
========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: "#0f3b82",
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1 pb-24 xl:pb-0">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          <footer className="hidden border-t border-slate-200 bg-white xl:block">
            <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
              BodyScope
            </div>
          </footer>

          <MobileNav />
        </div>
      </body>
    </html>
  );
}
