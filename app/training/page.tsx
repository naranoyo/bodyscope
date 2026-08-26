// app/training/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import { CalendarDays, Clock3, Dumbbell, Save, X } from "lucide-react";

import PageTitle from "@/components/PageTitle";

import TrainingRecordForm from "@/components/training/TrainingRecordForm";
import TrainingRecordHistory from "@/components/training/TrainingRecordHistory";
import TrainingSummary from "@/components/training/TrainingSummary";

import {
  deleteTrainingRecord,
  getTrainingRecords,
  updateTrainingRecord,
} from "@/lib/bodyScopeStorage";

import type { TrainingRecord } from "@/types/training";

/* =========================================================
   TODAY
========================================================= */

function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   SORT
========================================================= */

function sortTrainingRecords(records: TrainingRecord[]) {
  return [...records].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    const timeCompare = (b.time ?? "").localeCompare(a.time ?? "");

    if (timeCompare !== 0) {
      return timeCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainingPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString);

  const [records, setRecords] = useState<TrainingRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================================
     EDIT
  ========================================================= */

  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(
    null
  );

  const [editDate, setEditDate] = useState("");

  const [editTime, setEditTime] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);

  /* =========================================================
     選択日の記録
  ========================================================= */

  const selectedDateRecords = useMemo(() => {
    return records.filter((record) => record.date === selectedDate);
  }, [records, selectedDate]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const trainingRecords = await getTrainingRecords();

        if (cancelled) {
          return;
        }

        setRecords(trainingRecords);
      } catch (error) {
        console.error(error);

        if (cancelled) {
          return;
        }

        setErrorMessage("トレーニング記録の取得に失敗しました。");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     SAVE
  ========================================================= */

  function handleSaved(record: TrainingRecord) {
    setRecords((currentRecords) =>
      sortTrainingRecords([record, ...currentRecords])
    );
  }

  /* =========================================================
     EDIT OPEN
  ========================================================= */

  function handleOpenEdit(record: TrainingRecord) {
    setEditingRecord(record);

    setEditDate(record.date);

    setEditTime(record.time ?? "");
  }

  /* =========================================================
     EDIT CLOSE
  ========================================================= */

  function handleCloseEdit() {
    if (isUpdating) {
      return;
    }

    setEditingRecord(null);

    setEditDate("");

    setEditTime("");
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async function handleUpdateRecord() {
    if (!editingRecord) {
      return;
    }

    if (!editDate) {
      alert("日付を入力してください。");

      return;
    }

    try {
      setIsUpdating(true);

      setErrorMessage("");

      const updatedRecord: TrainingRecord = {
        ...editingRecord,

        date: editDate,

        time: editTime || undefined,

        updatedAt: new Date().toISOString(),
      };

      const savedRecord = await updateTrainingRecord(updatedRecord);

      setRecords((currentRecords) =>
        sortTrainingRecords(
          currentRecords.map((record) =>
            record.id === savedRecord.id ? savedRecord : record
          )
        )
      );

      setEditingRecord(null);

      setEditDate("");

      setEditTime("");
    } catch (error) {
      console.error(error);

      alert("トレーニング記録の更新に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(id: string) {
    const record = records.find((item) => item.id === id);

    const exerciseName =
      record?.exercises[0]?.exerciseName ?? "このトレーニング";

    const confirmed = window.confirm(`${exerciseName}の記録を削除しますか？`);

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingId(id);

      setErrorMessage("");

      await deleteTrainingRecord(id);

      setRecords((currentRecords) =>
        currentRecords.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);

      setErrorMessage("トレーニング記録の削除に失敗しました。");
    } finally {
      setIsDeletingId(null);
    }
  }

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}

      <PageTitle
        title="TRAINING"
        description="筋力トレーニングの内容を記録・管理します"
        icon={Dumbbell}
      />

      {/* ========================================
          DATE
      ======================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">トレーニング日</h2>

              <p className="mt-0.5 text-xs text-slate-500">
                記録する日付を選択してください
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label htmlFor="training-date" className="sr-only">
              トレーニング日
            </label>

            <input
              id="training-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-48"
            />
          </div>
        </div>
      </section>

      {/* ========================================
          SUMMARY
      ======================================== */}

      {isLoading ? (
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-900">
              今日のトレーニング
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        </section>
      ) : (
        <TrainingSummary records={selectedDateRecords} />
      )}

      {/* ========================================
          FORM
      ======================================== */}

      <TrainingRecordForm date={selectedDate} onSaved={handleSaved} />

      {/* ERROR */}

      {errorMessage && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errorMessage}
        </div>
      )}

      {/* ========================================
          HISTORY
      ======================================== */}

      {isLoading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">TRAINING記録履歴</h2>

          <div className="mt-6 space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </section>
      ) : (
        <TrainingRecordHistory
          records={records}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isDeletingId={isDeletingId}
        />
      )}

      {/* ========================================
          EDIT MODAL
      ======================================== */}

      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6 backdrop-blur-[2px] sm:py-10">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  TRAINING記録を編集
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  日付・時刻を変更できます
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="編集画面を閉じる"
              >
                <X size={19} />
              </button>
            </div>

            {/* EXERCISE INFO */}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Dumbbell size={18} />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {editingRecord.exercises[0]?.exerciseName ?? "トレーニング"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {editingRecord.exercises[0]?.sets.length ?? 0}
                    セット
                  </p>
                </div>
              </div>
            </div>

            {/* DATE / TIME */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="training-edit-date"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <CalendarDays size={16} className="text-blue-600" />
                  日付
                </label>

                <input
                  id="training-edit-date"
                  type="date"
                  value={editDate}
                  onChange={(event) => setEditDate(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label
                  htmlFor="training-edit-time"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <Clock3 size={16} className="text-blue-600" />
                  時刻
                </label>

                <input
                  id="training-edit-time"
                  type="time"
                  value={editTime}
                  onChange={(event) => setEditTime(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* SET INFO */}

            {editingRecord.exercises[0] && (
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-[70px_1fr_1fr] bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                  <span>セット</span>

                  <span className="text-right">重量</span>

                  <span className="text-right">回数</span>
                </div>

                {editingRecord.exercises[0].sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[70px_1fr_1fr] border-t border-slate-100 px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-slate-600">
                      {set.setNumber}
                    </span>

                    <span className="text-right font-bold text-slate-900">
                      {set.weight} kg
                    </span>

                    <span className="text-right font-bold text-slate-900">
                      {set.reps} 回
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ACTION */}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleUpdateRecord}
                disabled={isUpdating}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />

                {isUpdating ? "保存中..." : "変更を保存"}
              </button>

              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={isUpdating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
