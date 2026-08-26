// app/body/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";

import { Weight } from "lucide-react";

import PageTitle from "@/components/PageTitle";

import BodyMetricsSummary from "@/components/body/BodyMetricsSummary";
import BodyRecordList from "@/components/body/BodyRecordList";

import { getBodyRecords, getSettings } from "@/lib/bodyScopeStorage";

import type { BodyRecord } from "@/types/body";
import type { BodyScopeSettings } from "@/types/settings";

export default function BodyPage() {
  /* =========================================================
     BODY RECORDS
  ========================================================= */

  const [records, setRecords] = useState<BodyRecord[]>([]);

  /* =========================================================
     SETTINGS
  ========================================================= */

  const [settings, setSettings] = useState<BodyScopeSettings | undefined>();

  /* =========================================================
     LOADING
  ========================================================= */

  const [isLoading, setIsLoading] = useState(true);

  /* =========================================================
     BODY再取得
  ========================================================= */

  const loadRecords = useCallback(async () => {
    try {
      const data = await getBodyRecords();

      setRecords(data);
    } catch (error) {
      console.error("BODYデータの取得に失敗しました。", error);

      alert("BODYデータの取得に失敗しました。");
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [bodyRecords, bodyScopeSettings] = await Promise.all([
          getBodyRecords(),

          getSettings(),
        ]);

        if (cancelled) {
          return;
        }

        setRecords(bodyRecords);

        setSettings(bodyScopeSettings);
      } catch (error) {
        console.error("BODYデータの読み込みに失敗しました。", error);

        if (!cancelled) {
          alert("BODYデータの読み込みに失敗しました。");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     BODY変更後
  ========================================================= */

  async function handleBodyChanged() {
    await loadRecords();
  }

  /* =========================================================
     最新BODY記録
  ========================================================= */

  const latestRecord = records.length > 0 ? records[0] : undefined;

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div>
      <PageTitle
        title="BODY"
        description="体重・体脂肪率・筋肉量などの身体データを管理します"
        icon={Weight}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">
            BODYデータを読み込んでいます...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ========================================
              身体データ・自動計算
          ======================================== */}

          <BodyMetricsSummary
            latestRecord={latestRecord}
            settings={settings}
            onWeightSaved={handleBodyChanged}
          />

          {/* ========================================
              BODY記録履歴
          ======================================== */}

          <BodyRecordList records={records} onChanged={handleBodyChanged} />
        </div>
      )}
    </div>
  );
}
