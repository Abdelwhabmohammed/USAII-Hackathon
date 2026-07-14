"use client";

import { motion } from "framer-motion";
import { Clock, CalendarDays, ShieldAlert, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, ActionItem } from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./useProgress";

export function TimelineView({ analysis }: { analysis: AnalysisResult }) {
  const { t, language } = useLanguage();
  const { isDone } = useProgress();

  // Build a timeline of events from the analysis
  const events: {
    when: string;
    whenLabel: string;
    icon: typeof Clock;
    color: string;
    items: { item: ActionItem; section: string }[];
  }[] = [
    {
      when: "today",
      whenLabel: language === "es" ? "Hoy" : "Today",
      icon: Clock,
      color: "primary",
      items: analysis.actionPlan.today.map((item) => ({ item, section: "today" })),
    },
    {
      when: "thisWeek",
      whenLabel: language === "es" ? "Esta semana" : "This week",
      icon: CalendarDays,
      color: "accent",
      items: analysis.actionPlan.thisWeek.map((item) => ({ item, section: "thisWeek" })),
    },
    {
      when: "backup",
      whenLabel: language === "es" ? "Plan de respaldo" : "Backup plan",
      icon: ShieldAlert,
      color: "muted",
      items: analysis.actionPlan.backupPlan.map((item) => ({ item, section: "backupPlan" })),
    },
  ];

  // Add deadline events from document analysis if available
  // (We don't have document analysis in this view's scope, but we could pass it in)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
          {language === "es" ? "Cronología de acciones" : "Action timeline"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {language === "es"
            ? "Una vista cronológica de lo que debes hacer y cuándo."
            : "A chronological view of what to do and when."}
        </p>
      </div>

      {/* Escalation alert */}
      {analysis.escalationRequired && (
        <Card className="rounded-2xl border-rose-300/60 bg-rose-50/70 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            <div>
              <p className="text-sm font-semibold text-rose-900">
                {language === "es"
                  ? "Habla con un humano primero"
                  : "Talk to a human first"}
              </p>
              <p className="mt-1 text-xs text-rose-800">
                {analysis.humanEscalation.reasons[0] ||
                  (language === "es"
                    ? "Tu situación requiere apoyo humano."
                    : "Your situation requires human support.")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-border sm:left-6" />

        <div className="space-y-8">
          {events.map((event, eventIdx) => {
            const doneCount = event.items.filter(({ item, section }) =>
              isDone(`${section}:${item.id}`)
            ).length;
            const Icon = event.icon;
            const colorMap: Record<string, string> = {
              primary: "bg-primary text-primary-foreground",
              accent: "bg-accent-foreground text-accent",
              muted: "bg-muted-foreground text-background",
            };

            return (
              <motion.div
                key={event.when}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: eventIdx * 0.1 }}
                className="relative pl-14 sm:pl-16"
              >
                {/* Dot on timeline */}
                <div
                  className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full ${colorMap[event.color]} shadow-sm sm:h-12 sm:w-12`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                {/* Event content */}
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-serif-display text-lg font-semibold text-foreground">
                    {event.whenLabel}
                  </h3>
                  {event.items.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/5 text-[11px] text-primary"
                    >
                      {doneCount}/{event.items.length}
                    </Badge>
                  )}
                </div>

                {event.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {language === "es" ? "Sin elementos." : "No items."}
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {event.items.map(({ item, section }, i) => {
                      const done = isDone(`${section}:${item.id}`);
                      return (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: 0.05 * i }}
                          className={`rounded-xl border p-3 transition ${
                            done
                              ? "border-primary/30 bg-primary/5"
                              : "border-border/50 bg-card/60"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {done ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            ) : (
                              <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <div
                                className={`text-sm font-semibold ${
                                  done ? "text-muted-foreground line-through" : "text-foreground"
                                }`}
                              >
                                {item.title}
                              </div>
                              <div
                                className={`mt-0.5 text-xs leading-relaxed ${
                                  done ? "text-muted-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {item.detail}
                              </div>
                              {item.estimatedMinutes && !done && (
                                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="h-2.5 w-2.5" />
                                  ~{item.estimatedMinutes} {language === "es" ? "min" : "min"}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

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
