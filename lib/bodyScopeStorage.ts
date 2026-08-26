// lib/bodyScopeStorage.ts

import type { TrainingRecord } from "@/types/training";
import type { FoodRecord, MealType } from "@/types/food";
import type { BodyRecord } from "@/types/body";
import type { HealthRecord } from "@/types/health";
import type { BodyScopeSettings } from "@/types/settings";

const DB_NAME = "BodyScopeDB";

/**
 * FOODストアへ dateMealType インデックスを追加したため
 * 1 → 2 に更新
 */
const DB_VERSION = 2;

const STORES = {
  training: "training",
  food: "food",
  body: "body",
  health: "health",
  settings: "settings",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

type RecordWithId = {
  id: string;
};

/* =========================================================
   DATABASE OPEN
========================================================= */

/**
 * IndexedDBを開く
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDBはブラウザでのみ使用できます。"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const transaction = request.transaction;

      /* =====================================================
         TRAINING
      ===================================================== */

      if (!db.objectStoreNames.contains(STORES.training)) {
        const store = db.createObjectStore(STORES.training, {
          keyPath: "id",
        });

        store.createIndex("date", "date", {
          unique: false,
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      } else if (transaction) {
        const store = transaction.objectStore(STORES.training);

        if (!store.indexNames.contains("date")) {
          store.createIndex("date", "date", {
            unique: false,
          });
        }

        if (!store.indexNames.contains("createdAt")) {
          store.createIndex("createdAt", "createdAt", {
            unique: false,
          });
        }
      }

      /* =====================================================
         FOOD
      ===================================================== */

      if (!db.objectStoreNames.contains(STORES.food)) {
        /**
         * 新規DBの場合
         */
        const store = db.createObjectStore(STORES.food, {
          keyPath: "id",
        });

        store.createIndex("date", "date", {
          unique: false,
        });

        store.createIndex("mealType", "mealType", {
          unique: false,
        });

        store.createIndex("dateMealType", ["date", "mealType"], {
          unique: false,
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      } else if (transaction) {
        /**
         * 既存DBを Version 1 → 2 に更新する場合
         */
        const store = transaction.objectStore(STORES.food);

        if (!store.indexNames.contains("date")) {
          store.createIndex("date", "date", {
            unique: false,
          });
        }

        if (!store.indexNames.contains("mealType")) {
          store.createIndex("mealType", "mealType", {
            unique: false,
          });
        }

        if (!store.indexNames.contains("dateMealType")) {
          store.createIndex("dateMealType", ["date", "mealType"], {
            unique: false,
          });
        }

        if (!store.indexNames.contains("createdAt")) {
          store.createIndex("createdAt", "createdAt", {
            unique: false,
          });
        }
      }

      /* =====================================================
         BODY
      ===================================================== */

      if (!db.objectStoreNames.contains(STORES.body)) {
        const store = db.createObjectStore(STORES.body, {
          keyPath: "id",
        });

        store.createIndex("date", "date", {
          unique: false,
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      } else if (transaction) {
        const store = transaction.objectStore(STORES.body);

        if (!store.indexNames.contains("date")) {
          store.createIndex("date", "date", {
            unique: false,
          });
        }

        if (!store.indexNames.contains("createdAt")) {
          store.createIndex("createdAt", "createdAt", {
            unique: false,
          });
        }
      }

      /* =====================================================
         HEALTH
      ===================================================== */

      if (!db.objectStoreNames.contains(STORES.health)) {
        const store = db.createObjectStore(STORES.health, {
          keyPath: "id",
        });

        store.createIndex("date", "date", {
          unique: false,
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      } else if (transaction) {
        const store = transaction.objectStore(STORES.health);

        if (!store.indexNames.contains("date")) {
          store.createIndex("date", "date", {
            unique: false,
          });
        }

        if (!store.indexNames.contains("createdAt")) {
          store.createIndex("createdAt", "createdAt", {
            unique: false,
          });
        }
      }

      /* =====================================================
         SETTINGS
      ===================================================== */

      if (!db.objectStoreNames.contains(STORES.settings)) {
        const store = db.createObjectStore(STORES.settings, {
          keyPath: "id",
        });

        store.createIndex("updatedAt", "updatedAt", {
          unique: false,
        });
      } else if (transaction) {
        const store = transaction.objectStore(STORES.settings);

        if (!store.indexNames.contains("updatedAt")) {
          store.createIndex("updatedAt", "updatedAt", {
            unique: false,
          });
        }
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ?? new Error("IndexedDBを開くことができませんでした。")
      );
    };
  });
}

/* =========================================================
   COMMON
========================================================= */

/**
 * 1件保存・更新
 */
async function putRecord<T extends RecordWithId>(
  storeName: StoreName,
  record: T
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.put(record);

    transaction.oncomplete = () => {
      db.close();
      resolve(record);
    };

    transaction.onerror = () => {
      const error =
        transaction.error ?? new Error(`${storeName}の保存に失敗しました。`);

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ??
        new Error(`${storeName}の保存処理が中断されました。`);

      db.close();
      reject(error);
    };
  });
}

/**
 * 1件追加
 *
 * 同じIDが存在する場合はエラーになります。
 */
async function addRecord<T extends RecordWithId>(
  storeName: StoreName,
  record: T
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.add(record);

    transaction.oncomplete = () => {
      db.close();
      resolve(record);
    };

    transaction.onerror = () => {
      const error =
        transaction.error ?? new Error(`${storeName}の追加に失敗しました。`);

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ??
        new Error(`${storeName}の追加処理が中断されました。`);

      db.close();
      reject(error);
    };
  });
}

/**
 * 全件取得
 */
async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`${storeName}の取得に失敗しました。`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * IDから1件取得
 */
async function getRecordById<T>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`${storeName}の取得に失敗しました。`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * IDから1件削除
 */
async function deleteRecord(storeName: StoreName, id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const error =
        transaction.error ?? new Error(`${storeName}の削除に失敗しました。`);

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ??
        new Error(`${storeName}の削除処理が中断されました。`);

      db.close();
      reject(error);
    };
  });
}

