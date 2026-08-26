// app/food/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Coffee,
  Moon,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import PageTitle from "@/components/PageTitle";
import FoodRecordForm from "@/components/food/FoodRecordForm";
import FoodRecordHistory from "@/components/food/FoodRecordHistory";

import {
  addFoodRecord,
  deleteFoodRecord,
  getBodyRecords,
  getFoodRecords,
  getSettings,
  updateFoodRecord,
} from "@/lib/bodyScopeStorage";

import {
  calculateNutritionTargets,
  type SupportedGender,
} from "@/lib/calculations";

import type { FoodRecord, MealType, NutritionTarget } from "@/types/food";

import type { BodyRecord } from "@/types/body";
import type { BodyScopeSettings } from "@/types/settings";

import { MEAL_TYPE_LABELS } from "@/types/food";

export default function FoodPage() {
  /**
   * 食事フォームの開閉
   */
  const [isFormOpen, setIsFormOpen] = useState(false);

  /**
   * 編集中の食事記録
   *
   * nullなら新規登録
   */
  const [editingRecord, setEditingRecord] = useState<FoodRecord | null>(null);

  /**
   * IndexedDBから読み込んだ食事記録
   */
  const [records, setRecords] = useState<FoodRecord[]>([]);

  /**
   * SETTINGS
   */
  const [settings, setSettings] = useState<BodyScopeSettings | undefined>();

  /**
   * 最新BODY記録
   */
  const [latestBodyRecord, setLatestBodyRecord] = useState<
    BodyRecord | undefined
  >();

  /**
   * 初期読み込み中
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 今日の日付
   */
  const today = useMemo(() => {
    return formatDate(new Date());
  }, []);

  /* =========================================================
     FOOD・BODY・SETTINGS 初回読み込み
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [savedFoodRecords, bodyRecords, bodyScopeSettings] =
          await Promise.all([
            getFoodRecords(),
            getBodyRecords(),
            getSettings(),
          ]);

        if (cancelled) {
          return;
        }

        setRecords(savedFoodRecords);

        setLatestBodyRecord(
          bodyRecords.length > 0 ? bodyRecords[0] : undefined
        );

        setSettings(bodyScopeSettings);
      } catch (error) {
        console.error("FOODデータの読み込みに失敗しました。", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     BODY + SETTINGSから
     FOOD用の目標摂取カロリー・PFCを計算
  ========================================================= */

  const nutritionTarget = useMemo<NutritionTarget | null>(() => {
    if (!settings || !latestBodyRecord) {
      return null;
    }

    const {
      gender,
      birthDate,
      height,
      activityLevel,
      goalMode,
      targetWeight,
      targetMonths,
    } = settings;

    /**
     * 計算に必要な情報が
     * すべて揃っているか確認
     */
    if (
      (gender !== "male" && gender !== "female") ||
      !birthDate ||
      !height ||
      !activityLevel ||
      !goalMode ||
      !targetWeight ||
      !targetMonths ||
      !latestBodyRecord.weight
    ) {
      return null;
    }

    try {
      const result = calculateNutritionTargets({
        gender: gender as SupportedGender,

        birthDate,

        height,

        weight: latestBodyRecord.weight,

        activityLevel,

        goalMode,

        targetWeight,

        targetMonths,
      });

      return {
        calories: result.targetCalories,

        protein: result.pfc.proteinGrams,

        fat: result.pfc.fatGrams,

        carbohydrate: result.pfc.carbohydrateGrams,
      };
    } catch (error) {
      console.error("栄養目標の計算に失敗しました。", error);

      return null;
    }
  }, [settings, latestBodyRecord]);

  /* =========================================================
     今日の食事
  ========================================================= */

  const todayRecords = useMemo(() => {
    return records.filter((record) => record.date === today);
  }, [records, today]);

  /* =========================================================
     今日の摂取量
  ========================================================= */

  const dailyTotals = useMemo(() => {
    return todayRecords.reduce(
      (total, record) => {
        total.calories += record.totalCalories;

        total.protein += record.totalProtein;

        total.fat += record.totalFat;

        total.carbohydrate += record.totalCarbohydrate;

        return total;
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrate: 0,
      }
    );
  }, [todayRecords]);

  /* =========================================================
     進捗・残り
  ========================================================= */

  const calorieProgress = getProgress(
    dailyTotals.calories,
    nutritionTarget?.calories ?? 0
  );

  const remainingCalories = Math.max(
    (nutritionTarget?.calories ?? 0) - dailyTotals.calories,
    0
  );

  /* =========================================================
     フォーム
  ========================================================= */

  /**
   * 新規登録フォーム
   */
  function handleOpenAddForm() {
    setEditingRecord(null);
    setIsFormOpen(true);
  }

  /**
   * 編集フォーム
   */
  function handleOpenEditForm(record: FoodRecord) {
    setEditingRecord(record);
    setIsFormOpen(true);
  }

  /**
   * フォーム閉じる
   */
  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingRecord(null);
  }

  /* =========================================================
     FOOD再取得
  ========================================================= */

  async function reloadFoodRecords() {
    const savedRecords = await getFoodRecords();

    setRecords(savedRecords);
  }

  /* =========================================================
     新規登録
  ========================================================= */

  async function handleAddRecord(record: FoodRecord) {
    try {
      await addFoodRecord(record);

      await reloadFoodRecords();

      handleCloseForm();
    } catch (error) {
      console.error("FOOD記録の保存に失敗しました。", error);

      alert("食事記録の保存に失敗しました。");
    }
  }

  /* =========================================================
     更新
  ========================================================= */

  async function handleUpdateRecord(record: FoodRecord) {
    try {
      await updateFoodRecord(record);

      await reloadFoodRecords();

      handleCloseForm();
    } catch (error) {
      console.error("FOOD記録の更新に失敗しました。", error);

      alert("食事記録の更新に失敗しました。");
    }
  }

  /* =========================================================
     削除
  ========================================================= */

  async function handleDeleteRecord(id: string) {
    const confirmed = window.confirm("この食事記録を削除しますか？");

    if (!confirmed) {
      return;
    }

    try {
      await deleteFoodRecord(id);

      await reloadFoodRecords();
    } catch (error) {
      console.error("FOOD記録の削除に失敗しました。", error);

      alert("食事記録の削除に失敗しました。");
    }
  }

  /* =========================================================
     画面
  ========================================================= */

  return (
    <div>
      <PageTitle
        title="FOOD"
        description="食事・カロリー・PFCバランスを記録・管理します"
        icon={Utensils}
      />

      <div className="space-y-6">
        {/* ========================================
            今日の摂取カロリー
        ======================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">
              今日の摂取カロリー
            </p>

            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {formatNumber(dailyTotals.calories)}
              </span>

              <span className="pb-1 text-sm font-medium text-slate-500">
                {nutritionTarget ? (
                  <>/ {formatNumber(nutritionTarget.calories)} kcal</>
                ) : (
                  <>/ -- kcal</>
                )}
              </span>
            </div>
          </div>

          {/* 進捗 */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">摂取状況</span>

              <span className="font-semibold text-blue-600">
                {nutritionTarget ? `${calorieProgress}%` : "--"}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${
                    nutritionTarget ? Math.min(calorieProgress, 100) : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* 残り */}
          <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3">
            {isLoading ? (
              <p className="text-sm text-slate-500">
                BODYデータから目標値を読み込んでいます...
              </p>
            ) : !nutritionTarget ? (
              <p className="text-sm leading-relaxed text-slate-500">
                BODYの現在体重とSETTINGSの基本情報・身体づくり目標を設定すると、
                目標摂取カロリーが表示されます。
              </p>
            ) : dailyTotals.calories <= nutritionTarget.calories ? (
              <p className="text-sm text-slate-600">
                残り
                <span className="ml-2 text-lg font-bold text-blue-700">
                  {formatNumber(remainingCalories)} kcal
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                目標より
                <span className="ml-2 text-lg font-bold text-orange-600">
                  {formatNumber(
                    dailyTotals.calories - nutritionTarget.calories
                  )}{" "}
                  kcal
                </span>
                <span className="ml-1">オーバー</span>
              </p>
            )}
          </div>
        </section>

        {/* ========================================
            PFCバランス
        ======================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">PFCバランス</h2>

            <p className="mt-1 text-sm text-slate-500">
              今日の栄養バランスを確認できます
            </p>
          </div>

          <div className="space-y-6">
            <MacroProgress
              label="P"
              name="タンパク質"
              current={dailyTotals.protein}
              target={nutritionTarget?.protein ?? 0}
            />

            <MacroProgress
              label="F"
              name="脂質"
              current={dailyTotals.fat}
              target={nutritionTarget?.fat ?? 0}
            />

            <MacroProgress
              label="C"
              name="炭水化物"
              current={dailyTotals.carbohydrate}
              target={nutritionTarget?.carbohydrate ?? 0}
            />
          </div>
        </section>

        {/* ========================================
            今日の食事
        ======================================== */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">今日の食事</h2>

              <p className="mt-1 text-sm text-slate-500">
                食事ごとのカロリー・PFCを確認できます
              </p>
            </div>

            {/* PC */}
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="hidden items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:flex"
            >
              <Plus size={17} />
              食事を追加
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MealSection
              mealType="breakfast"
              icon={<Coffee size={19} />}
              records={getMealRecords(todayRecords, "breakfast")}
              onAdd={handleOpenAddForm}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteRecord}
            />

            <MealSection
              mealType="lunch"
              icon={<Utensils size={19} />}
              records={getMealRecords(todayRecords, "lunch")}
              onAdd={handleOpenAddForm}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteRecord}
            />

            <MealSection
              mealType="dinner"
              icon={<Moon size={19} />}
              records={getMealRecords(todayRecords, "dinner")}
              onAdd={handleOpenAddForm}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteRecord}
            />

            <MealSection
              mealType="snack"
              icon={<Apple size={19} />}
              records={getMealRecords(todayRecords, "snack")}
              onAdd={handleOpenAddForm}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteRecord}
            />
          </div>

          {/* スマホ */}
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:hidden"
          >
            <Plus size={18} />
            食事を追加
          </button>
        </section>

        <FoodRecordHistory
          records={records}
          onEdit={handleOpenEditForm}
          onDelete={handleDeleteRecord}
        />
      </div>

      {/* ========================================
          食事追加・編集モーダル
      ======================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6 backdrop-blur-[2px] sm:py-10">
          <div className="relative w-full max-w-2xl">
            {/* 閉じる */}
            <button
              type="button"
              onClick={handleCloseForm}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={
                editingRecord
                  ? "食事編集フォームを閉じる"
                  : "食事追加フォームを閉じる"
              }
            >
              <X size={20} />
            </button>

            <FoodRecordForm
              key={editingRecord?.id ?? "new-food-record"}
              initialRecord={editingRecord ?? undefined}
              onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}
            />

            {/* キャンセル */}
            <button
              type="button"
              onClick={handleCloseForm}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================
   食事区分カード
