// components/Header.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Dumbbell,
  HeartPulse,
  Home,
  List,
  Settings,
  Utensils,
  Weight,
} from "lucide-react";

const menus = [
  {
    href: "/",
    label: "HOME",
    icon: Home,
  },
  {
    href: "/training",
    label: "TRAINING",
    icon: Dumbbell,
  },
  {
    href: "/food",
    label: "FOOD",
    icon: Utensils,
  },
  {
    href: "/body",
    label: "BODY",
    icon: Weight,
  },
  {
    href: "/health",
    label: "HEALTH",
    icon: HeartPulse,
  },
  {
    href: "/graph",
    label: "GRAPH",
    icon: BarChart3,
  },
  {
    href: "/records",
    label: "RECORDS",
    icon: List,
  },
  {
    href: "/settings",
    label: "SETTINGS",
    icon: Settings,
  },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        {/* ロゴ */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-blue-600 text-white shadow-sm">
            <div className="relative flex items-center justify-center">
              <span className="text-base font-black tracking-tight">BS</span>
              <Activity
                size={15}
                strokeWidth={2.5}
                className="absolute -bottom-2 -right-2 text-blue-200"
              />
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold tracking-tight text-slate-900">
              BodyScope
            </div>

            <div className="text-[10px] font-semibold tracking-[0.16em] text-slate-500">
              TRAINING × FOOD × HEALTH
            </div>
          </div>
        </Link>

        {/* PCナビゲーション */}
        <nav className="hidden items-center gap-1 xl:flex">
          {menus.map((menu) => {
            const Icon = menu.icon;

            const isActive =
              menu.href === "/"
                ? pathname === "/"
                : pathname.startsWith(menu.href);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                <span>{menu.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* タブレット用簡易ロゴ */}
        <div className="hidden text-xs font-medium text-slate-400 lg:block xl:hidden">
          BodyScope
        </div>
      </div>
    </header>
  );
}
