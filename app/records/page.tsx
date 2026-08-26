// app/records/page.tsx

import { List } from "lucide-react";

import PageTitle from "@/components/PageTitle";

export default function RecordsPage() {
  return (
    <div>
      <PageTitle
        title="RECORDS"
        description="これまでに登録した記録を一覧で確認します"
        icon={List}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        RECORDS画面
      </div>
    </div>
  );
}
