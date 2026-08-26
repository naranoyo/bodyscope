// components/PageTitle.tsx

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
};

export default function PageTitle({
  title,
  description,
  icon: Icon,
  children,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  );
}
