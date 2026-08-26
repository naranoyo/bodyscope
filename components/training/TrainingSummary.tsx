// components/training/TrainingSummary.tsx

"use client";

import { Dumbbell, Layers3, Weight } from "lucide-react";

import type { TrainingRecord } from "@/types/training";

type Props = {
  records: TrainingRecord[];
};

export default function TrainingSummary({ records }: Props) {
  /* =========================================================
     種目数
  ========================================================= */

  const exerciseCount = records.reduce(
    (total, record) => total + record.exercises.length,
    0
  );

  /* =========================================================
     セット数
  ========================================================= */

  const setCount = records.reduce((total, record) => {
    return (
      total +
      record.exercises.reduce(
        (exerciseTotal, exercise) => exerciseTotal + exercise.sets.length,
        0
      )
    );
  }, 0);

  /* =========================================================
     総ボリューム
  ========================================================= */

  const totalVolume = records.reduce((total, record) => {
    if (typeof record.totalVolume === "number") {
      return total + record.totalVolume;
    }

    const recordVolume = record.exercises.reduce((exerciseTotal, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
        if (!set.completed) {
          return setTotal;
        }

        return setTotal + set.weight * set.reps;
      }, 0);

      return exerciseTotal + exerciseVolume;
    }, 0);

    return total + recordVolume;
  }, 0);

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-900">今日のトレーニング</h2>

        <p className="mt-1 text-sm text-slate-500">選択日のトレーニング状況</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* ===============================
            種目数
        =============================== */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
              <Dumbbell size={19} />
            </div>

            <p className="text-3xl font-black tracking-tight text-slate-900">
              {exerciseCount}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-slate-800">種目数</p>

            <p className="mt-1 text-xs text-slate-500">
              今日行ったトレーニング
            </p>
          </div>
        </div>

        {/* ===============================
            セット数
        =============================== */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
              <Layers3 size={19} />
            </div>

            <p className="text-3xl font-black tracking-tight text-slate-900">
              {setCount}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-slate-800">セット数</p>

            <p className="mt-1 text-xs text-slate-500">今日の合計セット</p>
          </div>
        </div>

        {/* ===============================
            総ボリューム
        =============================== */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
              <Weight size={19} />
            </div>

            <div className="text-right">
              <p className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {totalVolume.toLocaleString()}
              </p>

              <p className="mt-0.5 text-xs font-semibold text-slate-400">kg</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-slate-800">総ボリューム</p>

            <p className="mt-1 text-xs text-slate-500">重量 × 回数の合計</p>
          </div>
        </div>
      </div>
    </section>
  );
}
