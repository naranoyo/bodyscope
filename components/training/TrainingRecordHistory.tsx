// components/training/TrainingRecordHistory.tsx

"use client";

import { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Dumbbell,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

import type { TrainingExercise, TrainingRecord } from "@/types/training";

type Props = {
  records: TrainingRecord[];

  onEdit: (record: TrainingRecord) => void;

  onDelete: (id: string) => void | Promise<void>;

  isDeletingId?: string | null;
};

type TrainingHistoryItem = {
  record: TrainingRecord;

  exercise: TrainingExercise;
};

type TrainingDateGroup = {
  date: string;

  items: TrainingHistoryItem[];
};

/* =========================================================
   DATE
========================================================= */

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

/* =========================================================
   GROUP
========================================================= */

function groupTrainingByDate(records: TrainingRecord[]): TrainingDateGroup[] {
  const grouped = new Map<string, TrainingHistoryItem[]>();

  for (const record of records) {
    const current = grouped.get(record.date) ?? [];

    for (const exercise of record.exercises) {
      current.push({
        record,
        exercise,
      });
    }

    grouped.set(record.date, current);
  }

  return Array.from(grouped.entries())
    .map(([date, items]) => ({
      date,

      items: items.sort((a, b) => {
        const timeCompare = (a.record.time ?? "").localeCompare(
          b.record.time ?? ""
        );

        if (timeCompare !== 0) {
          return timeCompare;
        }

        return a.record.createdAt.localeCompare(b.record.createdAt);
      }),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TrainingRecordHistory({
  records,
  onEdit,
  onDelete,
  isDeletingId = null,
}: Props) {
  const [openDates, setOpenDates] = useState<string[]>([]);

  const dateGroups = groupTrainingByDate(records);

  function toggleDate(date: string) {
    setOpenDates((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date]
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (dateGroups.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">TRAINING記録履歴</h2>

          <p className="mt-1 text-sm text-slate-500">
            これまでに保存したトレーニングデータです
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Dumbbell size={22} />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-700">
            まだトレーニング記録がありません
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">TRAINING記録履歴</h2>

        <p className="mt-1 text-sm text-slate-500">
          これまでに保存したトレーニングデータです
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {dateGroups.map((group) => {
          const isOpen = openDates.includes(group.date);

          const totalSets = group.items.reduce(
            (total, item) => total + item.exercise.sets.length,
            0
          );

          const totalVolume = group.items.reduce(
            (groupTotal, item) =>
              groupTotal +
              item.exercise.sets.reduce(
                (setTotal, set) =>
                  set.completed ? setTotal + set.weight * set.reps : setTotal,
                0
              ),
            0
          );

          return (
            <article
              key={group.date}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              {/* ===============================
                    SUMMARY
                =============================== */}

              <button
                type="button"
                onClick={() => toggleDate(group.date)}
                className="group flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-blue-50/30"
              >
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {formatDate(group.date)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {group.items.length}
                    種目 / {totalSets}
                    セット
                  </p>

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    総ボリューム {totalVolume.toLocaleString()}
                    <span className="ml-1 text-xs font-medium text-slate-400">
                      kg
                    </span>
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                  {isOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                </div>
              </button>

              {/* ===============================
                    DETAIL
                =============================== */}

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-5">
                  <div className="space-y-4">
                    {group.items.map(({ record, exercise }) => {
                      const exerciseVolume = exercise.sets.reduce(
                        (total, set) =>
                          set.completed ? total + set.weight * set.reps : total,
                        0
                      );

                      return (
                        <div
                          key={`${record.id}-${exercise.id}`}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          {/* HEADER */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Dumbbell size={18} />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-slate-900">
                                    {exercise.exerciseName}
                                  </p>

                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {exercise.bodyPart}
                                  </span>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                  <span>{exercise.sets.length} セット</span>

                                  {record.time && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3 size={13} />

                                      {record.time}
                                    </span>
                                  )}

                                  {exercise.loadType === "bodyweight" &&
                                    exercise.bodyWeightAtTraining !==
                                      undefined && (
                                      <>
                                        <span>
                                          自重 {exercise.bodyWeightAtTraining}
                                          kg
                                        </span>

                                        <span>
                                          負荷率{" "}
                                          {Math.round(
                                            (exercise.bodyWeightRatio ?? 1) *
                                              100
                                          )}
                                          %
                                        </span>
                                      </>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* ACTION */}

                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onEdit(record)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                aria-label="トレーニング記録を編集"
                                title="編集"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDelete(record.id)}
                                disabled={isDeletingId === record.id}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="トレーニング記録を削除"
                                title="削除"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </div>

                          {/* SET TABLE */}

                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                            <div className="grid grid-cols-[70px_1fr_1fr] bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500">
                              <div>セット</div>

                              <div className="text-right">
                                {exercise.loadType === "bodyweight"
                                  ? "推定負荷"
                                  : "重量"}
                              </div>

                              <div className="text-right">回数</div>
                            </div>

                            {exercise.sets.map((set) => (
                              <div
                                key={set.id}
                                className="grid grid-cols-[70px_1fr_1fr] border-t border-slate-100 px-4 py-3 text-sm"
                              >
                                <div className="font-semibold text-slate-600">
                                  {set.setNumber}
                                </div>

                                <div className="text-right font-bold text-slate-900">
                                  {set.weight.toLocaleString()}

                                  <span className="ml-1 text-xs font-normal text-slate-400">
                                    kg
                                  </span>
                                </div>

                                <div className="text-right font-bold text-slate-900">
                                  {set.reps.toLocaleString()}

                                  <span className="ml-1 text-xs font-normal text-slate-400">
                                    回
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* VOLUME */}

                          <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                            <span className="text-xs font-bold text-blue-700">
                              ボリューム
                            </span>

                            <span className="font-black text-slate-900">
                              {exerciseVolume.toLocaleString()}

                              <span className="ml-1 text-xs font-semibold text-slate-500">
                                kg
                              </span>
                            </span>
                          </div>

                          {/* MEMO */}

                          {exercise.memo && (
                            <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
                              <FileText
                                size={15}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />

                              <p className="text-sm text-slate-600">
                                {exercise.memo}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