======================================== */

type MealSectionProps = {
  mealType: MealType;
  icon: React.ReactNode;
  records: FoodRecord[];
  onAdd: () => void;
  onEdit: (record: FoodRecord) => void;
  onDelete: (id: string) => void;
};

function MealSection({
  mealType,
  icon,
  records,
  onAdd,
  onEdit,
  onDelete,
}: MealSectionProps) {
  const totals = records.reduce(
    (total, record) => {
      total.calories += record.totalCalories;

      total.protein += record.totalProtein;

      total.fat += record.totalFat;

      total.carbohydrate += record.totalCarbohydrate;

      return total;
    },
    {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrate: 0,
    }
  );

  /**
   * 未登録
   */
  if (records.length === 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="group w-full rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              {MEAL_TYPE_LABELS[mealType]}
            </h3>

            <p className="text-xs text-slate-500">まだ記録されていません</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-blue-600 transition group-hover:bg-blue-100">
          <Plus size={17} />
          食事を追加
        </div>
      </button>
    );
  }

  /**
   * 登録済み
   */
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md">
      {/* 上部 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              {MEAL_TYPE_LABELS[mealType]}
            </h3>

            <p className="text-xs text-slate-500">
              {records.length}
              件の記録
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">
            {formatNumber(totals.calories)}
          </p>

          <p className="text-xs text-slate-500">kcal</p>
        </div>
      </div>

      {/* PFC */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <MacroMiniCard label="P" value={`${roundOne(totals.protein)}g`} />

        <MacroMiniCard label="F" value={`${roundOne(totals.fat)}g`} />

        <MacroMiniCard label="C" value={`${roundOne(totals.carbohydrate)}g`} />
      </div>

      {/* 食事記録一覧 */}
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* 日付・時刻・カロリー */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    {formatRecordDateTime(record.date, record.time)}
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {formatNumber(record.totalCalories)} kcal
                  </span>
                </div>

                {/* 食品一覧 */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {record.items.map((item) => (
                    <span
                      key={item.id}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      {item.name}

                      {item.amount !== undefined && item.unit && (
                        <span className="ml-1 text-slate-400">
                          {item.amount}
                          {item.unit}
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                {/* PFC */}
                <p className="mt-2 text-xs text-slate-500">
                  P {roundOne(record.totalProtein)}g{" / "}F{" "}
                  {roundOne(record.totalFat)}g{" / "}C{" "}
                  {roundOne(record.totalCarbohydrate)}g
                </p>

                {/* メモ */}
                {record.memo && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {record.memo}
                  </p>
                )}
              </div>

              {/* 編集・削除 */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(record)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  aria-label="食事記録を編集"
                  title="編集"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(record.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="食事記録を削除"
                  title="削除"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 追加 */}
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
      >
        <Plus size={16} />
        追加する
      </button>
    </div>
  );
}

/* ========================================
   PFC進捗
======================================== */

type MacroProgressProps = {
  label: string;
  name: string;
  current: number;
  target: number;
};

function MacroProgress({ label, name, current, target }: MacroProgressProps) {
  const progress = getProgress(current, target);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
            {label}
          </div>

          <div>
            <p className="font-semibold text-slate-900">{name}</p>

            <p className="text-xs text-slate-500">
              {target > 0
                ? `${roundOne(current)} / ${target}g`
                : `${roundOne(current)} / -- g`}
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold text-blue-600">
          {target > 0 ? `${progress}%` : "--"}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{
            width: `${target > 0 ? Math.min(progress, 100) : 0}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ========================================
   PFCミニカード
======================================== */

type MacroMiniCardProps = {
  label: string;
  value: string;
};

function MacroMiniCard({ label, value }: MacroMiniCardProps) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-xs font-bold text-blue-600">{label}</p>

      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

/* ========================================
   共通処理
======================================== */

function getMealRecords(records: FoodRecord[], mealType: MealType) {
  return records.filter((record) => record.mealType === mealType);
}

function getProgress(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.round((current / target) * 100);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

/**
 * YYYY-MM-DD
 */
function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 履歴表示用
 *
 * 2026-08-26 08:45
 * ↓
 * 2026/08/26 08:45
 */
function formatRecordDateTime(date: string, time?: string) {
  const formattedDate = date.replaceAll("-", "/");

  if (!time) {
    return formattedDate;
  }

  return `${formattedDate} ${time}`;
}
