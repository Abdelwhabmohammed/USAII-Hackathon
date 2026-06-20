"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  FileSearch,
  LifeBuoy,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import type { AppView } from "@/lib/homepath/types";
import type { AnalysisResult } from "@/lib/homepath/types";

interface SidebarProps {
  view: AppView;
  onView: (v: AppView) => void;
  analysis: AnalysisResult;
  progressPct: number;
}

export function Sidebar({ view, onView, analysis, progressPct }: SidebarProps) {
  const { t } = useLanguage();

  const items: { key: AppView; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: t("navDashboard") },
    { key: "action-plan", icon: ListChecks, label: t("navActionPlan") },
    { key: "programs", icon: Building2, label: t("navPrograms") },
    { key: "document-analysis", icon: FileSearch, label: t("navDocument") },
    { key: "resources", icon: LifeBuoy, label: t("navResources") },
  ];

  const riskColor =
    analysis.riskLevel === "Critical"
      ? "text-rose-600 bg-rose-50"
      : analysis.riskLevel === "High"
      ? "text-amber-600 bg-amber-50"
      : analysis.riskLevel === "Moderate"
      ? "text-yellow-700 bg-yellow-50"
      : "text-emerald-700 bg-emerald-50";

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-border/60 bg-card/40 p-4 lg:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onView(item.key)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Risk summary card */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card/80 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("riskScore")}
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-serif-display text-3xl font-bold text-foreground">
            {analysis.riskScore}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <div
          className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${riskColor}`}
        >
          {analysis.riskLevel === "Critical"
            ? t("riskCritical")
            : analysis.riskLevel === "High"
            ? t("riskHigh")
            : analysis.riskLevel === "Moderate"
            ? t("riskModerate")
            : t("riskLow")}
        </div>
      </div>

      {/* Progress card */}
      <div className="mt-3 rounded-2xl border border-border/60 bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("progress")}
          </div>
          <span className="text-xs font-semibold text-primary">
            {progressPct}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="mt-1.5 text-[10px] text-muted-foreground">
          {t("actionPlanSubtitle")}
        </div>
      </div>

      {/* Escalation alert */}
      {analysis.escalationRequired && (
        <div className="mt-3 rounded-2xl border border-rose-300/60 bg-rose-50/70 p-3">
          <div className="flex items-center gap-1.5 text-rose-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {t("referrals")}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-rose-700">
            {analysis.humanEscalation.reasons[0] || t("escalationTitle")}
          </p>
        </div>
      )}
    </aside>
  );
}

// Mobile bottom-nav variant (shown on small screens)
export function MobileNav({
  view,
  onView,
}: {
  view: AppView;
  onView: (v: AppView) => void;
}) {
  const { t } = useLanguage();
  const items: { key: AppView; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: t("navDashboard") },
    { key: "action-plan", icon: ListChecks, label: t("navActionPlan") },
    { key: "programs", icon: Building2, label: t("navPrograms") },
    { key: "document-analysis", icon: FileSearch, label: t("navDocument") },
    { key: "resources", icon: LifeBuoy, label: t("navResources") },
  ];

  return (
    <nav className="sticky bottom-0 z-30 flex w-full justify-around border-t border-border/60 bg-card/95 backdrop-blur lg:hidden">
      {items.map((item) => {
        const isActive = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onView(item.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span className="leading-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
