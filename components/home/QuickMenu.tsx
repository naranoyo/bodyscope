// components/home/QuickMenu.tsx

import Link from "next/link";
import {
  BarChart3,
  Dumbbell,
  HeartPulse,
  List,
  Settings,
  Utensils,
  Weight,
} from "lucide-react";

const menus = [
  {
    href: "/training",
    label: "TRAINING",
    description: "筋トレを記録",
    icon: Dumbbell,
  },
  {
    href: "/food",
    label: "FOOD",
    description: "食事を記録",
    icon: Utensils,
  },
  {
    href: "/body",
    label: "BODY",
    description: "身体データを記録",
    icon: Weight,
  },
  {
    href: "/health",
    label: "HEALTH",
    description: "健康状態を記録",
    icon: HeartPulse,
  },
  {
    href: "/graph",
    label: "GRAPH",
    description: "推移を確認",
    icon: BarChart3,
  },
  {
    href: "/records",
    label: "RECORDS",
    description: "過去の記録を見る",
    icon: List,
  },
  {
    href: "/settings",
    label: "SETTINGS",
    description: "目標・基本設定",
    icon: Settings,
  },
];

export default function QuickMenu() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {menus.map((menu) => {
        const Icon = menu.icon;

        return (
          <Link
            key={menu.href}
            href={menu.href}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
              <Icon size={19} strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">{menu.label}</p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {menu.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
