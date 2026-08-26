// lib/calculations.ts

import type { ActivityLevel, Gender, GoalMode } from "@/types/settings";

/* =========================================================
   共通型
========================================================= */

export type SupportedGender = Extract<Gender, "male" | "female">;

export type PFCResult = {
  proteinGrams: number;
  proteinCalories: number;

  fatGrams: number;
  fatCalories: number;

  carbohydrateGrams: number;
  carbohydrateCalories: number;
};

export type NutritionCalculationParams = {
  gender: SupportedGender;

  birthDate: string;

  height: number;

  weight: number;

  activityLevel: ActivityLevel;

  goalMode: GoalMode;

  targetWeight: number;

  targetMonths: number;
};

export type NutritionCalculationResult = {
  age: number;

  bmi: number;

  basalMetabolicRate: number;

  activityCoefficient: number;

  totalDailyEnergyExpenditure: number;

  goalMode: GoalMode;

  dailyCalorieAdjustment: number;

  targetCalories: number;

  pfc: PFCResult;
};

/* =========================================================
   共通
========================================================= */

function roundTo(value: number, digits = 0): number {
  const multiplier = 10 ** digits;

  return Math.round(value * multiplier) / multiplier;
}

/* =========================================================
   年齢
========================================================= */

/**
 * 生年月日から満年齢を計算
 *
 * birthDate:
 * YYYY-MM-DD
 */
export function calculateAge(
  birthDate: string,
  referenceDate = new Date()
): number {
  const parts = birthDate.split("-").map(Number);

  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    throw new Error("正しい生年月日を指定してください。");
  }

  const [year, month, day] = parts;

  if (year <= 0 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("正しい生年月日を指定してください。");
  }

  let age = referenceDate.getFullYear() - year;

  const currentMonth = referenceDate.getMonth() + 1;

  const currentDay = referenceDate.getDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1;
  }

  if (age < 0) {
    throw new Error("未来の生年月日は指定できません。");
  }

  return age;
}

/* =========================================================
   BMI
========================================================= */

/**
 * BMI
 *
 * 体重kg ÷ 身長m²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error("体重と身長は0より大きい値を指定してください。");
  }

  const heightMeter = heightCm / 100;

  const bmi = weightKg / (heightMeter * heightMeter);

  return roundTo(bmi, 1);
}

/* =========================================================
   基礎代謝量
========================================================= */

/**
 * Ganpule式の性別定数
 */
const GANPULE_GENDER_CONSTANT: Record<SupportedGender, number> = {
  male: 0.5473,
  female: 1.0946,
};

/**
 * 基礎代謝量
 *
 * Ganpule式
 *
 * (
 *   0.1238
 *   + 0.0481 × 体重kg
 *   + 0.0234 × 身長cm
 *   - 0.0138 × 年齢
 *   - 性別定数
 * )
 * × 1000 ÷ 4.186
 */
export function calculateBMR(
  gender: SupportedGender,
  age: number,
  heightCm: number,
  weightKg: number
): number {
  if (age < 0) {
    throw new Error("年齢は0以上で指定してください。");
  }

  if (heightCm <= 0 || weightKg <= 0) {
    throw new Error("身長と体重は0より大きい値を指定してください。");
  }

  const genderConstant = GANPULE_GENDER_CONSTANT[gender];

  const bmr =
    ((0.1238 +
      0.0481 * weightKg +
      0.0234 * heightCm -
      0.0138 * age -
      genderConstant) *
      1000) /
    4.186;

  return Math.round(bmr);
}

/* =========================================================
   活動係数
========================================================= */

export const ACTIVITY_COEFFICIENTS: Record<ActivityLevel, number> = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  veryHigh: 1.9,
};

/**
 * 活動係数を取得
 */
export function getActivityCoefficient(activityLevel: ActivityLevel): number {
  return ACTIVITY_COEFFICIENTS[activityLevel];
}

/* =========================================================
   1日の消費カロリー
========================================================= */

/**
 * TDEE
 *
 * 基礎代謝 × 活動係数
 */
export function calculateTDEE(
  basalMetabolicRate: number,
  activityLevel: ActivityLevel
): number {
  if (basalMetabolicRate <= 0) {
    throw new Error("基礎代謝量は0より大きい値を指定してください。");
  }

  const coefficient = getActivityCoefficient(activityLevel);

  return Math.round(basalMetabolicRate * coefficient);
}

