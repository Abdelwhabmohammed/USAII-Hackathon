"use client";

import { motion } from "framer-motion";
import {
  Clock,
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  Circle,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult, ActionItem } from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./useProgress";

export function ActionPlanView({
  analysis,
  onProgressChange,
}: {
  analysis: AnalysisResult;
  onProgressChange?: (pct: number) => void;
}) {
  const { t } = useLanguage();
  const { isDone, toggle, reset } = useProgress();

  const allItems: { item: ActionItem; section: string }[] = [
    ...analysis.actionPlan.today.map((item) => ({ item, section: "today" })),
    ...analysis.actionPlan.thisWeek.map((item) => ({ item, section: "thisWeek" })),
    ...analysis.actionPlan.backupPlan.map((item) => ({ item, section: "backupPlan" })),
  ];

  const doneCount = allItems.filter(({ item, section }) =>
    isDone(`${section}:${item.id}`)
  ).length;
  const pct = allItems.length === 0 ? 0 : Math.round((doneCount / allItems.length) * 100);

  // Notify parent when progress changes (effect-free: call inline)
  // We rely on a small wrapper that re-runs on every render.
  if (onProgressChange) {
    queueMicrotask(() => onProgressChange(pct));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
            {t("actionPlanTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("actionPlanSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("progress")}
            </div>
            <div className="font-serif-display text-2xl font-bold text-primary">
              {pct}%
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Overall progress bar */}
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {doneCount} {t("of")} {allItems.length} {t("completed").toLowerCase()}
            </span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2 bg-secondary" />
        </CardContent>
      </Card>

      {/* Three columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ActionColumn
          icon={Clock}
          label={t("today")}
          color="primary"
          items={analysis.actionPlan.today}
          section="today"
          isDone={isDone}
          onToggle={toggle}
        />
        <ActionColumn
          icon={CalendarDays}
          label={t("thisWeek")}
          color="accent"
          items={analysis.actionPlan.thisWeek}
          section="thisWeek"
          isDone={isDone}
          onToggle={toggle}
        />
        <ActionColumn
          icon={ShieldAlert}
          label={t("backupPlan")}
          color="muted"
          items={analysis.actionPlan.backupPlan}
          section="backupPlan"
          isDone={isDone}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}

function ActionColumn({
  icon: Icon,
  label,
  color,
  items,
  section,
  isDone,
  onToggle,
}: {
  icon: typeof Clock;
  label: string;
  color: "primary" | "accent" | "muted";
  items: ActionItem[];
  section: string;
  isDone: (key: string) => boolean;
  onToggle: (key: string) => void;
}) {
  const { t } = useLanguage();
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent-foreground/10 text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  const doneCount = items.filter((item) => isDone(`${section}:${item.id}`)).length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${colorMap[color]}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-serif-display text-sm font-semibold uppercase tracking-wider text-foreground">
            {label}
          </h3>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {doneCount}/{items.length}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("noItems")}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => {
            const key = `${section}:${item.id}`;
            const done = isDone(key);
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className={`rounded-lg border p-2.5 transition ${
                  done
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/40 bg-background/60"
                }`}
              >
                <button
                  onClick={() => onToggle(key)}
                  className="flex w-full items-start gap-2 text-left"
                  aria-label={done ? t("markIncomplete") : t("markComplete")}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div
                      className={`text-xs font-semibold ${
                        done ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </div>
                    <div
                      className={`mt-0.5 text-[11px] leading-relaxed ${
                        done ? "text-muted-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {item.detail}
                    </div>
                    {item.estimatedMinutes && !done && (
                      <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        ~{item.estimatedMinutes} {t("estMinutes")}
                      </div>
                    )}
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
