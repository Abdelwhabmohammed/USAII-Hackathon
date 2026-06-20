"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  FileCheck2,
  BookOpen,
  ListChecks,
  UserCog,
  Loader2,
  ExternalLink,
  Phone,
  AlertCircle,
  CircleCheck,
  Clock,
  CalendarDays,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type {
  AnalysisResult,
  EligibilityMatch,
  ResourceItem,
  RiskCategory,
  StreamChunk,
  SectionKey,
  UserProfile,
} from "@/lib/homepath/types";

interface SectionState {
  key: SectionKey;
  title: string;
  started: boolean;
  done: boolean;
}

const SECTION_META: Record<
  SectionKey,
  { icon: typeof Activity; label: string }
> = {
  situation: { icon: Activity, label: "Situation" },
  risk: { icon: ShieldAlert, label: "Risk" },
  eligibility: { icon: FileCheck2, label: "Eligibility" },
  resources: { icon: BookOpen, label: "Resources" },
  action: { icon: ListChecks, label: "Action Plan" },
  human: { icon: UserCog, label: "Human" },
};

export function ResultsView({
  profile,
  onRestart,
}: {
  profile: UserProfile;
  onRestart: () => void;
}) {
  const [sections, setSections] = useState<SectionState[]>([
    { key: "situation", title: "Understanding your situation", started: false, done: false },
    { key: "risk", title: "Risk assessment", started: false, done: false },
    { key: "eligibility", title: "Programs you may qualify for", started: false, done: false },
    { key: "resources", title: "Resources & where to start", started: false, done: false },
    { key: "action", title: "Your personalized action plan", started: false, done: false },
    { key: "human", title: "Connecting you with a human", started: false, done: false },
  ]);
  const [situationText, setSituationText] = useState("");
  const [result, setResult] = useState<Partial<AnalysisResult>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  const handleChunk = useCallback((chunk: StreamChunk) => {
    switch (chunk.type) {
      case "section":
        // Mark the new section as started and any earlier started sections as done
        setSections((prev) => {
          const idx = prev.findIndex((s) => s.key === chunk.section);
          if (idx === -1) return prev;
          return prev.map((s, i) => {
            if (i === idx) {
              return { ...s, title: chunk.title, started: true };
            }
            if (i < idx && s.started && !s.done) {
              return { ...s, done: true };
            }
            return s;
          });
        });
        break;
      case "delta":
        setSituationText((t) => t + chunk.text);
        break;
      case "data":
        setResult((r) => {
          const next = { ...r };
          for (const [k, v] of Object.entries(chunk.data)) {
            if (k === "eligibility") {
              const arr = (r.eligibility ?? []) as EligibilityMatch[];
              next.eligibility = [...arr, ...(v as EligibilityMatch[])];
            } else {
              // @ts-expect-error dynamic key
              next[k] = v;
            }
          }
          return next;
        });
        break;
      case "done":
        setSections((prev) => prev.map((s) => ({ ...s, done: true })));
        setDone(true);
        break;
      case "error":
        setError(chunk.message);
        break;
    }
  }, []);

  const startStream = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok || !res.body) {
        setError("Couldn't connect to the analysis service.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const chunk: StreamChunk = JSON.parse(json);
            handleChunk(chunk);
          } catch (e) {
            console.warn("Failed to parse chunk", e, json);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while analyzing your situation."
      );
    }
  }, [profile, handleChunk]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startStream();
  }, [startStream]);

  const activeSection = sections.findIndex((s) => s.started && !s.done);
  const overallConfidence = result.overallConfidence ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      {/* Top bar: progress + restart */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onRestart}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Start over
        </button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="hidden sm:inline">
            Analyzing your situation…
          </span>
          <div className="flex items-center gap-1.5">
            {sections.map((s, i) => (
              <div
                key={s.key}
                className={`h-1.5 rounded-full transition-all ${
                  s.done
                    ? "w-6 bg-primary"
                    : s.started
                    ? "w-8 bg-primary/60"
                    : i === activeSection
                    ? "w-8 bg-primary/40 animate-pulse"
                    : "w-4 bg-border"
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              We hit a snag
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={onRestart}
              className="mt-3 rounded-full"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Start over
            </Button>
          </div>
        </div>
      )}

      {/* Section navigation chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sections.map((s) => {
          const meta = SECTION_META[s.key];
          const Icon = meta.icon;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                s.done
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : s.started
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border bg-card/50 text-muted-foreground"
              }`}
            >
              {s.done ? (
                <CircleCheck className="h-3 w-3" />
              ) : s.started ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              {meta.label}
            </div>
          );
        })}
      </div>

      {/* 1. Situation summary */}
      <SectionShell
        started={sections[0].started}
        done={sections[0].done}
        icon={Activity}
        title={sections[0].title}
      >
        <p
          className={`prose-calm text-base leading-relaxed text-foreground ${
            !sections[0].done ? "streaming-cursor" : ""
          }`}
        >
          {situationText || (
            <span className="text-muted-foreground">
              Listening to what you shared…
            </span>
          )}
        </p>
      </SectionShell>

      {/* 2. Risk assessment */}
      <SectionShell
        started={sections[1].started}
        done={sections[1].done}
        icon={ShieldAlert}
        title={sections[1].title}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(result.riskAssessment ?? []).map((r: RiskCategory, i) => (
            <RiskCard key={i} risk={r} />
          ))}
          {!sections[1].done && (result.riskAssessment ?? []).length === 0 && (
            <SkeletonCard />
          )}
        </div>
      </SectionShell>

      {/* 3. Eligibility */}
      <SectionShell
        started={sections[2].started}
        done={sections[2].done}
        icon={FileCheck2}
        title={sections[2].title}
      >
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Important:</strong> These are{" "}
            <em>&ldquo;you may qualify&rdquo;</em> matches — not guarantees.
            Always verify with the program directly.
          </span>
        </div>
        <div className="space-y-3">
          {(result.eligibility ?? []).map((m: EligibilityMatch, i) => (
            <EligibilityCard key={i} match={m} index={i} />
          ))}
          {!sections[2].done && (result.eligibility ?? []).length === 0 && (
            <SkeletonCard />
          )}
        </div>
      </SectionShell>

      {/* 4. Resources */}
      <SectionShell
        started={sections[3].started}
        done={sections[3].done}
        icon={BookOpen}
        title={sections[3].title}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(result.resources ?? []).map((r: ResourceItem, i) => (
            <ResourceCard key={i} resource={r} />
          ))}
          {!sections[3].done && (result.resources ?? []).length === 0 && (
            <SkeletonCard />
          )}
        </div>
      </SectionShell>

      {/* 5. Action plan */}
      <SectionShell
        started={sections[4].started}
        done={sections[4].done}
        icon={ListChecks}
        title={sections[4].title}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <ActionColumn
            icon={Clock}
            label="Today"
            color="primary"
            items={result.actionPlan?.today ?? []}
          />
          <ActionColumn
            icon={CalendarDays}
            label="This week"
            color="accent"
            items={result.actionPlan?.thisWeek ?? []}
          />
          <ActionColumn
            icon={ShieldAlert}
            label="Backup plan"
            color="muted"
            items={result.actionPlan?.backup ?? []}
          />
        </div>
      </SectionShell>

      {/* 6. Human escalation */}
      {result.humanEscalation?.triggered && (
        <SectionShell
          started={sections[5].started}
          done={sections[5].done}
          icon={UserCog}
          title={sections[5].title}
        >
          <div className="rounded-2xl border border-rose-300/50 bg-rose-50/70 p-5">
            <div className="mb-3 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-rose-700" />
              <h4 className="font-serif-display text-lg font-semibold text-rose-900">
                We'd feel better if a human helped you with this.
              </h4>
            </div>
            <ul className="mb-4 space-y-1.5 text-sm text-rose-800">
              {result.humanEscalation.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-600" />
                  {r}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {result.humanEscalation.referrals.map((r, i) => (
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
        </SectionShell>
      )}

      {/* Final: confidence + caveats + restart */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <Card className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-card">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Overall confidence
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-serif-display text-3xl font-bold text-foreground">
                      {overallConfidence}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      confidence in this interpretation
                    </span>
                  </div>
                </div>
                <div className="w-full max-w-xs">
                  <Progress
                    value={overallConfidence}
                    className="h-2 bg-secondary"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Lower confidence = please verify with a counselor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.caveats && result.caveats.length > 0 && (
            <div className="space-y-2">
              {result.caveats.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={onRestart}
              className="rounded-full bg-primary px-6 shadow-sm hover:bg-primary/90"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start a new session
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-primary/30 bg-card px-6 text-primary hover:bg-primary/5"
            >
              <a
                href="https://www.211.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call 211 for live help
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === Sub-components ===========================================================

function SectionShell({
  started,
  done,
  icon: Icon,
  title,
  children,
}: {
  started: boolean;
  done: boolean;
  icon: typeof Activity;
  title: string;
  children: React.ReactNode;
}) {
  if (!started) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            done
              ? "bg-primary/10 text-primary"
              : "bg-primary/5 text-primary animate-pulse"
          }`}
        >
          {done ? (
            <CircleCheck className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </span>
        <h3 className="font-serif-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
        <CardContent className="p-5 sm:p-6">{children}</CardContent>
      </Card>
    </motion.section>
  );
}

function RiskCard({ risk }: { risk: RiskCategory }) {
  const styles: Record<RiskCategory["level"], string> = {
    Critical: "border-rose-300/60 bg-rose-50/70 text-rose-900",
    High: "border-amber-300/60 bg-amber-50/70 text-amber-900",
    Moderate: "border-yellow-300/50 bg-yellow-50/60 text-yellow-900",
    Low: "border-emerald-300/50 bg-emerald-50/60 text-emerald-900",
  };
  const dotColor: Record<RiskCategory["level"], string> = {
    Critical: "bg-rose-600",
    High: "bg-amber-500",
    Moderate: "bg-yellow-400",
    Low: "bg-emerald-500",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${styles[risk.level]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor[risk.level]}`} />
          <span className="text-sm font-semibold">{risk.label}</span>
        </div>
        <Badge
          variant="outline"
          className={`border-current/30 bg-white/60 text-[10px] uppercase tracking-wide`}
        >
          {risk.level}
        </Badge>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed opacity-90">{risk.note}</p>
    </div>
  );
}

function EligibilityCard({
  match,
  index,
}: {
  match: EligibilityMatch;
  index: number;
}) {
  const matchStyles: Record<EligibilityMatch["matchLevel"], string> = {
    "High Probability": "border-emerald-300/60 bg-emerald-50/60 text-emerald-900",
    "Possible Match": "border-amber-300/50 bg-amber-50/60 text-amber-900",
    "Requires Verification":
      "border-yellow-300/50 bg-yellow-50/60 text-yellow-900",
  };
  const confColor =
    match.confidence >= 75
      ? "text-emerald-600"
      : match.confidence >= 50
      ? "text-amber-600"
      : "text-yellow-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif-display text-base font-semibold text-foreground sm:text-lg">
              {match.program}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Source:{" "}
            <a
              href={match.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              {match.sourceName}
              <ExternalLink className="ml-0.5 inline h-3 w-3" />
            </a>
          </p>
        </div>
        <div className="text-right">
          <div className={`font-serif-display text-2xl font-bold ${confColor}`}>
            {match.confidence}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            confidence
          </div>
        </div>
      </div>

      <div
        className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${matchStyles[match.matchLevel]}`}
      >
        {match.matchLevel}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        <span className="font-medium text-primary">Why this may fit: </span>
        {match.why}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Eligibility conditions
          </div>
          <ul className="space-y-1">
            {match.conditions.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs text-foreground"
              >
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Documents you'll need
          </div>
          <ul className="space-y-1">
            {match.documents.map((d, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs text-foreground"
              >
                <FileCheck2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {match.applicationLink && (
        <div className="mt-4">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-primary text-xs hover:bg-primary/90"
          >
            <a
              href={match.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply here
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const urgencyStyles: Record<ResourceItem["urgency"], string> = {
    Immediate: "border-rose-300/60 bg-rose-50/40 text-rose-700",
    "This Week": "border-amber-300/60 bg-amber-50/40 text-amber-700",
    "When Ready": "border-emerald-300/50 bg-emerald-50/40 text-emerald-700",
  };
  const typeIcons: Record<ResourceItem["type"], string> = {
    Government: "🏛",
    Community: "🤝",
    "Legal Aid": "⚖️",
    Emergency: "🚨",
    Counseling: "💬",
  };
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-xl" aria-hidden>
            {typeIcons[resource.type]}
          </span>
          <div>
            <h4 className="font-serif-display text-sm font-semibold leading-snug text-foreground">
              {resource.name}
            </h4>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {resource.type}
            </div>
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition group-hover:text-primary" />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {resource.description}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${urgencyStyles[resource.urgency]}`}
        >
          {resource.urgency}
        </span>
        {resource.phone && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {resource.phone}
          </span>
        )}
      </div>
    </a>
  );
}

function ActionColumn({
  icon: Icon,
  label,
  color,
  items,
}: {
  icon: typeof Clock;
  label: string;
  color: "primary" | "accent" | "muted";
  items: { title: string; detail: string }[];
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent-foreground/10 text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${colorMap[color]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h4 className="font-serif-display text-sm font-semibold uppercase tracking-wider text-foreground">
          {label}
        </h4>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No items.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="rounded-lg border border-border/40 bg-background/60 p-2.5"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-current/30 text-[10px] text-muted-foreground">
                  {i + 1}
                </span>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="col-span-full">
      <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
    </div>
  );
}
