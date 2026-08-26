// components/body/BodyRecordList.tsx

"use client";

import { useEffect, useState } from "react";

import { Camera, ImageIcon, Pencil, Save, Trash2, X } from "lucide-react";

import { deleteBodyRecord, updateBodyRecord } from "@/lib/bodyScopeStorage";

import type { BodyRecord } from "@/types/body";

type Props = {
  records: BodyRecord[];

  onChanged: () => void;
};

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  const [year, month, day] = date.split("-");

  return `${year}/${month}/${day}`;
}

/* =========================================================
   BODY画像 縮小・圧縮
========================================================= */

const BODY_PHOTO_MAX_WIDTH = 1200;
const BODY_PHOTO_MAX_HEIGHT = 1600;
const BODY_PHOTO_QUALITY = 0.82;

/**
 * BODY画像を
 * 最大1200 × 1600pxまで縮小し、
 * WebPへ圧縮する
 *
 * 縦横比は維持するため画像は変形しません。
 */
async function compressBodyPhoto(file: File): Promise<{
  blob: Blob;
  name: string;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      try {
        const originalWidth = image.naturalWidth;
        const originalHeight = image.naturalHeight;

        if (originalWidth <= 0 || originalHeight <= 0) {
          URL.revokeObjectURL(objectUrl);

          reject(new Error("画像サイズを取得できませんでした。"));

          return;
        }

        /* ========================================
           縮小率
        ======================================== */

        const widthRatio = BODY_PHOTO_MAX_WIDTH / originalWidth;

        const heightRatio = BODY_PHOTO_MAX_HEIGHT / originalHeight;

        /**
         * 1より大きくしないことで
         * 小さい画像を無理に拡大しない
         */
        const scale = Math.min(widthRatio, heightRatio, 1);

        const width = Math.max(1, Math.round(originalWidth * scale));

        const height = Math.max(1, Math.round(originalHeight * scale));

        /* ========================================
           Canvas
        ======================================== */

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(objectUrl);

          reject(new Error("画像処理を開始できませんでした。"));

          return;
        }

        /**
         * 高品質リサイズ
         */
        context.imageSmoothingEnabled = true;

        context.imageSmoothingQuality = "high";

        context.drawImage(image, 0, 0, width, height);

        /* ========================================
           WebPへ変換
        ======================================== */

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(new Error("画像の圧縮に失敗しました。"));

              return;
            }

            /**
             * 元ファイル名の拡張子を除去
             */
            const baseName = file.name.replace(/\.[^/.]+$/, "");

            resolve({
              blob,

              name: `${baseName}.webp`,

              type: "image/webp",
            });
          },

          "image/webp",

          BODY_PHOTO_QUALITY
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);

        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(new Error("画像を読み込めませんでした。"));
    };

    image.src = objectUrl;
  });
}

/* =========================================================
   PHOTO PREVIEW
========================================================= */

function BodyPhoto({ photo, alt }: { photo: Blob; alt: string }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      }
    };

    reader.onerror = () => {
      console.error("BODY画像の読み込みに失敗しました。");
    };

    reader.readAsDataURL(photo);

    return () => {
      cancelled = true;
    };
  }, [photo]);

  if (!previewUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <span className="text-xs text-slate-400">画像を読み込み中...</span>
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt={alt} className="h-full w-full object-cover" />
    </>
  );
}
/* =========================================================
   BODY RECORD LIST
========================================================= */

