// types/body.ts

export type BodyRecord = {
  id: string;

  /**
   * 記録日
   * YYYY-MM-DD
   */
  date: string;

  /**
   * 記録時刻
   * HH:mm
   */
  time?: string;

  weight?: number;

  bodyFatPercentage?: number;

  muscleMass?: number;

  skeletalMusclePercentage?: number;

  visceralFatLevel?: number;

  basalMetabolicRate?: number;

  bmi?: number;

  waist?: number;

  chest?: number;

  upperArm?: number;

  thigh?: number;

  memo?: string;

  /**
   * BODY写真
   *
   * IndexedDBはBlobをそのまま保存できます。
   */
  photo?: Blob;

  /**
   * 元画像のファイル名
   */
  photoName?: string;

  /**
   * MIME Type
   *
   * image/jpeg
   * image/png
   * image/webp
   * など
   */
  photoType?: string;

  createdAt: string;

  updatedAt: string;
};
