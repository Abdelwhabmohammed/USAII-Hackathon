"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ShieldAlert,
  FileCheck2,
  AlertCircle,
  UserCog,
  ArrowRight,
  ListChecks,
  Building2,
  FileSearch,
  LifeBuoy,
  Sparkles,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  AnalysisResult,
  AppView,
  RiskCategory,
  EligibilityMatch,
  RiskLevel,
} from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; bar: string }> = {
  Low: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  Moderate: { bg: "bg-yellow-50", text: "text-yellow-700", bar: "bg-yellow-500" },
  High: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  Critical: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500" },
};

export function DashboardView({
  analysis,
  onView,
  progressPct,
}: {
  analysis: AnalysisResult;
  onView: (v: AppView) => void;
  progressPct: number;
}) {
  const { t } = useLanguage();
  const riskColor = RISK_COLORS[analysis.riskLevel];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
          {t("dashboardTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("dashboardSubtitle")}
        </p>
      </div>

      {/* Top row: Risk score + Confidence + Progress */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Risk Score Card */}
        <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("riskScore")}
              </span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-serif-display text-5xl font-bold text-foreground">
                {analysis.riskScore}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.riskScore}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`h-full rounded-full ${riskColor.bar}`}
              />
            </div>
            <div
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${riskColor.bg} ${riskColor.text}`}
            >
              {t("riskLevel")}:{" "}
              {analysis.riskLevel === "Critical"
                ? t("riskCritical")
                : analysis.riskLevel === "High"
                ? t("riskHigh")
                : analysis.riskLevel === "Moderate"
                ? t("riskModerate")
                : t("riskLow")}
            </div>
          </CardContent>
        </Card>

        {/* Confidence Card */}
        <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("confidence")}
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-serif-display text-5xl font-bold text-foreground">
                {analysis.confidenceScore}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.confidenceScore}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {t("confidence")}:{" "}
              {analysis.confidenceLabel === "High"
                ? t("confHigh")
                : analysis.confidenceLabel === "Moderate"
                ? t("confModerate")
                : t("confLow")}
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("progress")}
              </span>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-serif-display text-5xl font-bold text-foreground">
                {progressPct}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView("action-plan")}
              className="mt-3 h-8 w-full rounded-full border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10"
            >
              {t("viewActionPlan")}
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Escalation alert */}
      {analysis.escalationRequired && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-2xl border-rose-300/60 bg-rose-50/70 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-rose-200/70">
                  <UserCog className="h-5 w-5 text-rose-700" />
                </span>
                <div className="flex-1">
                  <h3 className="font-serif-display text-lg font-semibold text-rose-900">
                    {t("escalationTitle")}
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-rose-800">
                    {analysis.humanEscalation.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-600" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.humanEscalation.referrals.map((r, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-rose-300 bg-white px-3 py-1 text-xs text-rose-800"
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Situation summary */}
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("situationSummary")}
            </h3>
          </div>
          <p className="text-base leading-relaxed text-foreground">
            {analysis.situationSummary}
          </p>
        </CardContent>
      </Card>

      {/* Risk assessment */}
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("riskAssessment")}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.riskAssessment.map((r: RiskCategory, i) => (
              <RiskCard key={i} risk={r} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top eligible programs (preview) */}
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("eligiblePrograms")}
              </h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView("programs")}
              className="h-7 rounded-full text-xs text-primary hover:bg-primary/5"
            >
              {t("viewAllPrograms")}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {analysis.eligibility.slice(0, 3).map((m: EligibilityMatch, i) => (
              <EligibilityPreview key={i} match={m} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("quickActions")}
            </h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              icon={ListChecks}
              label={t("viewActionPlan")}
              onClick={() => onView("action-plan")}
            />
            <QuickAction
              icon={Building2}
              label={t("viewAllPrograms")}
              onClick={() => onView("programs")}
            />
            <QuickAction
              icon={FileSearch}
              label={t("analyzeDocument")}
              onClick={() => onView("document-analysis")}
            />
            <QuickAction
              icon={LifeBuoy}
              label={t("navResources")}
              onClick={() => onView("resources")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Caveats */}
      <div className="space-y-2">
        {analysis.caveats.map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskCard({ risk }: { risk: RiskCategory }) {
  const { t } = useLanguage();
  const color = RISK_COLORS[risk.level];
  return (
    <div className={`rounded-xl border border-border/60 ${color.bg} px-4 py-3`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{risk.label}</span>
        <Badge
          variant="outline"
          className={`border-current/30 bg-white/60 text-[10px] uppercase tracking-wide ${color.text}`}
        >
          {risk.level === "Critical"
            ? t("riskCritical")
            : risk.level === "High"
            ? t("riskHigh")
            : risk.level === "Moderate"
            ? t("riskModerate")
            : t("riskLow")}
        </Badge>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {risk.note}
      </p>
    </div>
  );
}

function EligibilityPreview({ match }: { match: EligibilityMatch }) {
  const { t } = useLanguage();
  const matchStyle =
    match.matchLevel === "High Probability"
      ? "border-emerald-300/60 bg-emerald-50/60 text-emerald-900"
      : match.matchLevel === "Possible Match"
      ? "border-amber-300/50 bg-amber-50/60 text-amber-900"
      : "border-yellow-300/50 bg-yellow-50/60 text-yellow-900";
  const label =
    match.matchLevel === "High Probability"
      ? t("matchHigh")
      : match.matchLevel === "Possible Match"
      ? t("matchPossible")
      : t("matchRequires");

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{match.program}</div>
          <a
            href={match.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline"
          >
            {match.sourceName}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
        <div className="text-right">
          <div className="font-serif-display text-xl font-bold text-primary">
            {match.confidence}%
          </div>
        </div>
      </div>
      <span
        className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${matchStyle}`}
      >
        {label}
      </span>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {match.why}
      </p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Clock;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1">{label}</span>
      <ArrowRight className="h-3 w-3 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
