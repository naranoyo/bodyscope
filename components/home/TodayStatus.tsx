// components/home/TodayStatus.tsx

import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Moon,
  Utensils,
  Weight,
} from "lucide-react";

const items = [
  {
    label: "体重測定",
    detail: "72.4 kg",
    done: true,
    icon: Weight,
  },
  {
    label: "朝食",
    detail: "520 kcal",
    done: true,
    icon: Utensils,
  },
  {
    label: "トレーニング",
    detail: "胸・三頭筋",
    done: false,
    icon: Dumbbell,
  },
  {
    label: "睡眠",
    detail: "7時間12分",
    done: true,
    icon: Moon,
  },
];

export default function TodayStatus() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">今日の記録</h2>

        <p className="mt-1 text-xs text-slate-400">
          今日入力したデータを確認できます
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {item.label}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {item.detail}
                  </p>
                </div>
              </div>

              {item.done ? (
                <CheckCircle2 size={20} className="shrink-0 text-blue-600" />
              ) : (
                <Circle size={20} className="shrink-0 text-slate-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