/* =========================================================
   体重変化カロリー
========================================================= */

/**
 * BodyScopeで使用する
 * 体重1kgあたりの簡易的なエネルギー目安
 */
export const CALORIES_PER_KG_CHANGE = 7200;

/**
 * 1日あたりのカロリー調整量
 *
 * 減量：
 * 現在体重 - 目標体重
 *
 * 維持：
 * 0kcal
 *
 * 増量：
 * 目標体重 - 現在体重
 */
export function calculateDailyCalorieAdjustment(
  goalMode: GoalMode,
  currentWeightKg: number,
  targetWeightKg: number,
  targetMonths: number
): number {
  if (currentWeightKg <= 0 || targetWeightKg <= 0) {
    throw new Error("現在体重と目標体重は0より大きい値を指定してください。");
  }

  /**
   * 維持モード
   */
  if (goalMode === "maintain") {
    return 0;
  }

  if (targetMonths <= 0) {
    throw new Error("目標期間は1か月以上で指定してください。");
  }

  let weightDifference = 0;

  /**
   * 減量
   */
  if (goalMode === "cut") {
    weightDifference = currentWeightKg - targetWeightKg;

    /**
     * 減量モードなのに
     * 目標体重が現在以上なら調整しない
     */
    if (weightDifference <= 0) {
      return 0;
    }
  }

  /**
   * 増量
   */
  if (goalMode === "bulk") {
    weightDifference = targetWeightKg - currentWeightKg;

    /**
     * 増量モードなのに
     * 目標体重が現在以下なら調整しない
     */
    if (weightDifference <= 0) {
      return 0;
    }
  }

  const totalCalories = CALORIES_PER_KG_CHANGE * weightDifference;

  const totalDays = targetMonths * 30;

  const dailyAdjustment = totalCalories / totalDays;

  return Math.round(dailyAdjustment);
}

/* =========================================================
   従来の減量専用関数
========================================================= */

/**
 * 後方互換用
 *
 * 以前作成したコードから
 * calculateDailyCalorieDeficit()
 * を呼んでも動作するよう残しています。
 */
export function calculateDailyCalorieDeficit(
  currentWeightKg: number,
  targetWeightKg: number,
  targetMonths: number
): number {
  return calculateDailyCalorieAdjustment(
    "cut",
    currentWeightKg,
    targetWeightKg,
    targetMonths
  );
}

/* =========================================================
   目標摂取カロリー
========================================================= */

/**
 * 減量・維持・増量対応
 */
export function calculateTargetCaloriesByGoal(
  goalMode: GoalMode,
  totalDailyEnergyExpenditure: number,
  dailyCalorieAdjustment: number,
  basalMetabolicRate: number
): number {
  if (totalDailyEnergyExpenditure <= 0 || basalMetabolicRate <= 0) {
    throw new Error(
      "消費カロリーと基礎代謝量は0より大きい値を指定してください。"
    );
  }

  if (dailyCalorieAdjustment < 0) {
    throw new Error("カロリー調整量は0以上で指定してください。");
  }

  /**
   * 維持
   */
  if (goalMode === "maintain") {
    return Math.round(totalDailyEnergyExpenditure);
  }

  /**
   * 減量
   */
  if (goalMode === "cut") {
    const calculatedCalories =
      totalDailyEnergyExpenditure - dailyCalorieAdjustment;

    /**
     * BodyScopeでは
     * 基礎代謝を下限として扱う
     */
    return Math.max(
      Math.round(calculatedCalories),
      Math.round(basalMetabolicRate)
    );
  }

  /**
   * 増量
   */
  return Math.round(totalDailyEnergyExpenditure + dailyCalorieAdjustment);
}

/**
 * 後方互換用
 *
 * 従来の減量専用
 * calculateTargetCalories()
 */
export function calculateTargetCalories(
  totalDailyEnergyExpenditure: number,
  dailyCalorieDeficit: number,
  basalMetabolicRate: number
): number {
  return calculateTargetCaloriesByGoal(
    "cut",
    totalDailyEnergyExpenditure,
    dailyCalorieDeficit,
    basalMetabolicRate
  );
}

