// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: {
    default: "BodyScope",
    template: "%s | BodyScope",
  },
  description:
    "TRAINING・FOOD・BODY・HEALTHをまとめて管理するボディコンディション管理アプリ",
};

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
