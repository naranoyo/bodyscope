// types/training.ts

export type BodyPart = "胸" | "背中" | "脚" | "肩" | "腕" | "腹" | "その他";

/**
 * 種目の負荷タイプ
 *
 * external:
 * バーベル・ダンベル・マシンなど
 *
 * bodyweight:
 * 腕立て伏せ・懸垂・ディップスなど
 */
export type ExerciseLoadType = "external" | "bodyweight";

export type ExerciseMaster = {
  id: string;
  name: string;
  bodyPart: BodyPart;

  /**
   * ウェイト種目 / 自重種目
   */
  loadType: ExerciseLoadType;

  /**
   * 自重種目で使用する体重負荷率
   *
   * 例:
   * 腕立て伏せ 0.65
   * 懸垂 1.0
   */
  bodyWeightRatio?: number;
};

export type TrainingSet = {
  id: string;

  setNumber: number;

  /**
   * ボリューム計算に使用する負荷
   *
   * ウェイト種目:
   * 実際に入力した重量
   *
   * 自重種目:
   * BODY体重 × bodyWeightRatio
   */
  weight: number;

  reps: number;

  completed: boolean;
};

export type TrainingExercise = {
  id: string;

  exerciseId: string;

  exerciseName: string;

  bodyPart: BodyPart;

  /**
   * 記録時の負荷タイプ
   */
  loadType?: ExerciseLoadType;

  /**
   * 自重種目の場合
   * 記録時点のBODY体重
   */
  bodyWeightAtTraining?: number;

  /**
   * 自重種目の場合
   * 使用した負荷率
   */
  bodyWeightRatio?: number;

  sets: TrainingSet[];

  memo?: string;
};

export type TrainingRecord = {
  id: string;

  date: string;

  /**
   * 記録時刻
   * HH:mm
   */
  time?: string;

  startTime?: string;
  endTime?: string;
  durationMinutes?: number;

  exercises: TrainingExercise[];

  totalVolume?: number;

  memo?: string;

  createdAt: string;
  updatedAt: string;
};
