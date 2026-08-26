// types/food.ts

/**
 * 食事区分
 */
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/**
 * 食事区分の表示名
 */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

/**
 * 食事に登録する食品1件分
 */
export type FoodItem = {
  /**
   * 食事内で使用する一意のID
   */
  id: string;

  /**
   * foodMaster.ts の食品ID
   *
   * 手入力食品の場合は未設定でもOK
   */
  foodId?: string;

  /**
   * 食品名
   */
  name: string;

  /**
   * 摂取量
   *
   * 例:
   * 150g
   * 1個
   * 200ml
   */
  amount?: number;

  /**
   * 単位
   *
   * 例:
   * g
   * ml
   * 個
   * 枚
   * 杯
   */
  unit?: string;

  /**
   * この摂取量でのカロリー
   */
  calories: number;

  /**
   * この摂取量でのタンパク質
   */
  protein: number;

  /**
   * この摂取量での脂質
   */
  fat: number;

  /**
   * この摂取量での炭水化物
   */
  carbohydrate: number;
};

/**
 * 1回の食事記録
 *
 * 例:
 * 2026-08-26 朝食
 * 2026-08-26 昼食
 */
export type FoodRecord = {
  /**
   * 食事記録ID
   */
  id: string;

  /**
   * 食事日
   *
   * YYYY-MM-DD
   */
  date: string;

  /**
   * 食事時刻
   *
   * HH:mm
   */
  time?: string;

  /**
   * 朝食・昼食・夕食・間食
   */
  mealType: MealType;

  /**
   * 食事に含まれる食品
   */
  items: FoodItem[];

  /**
   * 食事全体のカロリー
   */
  totalCalories: number;

  /**
   * 食事全体のタンパク質
   */
  totalProtein: number;

  /**
   * 食事全体の脂質
   */
  totalFat: number;

  /**
   * 食事全体の炭水化物
   */
  totalCarbohydrate: number;

  /**
   * メモ
   */
  memo?: string;

  /**
   * 作成日時
   *
   * ISO形式
   */
  createdAt: string;

  /**
   * 更新日時
   *
   * ISO形式
   */
  updatedAt: string;
};

/**
 * 1日分の食事集計
 *
 * FOOD画面上部の
 * 「今日の摂取カロリー」
 * 「PFCバランス」
 * などで使用
 */
export type DailyFoodSummary = {
  date: string;

  calories: number;

  protein: number;

  fat: number;

  carbohydrate: number;
};

/**
 * 1日の栄養目標
 *
 * BODYで計算した
 * 目標摂取カロリー・PFC目標値との連携用
 */
export type NutritionTarget = {
  calories: number;

  protein: number;

  fat: number;

  carbohydrate: number;
};
