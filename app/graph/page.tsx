// app/graph/page.tsx

import { BarChart3 } from "lucide-react";

import PageTitle from "@/components/PageTitle";

export default function GraphPage() {
  return (
    <div>
      <PageTitle
        title="GRAPH"
        description="各種データの推移や変化をグラフで確認します"
        icon={BarChart3}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        GRAPH画面
      </div>
    </div>
  );
}
