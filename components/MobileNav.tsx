// components/MobileNav.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, HeartPulse, Home, Utensils, Weight } from "lucide-react";

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
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur xl:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
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
              className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 transition ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {/* 選択中の上部ライン */}
              {isActive && (
                <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-blue-600" />
              )}

              <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />

              <span className="text-[9px] font-semibold tracking-tight">
                {menu.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* iPhoneなどの下部セーフエリア */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
  );
}
