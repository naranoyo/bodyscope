// components/body/BodyRecordForm.tsx

"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";

import { saveBodyRecord } from "@/lib/bodyScopeStorage";
import type { BodyRecord } from "@/types/body";

type Props = {
  editingRecord?: BodyRecord;
  onSaved: () => void;
  onCancelEdit: () => void;
};

function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentTimeString() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isNaN(number) ? undefined : number;
}

function numberToString(value?: number) {
  return value !== undefined ? value.toString() : "";
}

export default function BodyRecordForm({
  editingRecord,
  onSaved,
  onCancelEdit,
}: Props) {
  /*
   * editingRecordがある場合
   * その値を直接Stateの初期値として使用します。
   *
   * useEffectによるsetStateは使用しません。
   */

  const [date, setDate] = useState(editingRecord?.date ?? getTodayString());

  const [time, setTime] = useState(
    editingRecord?.time ?? getCurrentTimeString()
  );

  const [weight, setWeight] = useState(numberToString(editingRecord?.weight));

  const [bodyFatPercentage, setBodyFatPercentage] = useState(
    numberToString(editingRecord?.bodyFatPercentage)
  );

  const [muscleMass, setMuscleMass] = useState(
    numberToString(editingRecord?.muscleMass)
  );

  const [skeletalMusclePercentage, setSkeletalMusclePercentage] = useState(
    numberToString(editingRecord?.skeletalMusclePercentage)
  );

  const [visceralFatLevel, setVisceralFatLevel] = useState(
    numberToString(editingRecord?.visceralFatLevel)
  );

  const [waist, setWaist] = useState(numberToString(editingRecord?.waist));

  const [chest, setChest] = useState(numberToString(editingRecord?.chest));

  const [upperArm, setUpperArm] = useState(
    numberToString(editingRecord?.upperArm)
  );

  const [thigh, setThigh] = useState(numberToString(editingRecord?.thigh));

  const [memo, setMemo] = useState(editingRecord?.memo ?? "");

  const [isSaving, setIsSaving] = useState(false);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const labelClass = "text-sm font-medium text-slate-700";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!weight.trim()) {
      alert("体重を入力してください。");
      return;
    }

    const weightNumber = Number(weight);

    if (Number.isNaN(weightNumber) || weightNumber <= 0) {
      alert("正しい体重を入力してください。");
      return;
    }

    try {
      setIsSaving(true);

      const now = new Date().toISOString();

      const record: BodyRecord = {
        /*
         * 編集時は元のIDを使用
         * 新規時だけUUIDを作成
         */
        id: editingRecord?.id ?? crypto.randomUUID(),

        date,

        time: time.trim() || undefined,

        weight: weightNumber,

        bodyFatPercentage: toOptionalNumber(bodyFatPercentage),

        muscleMass: toOptionalNumber(muscleMass),

        skeletalMusclePercentage: toOptionalNumber(skeletalMusclePercentage),

        visceralFatLevel: toOptionalNumber(visceralFatLevel),

        waist: toOptionalNumber(waist),

        chest: toOptionalNumber(chest),

        upperArm: toOptionalNumber(upperArm),

        thigh: toOptionalNumber(thigh),

        memo: memo.trim() || undefined,

        /*
         * 編集時は作成日時を維持
         */
        createdAt: editingRecord?.createdAt ?? now,

        /*
         * 更新日時は毎回更新
         */
        updatedAt: now,
      };

      await saveBodyRecord(record);

      alert(
        editingRecord
          ? "BODYデータを更新しました。"
          : "BODYデータを保存しました。"
      );

      await onSaved();
    } catch (error) {
      console.error(error);

      alert(
        editingRecord
          ? "BODYデータの更新に失敗しました。"
          : "BODYデータの保存に失敗しました。"
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    onCancelEdit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        editingRecord
          ? "border-blue-300 ring-2 ring-blue-100"
          : "border-slate-200"
      }`}
    >
      {/* タイトル */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {editingRecord ? "身体データを編集" : "身体データを記録"}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {editingRecord
              ? "保存済みのBODYデータを修正します"
              : "体重・体脂肪率・筋肉量などを入力します"}
          </p>
        </div>

        {editingRecord && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={15} />
            編集をキャンセル
          </button>
        )}
      </div>

      {/* 編集中 */}
      {editingRecord && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-700">
            {editingRecord.date}
            {editingRecord.time ? ` ${editingRecord.time}` : ""}
            の記録を編集中です
          </p>
        </div>
      )}

      {/* 日付・時刻 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          日付
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className={labelClass}>
          時刻
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {/* 体組成 */}
      <div className="mt-5">
        <h3 className="text-sm font-bold text-slate-800">体組成</h3>

        <p className="mt-1 text-xs text-slate-400">
          体重は必須、その他は必要な項目だけ入力してください
        </p>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 体重 */}
        <label className={labelClass}>
          体重
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="67.0"
              required
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              kg
            </span>
          </div>
        </label>

        {/* 体脂肪率 */}
        <label className={labelClass}>
          体脂肪率
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={bodyFatPercentage}
              onChange={(event) => setBodyFatPercentage(event.target.value)}
              className={`${inputClass} pr-10`}
              placeholder="18.2"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              %
            </span>
          </div>
        </label>

        {/* 筋肉量 */}
        <label className={labelClass}>
          筋肉量
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              value={muscleMass}
              onChange={(event) => setMuscleMass(event.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="55.3"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              kg
            </span>
          </div>
        </label>

        {/* 骨格筋率 */}
        <label className={labelClass}>
          骨格筋率
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={skeletalMusclePercentage}
              onChange={(event) =>
                setSkeletalMusclePercentage(event.target.value)
              }
              className={`${inputClass} pr-10`}
              placeholder="38.5"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              %
            </span>
          </div>
        </label>

        {/* 内臓脂肪 */}
        <label className={labelClass}>
          内臓脂肪レベル
          <input
            type="number"
            step="1"
            min="0"
            value={visceralFatLevel}
            onChange={(event) => setVisceralFatLevel(event.target.value)}
            className={inputClass}
            placeholder="8"
          />
        </label>
      </div>

      {/* 自動計算案内 */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm font-bold text-blue-800">
          BMI・基礎代謝・消費カロリーは自動計算
        </p>

        <p className="mt-1 text-xs leading-relaxed text-blue-700">
          SETTINGSに登録した身長・性別・生年月日・活動量と、
          最新の体重データを使って自動計算します。
        </p>
      </div>

      {/* 部位サイズ */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-800">部位サイズ</h3>

        <p className="mt-1 text-xs text-slate-400">
          必要な項目だけ入力してください
        </p>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ウエスト */}
        <label className={labelClass}>
          ウエスト
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              value={waist}
              onChange={(event) => setWaist(event.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="80.0"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              cm
            </span>
          </div>
        </label>

        {/* 胸囲 */}
        <label className={labelClass}>
          胸囲
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              value={chest}
              onChange={(event) => setChest(event.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="95.0"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              cm
            </span>
          </div>
        </label>

        {/* 上腕 */}
        <label className={labelClass}>
          上腕
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              value={upperArm}
              onChange={(event) => setUpperArm(event.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="32.0"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              cm
            </span>
          </div>
        </label>

        {/* 太もも */}
        <label className={labelClass}>
          太もも
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              value={thigh}
              onChange={(event) => setThigh(event.target.value)}
              className={`${inputClass} pr-12`}
              placeholder="55.0"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
              cm
            </span>
          </div>
        </label>
      </div>

      {/* メモ */}
      <div className="mt-5">
        <label className={labelClass}>
          メモ
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            className={`${inputClass} min-h-24 resize-y`}
            placeholder="測定時の状態やメモなど"
          />
        </label>
      </div>

      {/* 保存 */}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {editingRecord && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            キャンセル
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} />

          {isSaving
            ? editingRecord
              ? "更新中..."
              : "保存中..."
            : editingRecord
              ? "BODYデータを更新"
              : "BODYデータを保存"}
        </button>
      </div>
    </form>
  );
}
