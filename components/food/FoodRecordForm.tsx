// components/food/FoodRecordForm.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Plus,
  Search,
  Trash2,
  Utensils,
} from "lucide-react";

import { FOOD_MASTER, calculateFoodNutrition } from "@/data/foodMaster";

import type { FoodItem, FoodRecord, MealType } from "@/types/food";

import { MEAL_TYPE_LABELS } from "@/types/food";

type Props = {
  /**
   * 編集する記録
   *
   * 未指定なら新規登録
   */
  initialRecord?: FoodRecord;

  /**
   * 保存時
   */
  onSubmit?: (record: FoodRecord) => void | Promise<void>;
};

export default function FoodRecordForm({ initialRecord, onSubmit }: Props) {
  /* =========================================================
     編集モード
  ========================================================= */

  const isEditMode = Boolean(initialRecord);

  /* =========================================================
     日付・時刻
     ※編集時のみ使用
  ========================================================= */

  const [date, setDate] = useState(initialRecord?.date ?? "");

  const [time, setTime] = useState(initialRecord?.time ?? "");

  /* =========================================================
     食事区分
  ========================================================= */

  const [mealType, setMealType] = useState<MealType>(
    initialRecord?.mealType ?? "breakfast"
  );

  /* =========================================================
     食品検索
  ========================================================= */

  const [searchKeyword, setSearchKeyword] = useState("");

  /* =========================================================
     選択食品
  ========================================================= */

  const [selectedFoodId, setSelectedFoodId] = useState("");

  /* =========================================================
     摂取量
  ========================================================= */

  const [amount, setAmount] = useState("");

  /* =========================================================
     食事内容
  ========================================================= */

  const [items, setItems] = useState<FoodItem[]>(initialRecord?.items ?? []);

  /* =========================================================
     メモ
  ========================================================= */

  const [memo, setMemo] = useState(initialRecord?.memo ?? "");

  /* =========================================================
     保存中
  ========================================================= */

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================================================
     検索結果
  ========================================================= */

  const filteredFoods = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return FOOD_MASTER;
    }

    return FOOD_MASTER.filter((food) =>
      food.name.toLowerCase().includes(keyword)
    );
  }, [searchKeyword]);

  /* =========================================================
     選択食品
  ========================================================= */

  const selectedFood = useMemo(() => {
    return FOOD_MASTER.find((food) => food.id === selectedFoodId);
  }, [selectedFoodId]);

  /* =========================================================
     栄養価
  ========================================================= */

  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) {
      return null;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return null;
    }

    return calculateFoodNutrition(selectedFood, numericAmount);
  }, [selectedFood, amount]);

  /* =========================================================
     食事合計
  ========================================================= */

  const totals = useMemo(() => {
    return items.reduce(
      (total, item) => {
        total.calories += item.calories;

        total.protein += item.protein;

        total.fat += item.fat;

        total.carbohydrate += item.carbohydrate;

        return total;
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrate: 0,
      }
    );
  }, [items]);

  /* =========================================================
     食品選択
  ========================================================= */

  function handleFoodSelect(foodId: string) {
    setSelectedFoodId(foodId);

    const food = FOOD_MASTER.find((item) => item.id === foodId);

    if (!food) {
      setAmount("");

      return;
    }

    setAmount(
      food.defaultAmount !== undefined
        ? String(food.defaultAmount)
        : String(food.baseAmount)
    );
  }

  /* =========================================================
     食品追加
  ========================================================= */

  function handleAddFood() {
    if (!selectedFood) {
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    const nutrition = calculateFoodNutrition(selectedFood, numericAmount);

    const newItem: FoodItem = {
      id: crypto.randomUUID(),

      foodId: selectedFood.id,

      name: selectedFood.name,

      amount: numericAmount,

      unit: selectedFood.unit,

      calories: nutrition.calories,

      protein: nutrition.protein,

      fat: nutrition.fat,

      carbohydrate: nutrition.carbohydrate,
    };

    setItems((current) => [...current, newItem]);

    setSelectedFoodId("");

    setSearchKeyword("");

    setAmount("");
  }

  /* =========================================================
     食品削除
  ========================================================= */

  function handleDeleteFood(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  /* =========================================================
     保存
  ========================================================= */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      alert("食品を1件以上追加してください。");

      return;
    }

    if (isEditMode && !date) {
      alert("日付を入力してください。");

      return;
    }

    try {
      setIsSubmitting(true);

      const now = new Date();

      const record: FoodRecord = {
        id: initialRecord?.id ?? crypto.randomUUID(),

        /**
         * 編集時は入力値
         * 新規時は現在日付
         */
        date: isEditMode ? date : formatDate(now),

        /**
         * 編集時は入力値
         * 新規時は現在時刻
         */
        time: isEditMode ? time || undefined : formatTime(now),

        mealType,

        items,

        totalCalories: Math.round(totals.calories),

        totalProtein: roundOne(totals.protein),

        totalFat: roundOne(totals.fat),

        totalCarbohydrate: roundOne(totals.carbohydrate),

        memo: memo.trim() || undefined,

        createdAt: initialRecord?.createdAt ?? now.toISOString(),

        updatedAt: now.toISOString(),
      };

      await onSubmit?.(record);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* HEADER */}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Utensils size={19} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode ? "食事記録を編集" : "食事を追加"}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {isEditMode
                ? "日付・時刻・食事内容を変更できます"
                : "食品を選択してカロリー・PFCを記録します"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ========================================
            編集時：日付・時刻
        ======================================== */}

        {isEditMode && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* DATE */}

            <div>
              <label
                htmlFor="food-date"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <CalendarDays size={16} className="text-blue-600" />
                日付
              </label>

              <input
                id="food-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* TIME */}

            <div>
              <label
                htmlFor="food-time"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <Clock3 size={16} className="text-blue-600" />
                時刻
              </label>

              <input
                id="food-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>
        )}

        {/* ========================================
            食事区分
        ======================================== */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            食事区分
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => {
              const active = mealType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {MEAL_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================
            食品検索
        ======================================== */}

        <div>
          <label
            htmlFor="food-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            食品検索
          </label>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="food-search"
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="例：白米、鶏むね肉、バナナ"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* ========================================
            食品選択
        ======================================== */}

        <div>
          <label
            htmlFor="food-select"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            食品
          </label>

          <select
            id="food-select"
            value={selectedFoodId}
            onChange={(event) => handleFoodSelect(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">食品を選択してください</option>

            {filteredFoods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
          </select>

          {filteredFoods.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              該当する食品がありません。
            </p>
          )}
        </div>

        {/* ========================================
            摂取量
        ======================================== */}

        {selectedFood && (
          <div>
            <label
              htmlFor="food-amount"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              摂取量
            </label>

            <div className="relative">
              <input
                id="food-amount"
                type="number"
                min="0"
                step="0.1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                {selectedFood.unit}
              </span>
            </div>
          </div>
        )}

        {/* ========================================
            自動計算
        ======================================== */}

        {selectedFood && calculatedNutrition && (
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedFood.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {amount}
                  {selectedFood.unit}
                  の栄養価
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  {calculatedNutrition.calories}
                </p>

                <p className="text-xs text-slate-500">kcal</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <NutritionMiniCard
                label="P"
                name="タンパク質"
                value={`${calculatedNutrition.protein}g`}
              />

              <NutritionMiniCard
                label="F"
                name="脂質"
                value={`${calculatedNutrition.fat}g`}
              />

              <NutritionMiniCard
                label="C"
                name="炭水化物"
                value={`${calculatedNutrition.carbohydrate}g`}
              />
            </div>
          </div>
        )}

        {/* ========================================
            食品追加
        ======================================== */}

        <button
          type="button"
          onClick={handleAddFood}
          disabled={!selectedFood || !calculatedNutrition}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus size={18} />
          この食品を追加
        </button>

        {/* ========================================
            食事内容
        ======================================== */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">食事内容</h3>

            <span className="text-xs font-medium text-slate-500">
              {items.length}件
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm text-slate-500">
                まだ食品が追加されていません
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.amount}
                      {item.unit}
                      {" ・ "}
                      {item.calories} kcal
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      P {item.protein}g{" / "}F {item.fat}g{" / "}C{" "}
                      {item.carbohydrate}g
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteFood(item.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    aria-label={`${item.name}を削除`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================
            合計
        ======================================== */}

        <div className="rounded-2xl bg-blue-50 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">合計</p>

              <p className="mt-1 text-2xl font-bold text-blue-700">
                {Math.round(totals.calories)}

                <span className="ml-1 text-sm font-semibold">kcal</span>
              </p>
            </div>

            <div className="text-right text-xs font-medium text-slate-600">
              <p>P {roundOne(totals.protein)}g</p>

              <p>F {roundOne(totals.fat)}g</p>

              <p>C {roundOne(totals.carbohydrate)}g</p>
            </div>
          </div>
        </div>

        {/* ========================================
            メモ
        ======================================== */}

        <div>
          <label
            htmlFor="food-memo"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            メモ
            <span className="ml-1 font-normal text-slate-400">任意</span>
          </label>

          <textarea
            id="food-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            rows={3}
            placeholder="食事についてメモを残せます"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {/* ========================================
            保存
        ======================================== */}

        <button
          type="submit"
          disabled={items.length === 0 || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Utensils size={18} />

          {isSubmitting
            ? "保存中..."
            : isEditMode
              ? "変更を保存"
              : "食事を記録"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   MINI CARD
========================================================= */

type NutritionMiniCardProps = {
  label: string;
  name: string;
  value: string;
};

function NutritionMiniCard({ label, name, value }: NutritionMiniCardProps) {
  return (
    <div className="rounded-xl bg-white px-3 py-2.5 text-center shadow-sm">
      <p className="text-xs font-bold text-blue-600">{label}</p>

      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>

      <p className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
        {name}
      </p>
    </div>
  );
}

/* =========================================================
   UTILS
========================================================= */

function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
