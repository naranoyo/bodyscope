// data/exerciseMaster.ts

import type { BodyPart, ExerciseMaster } from "@/types/training";

export const BODY_PARTS: BodyPart[] = [
  "胸",
  "背中",
  "脚",
  "肩",
  "腕",
  "腹",
  "その他",
];

export const EXERCISE_MASTER: ExerciseMaster[] = [
  /* =========================================================
     胸
  ========================================================= */

  {
    id: "chest-bench-press",
    name: "ベンチプレス",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-incline-bench-press",
    name: "インクラインベンチプレス",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-decline-bench-press",
    name: "デクラインベンチプレス",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-dumbbell-press",
    name: "ダンベルプレス",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-incline-dumbbell-press",
    name: "インクラインダンベルプレス",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-dumbbell-fly",
    name: "ダンベルフライ",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-chest-press",
    name: "チェストプレス",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-pec-fly",
    name: "ペックフライ",
    bodyPart: "胸",
    loadType: "external",
  },
  {
    id: "chest-cable-crossover",
    name: "ケーブルクロスオーバー",
    bodyPart: "胸",
    loadType: "external",
  },

  /**
   * 自重種目
   *
   * 一般的な腕立て伏せでは
   * 体重の約65%を負荷として扱う
   */
  {
    id: "chest-push-up",
    name: "腕立て伏せ",
    bodyPart: "胸",
    loadType: "bodyweight",
    bodyWeightRatio: 0.65,
  },

  /* =========================================================
     背中
  ========================================================= */

  {
    id: "back-deadlift",
    name: "デッドリフト",
    bodyPart: "背中",
    loadType: "external",
  },
  {
    id: "back-lat-pulldown",
    name: "ラットプルダウン",
    bodyPart: "背中",
    loadType: "external",
  },

  /**
   * 懸垂
   * 基本的に自分の体重を負荷として扱う
   */
  {
    id: "back-pull-up",
    name: "懸垂",
    bodyPart: "背中",
    loadType: "bodyweight",
    bodyWeightRatio: 1,
  },
  {
    id: "back-seated-row",
    name: "シーテッドロー",
    bodyPart: "背中",
    loadType: "external",
  },
  {
    id: "back-barbell-row",
    name: "バーベルロー",
    bodyPart: "背中",
    loadType: "external",
  },
  {
    id: "back-one-arm-dumbbell-row",
    name: "ワンハンドダンベルロー",
    bodyPart: "背中",
    loadType: "external",
  },
  {
    id: "back-t-bar-row",
    name: "Tバーロー",
    bodyPart: "背中",
    loadType: "external",
  },
  {
    id: "back-straight-arm-pulldown",
    name: "ストレートアームプルダウン",
    bodyPart: "背中",
    loadType: "external",
  },
  {
    id: "back-back-extension",
    name: "バックエクステンション",
    bodyPart: "背中",
    loadType: "external",
  },

  /* =========================================================
     脚
  ========================================================= */

  {
    id: "legs-squat",
    name: "スクワット",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-front-squat",
    name: "フロントスクワット",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-leg-press",
    name: "レッグプレス",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-leg-extension",
    name: "レッグエクステンション",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-leg-curl",
    name: "レッグカール",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-bulgarian-split-squat",
    name: "ブルガリアンスクワット",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-lunge",
    name: "ランジ",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-romanian-deadlift",
    name: "ルーマニアンデッドリフト",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-hip-thrust",
    name: "ヒップスラスト",
    bodyPart: "脚",
    loadType: "external",
  },
  {
    id: "legs-calf-raise",
    name: "カーフレイズ",
    bodyPart: "脚",
    loadType: "external",
  },

  /* =========================================================
     肩
  ========================================================= */

  {
    id: "shoulders-shoulder-press",
    name: "ショルダープレス",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-dumbbell-shoulder-press",
    name: "ダンベルショルダープレス",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-military-press",
    name: "ミリタリープレス",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-side-raise",
    name: "サイドレイズ",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-front-raise",
    name: "フロントレイズ",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-rear-raise",
    name: "リアレイズ",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-face-pull",
    name: "フェイスプル",
    bodyPart: "肩",
    loadType: "external",
  },
  {
    id: "shoulders-upright-row",
    name: "アップライトロー",
    bodyPart: "肩",
    loadType: "external",
  },

  /* =========================================================
     腕
  ========================================================= */

  {
    id: "arms-barbell-curl",
    name: "バーベルカール",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-dumbbell-curl",
    name: "ダンベルカール",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-hammer-curl",
    name: "ハンマーカール",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-preacher-curl",
    name: "プリーチャーカール",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-cable-curl",
    name: "ケーブルカール",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-triceps-pushdown",
    name: "トライセプスプレスダウン",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-french-press",
    name: "フレンチプレス",
    bodyPart: "腕",
    loadType: "external",
  },
  {
    id: "arms-skull-crusher",
    name: "スカルクラッシャー",
    bodyPart: "腕",
    loadType: "external",
  },

  /**
   * ディップス
   */
  {
    id: "arms-dips",
    name: "ディップス",
    bodyPart: "腕",
    loadType: "bodyweight",
    bodyWeightRatio: 1,
  },

  /* =========================================================
     腹
  ========================================================= */

  {
    id: "abs-crunch",
    name: "クランチ",
    bodyPart: "腹",
    loadType: "external",
  },
  {
    id: "abs-sit-up",
    name: "シットアップ",
    bodyPart: "腹",
    loadType: "external",
  },
  {
    id: "abs-leg-raise",
    name: "レッグレイズ",
    bodyPart: "腹",
    loadType: "external",
  },
  {
    id: "abs-hanging-leg-raise",
    name: "ハンギングレッグレイズ",
    bodyPart: "腹",
    loadType: "external",
  },
  {
    id: "abs-ab-roller",
    name: "アブローラー",
    bodyPart: "腹",
    loadType: "external",
  },
  {
    id: "abs-plank",
    name: "プランク",
    bodyPart: "腹",
    loadType: "external",
  },
  {
    id: "abs-cable-crunch",
    name: "ケーブルクランチ",
    bodyPart: "腹",
    loadType: "external",
  },

  /* =========================================================
     その他
  ========================================================= */

  {
    id: "other-shrug",
    name: "シュラッグ",
    bodyPart: "その他",
    loadType: "external",
  },
  {
    id: "other-farmers-walk",
    name: "ファーマーズウォーク",
    bodyPart: "その他",
    loadType: "external",
  },
];

/* =========================================================
   指定部位
========================================================= */

export function getExercisesByBodyPart(bodyPart: BodyPart): ExerciseMaster[] {
  return EXERCISE_MASTER.filter((exercise) => exercise.bodyPart === bodyPart);
}

/* =========================================================
   ID検索
========================================================= */

export function getExerciseById(
  exerciseId: string
): ExerciseMaster | undefined {
  return EXERCISE_MASTER.find((exercise) => exercise.id === exerciseId);
}

/* =========================================================
   名前検索
========================================================= */

export function searchExercises(keyword: string): ExerciseMaster[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return EXERCISE_MASTER;
  }

  return EXERCISE_MASTER.filter((exercise) =>
    exercise.name.toLowerCase().includes(normalizedKeyword)
  );
}
