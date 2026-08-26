// app/health/page.tsx

import { HeartPulse } from "lucide-react";

import PageTitle from "@/components/PageTitle";

export default function HealthPage() {
  return (
    <div>
      <PageTitle
        title="HEALTH"
        description="血圧・脈拍・睡眠などの健康データを記録・管理します"
        icon={HeartPulse}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        HEALTH画面
      </div>
    </div>
  );
}
