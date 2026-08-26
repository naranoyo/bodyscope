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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <div className="mt-1.5 flex items-end gap-1 sm:mt-2">
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
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:mt-2">
              {subText}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
          <Icon size={20} strokeWidth={2.2} className="sm:h-5.25 sm:w-5.25" />
        </div>
      </div>
    </div>
  );
}
