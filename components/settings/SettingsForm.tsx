// components/settings/SettingsForm.tsx

"use client";

import { useState } from "react";
import { Calculator, Dumbbell, Scale, Save, Target } from "lucide-react";

import { saveSettings } from "@/lib/bodyScopeStorage";

import type {
  ActivityLevel,
  BodyScopeSettings,
  Gender,
  GoalMode,
} from "@/types/settings";

type Props = {
  initialSettings?: BodyScopeSettings;
  onSaved: () => void;
};

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isNaN(number) ? undefined : number;
}

export default function SettingsForm({ initialSettings, onSaved }: Props) {
  /* =========================================================
     基本情報
  ========================================================= */

  const [name, setName] = useState(initialSettings?.name ?? "");

  const [birthDate, setBirthDate] = useState(initialSettings?.birthDate ?? "");

  const [gender, setGender] = useState<Gender>(
    initialSettings?.gender ?? "unspecified"
  );

  const [height, setHeight] = useState(
    initialSettings?.height?.toString() ?? ""
  );

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialSettings?.activityLevel ?? "moderate"
  );

  /* =========================================================
     身体目標
  ========================================================= */

  const [goalMode, setGoalMode] = useState<GoalMode>(
    initialSettings?.goalMode ?? "maintain"
  );

  const [targetWeight, setTargetWeight] = useState(
    initialSettings?.targetWeight?.toString() ?? ""
  );

  const [targetBodyFatPercentage, setTargetBodyFatPercentage] = useState(
    initialSettings?.targetBodyFatPercentage?.toString() ?? ""
  );

  const [targetMonths, setTargetMonths] = useState(
    initialSettings?.targetMonths?.toString() ?? ""
  );

  /* =========================================================
     栄養目標
  ========================================================= */

  const [targetCalories, setTargetCalories] = useState(
    initialSettings?.targetCalories?.toString() ?? ""
  );

  const [targetProtein, setTargetProtein] = useState(
    initialSettings?.targetProtein?.toString() ?? ""
  );

  const [targetFat, setTargetFat] = useState(
    initialSettings?.targetFat?.toString() ?? ""
  );

  const [targetCarbohydrate, setTargetCarbohydrate] = useState(
    initialSettings?.targetCarbohydrate?.toString() ?? ""
  );

  /* =========================================================
     健康目標
  ========================================================= */

  const [targetSleepHours, setTargetSleepHours] = useState(
    initialSettings?.targetSleepHours?.toString() ?? ""
  );

  const [targetWaterIntake, setTargetWaterIntake] = useState(
    initialSettings?.targetWaterIntake?.toString() ?? ""
  );

  const [isSaving, setIsSaving] = useState(false);

  /* =========================================================
     共通クラス
  ========================================================= */

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const labelClass = "text-sm font-medium text-slate-700";

  /* =========================================================
     保存
  ========================================================= */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const heightNumber = toOptionalNumber(height);

    const targetWeightNumber = toOptionalNumber(targetWeight);

    const targetMonthsNumber = toOptionalNumber(targetMonths);

    const targetBodyFatNumber = toOptionalNumber(targetBodyFatPercentage);

    if (
      heightNumber !== undefined &&
      (heightNumber < 50 || heightNumber > 250)
    ) {
      alert("身長は50〜250cmの範囲で入力してください。");

      return;
    }

    if (targetWeightNumber !== undefined && targetWeightNumber <= 0) {
      alert("目標体重は0より大きい値を入力してください。");

      return;
    }

    if (
      goalMode !== "maintain" &&
      (targetMonthsNumber === undefined || targetMonthsNumber <= 0)
    ) {
      alert("減量・増量モードでは目標期間を1か月以上で入力してください。");

      return;
    }

    if (
      targetBodyFatNumber !== undefined &&
      (targetBodyFatNumber < 0 || targetBodyFatNumber > 100)
    ) {
      alert("目標体脂肪率は0〜100%の範囲で入力してください。");

      return;
    }

    try {
      setIsSaving(true);

      const now = new Date().toISOString();

      const settings: BodyScopeSettings = {
        id: initialSettings?.id ?? "main-settings",

        name: name.trim() || undefined,

        birthDate: birthDate || undefined,

        gender,

        height: heightNumber,

        activityLevel,

        goalMode,

        targetWeight: targetWeightNumber,

        targetBodyFatPercentage: targetBodyFatNumber,

        targetMonths: goalMode === "maintain" ? undefined : targetMonthsNumber,

        targetCalories: toOptionalNumber(targetCalories),

        targetProtein: toOptionalNumber(targetProtein),

        targetFat: toOptionalNumber(targetFat),

        targetCarbohydrate: toOptionalNumber(targetCarbohydrate),

        targetSleepHours: toOptionalNumber(targetSleepHours),

        targetWaterIntake: toOptionalNumber(targetWaterIntake),

        createdAt: initialSettings?.createdAt ?? now,

        updatedAt: now,
      };

      await saveSettings(settings);

      alert("SETTINGSを保存しました。");

      onSaved();
    } catch (error) {
      console.error(error);

      alert("SETTINGSの保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  /* =========================================================
     目標モード説明
  ========================================================= */

  const goalModeDescription =
    goalMode === "cut"
      ? "消費カロリーより少なく摂取して、体重を減らすモードです。"
      : goalMode === "bulk"
        ? "消費カロリーより多く摂取して、体重を増やすモードです。"
        : "現在の体重を維持することを目的としたモードです。";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* =====================================================
          基本情報
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">基本情報</h2>

          <p className="mt-1 text-xs text-slate-400">
            BMI・基礎代謝・消費カロリーなどの計算に使用します
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 名前 */}
          <label className={labelClass}>
            名前
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="任意"
            />
          </label>

          {/* 生年月日 */}
          <label className={labelClass}>
            生年月日
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className={inputClass}
            />
          </label>

          {/* 性別 */}
          <label className={labelClass}>
            性別
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value as Gender)}
              className={inputClass}
            >
              <option value="unspecified">未設定</option>

              <option value="male">男性</option>

              <option value="female">女性</option>

              <option value="other">その他</option>
            </select>
          </label>

          {/* 身長 */}
          <label className={labelClass}>
            身長
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="50"
                max="250"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="170.0"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                cm
              </span>
            </div>
          </label>

          {/* 活動量 */}
          <label className={labelClass}>
            活動量
            <select
              value={activityLevel}
              onChange={(event) =>
                setActivityLevel(event.target.value as ActivityLevel)
              }
              className={inputClass}
            >
              <option value="low">低い（×1.2）</option>

              <option value="light">やや低い（×1.375）</option>

              <option value="moderate">標準（×1.55）</option>

              <option value="high">高い（×1.725）</option>

              <option value="veryHigh">かなり高い（×1.9）</option>
            </select>
            <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs leading-relaxed text-slate-500">
                {activityLevel === "low" &&
                  "1日の運動は、通勤・通学・近所のお買い物程度。"}

                {activityLevel === "light" &&
                  "活動量が低い人に加えて、1週間に1〜2回程度の軽い運動や筋トレをする。"}

                {activityLevel === "moderate" &&
                  "肉体労働などで1日中よく動いている、または1週間に2〜3回程度の強度の高い運動や筋トレをする。"}

                {activityLevel === "high" &&
                  "活動量が標準の人に加えて、1週間に4〜5回程度の強度の高い運動や筋トレをする。"}

                {activityLevel === "veryHigh" &&
                  "スポーツ選手・アスリートなど、非常に高い活動量がある。"}
              </p>
            </div>
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-blue-700">
            活動量は、基礎代謝から1日の消費カロリーを計算するために使用します。
          </p>
        </div>
      </section>

      {/* =====================================================
          身体づくり目標
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-blue-600" />

            <h2 className="text-base font-bold text-slate-900">
              身体づくり目標
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            減量・維持・増量から目標を選択します
          </p>
        </div>

        {/* 目標モード */}
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setGoalMode("cut")}
            className={`rounded-2xl border p-4 text-left transition ${
              goalMode === "cut"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Scale
                size={18}
                className={
                  goalMode === "cut" ? "text-blue-600" : "text-slate-400"
                }
              />

              <span className="text-sm font-bold text-slate-800">減量</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              目標体重まで体重を減らします
            </p>
          </button>

          <button
            type="button"
            onClick={() => setGoalMode("maintain")}
            className={`rounded-2xl border p-4 text-left transition ${
              goalMode === "maintain"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Target
                size={18}
                className={
                  goalMode === "maintain" ? "text-blue-600" : "text-slate-400"
                }
              />

              <span className="text-sm font-bold text-slate-800">維持</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              現在の体重を維持します
            </p>
          </button>

          <button
            type="button"
            onClick={() => setGoalMode("bulk")}
            className={`rounded-2xl border p-4 text-left transition ${
              goalMode === "bulk"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Dumbbell
                size={18}
                className={
                  goalMode === "bulk" ? "text-blue-600" : "text-slate-400"
                }
              />

              <span className="text-sm font-bold text-slate-800">増量</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              筋肉量アップを目的に体重を増やします
            </p>
          </button>
        </div>

        {/* モード説明 */}
        <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3">
          <p className="text-xs leading-relaxed text-slate-600">
            {goalModeDescription}
          </p>
        </div>

        {/* 目標入力 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 目標体重 */}
          <label className={labelClass}>
            目標体重
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="1"
                value={targetWeight}
                onChange={(event) => setTargetWeight(event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="70.0"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                kg
              </span>
            </div>
          </label>

          {/* 目標期間 */}
          <label className={labelClass}>
            目標達成期間
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                value={goalMode === "maintain" ? "" : targetMonths}
                onChange={(event) => setTargetMonths(event.target.value)}
                disabled={goalMode === "maintain"}
                className={`${inputClass} pr-14 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                placeholder={goalMode === "maintain" ? "-" : "3"}
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                か月
              </span>
            </div>
            {goalMode === "maintain" && (
              <p className="mt-1 text-xs text-slate-400">
                維持モードでは使用しません
              </p>
            )}
          </label>

          {/* 目標体脂肪率 */}
          <label className={labelClass}>
            目標体脂肪率
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={targetBodyFatPercentage}
                onChange={(event) =>
                  setTargetBodyFatPercentage(event.target.value)
                }
                className={`${inputClass} pr-10`}
                placeholder="15.0"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                %
              </span>
            </div>
          </label>
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-blue-600" />

            <p className="text-sm font-bold text-blue-800">
              BodyScope 自動計算
            </p>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-blue-700">
            BODYの最新体重・目標体重・目標期間・活動量から、
            目標摂取カロリーとPFCを自動計算します。
          </p>

          {goalMode === "cut" && (
            <p className="mt-2 text-xs leading-relaxed text-blue-700">
              減量：消費カロリーから必要なカロリー差を差し引きます。
            </p>
          )}

          {goalMode === "maintain" && (
            <p className="mt-2 text-xs leading-relaxed text-blue-700">
              維持：1日の消費カロリーと同程度を摂取目標にします。
            </p>
          )}

          {goalMode === "bulk" && (
            <p className="mt-2 text-xs leading-relaxed text-blue-700">
              増量：消費カロリーへ必要なカロリーを追加します。
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          栄養目標
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">栄養目標</h2>

          <p className="mt-1 text-xs text-slate-400">
            自動計算とは別に手動目標も保存できます
          </p>
        </div>

        <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3">
          <p className="text-xs leading-relaxed text-slate-500">
            今後FOOD画面では、自動計算した目標値を基本にして、
            必要な場合だけ下記の手動設定を優先できるようにします。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* カロリー */}
          <label className={labelClass}>
            目標カロリー
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={targetCalories}
                onChange={(event) => setTargetCalories(event.target.value)}
                className={`${inputClass} pr-16`}
                placeholder="2300"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                kcal
              </span>
            </div>
          </label>

          {/* P */}
          <label className={labelClass}>
            タンパク質
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={targetProtein}
                onChange={(event) => setTargetProtein(event.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="140"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                g
              </span>
            </div>
          </label>

          {/* F */}
          <label className={labelClass}>
            脂質
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={targetFat}
                onChange={(event) => setTargetFat(event.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="60"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                g
              </span>
            </div>
          </label>

          {/* C */}
          <label className={labelClass}>
            炭水化物
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                value={targetCarbohydrate}
                onChange={(event) => setTargetCarbohydrate(event.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="300"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                g
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* =====================================================
          健康目標
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">健康目標</h2>

          <p className="mt-1 text-xs text-slate-400">
            睡眠時間と水分摂取量の目標を設定します
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 睡眠 */}
          <label className={labelClass}>
            目標睡眠時間
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={targetSleepHours}
                onChange={(event) => setTargetSleepHours(event.target.value)}
                className={`${inputClass} pr-14`}
                placeholder="7.0"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                時間
              </span>
            </div>
          </label>

          {/* 水分 */}
          <label className={labelClass}>
            目標水分摂取量
            <div className="relative">
              <input
                type="number"
                step="100"
                min="0"
                value={targetWaterIntake}
                onChange={(event) => setTargetWaterIntake(event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="2000"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-slate-400">
                ml
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* =====================================================
          保存
      ===================================================== */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} />

          {isSaving ? "保存中..." : "SETTINGSを保存"}
        </button>
      </div>
    </form>
  );
}
