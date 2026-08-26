// types/settings.ts

export type Gender = "male" | "female" | "other" | "unspecified";

export type ActivityLevel = "low" | "light" | "moderate" | "high" | "veryHigh";

/**
 * 身体づくりの目標
 *
 * cut      = 減量
 * maintain = 維持
 * bulk     = 増量
 */
export type GoalMode = "cut" | "maintain" | "bulk";

export type BodyScopeSettings = {
  id: string;

  // 基本情報
  name?: string;

  birthDate?: string;

  gender?: Gender;

  height?: number;

  activityLevel?: ActivityLevel;

  // 身体目標
  goalMode?: GoalMode;

  targetWeight?: number;

  targetBodyFatPercentage?: number;

  /**
   * 目標体重までの期間
   * 単位：月
   */
  targetMonths?: number;

  // 栄養目標
  targetCalories?: number;

  targetProtein?: number;

  targetFat?: number;

  targetCarbohydrate?: number;

  // 健康目標
  targetSleepHours?: number;

  targetWaterIntake?: number;

  createdAt: string;

  updatedAt: string;
};
