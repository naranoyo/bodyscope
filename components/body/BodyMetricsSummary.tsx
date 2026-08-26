// components/body/BodyMetricsSummary.tsx

import {
  Activity,
  Calculator,
  Flame,
  Ruler,
  Scale,
  Target,
  Weight,
} from "lucide-react";

import EditableWeightCard from "@/components/body/EditableWeightCard";

import {
  calculateAge,
  calculateBMI,
  calculateBMR,
  calculateDailyCalorieAdjustment,
  calculatePFC,
  calculateTargetCaloriesByGoal,
  calculateTDEE,
  getActivityCoefficient,
  type PFCResult,
  type SupportedGender,
} from "@/lib/calculations";

import type { BodyRecord } from "@/types/body";
import type { BodyScopeSettings, GoalMode } from "@/types/settings";

type Props = {
  latestRecord?: BodyRecord;
  settings?: BodyScopeSettings;
  onWeightSaved: () => void;
};

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
  description?: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

function MetricCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </span>

            {unit && (
              <span className="pb-0.5 text-sm font-medium text-slate-400">
                {unit}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

type PFCCardProps = {
  label: string;
  shortLabel: string;
  grams: number;
  calories: number;
  description: string;
};

function PFCCard({
  label,
  shortLabel,
  grams,
  calories,
  description,
}: PFCCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold text-slate-900">{grams}</span>

            <span className="pb-0.5 text-sm text-slate-400">g</span>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
          {shortLabel}
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        {calories.toLocaleString()} kcal
      </p>

      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}

function getGoalModeLabel(goalMode: GoalMode) {
  switch (goalMode) {
    case "cut":
      return "減量";

    case "bulk":
      return "増量";

    default:
      return "維持";
  }
}

function getGoalModeDescription(goalMode: GoalMode) {
  switch (goalMode) {
    case "cut":
      return "消費カロリーより少なく摂取";

    case "bulk":
      return "消費カロリーより多く摂取";

    default:
      return "消費カロリーと同程度を摂取";
  }
}

function getActivityDescription(
  activityLevel?: BodyScopeSettings["activityLevel"]
) {
  switch (activityLevel) {
    case "low":
      return "通勤・通学・近所のお買い物程度";

    case "light":
      return "週1〜2回程度の軽い運動や筋トレ";

    case "moderate":
      return "よく動く仕事、または週2〜3回程度の強度の高い運動";

    case "high":
      return "週4〜5回程度の強度の高い運動や筋トレ";

    case "veryHigh":
      return "スポーツ選手・アスリート";

    default:
      return "SETTINGSの活動量から取得";
  }
}

export default function BodyMetricsSummary({
  latestRecord,
  settings,
  onWeightSaved,
}: Props) {
  const weight = latestRecord?.weight;

  const height = settings?.height;
  const birthDate = settings?.birthDate;
  const gender = settings?.gender;
  const activityLevel = settings?.activityLevel;

  const goalMode: GoalMode = settings?.goalMode ?? "maintain";

  const targetWeight = settings?.targetWeight;

  const targetMonths = settings?.targetMonths;

  let age: number | undefined;
  let bmi: number | undefined;
  let bmr: number | undefined;
  let tdee: number | undefined;

  let activityCoefficient: number | undefined;

  let dailyCalorieAdjustment: number | undefined;

  let targetCalories: number | undefined;

  let pfc: PFCResult | undefined;

  /* =========================================================
     BMI
  ========================================================= */

  if (weight !== undefined && height !== undefined) {
    try {
      bmi = calculateBMI(weight, height);
    } catch {
      bmi = undefined;
    }
  }

  /* =========================================================
     年齢
  ========================================================= */

  if (birthDate) {
    try {
      age = calculateAge(birthDate);
    } catch {
      age = undefined;
    }
  }

  /* =========================================================
     性別
  ========================================================= */

  const supportedGender: SupportedGender | undefined =
    gender === "male" || gender === "female" ? gender : undefined;

  /* =========================================================
     基礎代謝
  ========================================================= */

  if (
    supportedGender &&
    age !== undefined &&
    height !== undefined &&
    weight !== undefined
  ) {
    try {
      bmr = calculateBMR(supportedGender, age, height, weight);
    } catch {
      bmr = undefined;
    }
  }

  /* =========================================================
     活動係数
  ========================================================= */

  if (activityLevel) {
    activityCoefficient = getActivityCoefficient(activityLevel);
  }

  /* =========================================================
     1日の消費カロリー
  ========================================================= */

  if (bmr !== undefined && activityLevel) {
    try {
      tdee = calculateTDEE(bmr, activityLevel);
    } catch {
      tdee = undefined;
    }
  }

  /* =========================================================
     1日の調整カロリー
  ========================================================= */

  if (weight !== undefined && targetWeight !== undefined) {
    try {
      dailyCalorieAdjustment = calculateDailyCalorieAdjustment(
        goalMode,
        weight,
        targetWeight,
        targetMonths ?? 1
      );
    } catch {
      dailyCalorieAdjustment = undefined;
    }
  }

  /* =========================================================
     目標摂取カロリー
  ========================================================= */

  if (
    tdee !== undefined &&
    dailyCalorieAdjustment !== undefined &&
    bmr !== undefined
  ) {
    try {
      targetCalories = calculateTargetCaloriesByGoal(
        goalMode,
        tdee,
        dailyCalorieAdjustment,
        bmr
      );
    } catch {
      targetCalories = undefined;
    }
  }

  /* =========================================================
     PFC
  ========================================================= */

  if (targetCalories !== undefined && weight !== undefined && supportedGender) {
    try {
      pfc = calculatePFC(targetCalories, weight, supportedGender);
    } catch {
      pfc = undefined;
    }
  }

  const calorieAdjustmentLabel =
    goalMode === "cut"
      ? "1日の減量カロリー"
      : goalMode === "bulk"
        ? "1日の増量カロリー"
        : "カロリー調整";

  const calorieAdjustmentDescription =
    goalMode === "cut"
      ? "1日の消費カロリーから差し引きます"
      : goalMode === "bulk"
        ? "1日の消費カロリーへ追加します"
        : "維持モードでは調整しません";

  return (
    <div className="space-y-8">
      {/* =====================================================
          現在の身体データ
      ===================================================== */}

      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">
            現在の身体データ
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            SETTINGSと最新のBODY記録から自動計算します
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* ① 体重 */}
          <EditableWeightCard
            key={`${latestRecord?.id ?? "new"}-${latestRecord?.updatedAt ?? "new"}`}
            latestRecord={latestRecord}
            onSaved={onWeightSaved}
          />

          {/* ② 身長 */}
          <MetricCard
            label="身長"
            value={height !== undefined ? height.toFixed(1) : "未設定"}
            unit={height !== undefined ? "cm" : undefined}
            description="SETTINGSから取得"
            icon={Ruler}
          />

          {/* ③ BMI */}
          <MetricCard
            label="BMI"
            value={bmi !== undefined ? bmi.toFixed(1) : "計算不可"}
            description={
              bmi !== undefined
                ? "身長と体重から自動計算"
                : "体重と身長を設定してください"
            }
            icon={Calculator}
          />

          {/* 基礎代謝 */}
          <MetricCard
            label="基礎代謝"
            value={bmr !== undefined ? bmr.toLocaleString() : "計算不可"}
            unit={bmr !== undefined ? "kcal" : undefined}
            description={
              bmr !== undefined
                ? "Ganpule式による推定値"
                : "性別・生年月日・身長・体重が必要です"
            }
            icon={Flame}
          />

          {/* 活動係数 */}
          <MetricCard
            label="活動係数"
            value={
              activityCoefficient !== undefined
                ? activityCoefficient.toString()
                : "未設定"
            }
            description={getActivityDescription(activityLevel)}
            icon={Activity}
          />

          {/* TDEE */}
          <MetricCard
            label="1日の消費カロリー"
            value={tdee !== undefined ? tdee.toLocaleString() : "計算不可"}
            unit={tdee !== undefined ? "kcal" : undefined}
            description="基礎代謝 × 活動係数"
            icon={Flame}
          />
        </div>

        <div className="mt-3 rounded-xl bg-slate-100 px-4 py-3">
          <p className="text-xs leading-relaxed text-slate-500">
            BMI・基礎代謝・消費カロリーは目安です。
            実際の消費エネルギーには個人差があります。
          </p>
        </div>
      </section>

      {/* =====================================================
          身体づくり目標
      ===================================================== */}

      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">身体づくり目標</h2>

          <p className="mt-1 text-xs text-slate-400">
            減量・維持・増量の設定から目標摂取カロリーを計算します
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="目標モード"
            value={getGoalModeLabel(goalMode)}
            description={getGoalModeDescription(goalMode)}
            icon={Target}
          />

          <MetricCard
            label="目標体重"
            value={
              targetWeight !== undefined ? targetWeight.toFixed(1) : "未設定"
            }
            unit={targetWeight !== undefined ? "kg" : undefined}
            description="SETTINGSから取得"
            icon={Weight}
          />

          <MetricCard
            label="目標期間"
            value={
              goalMode === "maintain"
                ? "-"
                : targetMonths !== undefined
                  ? targetMonths.toString()
                  : "未設定"
            }
            unit={
              goalMode !== "maintain" && targetMonths !== undefined
                ? "か月"
                : undefined
            }
            description={
              goalMode === "maintain"
                ? "維持モードでは使用しません"
                : "目標体重までの期間"
            }
            icon={Scale}
          />

          <MetricCard
            label={calorieAdjustmentLabel}
            value={
              dailyCalorieAdjustment !== undefined
                ? dailyCalorieAdjustment.toLocaleString()
                : "計算不可"
            }
            unit={dailyCalorieAdjustment !== undefined ? "kcal" : undefined}
            description={calorieAdjustmentDescription}
            icon={Calculator}
          />

          <MetricCard
            label="1日の消費カロリー"
            value={tdee !== undefined ? tdee.toLocaleString() : "計算不可"}
            unit={tdee !== undefined ? "kcal" : undefined}
            description="現在の推定消費量"
            icon={Flame}
          />

          <MetricCard
            label="目標摂取カロリー"
            value={
              targetCalories !== undefined
                ? targetCalories.toLocaleString()
                : "計算不可"
            }
            unit={targetCalories !== undefined ? "kcal" : undefined}
            description={
              goalMode === "cut"
                ? "消費カロリー − 減量カロリー"
                : goalMode === "bulk"
                  ? "消費カロリー ＋ 増量カロリー"
                  : "消費カロリーと同程度"
            }
            icon={Target}
          />
        </div>

        {targetCalories !== undefined && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs leading-relaxed text-blue-700">
              {goalMode === "cut" &&
                "減量モードでは、計算上の目標摂取カロリーが基礎代謝を下回る場合、基礎代謝を下限として表示します。"}

              {goalMode === "maintain" &&
                "維持モードでは、推定した1日の消費カロリーと同程度を目標摂取カロリーとして表示します。"}

              {goalMode === "bulk" &&
                "増量モードでは、目標体重と期間から算出したカロリーを1日の消費カロリーへ追加します。"}
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          PFC
      ===================================================== */}

      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">PFCバランス</h2>

          <p className="mt-1 text-xs text-slate-400">
            目標摂取カロリーから1日のPFC目標を自動計算します
          </p>
        </div>

        {pfc ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <PFCCard
                label="タンパク質"
                shortLabel="P"
                grams={pfc.proteinGrams}
                calories={pfc.proteinCalories}
                description={
                  supportedGender === "male"
                    ? "体重 × 2gを目安"
                    : "体重 × 1.5gを目安"
                }
              />

              <PFCCard
                label="脂質"
                shortLabel="F"
                grams={pfc.fatGrams}
                calories={pfc.fatCalories}
                description="目標摂取カロリーの20%を目安"
              />

              <PFCCard
                label="炭水化物"
                shortLabel="C"
                grams={pfc.carbohydrateGrams}
                calories={pfc.carbohydrateCalories}
                description="タンパク質・脂質を除いた残り"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    1日の栄養目標
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    FOOD画面の実際の摂取量と比較できるようにします
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <span className="text-xs text-slate-400">カロリー</span>

                    <p className="font-bold text-slate-800">
                      {targetCalories?.toLocaleString()} kcal
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">P</span>

                    <p className="font-bold text-slate-800">
                      {pfc.proteinGrams} g
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">F</span>

                    <p className="font-bold text-slate-800">{pfc.fatGrams} g</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">C</span>

                    <p className="font-bold text-slate-800">
                      {pfc.carbohydrateGrams} g
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              PFCをまだ計算できません
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              SETTINGSで性別・生年月日・身長・活動量・目標を設定し、
              BODYで体重を登録してください
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
