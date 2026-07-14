"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalysisResult, UserProfile } from "@/lib/homepath/types";

const ANALYSIS_KEY = "homepath-analysis-v1";
const PROFILE_KEY = "homepath-profile-v1";
const FEEDBACK_KEY = "homepath-feedback-v1";

interface StoredSession {
  analysis: AnalysisResult;
  profile: UserProfile;
  savedAt: string;
}

export function useSessionPersistence() {
  const [savedAnalysis, setSavedAnalysis] = useState<AnalysisResult | null>(null);
  const [savedProfile, setSavedProfile] = useState<UserProfile | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(ANALYSIS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSession;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedAnalysis(parsed.analysis);
        setSavedProfile(parsed.profile);
        setHasSavedSession(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSession = useCallback(
    (analysis: AnalysisResult, profile: UserProfile) => {
      if (typeof window === "undefined") return;
      try {
        const session: StoredSession = {
          analysis,
          profile,
          savedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(ANALYSIS_KEY, JSON.stringify(session));
        setHasSavedSession(true);
      } catch {
        // ignore quota errors
      }
    },
    []
  );

  const clearSession = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(ANALYSIS_KEY);
      window.localStorage.removeItem(PROFILE_KEY);
      setHasSavedSession(false);
      setSavedAnalysis(null);
      setSavedProfile(null);
    } catch {
      // ignore
    }
  }, []);

  return {
    savedAnalysis,
    savedProfile,
    hasSavedSession,
    saveSession,
    clearSession,
  };
}

// Feedback storage — simple "was this helpful" tracking
export function useFeedback() {
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(FEEDBACK_KEY);
      if (raw)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFeedback(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const submit = useCallback(
    (key: string, helpful: boolean) => {
      setFeedback((prev) => {
        const next = { ...prev, [key]: helpful };
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
        }
        return next;
      });
    },
    []
  );

  const get = useCallback(
    (key: string) => feedback[key],
    [feedback]
  );

  return { submit, get };
}