/**
 * ストア内を全削除
 */
async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.clear();

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const error =
        transaction.error ?? new Error(`${storeName}の全削除に失敗しました。`);

      db.close();
      reject(error);
    };

    transaction.onabort = () => {
      const error =
        transaction.error ??
        new Error(`${storeName}の全削除処理が中断されました。`);

      db.close();
      reject(error);
    };
  });
}

/**
 * 日付で取得
 */
async function getRecordsByDate<T>(
  storeName: StoreName,
  date: string
): Promise<T[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    if (!store.indexNames.contains("date")) {
      db.close();
      resolve([]);
      return;
    }

    const index = store.index("date");
    const request = index.getAll(date);

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(
        request.error ?? new Error(`${storeName}の日付検索に失敗しました。`)
      );
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/* =========================================================
   TRAINING
========================================================= */

/**
 * TRAINING記録を新規追加
 *
 * 同じIDが存在する場合はエラーになります。
 */
export async function addTrainingRecord(
  record: TrainingRecord
): Promise<TrainingRecord> {
  return addRecord(STORES.training, record);
}

/**
 * TRAINING記録を保存
 *
 * 新規・更新どちらにも使用可能。
 */
export async function saveTrainingRecord(
  record: TrainingRecord
): Promise<TrainingRecord> {
  return putRecord(STORES.training, record);
}

/**
 * TRAINING記録を更新
 */
export async function updateTrainingRecord(
  record: TrainingRecord
): Promise<TrainingRecord> {
  const updatedRecord: TrainingRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };

  return putRecord(STORES.training, updatedRecord);
}

/**
 * TRAINING記録を全件取得
 *
 * 日付が新しい順
 */
export async function getTrainingRecords(): Promise<TrainingRecord[]> {
  const records = await getAllRecords<TrainingRecord>(STORES.training);

  return records.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

/**
 * TRAINING記録をIDから取得
 */
export async function getTrainingRecord(
  id: string
): Promise<TrainingRecord | undefined> {
  return getRecordById<TrainingRecord>(STORES.training, id);
}

/**
 * 指定日のTRAINING記録を取得
 */
export async function getTrainingRecordsByDate(
  date: string
): Promise<TrainingRecord[]> {
  const records = await getRecordsByDate<TrainingRecord>(STORES.training, date);

  return records.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * 指定日より前のTRAINING記録を取得
 *
 * 前回トレーニング比較などで使用
 */
export async function getPreviousTrainingRecords(
  date: string
): Promise<TrainingRecord[]> {
  const records = await getTrainingRecords();

  return records.filter((record) => record.date < date);
}

/**
 * 指定種目の直近記録を取得
 *
 * 例:
 * ベンチプレスの前回重量・回数表示などに使用
 */
export async function getPreviousExerciseRecord(
  exerciseId: string,
  beforeDate: string
): Promise<
  | {
      record: TrainingRecord;
      exercise: TrainingRecord["exercises"][number];
    }
  | undefined
> {
  const records = await getTrainingRecords();

  const previousRecords = records
    .filter((record) => record.date < beforeDate)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.createdAt.localeCompare(a.createdAt);
    });

  for (const record of previousRecords) {
    const exercise = record.exercises.find(
      (item) => item.exerciseId === exerciseId
    );

    if (exercise) {
      return {
        record,
        exercise,
      };
    }
  }

  return undefined;
}

