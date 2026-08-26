// components/food/FoodRecordHistory.tsx

"use client";

import { useState } from "react";

import {
  Apple,
  ChevronDown,
  ChevronUp,
  Coffee,
  Moon,
  Pencil,
  Trash2,
  Utensils,
} from "lucide-react";

import type { FoodRecord, MealType } from "@/types/food";
import { MEAL_TYPE_LABELS } from "@/types/food";

type Props = {
  records: FoodRecord[];
  onEdit: (record: FoodRecord) => void;
  onDelete: (id: string) => void | Promise<void>;
};

type FoodDateGroup = {
  date: string;
  records: FoodRecord[];
};

function getMealIcon(mealType: MealType) {
  switch (mealType) {
    case "breakfast":
      return <Coffee size={18} />;

    case "lunch":
      return <Utensils size={18} />;

    case "dinner":
      return <Moon size={18} />;

    case "snack":
      return <Apple size={18} />;
  }
}

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

function groupRecordsByDate(records: FoodRecord[]): FoodDateGroup[] {
  const grouped = new Map<string, FoodRecord[]>();

  for (const record of records) {
    const current = grouped.get(record.date) ?? [];

    current.push(record);

    grouped.set(record.date, current);
  }

  return Array.from(grouped.entries())
    .map(([date, groupedRecords]) => ({
      date,
      records: groupedRecords.sort((a, b) =>
        (a.time ?? "").localeCompare(b.time ?? "")
      ),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export default function FoodRecordHistory({
  records,
  onEdit,
  onDelete,
}: Props) {
  const [openDates, setOpenDates] = useState<string[]>([]);

  const dateGroups = groupRecordsByDate(records);

  function toggleDate(date: string) {
    setOpenDates((current) =>
      current.includes(date)
        ? current.filter((item) => item !== date)
        : [...current, date]
    );
  }

  if (dateGroups.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">FOOD記録履歴</h2>

          <p className="mt-1 text-sm text-slate-500">
            これまでに保存した食事データです
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Utensils size={22} />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-700">
            まだ食事記録がありません
          </p>

          <p className="mt-1 text-xs text-slate-500">
            食事を記録すると、ここに履歴が表示されます。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">FOOD記録履歴</h2>

        <p className="mt-1 text-sm text-slate-500">
          これまでに保存した食事データです
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {dateGroups.map((group) => {
          const isOpen = openDates.includes(group.date);

          const totals = group.records.reduce(
            (total, record) => {
              total.calories += record.totalCalories;

              total.protein += record.totalProtein;

              total.fat += record.totalFat;

              total.carbohydrate += record.totalCarbohydrate;

              return total;
            },
            {
              calories: 0,
              protein: 0,
              fat: 0,
              carbohydrate: 0,
            }
          );

          return (
            <article
              key={group.date}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              {/* ===============================
                  1日分の大枠
              =============================== */}

              <button
                type="button"
                onClick={() => toggleDate(group.date)}
                className="group flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-blue-50/30"
              >
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {formatDate(group.date)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {group.records.length}
                    件の食事記録
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      {formatNumber(totals.calories)}
                      <span className="ml-1 text-xs font-medium text-slate-400">
                        kcal
                      </span>
                    </p>

                    <p className="text-xs text-slate-500">
                      P{" "}
                      <strong className="text-slate-700">
                        {roundOne(totals.protein)}g
                      </strong>
                      {" / "}F{" "}
                      <strong className="text-slate-700">
                        {roundOne(totals.fat)}g
                      </strong>
                      {" / "}C{" "}
                      <strong className="text-slate-700">
                        {roundOne(totals.carbohydrate)}g
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                  {isOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                </div>
              </button>

              {/* ===============================
                  詳細
              =============================== */}

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-5">
                  <div className="space-y-3">
                    {group.records.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              {getMealIcon(record.mealType)}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-slate-900">
                                  {MEAL_TYPE_LABELS[record.mealType]}
                                </p>

                                {record.time && (
                                  <span className="text-xs text-slate-400">
                                    {record.time}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm font-bold text-slate-900">
                                {formatNumber(record.totalCalories)}{" "}
                                <span className="text-xs font-medium text-slate-400">
                                  kcal
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEdit(record)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              title="編集"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(record.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              title="削除"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>

                        {/* 食品 */}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {record.items.map((item) => (
                            <span
                              key={item.id}
                              className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                            >
                              {item.name}

                              {item.amount !== undefined && item.unit && (
                                <span className="ml-1 text-slate-400">
                                  {item.amount}
                                  {item.unit}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>

                        {/* PFC */}

                        <p className="mt-3 text-xs text-slate-500">
                          P{" "}
                          <strong className="text-slate-700">
                            {roundOne(record.totalProtein)}g
                          </strong>
                          {" / "}F{" "}
                          <strong className="text-slate-700">
                            {roundOne(record.totalFat)}g
                          </strong>
                          {" / "}C{" "}
                          <strong className="text-slate-700">
                            {roundOne(record.totalCarbohydrate)}g
                          </strong>
                        </p>

                        {record.memo && (
                          <p className="mt-3 text-xs leading-relaxed text-slate-500">
                            {record.memo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
