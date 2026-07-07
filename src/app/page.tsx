"use client";

import { useState, useCallback, useEffect } from "react";
import { SiteHeader } from "@/components/homepath/SiteHeader";
import { LandingHero } from "@/components/homepath/LandingHero";
import { IntakeChat } from "@/components/homepath/IntakeChat";
import { AnalyzingView } from "@/components/homepath/AnalyzingView";
import { DashboardView } from "@/components/homepath/DashboardView";
import { ActionPlanView } from "@/components/homepath/ActionPlanView";
import { TimelineView } from "@/components/homepath/TimelineView";
import { ProgramsView } from "@/components/homepath/ProgramsView";
import { DocumentAnalysisView } from "@/components/homepath/DocumentAnalysisView";
import { ResourcesView } from "@/components/homepath/ResourcesView";
import { GlossaryView } from "@/components/homepath/GlossaryView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AboutContent } from "@/components/homepath/AboutModal";
import { ResponsibleAIBanner } from "@/components/homepath/ResponsibleAIBanner";
import { Sidebar, MobileNav } from "@/components/homepath/Sidebar";
import { CrisisResourcesBar } from "@/components/homepath/CrisisResources";
import { CommandPalette } from "@/components/homepath/CommandPalette";
import { ErrorBoundary } from "@/components/homepath/ErrorBoundary";
import { LanguageProvider, useLanguage } from "@/components/homepath/LanguageProvider";
import { ThemeProvider } from "@/components/homepath/ThemeProvider";
import { useSessionPersistence } from "@/components/homepath/useSession";
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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const { savedAnalysis, savedProfile, hasSavedSession, saveSession, clearSession } =
    useSessionPersistence();

  // Check for saved session on mount
  useEffect(() => {
    if (hasSavedSession && savedAnalysis && savedProfile) {
      setShowResumePrompt(true);
    }
  }, [hasSavedSession, savedAnalysis, savedProfile]);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (phase === "app") {
          setCmdOpen((o) => !o);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase]);

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
        setProfile(p);
        saveSession(data.analysis, p);
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
    [language, saveSession]
  );

  const resumeSession = useCallback(() => {
    if (savedAnalysis && savedProfile) {
      setAnalysis(savedAnalysis);
      setProfile(savedProfile);
      setView("dashboard");
      setPhase("app");
      setShowResumePrompt(false);
    }
  }, [savedAnalysis, savedProfile]);

  const dismissResumePrompt = useCallback(() => {
    setShowResumePrompt(false);
    clearSession();
  }, [clearSession]);

  const restart = useCallback(() => {
    setPhase("landing");
    setDemoMode(false);
    setProfile(null);
    setAnalysis(null);
    setView("dashboard");
    setAnalyzeError(null);
    setProgressPct(0);
    clearSession();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [clearSession]);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
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

          {/* Resume session prompt */}
          {showResumePrompt && savedAnalysis && (
            <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
                <div>
                  <h3 className="font-serif-display text-base font-semibold text-foreground">
                    {t("resumeSession")}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {language === "es"
                      ? `Riesgo: ${savedAnalysis.riskScore}/100 (${savedAnalysis.riskLevel}) · Guardado ${new Date().toLocaleDateString()}`
                      : `Risk: ${savedAnalysis.riskScore}/100 (${savedAnalysis.riskLevel}) · Saved ${new Date().toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resumeSession}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    {language === "es" ? "Retomar" : "Resume"}
                  </button>
                  <button
                    onClick={dismissResumePrompt}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                  >
                    {language === "es" ? "Descartar" : "Dismiss"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <LandingHero
            onStart={() => startIntake(false)}
            onDemo={() => startIntake(true)}
          />
        </main>
        <footer className="mt-auto border-t border-border/60 bg-card/40 py-5">
          <div className="mx-auto max-w-6xl space-y-3 px-4 sm:px-6">
            <CrisisResourcesBar variant="footer" />
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
          <div className="mx-auto max-w-6xl space-y-2 px-4 sm:px-6">
            <CrisisResourcesBar variant="footer" />
            <div className="text-center text-xs text-muted-foreground">
              {t("footerDisclaimer")}
            </div>
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
          <div className="mx-auto max-w-6xl space-y-2 px-4 sm:px-6">
            <CrisisResourcesBar variant="footer" />
            <div className="text-center text-xs text-muted-foreground">
              {t("footerDisclaimer")}
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // phase === "app"
  if (!analysis) {
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
      <SiteHeader
        onRestart={restart}
        onAbout={() => setView("about")}
        onCommandPalette={() => setCmdOpen(true)}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6">
        <Sidebar
          view={view}
          onView={setView}
          analysis={analysis}
          progressPct={progressPct}
          onPrint={handlePrint}
        />
        <main className="flex-1 px-1 py-6 sm:px-6 lg:px-8">
          {/* Print-only header — only visible when printing */}
          <div className="print-only mb-6">
            <h1 className="font-serif-display text-3xl font-bold">HomePath AI — Action Plan</h1>
            <p className="text-sm text-muted-foreground">
              Generated {new Date().toLocaleDateString()} · Risk score: {analysis.riskScore}/100 ({analysis.riskLevel})
            </p>
            <hr className="my-4" />
          </div>

          <div className="mb-4 lg:hidden no-print">
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
            <div className="no-print">
              <ActionPlanView analysis={analysis} onProgressChange={setProgressPct} />
            </div>
          )}
          {view === "timeline" && <TimelineView analysis={analysis} />}
          {view === "programs" && <ProgramsView analysis={analysis} />}
          {view === "document-analysis" && <DocumentAnalysisView />}
          {view === "resources" && <ResourcesView analysis={analysis} />}
          {view === "glossary" && <GlossaryView />}
          {view === "about" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
                  About HomePath AI
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  An AI-powered Housing Stability Guide for families facing eviction.
                </p>
              </div>
              <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
                <CardContent className="p-6">
                  <AboutContent />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Print-only action plan */}
          <div className="print-only">
            <h2 className="font-serif-display text-xl font-bold mt-6 mb-3">Action Plan</h2>
            <PrintableActionPlan analysis={analysis} />
          </div>
        </main>
      </div>
      <MobileNav view={view} onView={setView} />
      <footer className="mt-auto border-t border-border/60 bg-card/40 py-3 no-print">
        <div className="mx-auto max-w-6xl space-y-2 px-4 sm:px-6">
          <CrisisResourcesBar variant="footer" />
          <div className="text-center text-[11px] text-muted-foreground">
            {t("footerDisclaimer")}
          </div>
        </div>
      </footer>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onView={setView}
        onRestart={restart}
      />
    </div>
  );
}

// Print-only action plan layout (checklist style)
function PrintableActionPlan({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="print-checklist space-y-4">
      {analysis.actionPlan.today.length > 0 && (
        <div>
          <h3 className="font-serif-display text-lg font-bold">Today</h3>
          <ul>
            {analysis.actionPlan.today.map((item) => (
              <li key={item.id}>
                <strong>{item.title}.</strong> {item.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
      {analysis.actionPlan.thisWeek.length > 0 && (
        <div>
          <h3 className="font-serif-display text-lg font-bold">This Week</h3>
          <ul>
            {analysis.actionPlan.thisWeek.map((item) => (
              <li key={item.id}>
                <strong>{item.title}.</strong> {item.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
      {analysis.actionPlan.backupPlan.length > 0 && (
        <div>
          <h3 className="font-serif-display text-lg font-bold">Backup Plan</h3>
          <ul>
            {analysis.actionPlan.backupPlan.map((item) => (
              <li key={item.id}>
                <strong>{item.title}.</strong> {item.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <HomeContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