export default function BodyRecordList({ records, onChanged }: Props) {
  const [editingRecord, setEditingRecord] = useState<BodyRecord | null>(null);

  const [editDate, setEditDate] = useState("");

  const [editTime, setEditTime] = useState("");

  const [editWeight, setEditWeight] = useState("");

  const [editMemo, setEditMemo] = useState("");

  const [editPhoto, setEditPhoto] = useState<Blob | undefined>();

  const [editPhotoName, setEditPhotoName] = useState<string | undefined>();

  const [editPhotoType, setEditPhotoType] = useState<string | undefined>();

  const [isSaving, setIsSaving] = useState(false);

  /* =========================================================
     編集開始
  ========================================================= */

  function handleEdit(record: BodyRecord) {
    setEditingRecord(record);

    setEditDate(record.date);

    setEditTime(record.time ?? "");

    setEditWeight(record.weight !== undefined ? String(record.weight) : "");

    setEditMemo(record.memo ?? "");

    setEditPhoto(record.photo);

    setEditPhotoName(record.photoName);

    setEditPhotoType(record.photoType);
  }

  /* =========================================================
     編集終了
  ========================================================= */

  function handleCloseEdit() {
    setEditingRecord(null);

    setEditDate("");

    setEditTime("");

    setEditWeight("");

    setEditMemo("");

    setEditPhoto(undefined);

    setEditPhotoName(undefined);

    setEditPhotoType(undefined);
  }

  /* =========================================================
     PHOTO
  ========================================================= */

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    /**
     * 同じ画像を再選択できるよう
     * 先にinputをリセット
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    /* ========================================
     ファイル形式
  ======================================== */

    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。");

      return;
    }

    /* ========================================
     元画像サイズ制限
  ======================================== */

    const maxOriginalSize = 20 * 1024 * 1024;

    if (file.size > maxOriginalSize) {
      alert("元画像は20MB以下の画像を選択してください。");

      return;
    }

    try {
      /* ========================================
       自動縮小・圧縮
    ======================================== */

      const compressed = await compressBodyPhoto(file);

      setEditPhoto(compressed.blob);

      setEditPhotoName(compressed.name);

      setEditPhotoType(compressed.type);
    } catch (error) {
      console.error("BODY画像の圧縮に失敗しました。", error);

      alert("画像の読み込み・圧縮に失敗しました。別の画像をお試しください。");
    }
  }

  /**
   * 選択中のBODY画像を削除
   */
  function handleRemovePhoto() {
    setEditPhoto(undefined);
    setEditPhotoName(undefined);
    setEditPhotoType(undefined);
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async function handleSaveEdit() {
    if (!editingRecord) {
      return;
    }

    if (!editDate) {
      alert("日付を入力してください。");

      return;
    }

    let weight: number | undefined;

    if (editWeight.trim()) {
      const numericWeight = Number(editWeight);

      if (Number.isNaN(numericWeight) || numericWeight <= 0) {
        alert("正しい体重を入力してください。");

        return;
      }

      weight = numericWeight;
    }

    try {
      setIsSaving(true);

      const updatedRecord: BodyRecord = {
        ...editingRecord,

        date: editDate,

        time: editTime || undefined,

        weight,

        memo: editMemo.trim() || undefined,

        photo: editPhoto,

        photoName: editPhotoName,

        photoType: editPhotoType,

        updatedAt: new Date().toISOString(),
      };

      await updateBodyRecord(updatedRecord);

      handleCloseEdit();

      await onChanged();
    } catch (error) {
      console.error(error);

      alert("BODY記録の更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(record: BodyRecord) {
    const confirmed = window.confirm(
      `${formatDate(record.date)} のBODY記録を削除しますか？`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBodyRecord(record.id);

      await onChanged();
    } catch (error) {
      console.error(error);

      alert("データの削除に失敗しました。");
    }
  }

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* HEADER */}

        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">BODY記録履歴</h2>

          <p className="mt-1 text-xs text-slate-400">
            これまでに保存した身体データです
          </p>
        </div>

        {/* EMPTY */}

        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              BODYデータがまだありません
            </p>

            <p className="mt-1 text-xs text-slate-400">
              現在体重から最初のBODY記録を追加してください
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
              >
                {/* ===============================
                      HEADER
                  =============================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {/* DATE */}

                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">
                        {formatDate(record.date)}
                      </p>

                      {record.time && (
                        <span className="text-xs text-slate-400">
                          {record.time}
                        </span>
                      )}
                    </div>

                    {/* BODY DATA */}

                    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
                      {record.weight !== undefined && (
                        <div>
                          <span className="text-xs text-slate-400">体重</span>

                          <p className="mt-1 text-base font-bold text-slate-800">
                            {record.weight} kg
                          </p>
                        </div>
                      )}

                      {record.bodyFatPercentage !== undefined && (
                        <div>
                          <span className="text-xs text-slate-400">
                            体脂肪率
                          </span>

                          <p className="mt-1 text-base font-bold text-slate-800">
                            {record.bodyFatPercentage} %
                          </p>
                        </div>
                      )}

                      {record.muscleMass !== undefined && (
                        <div>
                          <span className="text-xs text-slate-400">筋肉量</span>

                          <p className="mt-1 text-base font-bold text-slate-800">
                            {record.muscleMass} kg
                          </p>
                        </div>
                      )}

                      {record.skeletalMusclePercentage !== undefined && (
                        <div>
                          <span className="text-xs text-slate-400">
                            骨格筋率
                          </span>

                          <p className="mt-1 text-base font-bold text-slate-800">
                            {record.skeletalMusclePercentage} %
                          </p>
                        </div>
                      )}

                      {record.visceralFatLevel !== undefined && (
                        <div>
                          <span className="text-xs text-slate-400">
                            内臓脂肪レベル
                          </span>

                          <p className="mt-1 text-base font-bold text-slate-800">
                            {record.visceralFatLevel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION */}

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <Pencil size={15} />
                      編集
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      削除
                    </button>
                  </div>
                </div>

                {/* ===============================
                      PHOTO
                  =============================== */}

                {record.photo && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      BODY画像
                    </p>

                    <div className="h-48 w-36 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-60 sm:w-44">
                      <BodyPhoto
                        photo={record.photo}
                        alt={`${formatDate(record.date)}のBODY画像`}
                      />
                    </div>
                  </div>
                )}

                {/* ===============================
                      PART SIZE
                  =============================== */}

                {(record.waist !== undefined ||
                  record.chest !== undefined ||
                  record.upperArm !== undefined ||
                  record.thigh !== undefined) && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      部位サイズ
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {record.waist !== undefined && (
                        <p className="text-xs text-slate-500">
                          ウエスト{" "}
                          <span className="font-semibold text-slate-700">
                            {record.waist} cm
                          </span>
                        </p>
                      )}

                      {record.chest !== undefined && (
                        <p className="text-xs text-slate-500">
                          胸囲{" "}
                          <span className="font-semibold text-slate-700">
                            {record.chest} cm
                          </span>
                        </p>
                      )}

                      {record.upperArm !== undefined && (
                        <p className="text-xs text-slate-500">
                          上腕{" "}
                          <span className="font-semibold text-slate-700">
                            {record.upperArm} cm
                          </span>
                        </p>
                      )}

                      {record.thigh !== undefined && (
                        <p className="text-xs text-slate-500">
                          太もも{" "}
                          <span className="font-semibold text-slate-700">
                            {record.thigh} cm
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* MEMO */}

                {record.memo && (
                  <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs leading-relaxed text-slate-500">
                      {record.memo}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6 backdrop-blur-[2px] sm:py-10">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  BODY記録を編集
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  日付・体重・画像などを変更できます
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* DATE / TIME */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="body-edit-date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    日付
                  </label>

                  <input
                    id="body-edit-date"
                    type="date"
                    value={editDate}
                    onChange={(event) => setEditDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="body-edit-time"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    時刻
                  </label>

                  <input
                    id="body-edit-time"
                    type="time"
                    value={editTime}
                    onChange={(event) => setEditTime(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* WEIGHT */}

              <div>
                <label
                  htmlFor="body-edit-weight"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  体重
                </label>

                <div className="relative">
                  <input
                    id="body-edit-weight"
                    type="number"
                    step="0.1"
                    min="1"
                    value={editWeight}
                    onChange={(event) => setEditWeight(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-12 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              {/* PHOTO */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  BODY画像
                </p>

                {editPhoto ? (
                  <div>
                    <div className="h-64 w-48 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <BodyPhoto photo={editPhoto} alt="BODY画像プレビュー" />
                    </div>

                    {editPhotoName && (
                      <div className="mt-2">
                        <p className="max-w-xs truncate text-xs text-slate-500">
                          {editPhotoName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          最大1200 × 1600pxに自動最適化済み
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100">
                        <Camera size={17} />
                        画像を変更
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={17} />
                        画像を削除
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <ImageIcon size={20} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      画像を追加
                    </p>

                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <p>推奨サイズ：1200 × 1600px（3:4）</p>

                      <p>大きな画像は保存時に自動縮小・圧縮します</p>

                      <p>JPG・PNG・WebP / 元画像最大20MB</p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* MEMO */}

              <div>
                <label
                  htmlFor="body-edit-memo"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  メモ
                  <span className="ml-1 font-normal text-slate-400">任意</span>
                </label>

                <textarea
                  id="body-edit-memo"
                  value={editMemo}
                  onChange={(event) => setEditMemo(event.target.value)}
                  rows={3}
                  placeholder="身体の変化などを記録できます"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* SAVE */}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={17} />

                  {isSaving ? "保存中..." : "変更を保存"}
                </button>

                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
