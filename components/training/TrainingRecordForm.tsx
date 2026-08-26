// components/training/TrainingRecordForm.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import { Plus, Save, Trash2, Weight } from "lucide-react";

import { BODY_PARTS, getExercisesByBodyPart } from "@/data/exerciseMaster";

import { addTrainingRecord, getBodyRecords } from "@/lib/bodyScopeStorage";

import type {
  BodyPart,
  TrainingExercise,
  TrainingRecord,
  TrainingSet,
} from "@/types/training";

type Props = {
  date: string;

  onSaved?: (record: TrainingRecord) => void;
};

type EditableSet = {
  id: string;

  weight: string;

  reps: string;
};

/* =========================================================
   ID
========================================================= */

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/* =========================================================
   空セット
========================================================= */

function createEmptySet(id?: string): EditableSet {
  return {
    id: id ?? createId("set"),

    weight: "",

    reps: "",
  };
}

/* =========================================================
   初期セット
   Hydration対策で固定ID
========================================================= */

function createInitialSets(): EditableSet[] {
  return [
    createEmptySet("initial-set-1"),

    createEmptySet("initial-set-2"),

    createEmptySet("initial-set-3"),
  ];
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
   小数1桁
========================================================= */

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

/* =========================================================
   FORM
========================================================= */

export default function TrainingRecordForm({ date, onSaved }: Props) {
  const [bodyPart, setBodyPart] = useState<BodyPart>("胸");

  const [exerciseId, setExerciseId] = useState("");

  const [sets, setSets] = useState<EditableSet[]>(createInitialSets);

  const [memo, setMemo] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");

  /**
   * 最新BODY体重
   */
  const [currentBodyWeight, setCurrentBodyWeight] = useState<number | null>(
    null
  );

  /**
   * BODYデータ読込中
   */
  const [isBodyLoading, setIsBodyLoading] = useState(true);

  /* =========================================================
     BODY 最新体重読込
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const bodyRecords = await getBodyRecords();

        if (cancelled) {
          return;
        }

        const latest = bodyRecords[0];

        setCurrentBodyWeight(latest?.weight ?? null);
      } catch (error) {
        console.error("BODY体重の取得に失敗しました。", error);

        if (!cancelled) {
          setCurrentBodyWeight(null);
        }
      } finally {
        if (!cancelled) {
          setIsBodyLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     選択部位の種目
  ========================================================= */

  const exercises = useMemo(() => {
    return getExercisesByBodyPart(bodyPart);
  }, [bodyPart]);

  /* =========================================================
     選択種目
  ========================================================= */

  const selectedExercise = useMemo(() => {
    return exercises.find((exercise) => exercise.id === exerciseId);
  }, [exercises, exerciseId]);

  /* =========================================================
     自重種目か
  ========================================================= */

  const isBodyweightExercise = selectedExercise?.loadType === "bodyweight";

  /* =========================================================
     自重負荷率
  ========================================================= */

  const bodyWeightRatio = selectedExercise?.bodyWeightRatio ?? 1;

  /* =========================================================
     推定負荷
  ========================================================= */

  const estimatedBodyWeightLoad = useMemo(() => {
    if (!isBodyweightExercise || currentBodyWeight === null) {
      return null;
    }

    return roundOne(currentBodyWeight * bodyWeightRatio);
  }, [isBodyweightExercise, currentBodyWeight, bodyWeightRatio]);

  /* =========================================================
     総ボリューム
  ========================================================= */

  const totalVolume = useMemo(() => {
    return sets.reduce((total, set) => {
      const reps = Number(set.reps);

      if (!Number.isFinite(reps) || reps <= 0) {
        return total;
      }

      /**
       * 自重
       */
      if (isBodyweightExercise) {
        if (estimatedBodyWeightLoad === null) {
          return total;
        }

        return total + estimatedBodyWeightLoad * reps;
      }

      /**
       * ウェイト
       */
      const weight = Number(set.weight);

      if (!Number.isFinite(weight) || weight < 0 || set.weight === "") {
        return total;
      }

      return total + weight * reps;
    }, 0);
  }, [sets, isBodyweightExercise, estimatedBodyWeightLoad]);

  /* =========================================================
     部位変更
  ========================================================= */

  function handleBodyPartChange(value: BodyPart) {
    setBodyPart(value);

    setExerciseId("");

    setMessage("");
  }

  /* =========================================================
     セット変更
  ========================================================= */

  function handleSetChange(
    id: string,
    field: "weight" | "reps",
    value: string
  ) {
    setSets((currentSets) =>
      currentSets.map((set) =>
        set.id === id
          ? {
              ...set,
              [field]: value,
            }
          : set
      )
    );

    setMessage("");
  }

  /* =========================================================
     セット追加
  ========================================================= */

  function handleAddSet() {
    setSets((currentSets) => [...currentSets, createEmptySet()]);

    setMessage("");
  }

  /* =========================================================
     セット削除
  ========================================================= */

  function handleDeleteSet(id: string) {
    if (sets.length <= 1) {
      setMessage("セットは最低1つ必要です。");

      return;
    }

    setSets((currentSets) => currentSets.filter((set) => set.id !== id));

    setMessage("");
  }

  /* =========================================================
     保存
  ========================================================= */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date) {
      setMessage("トレーニング日を確認してください。");

      return;
    }

    if (!selectedExercise) {
      setMessage("トレーニング種目を選択してください。");

      return;
    }

    /**
     * 自重種目なのに
     * BODY体重がない場合
     */
    if (isBodyweightExercise && estimatedBodyWeightLoad === null) {
      setMessage("自重種目を記録するにはBODYの現在体重が必要です。");

      return;
    }

    const validSets = sets.filter((set) => {
      const reps = Number(set.reps);

      if (!Number.isFinite(reps) || reps <= 0) {
        return false;
      }

      /**
       * 自重なら回数だけでOK
       */
      if (isBodyweightExercise) {
        return true;
      }

      const weight = Number(set.weight);

      return set.weight !== "" && Number.isFinite(weight) && weight >= 0;
    });

    if (validSets.length === 0) {
      setMessage(
        isBodyweightExercise
          ? "回数を入力してください。"
          : "重量と回数を入力してください。"
      );

      return;
    }

    const now = new Date().toISOString();

    const trainingSets: TrainingSet[] = validSets.map((set, index) => {
      /**
       * 自重の場合
       */
      const effectiveWeight = isBodyweightExercise
        ? (estimatedBodyWeightLoad ?? 0)
        : Number(set.weight);

      return {
        id: createId("training-set"),

        setNumber: index + 1,

        weight: effectiveWeight,

        reps: Number(set.reps),

        completed: true,
      };
    });

    const exercise: TrainingExercise = {
      id: createId("training-exercise"),

      exerciseId: selectedExercise.id,

      exerciseName: selectedExercise.name,

      bodyPart: selectedExercise.bodyPart,

      loadType: selectedExercise.loadType,

      bodyWeightAtTraining: isBodyweightExercise
        ? (currentBodyWeight ?? undefined)
        : undefined,

      bodyWeightRatio: isBodyweightExercise ? bodyWeightRatio : undefined,

      sets: trainingSets,

      memo: memo.trim() || undefined,
    };

    const calculatedTotalVolume = trainingSets.reduce(
      (total, set) => total + set.weight * set.reps,
      0
    );

    const record: TrainingRecord = {
      id: createId("training"),

      date,

      time: getCurrentTimeString(),

      exercises: [exercise],

      totalVolume: roundOne(calculatedTotalVolume),

      createdAt: now,
      updatedAt: now,
    };

    try {
      setIsSaving(true);

      setMessage("");

      await addTrainingRecord(record);

      setExerciseId("");

      setSets(createInitialSets());

      setMemo("");

      setMessage("トレーニングを記録しました。");

      onSaved?.(record);
    } catch (error) {
      console.error(error);

      setMessage("トレーニングの保存に失敗しました。");
    } finally {
      setIsSaving(false);
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

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Plus size={20} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            トレーニングを追加
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            種目・重量・回数を記録します
          </p>
        </div>
      </div>

      {/* 部位・種目 */}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="training-body-part"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            部位
          </label>

          <select
            id="training-body-part"
            value={bodyPart}
            onChange={(event) =>
              handleBodyPartChange(event.target.value as BodyPart)
            }
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            {BODY_PARTS.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="training-exercise"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            種目
          </label>

          <select
            id="training-exercise"
            value={exerciseId}
            onChange={(event) => {
              setExerciseId(event.target.value);

              setMessage("");
            }}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">種目を選択してください</option>

            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================
          自重種目
      ======================================== */}

      {isBodyweightExercise && (
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
              <Weight size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900">自重種目</p>

              {isBodyLoading ? (
                <p className="mt-2 text-sm text-slate-500">
                  BODYの現在体重を読み込んでいます...
                </p>
              ) : currentBodyWeight === null ? (
                <p className="mt-2 text-sm text-red-600">
                  BODYに現在体重を登録してください。
                </p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">現在体重</p>

                    <p className="mt-1 font-bold text-slate-900">
                      {roundOne(currentBodyWeight)} kg
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">負荷率</p>

                    <p className="mt-1 font-bold text-slate-900">
                      {Math.round(bodyWeightRatio * 100)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">推定負荷</p>

                    <p className="mt-1 font-bold text-blue-700">
                      {estimatedBodyWeightLoad ?? "--"} kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SET */}

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">セット</h3>

            <p className="mt-1 text-xs text-slate-500">
              {isBodyweightExercise
                ? "各セットの回数を入力してください"
                : "各セットの重量と回数を入力してください"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSet}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Plus size={16} />
            セット追加
          </button>
        </div>

        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={set.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">
                  {index + 1}
                  セット目
                </p>

                <button
                  type="button"
                  onClick={() => handleDeleteSet(set.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div
                className={
                  isBodyweightExercise
                    ? "grid grid-cols-2 gap-3"
                    : "grid grid-cols-2 gap-3"
                }
              >
                {/* 重量 */}

                <div>
                  <label
                    htmlFor={`weight-${set.id}`}
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    {isBodyweightExercise ? "推定負荷" : "重量"}
                  </label>

                  {isBodyweightExercise ? (
                    <div className="flex h-11 items-center justify-end rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-700">
                      {estimatedBodyWeightLoad ?? "--"}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        kg
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        id={`weight-${set.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        inputMode="decimal"
                        value={set.weight}
                        onChange={(event) =>
                          handleSetChange(set.id, "weight", event.target.value)
                        }
                        placeholder="60.0"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-right text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        kg
                      </span>
                    </div>
                  )}
                </div>

                {/* 回数 */}

                <div>
                  <label
                    htmlFor={`reps-${set.id}`}
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    回数
                  </label>

                  <div className="relative">
                    <input
                      id={`reps-${set.id}`}
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(event) =>
                        handleSetChange(set.id, "reps", event.target.value)
                      }
                      placeholder="10"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-9 text-right text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      回
                    </span>
                  </div>
                </div>
              </div>

              {/* セットボリューム */}

              {Number(set.reps) > 0 && (
                <div className="mt-3 text-right text-xs text-slate-500">
                  ボリューム{" "}
                  <span className="font-bold text-slate-700">
                    {roundOne(
                      (isBodyweightExercise
                        ? (estimatedBodyWeightLoad ?? 0)
                        : Number(set.weight)) * Number(set.reps)
                    ).toLocaleString()}
                  </span>{" "}
                  kg
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL */}

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-700">総ボリューム</p>

            <p className="mt-1 text-xs text-slate-500">
              {isBodyweightExercise
                ? "推定負荷 × 回数の合計"
                : "重量 × 回数の合計"}
            </p>
          </div>

          <p className="text-2xl font-black text-slate-900">
            {roundOne(totalVolume).toLocaleString()}

            <span className="ml-1 text-sm font-semibold text-slate-500">
              kg
            </span>
          </p>
        </div>
      </div>

      {/* MEMO */}

      <div className="mt-6">
        <label
          htmlFor="training-memo"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          メモ
          <span className="ml-1 font-normal text-slate-400">任意</span>
        </label>

        <textarea
          id="training-memo"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={3}
          placeholder="フォームや体調、気づいたことなど"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>

      {/* MESSAGE */}

      {message && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
            message.includes("記録しました")
              ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* SAVE */}

      <button
        type="submit"
        disabled={
          isSaving ||
          (isBodyweightExercise &&
            (isBodyLoading || currentBodyWeight === null))
        }
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save size={18} />

        {isSaving ? "保存中..." : "トレーニングを記録"}
      </button>
    </form>
  );
}