/**
 * TRAINING記録を削除
 */
export async function deleteTrainingRecord(id: string): Promise<void> {
  return deleteRecord(STORES.training, id);
}

/**
 * TRAINING記録を全削除
 */
export async function clearTrainingRecords(): Promise<void> {
  return clearStore(STORES.training);
}

/* =========================================================
   FOOD
========================================================= */

/**
 * FOOD記録を新規追加
 */
export async function addFoodRecord(record: FoodRecord): Promise<FoodRecord> {
  return addRecord(STORES.food, record);
}

/**
 * FOOD記録を保存
 *
 * 新規・更新どちらにも使用可能。
 * 既存コードとの互換性のため残しています。
 */
export async function saveFoodRecord(record: FoodRecord): Promise<FoodRecord> {
  return putRecord(STORES.food, record);
}

/**
 * FOOD記録を更新
 */
export async function updateFoodRecord(
  record: FoodRecord
): Promise<FoodRecord> {
  const updatedRecord: FoodRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };

  return putRecord(STORES.food, updatedRecord);
}

/**
 * FOOD記録を全件取得
 */
export async function getFoodRecords(): Promise<FoodRecord[]> {
  const records = await getAllRecords<FoodRecord>(STORES.food);

  return records.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (b.time ?? "").localeCompare(a.time ?? "");
  });
}

/**
 * FOOD記録をIDから取得
 */
export async function getFoodRecord(
  id: string
): Promise<FoodRecord | undefined> {
  return getRecordById<FoodRecord>(STORES.food, id);
}

/**
 * 指定日のFOOD記録を取得
 */
export async function getFoodRecordsByDate(
  date: string
): Promise<FoodRecord[]> {
  const records = await getRecordsByDate<FoodRecord>(STORES.food, date);

  return records.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
}

/**
 * 指定日・食事区分のFOOD記録を取得
 */
export async function getFoodRecordsByMealType(
  date: string,
  mealType: MealType
): Promise<FoodRecord[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.food, "readonly");

    const store = transaction.objectStore(STORES.food);

    if (!store.indexNames.contains("dateMealType")) {
      db.close();
      resolve([]);
      return;
    }

    const index = store.index("dateMealType");

    const request = index.getAll([date, mealType]);

    request.onsuccess = () => {
      const records = request.result as FoodRecord[];

      records.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

      resolve(records);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("FOODの食事区分検索に失敗しました。"));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * FOOD記録を削除
 */
export async function deleteFoodRecord(id: string): Promise<void> {
  return deleteRecord(STORES.food, id);
}

/**
 * FOOD記録を全削除
 */
export async function clearFoodRecords(): Promise<void> {
  return clearStore(STORES.food);
}

/* =========================================================
   BODY
========================================================= */

/**
 * BODY記録を新規追加
 *
 * 1回の登録ごとに
 * 新しいBODY履歴を作成する場合に使用
 */
export async function addBodyRecord(record: BodyRecord): Promise<BodyRecord> {
  return addRecord(STORES.body, record);
}

/**
 * BODY記録を保存
 *
 * 新規・更新どちらにも使用可能。
 * 既存コードとの互換性のため残しています。
 */
export async function saveBodyRecord(record: BodyRecord): Promise<BodyRecord> {
  return putRecord(STORES.body, record);
}

/**
 * BODY記録を更新
 */
export async function updateBodyRecord(
  record: BodyRecord
): Promise<BodyRecord> {
  const updatedRecord: BodyRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };

  return putRecord(STORES.body, updatedRecord);
}

