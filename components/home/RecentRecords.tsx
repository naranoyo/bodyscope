// components/home/RecentRecords.tsx

const records = [
  {
    date: "8/23",
    category: "BODY",
    content: "体重 72.4kg / 体脂肪率 18.2%",
  },
  {
    date: "8/23",
    category: "FOOD",
    content: "朝食 520kcal",
  },
  {
    date: "8/22",
    category: "TRAINING",
    content: "背中・二頭筋 58分",
  },
  {
    date: "8/22",
    category: "HEALTH",
    content: "血圧 122 / 78 mmHg",
  },
];

export default function RecentRecords() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">最近の記録</h2>

        <p className="mt-1 text-xs text-slate-400">最新の登録データ</p>
      </div>

      <div className="divide-y divide-slate-100">
        {records.map((record, index) => (
          <div
            key={`${record.date}-${index}`}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="w-10 shrink-0 text-xs font-medium text-slate-400">
              {record.date}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wide text-blue-600">
                {record.category}
              </p>

              <p className="mt-0.5 text-sm text-slate-700">{record.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
