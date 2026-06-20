"use client";

import { useState, useCallback, useEffect } from "react";
import { SiteHeader } from "@/components/homepath/SiteHeader";
import { LandingHero } from "@/components/homepath/LandingHero";
import { IntakeChat } from "@/components/homepath/IntakeChat";
import { AnalyzingView } from "@/components/homepath/AnalyzingView";
import { DashboardView } from "@/components/homepath/DashboardView";
import { ActionPlanView } from "@/components/homepath/ActionPlanView";
import { ProgramsView } from "@/components/homepath/ProgramsView";
import { DocumentAnalysisView } from "@/components/homepath/DocumentAnalysisView";
import { ResourcesView } from "@/components/homepath/ResourcesView";
import { ResponsibleAIBanner } from "@/components/homepath/ResponsibleAIBanner";
import { Sidebar, MobileNav } from "@/components/homepath/Sidebar";
import { LanguageProvider, useLanguage } from "@/components/homepath/LanguageProvider";
import type { Phase, AppView, UserProfile, AnalysisResult } from "@/lib/homepath/types";

function HomeContent() {
  const { t, language } = useLanguage();
  const [phase, setPhase] = useState<Phase>("landing");
  const [demoMode, setDemoMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);

  const startIntake = useCallback((demo: boolean) => {
    setDemoMode(demo);
    setPhase("intake");
  }, []);

  const handleProfileReady = useCallback(
    async (p: UserProfile) => {
      setProfile(p);
      setPhase("analyzing");
      setAnalyzeError(null);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: p, language }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Analysis failed");
        }
        setAnalysis(data.analysis);
        setView("dashboard");
        setPhase("app");
      } catch (err) {
        console.error(err);
        setAnalyzeError(
          err instanceof Error
            ? err.message
            : language === "es"
            ? "No pudimos analizar tu situación. Intenta de nuevo."
            : "We couldn't analyze your situation. Please try again."
        );
        setPhase("intake");
      }
    },
    [language]
  );

  const restart = useCallback(() => {
    setPhase("landing");
    setDemoMode(false);
    setProfile(null);
    setAnalysis(null);
    setView("dashboard");
    setAnalyzeError(null);
    setProgressPct(0);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // === Render phases ===

  if (phase === "landing") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader onRestart={restart} />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
            <ResponsibleAIBanner />
          </div>
          <LandingHero
            onStart={() => startIntake(false)}
            onDemo={() => startIntake(true)}
          />
        </main>
        <footer className="mt-auto border-t border-border/60 bg-card/40 py-5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
              <div className="text-center sm:text-left">
                <span className="font-serif-display text-sm font-semibold text-foreground">
                  {t("brand")}
                </span>{" "}
                — {t("footerTagline")}
              </div>
              <div className="text-center sm:text-right">{t("footerDisclaimer")}</div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (phase === "intake") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader onRestart={restart} />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
            <ResponsibleAIBanner variant="compact" />
            {analyzeError && (
              <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                {analyzeError}
              </div>
            )}
          </div>
          <IntakeChat
            onProfileReady={handleProfileReady}
            onBack={restart}
            isDemoMode={demoMode}
          />
        </main>
        <footer className="mt-auto border-t border-border/60 bg-card/40 py-5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
            {t("footerDisclaimer")}
          </div>
        </footer>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader onRestart={restart} />
        <main className="flex-1">
          <AnalyzingView />
        </main>
        <footer className="mt-auto border-t border-border/60 bg-card/40 py-5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
            {t("footerDisclaimer")}
          </div>
        </footer>
      </div>
    );
  }

  // phase === "app"
  if (!analysis) {
    // Shouldn't happen, but fallback
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader onRestart={restart} />
        <main className="flex-1">
          <div className="mx-auto max-w-xl px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">{t("error")}</p>
            <button
              onClick={restart}
              className="mt-3 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
            >
              {t("startOver")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader onRestart={restart} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6">
        <Sidebar
          view={view}
          onView={setView}
          analysis={analysis}
          progressPct={progressPct}
        />
        <main className="flex-1 px-1 py-6 sm:px-6 lg:px-8">
          {/* Mobile view selector (visible on small screens, replaces sidebar) */}
          <div className="mb-4 lg:hidden">
            <ResponsibleAIBanner variant="compact" />
          </div>
          {view === "dashboard" && (
            <DashboardView
              analysis={analysis}
              onView={setView}
              progressPct={progressPct}
            />
          )}
          {view === "action-plan" && (
            <ActionPlanView analysis={analysis} onProgressChange={setProgressPct} />
          )}
          {view === "programs" && <ProgramsView analysis={analysis} />}
          {view === "document-analysis" && <DocumentAnalysisView />}
          {view === "resources" && <ResourcesView analysis={analysis} />}
        </main>
      </div>
      <MobileNav view={view} onView={setView} />
      <footer className="mt-auto border-t border-border/60 bg-card/40 py-3">
        <div className="mx-auto max-w-6xl px-4 text-center text-[11px] text-muted-foreground sm:px-6">
          {t("footerDisclaimer")}
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
