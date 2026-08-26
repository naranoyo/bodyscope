// components/body/EditableWeightCard.tsx

"use client";

import { useState } from "react";
import { Pencil, Save, Weight, X } from "lucide-react";

import { addBodyRecord } from "@/lib/bodyScopeStorage";

import type { BodyRecord } from "@/types/body";

type Props = {
  latestRecord?: BodyRecord;
  onSaved: () => void;
};

/* =========================================================
   今日
========================================================= */

function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   現在時刻
========================================================= */

function getCurrentTimeString() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");

  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EditableWeightCard({ latestRecord, onSaved }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const [weight, setWeight] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  /* =========================================================
     編集開始
  ========================================================= */

  function handleStartEditing() {
    setWeight(latestRecord?.weight?.toString() ?? "");

    setIsEditing(true);
  }

  /* =========================================================
     保存
  ========================================================= */

  async function handleSave() {
    const weightNumber = Number(weight);

    if (!weight.trim() || Number.isNaN(weightNumber) || weightNumber <= 0) {
      alert("正しい体重を入力してください。");

      return;
    }

    try {
      setIsSaving(true);

      const now = new Date().toISOString();

      /**
       * 重要
       *
       * latestRecordを更新せず
       * 毎回新しいBODY記録を作る
       */
      const record: BodyRecord = {
        id: crypto.randomUUID(),

        date: getTodayString(),

        time: getCurrentTimeString(),

        weight: weightNumber,

        createdAt: now,

        updatedAt: now,
      };

      await addBodyRecord(record);

      setIsEditing(false);

      setWeight("");

      await onSaved();
    } catch (error) {
      console.error(error);

      alert("体重の保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  /* =========================================================
     キャンセル
  ========================================================= */

  function handleCancel(event?: React.MouseEvent) {
    event?.stopPropagation();

    setWeight("");

    setIsEditing(false);
  }

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div
      onClick={() => {
        if (!isEditing) {
          handleStartEditing();
        }
      }}
      className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${
        !isEditing
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">現在体重</p>

          {!isEditing ? (
            <>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {latestRecord?.weight !== undefined
                    ? latestRecord.weight.toFixed(1)
                    : "未登録"}
                </span>

                {latestRecord?.weight !== undefined && (
                  <span className="pb-0.5 text-sm font-medium text-slate-400">
                    kg
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-400">最新のBODY記録</p>
            </>
          ) : (
            <div className="mt-3" onClick={(event) => event.stopPropagation()}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  className="w-full rounded-xl border border-blue-300 bg-white px-3 py-2.5 pr-12 text-lg font-bold text-slate-900 outline-none ring-2 ring-blue-100 focus:border-blue-500"
                  placeholder="68.0"
                  autoFocus
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  kg
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                保存すると新しいBODY記録として履歴に追加されます
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={14} />

                  {isSaving ? "保存中..." : "記録"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={14} />
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                handleStartEditing();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600 hover:bg-blue-100"
              aria-label="体重を記録"
              title="体重を記録"
            >
              <Pencil size={17} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Weight size={19} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
