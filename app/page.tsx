// app/page.tsx

import {
  Activity,
  Dumbbell,
  Flame,
  HeartPulse,
  Moon,
  Weight,
} from "lucide-react";

import PageTitle from "@/components/PageTitle";
import QuickMenu from "@/components/home/QuickMenu";
import RecentRecords from "@/components/home/RecentRecords";
import SummaryCard from "@/components/home/SummaryCard";
import TodayStatus from "@/components/home/TodayStatus";

export default function HomePage() {
  return (
    <div>
      <PageTitle
        title="HOME"
        description="トレーニング・食事・身体・健康データをまとめて確認します"
        icon={Activity}
      />

      {/* 今日のサマリー */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">
            今日のコンディション
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="体重"
            value="72.4"
            unit="kg"
            subText="前回比 -0.3kg"
            icon={Weight}
          />

          <SummaryCard
            title="体脂肪率"
            value="18.2"
            unit="%"
            subText="目標 15.0%"
            icon={Activity}
          />

          <SummaryCard
            title="摂取カロリー"
            value="1,840"
            unit="kcal"
            subText="目標 2,300kcal"
            icon={Flame}
          />

          <SummaryCard
            title="トレーニング"
            value="0"
            unit="種目"
            subText="今日はまだ未実施"
            icon={Dumbbell}
          />

          <SummaryCard
            title="血圧"
            value="122 / 78"
            unit="mmHg"
            subText="直近の測定値"
            icon={HeartPulse}
          />

          <SummaryCard
            title="睡眠"
            value="7時間12分"
            subText="目標 7時間"
            icon={Moon}
          />
        </div>
      </section>

      {/* クイックメニュー */}
      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">
            クイックメニュー
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            各機能へすぐに移動できます
          </p>
        </div>

        <QuickMenu />
      </section>

      {/* 今日の記録・最近の記録 */}
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <TodayStatus />

        <RecentRecords />
      </section>
    </div>
  );
}
