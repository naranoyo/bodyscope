// app/settings/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings } from "lucide-react";

import PageTitle from "@/components/PageTitle";
import SettingsForm from "@/components/settings/SettingsForm";

import { getSettings } from "@/lib/bodyScopeStorage";

import type { BodyScopeSettings } from "@/types/settings";

type LoadState =
  | {
      status: "loading";
      settings?: undefined;
    }
  | {
      status: "loaded";
      settings?: BodyScopeSettings;
    };

export default function SettingsPage() {
  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading",
  });

  /* =========================================================
     SETTINGS読み込み
  ========================================================= */

  const loadSettings = useCallback(async () => {
    try {
      const settings = await getSettings();

      setLoadState({
        status: "loaded",
        settings,
      });
    } catch (error) {
      console.error("SETTINGSの取得に失敗しました。", error);

      setLoadState({
        status: "loaded",
        settings: undefined,
      });

      if (typeof window !== "undefined") {
        window.alert("SETTINGSの取得に失敗しました。");
      }
    }
  }, []);

  /* =========================================================
     初回読み込み
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const settings = await getSettings();

        if (cancelled) {
          return;
        }

        setLoadState({
          status: "loaded",
          settings,
        });
      } catch (error) {
        console.error("SETTINGSの取得に失敗しました。", error);

        if (cancelled) {
          return;
        }

        setLoadState({
          status: "loaded",
          settings: undefined,
        });

        if (typeof window !== "undefined") {
          window.alert("SETTINGSの取得に失敗しました。");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     読み込み中
  ========================================================= */

  if (loadState.status === "loading") {
    return (
      <div>
        <PageTitle
          title="SETTINGS"
          description="基本情報・目標値・アプリ設定を管理します"
          icon={Settings}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">
            SETTINGSを読み込んでいます...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     画面
  ========================================================= */

  return (
    <div>
      <PageTitle
        title="SETTINGS"
        description="基本情報・目標値・アプリ設定を管理します"
        icon={Settings}
      />

      <SettingsForm
        key={loadState.settings?.updatedAt ?? "new-settings"}
        initialSettings={loadState.settings}
        onSaved={loadSettings}
      />
    </div>
  );
}