/* =========================================================
   PFC
========================================================= */

/**
 * タンパク質
 *
 * 男性：体重 × 2g
 * 女性：体重 × 1.5g
 */
const PROTEIN_PER_KG: Record<SupportedGender, number> = {
  male: 2,
  female: 1.5,
};

/**
 * PFC計算
 *
 * P：
 * 男性 体重×2g
 * 女性 体重×1.5g
 *
 * F：
 * 目標摂取カロリーの20%
 *
 * C：
 * 残ったカロリー
 *
 * 1gあたり
 * P = 4kcal
 * F = 9kcal
 * C = 4kcal
 */
export function calculatePFC(
  targetCalories: number,
  weightKg: number,
  gender: SupportedGender
): PFCResult {
  if (targetCalories <= 0 || weightKg <= 0) {
    throw new Error("摂取カロリーと体重は0より大きい値を指定してください。");
  }

  /* -------------------------
     Protein
  ------------------------- */

  const proteinGramsRaw = weightKg * PROTEIN_PER_KG[gender];

  const proteinCaloriesRaw = proteinGramsRaw * 4;

  /* -------------------------
     Fat
  ------------------------- */

  const fatCaloriesRaw = targetCalories * 0.2;

  const fatGramsRaw = fatCaloriesRaw / 9;

  /* -------------------------
     Carbohydrate
  ------------------------- */

  const carbohydrateCaloriesRaw =
    targetCalories - proteinCaloriesRaw - fatCaloriesRaw;

  /**
   * 極端に低い摂取カロリーの場合でも
   * マイナスにならないようにする
   */
  const safeCarbohydrateCalories = Math.max(carbohydrateCaloriesRaw, 0);

  const carbohydrateGramsRaw = safeCarbohydrateCalories / 4;

  return {
    proteinGrams: Math.round(proteinGramsRaw),

    proteinCalories: Math.round(proteinCaloriesRaw),

    fatGrams: Math.round(fatGramsRaw),

    fatCalories: Math.round(fatCaloriesRaw),

    carbohydrateGrams: Math.round(carbohydrateGramsRaw),

    carbohydrateCalories: Math.round(safeCarbohydrateCalories),
  };
}

/* =========================================================
   BodyScope 一括計算
========================================================= */

/**
 * SETTINGS + BODYの最新体重から
 *
 * ・年齢
 * ・BMI
 * ・基礎代謝
 * ・活動係数
 * ・消費カロリー
 * ・調整カロリー
 * ・目標摂取カロリー
 * ・PFC
 *
 * をまとめて計算
 */
export function calculateNutritionTargets({
  gender,
  birthDate,
  height,
  weight,
  activityLevel,
  goalMode,
  targetWeight,
  targetMonths,
}: NutritionCalculationParams): NutritionCalculationResult {
  /* -------------------------
     年齢
  ------------------------- */

  const age = calculateAge(birthDate);

  /* -------------------------
     BMI
  ------------------------- */

  const bmi = calculateBMI(weight, height);

  /* -------------------------
     基礎代謝
  ------------------------- */

  const basalMetabolicRate = calculateBMR(gender, age, height, weight);

  /* -------------------------
     活動係数
  ------------------------- */

  const activityCoefficient = getActivityCoefficient(activityLevel);

  /* -------------------------
     消費カロリー
  ------------------------- */

  const totalDailyEnergyExpenditure = calculateTDEE(
    basalMetabolicRate,
    activityLevel
  );

  /* -------------------------
     調整カロリー
  ------------------------- */

  const dailyCalorieAdjustment = calculateDailyCalorieAdjustment(
    goalMode,
    weight,
    targetWeight,
    targetMonths
  );

  /* -------------------------
     目標摂取カロリー
  ------------------------- */

  const targetCalories = calculateTargetCaloriesByGoal(
    goalMode,
    totalDailyEnergyExpenditure,
    dailyCalorieAdjustment,
    basalMetabolicRate
  );

  /* -------------------------
     PFC
  ------------------------- */

  const pfc = calculatePFC(targetCalories, weight, gender);

  return {
    age,

    bmi,

    basalMetabolicRate,

    activityCoefficient,

    totalDailyEnergyExpenditure,

    goalMode,

    dailyCalorieAdjustment,

    targetCalories,

    pfc,
  };
}