/**
 * BODY記録を全件取得
 *
 * 日付 → 時刻 → 作成日時の順で
 * 新しい記録を先頭にする
 */
export async function getBodyRecords(): Promise<BodyRecord[]> {
  const records = await getAllRecords<BodyRecord>(STORES.body);

  return records.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    const timeCompare = (b.time ?? "").localeCompare(a.time ?? "");

    if (timeCompare !== 0) {
      return timeCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

/**
 * BODY記録をIDから取得
 */
export async function getBodyRecord(
  id: string
): Promise<BodyRecord | undefined> {
  return getRecordById<BodyRecord>(STORES.body, id);
}

/**
 * 指定日のBODY記録を取得
 */
export async function getBodyRecordsByDate(
  date: string
): Promise<BodyRecord[]> {
  const records = await getRecordsByDate<BodyRecord>(STORES.body, date);

  return records.sort((a, b) => {
    const timeCompare = (b.time ?? "").localeCompare(a.time ?? "");

    if (timeCompare !== 0) {
      return timeCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

/**
 * BODY記録を削除
 */
export async function deleteBodyRecord(id: string): Promise<void> {
  return deleteRecord(STORES.body, id);
}

/**
 * BODY記録を全削除
 */
export async function clearBodyRecords(): Promise<void> {
  return clearStore(STORES.body);
}

/* =========================================================
   HEALTH
========================================================= */

/**
 * HEALTH記録を保存
 */
export async function saveHealthRecord(
  record: HealthRecord
): Promise<HealthRecord> {
  return putRecord(STORES.health, record);
}

/**
 * HEALTH記録を全件取得
 */
export async function getHealthRecords(): Promise<HealthRecord[]> {
  const records = await getAllRecords<HealthRecord>(STORES.health);

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * HEALTH記録をIDから取得
 */
export async function getHealthRecord(
  id: string
): Promise<HealthRecord | undefined> {
  return getRecordById<HealthRecord>(STORES.health, id);
}

/**
 * 指定日のHEALTH記録を取得
 */
export async function getHealthRecordsByDate(
  date: string
): Promise<HealthRecord[]> {
  return getRecordsByDate<HealthRecord>(STORES.health, date);
}

/**
 * HEALTH記録を削除
 */
export async function deleteHealthRecord(id: string): Promise<void> {
  return deleteRecord(STORES.health, id);
}

/**
 * HEALTH記録を全削除
 */
export async function clearHealthRecords(): Promise<void> {
  return clearStore(STORES.health);
}

/* =========================================================
   SETTINGS
========================================================= */

/**
 * SETTINGSを保存
 */
export async function saveSettings(
  settings: BodyScopeSettings
): Promise<BodyScopeSettings> {
  return putRecord(STORES.settings, settings);
}

/**
 * 最新のSETTINGSを取得
 */
export async function getSettings(): Promise<BodyScopeSettings | undefined> {
  const records = await getAllRecords<BodyScopeSettings>(STORES.settings);

  if (records.length === 0) {
    return undefined;
  }

  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

/**
 * SETTINGSをIDから取得
 */
export async function getSettingsById(
  id: string
): Promise<BodyScopeSettings | undefined> {
  return getRecordById<BodyScopeSettings>(STORES.settings, id);
}

/**
 * SETTINGSを削除
 */
export async function deleteSettings(id: string): Promise<void> {
  return deleteRecord(STORES.settings, id);
}

/**
 * SETTINGSを全削除
 */
export async function clearSettings(): Promise<void> {
  return clearStore(STORES.settings);
}

/* =========================================================
   DATABASE
========================================================= */

/**
 * BodyScopeの全データ削除
 */
export async function clearAllBodyScopeData(): Promise<void> {
  await Promise.all([
    clearTrainingRecords(),
    clearFoodRecords(),
    clearBodyRecords(),
    clearHealthRecords(),
    clearSettings(),
  ]);
}

/**
 * IndexedDBそのものを削除
 *
 * 開発中のリセットなどに使用
 */
export function deleteBodyScopeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDBはブラウザでのみ使用できます。"));

      return;
    }

    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error ?? new Error("BodyScopeDBの削除に失敗しました。"));
    };

    request.onblocked = () => {
      reject(
        new Error(
          "BodyScopeDBが別のタブなどで使用されているため削除できません。"
        )
      );
    };
  });
}
