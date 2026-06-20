"use client";

import { useState, useCallback, useEffect } from "react";
import type { ProgressMap } from "@/lib/homepath/types";

const STORAGE_KEY = "homepath-progress-v1";

function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function saveProgress(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadProgress());
  }, []);

  const toggle = useCallback((key: string) => {
    setProgress((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveProgress(next);
      return next;
    });
  }, []);

  const isDone = useCallback(
    (key: string) => Boolean(progress[key]),
    [progress]
  );

  const reset = useCallback(() => {
    setProgress({});
    saveProgress({});
  }, []);

  return { progress, toggle, isDone, reset };
}
