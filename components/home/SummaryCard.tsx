// components/home/SummaryCard.tsx

import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  unit?: string;
  subText?: string;
  icon: LucideIcon;
};

export default function SummaryCard({
  title,
  value,
  unit,
  subText,
  icon: Icon,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </span>

            {unit && (
              <span className="pb-0.5 text-sm font-medium text-slate-500">
                {unit}
              </span>
            )}
          </div>

          {subText && (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {subText}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
