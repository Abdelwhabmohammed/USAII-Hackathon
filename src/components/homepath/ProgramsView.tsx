"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROGRAMS } from "@/lib/homepath/knowledge";
import type {
  AnalysisResult,
  EligibilityMatch,
} from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";

const CATEGORIES = [
  "Rental Assistance",
  "Legal Aid",
  "Food & Cash",
  "Emergency Housing",
  "Utility",
  "Counseling",
] as const;

export function ProgramsView({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  // Map program name → eligibility match (if any)
  const matchByName = useMemo(() => {
    const m = new Map<string, EligibilityMatch>();
    for (const e of analysis.eligibility) {
      m.set(e.program.toLowerCase(), e);
    }
    return m;
  }, [analysis.eligibility]);

  // Filter the knowledge base programs
  const filtered = useMemo(() => {
    return PROGRAMS.filter((p) => {
      // Category filter
      if (category !== "all") {
        // Match by inspecting the program's `appliesTo` and source — but our knowledge base
        // doesn't have explicit category, so we infer from name + agency.
        const progCat = inferCategory(p.name, p.agency);
        if (progCat !== category) return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.agency.toLowerCase().includes(q) ||
          p.eligibility.some((e) => e.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
          {t("programsTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("programsSubtitle")}
        </p>
      </div>

      {/* Important reminder */}
      <div className="flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-900">
        <ShieldCheck className="h-4 w-4 flex-shrink-0" />
        <span>
          {t("mayQualifyBadge")} — {t("notLegalAdvice")}
        </span>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 rounded-full border-border/60 bg-card pl-9 pr-4 text-sm focus-visible:ring-primary"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11 w-full rounded-full border-border/60 bg-card text-sm sm:w-56">
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel(c, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Programs grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-border/60 bg-card/60">
          <CardContent className="p-8 text-center">
            <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("noResults")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((p, i) => {
            const match = matchByName.get(p.name.toLowerCase());
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <ProgramCard
                  name={p.name}
                  agency={p.agency}
                  url={p.url}
                  description={p.description}
                  eligibility={p.eligibility}
                  documents={p.documents}
                  match={match}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramCard({
  name,
  agency,
  url,
  description,
  eligibility,
  documents,
  match,
}: {
  name: string;
  agency: string;
  url: string;
  description: string;
  eligibility: string[];
  documents: string[];
  match?: EligibilityMatch;
}) {
  const { t } = useLanguage();
  const category = inferCategory(name, agency);
  const matchStyle = match
    ? match.matchLevel === "High Probability"
      ? "border-emerald-300/60 bg-emerald-50/60 text-emerald-900"
      : match.matchLevel === "Possible Match"
      ? "border-amber-300/50 bg-amber-50/60 text-amber-900"
      : "border-yellow-300/50 bg-yellow-50/60 text-yellow-900"
    : null;
  const matchLabel = match
    ? match.matchLevel === "High Probability"
      ? t("matchHigh")
      : match.matchLevel === "Possible Match"
      ? t("matchPossible")
      : t("matchRequires")
    : null;

  return (
    <Card className="h-full rounded-2xl border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-display text-lg font-semibold text-foreground">
              {name}
            </h3>
            {match && (
              <CheckCircle2 className="h-4 w-4 text-primary" aria-label="Match" />
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-border/60 bg-secondary/40 text-[10px] text-secondary-foreground"
            >
              {categoryLabel(category, t)}
            </Badge>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline"
            >
              {agency}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
        {match && (
          <div className="text-right">
            <div className="font-serif-display text-2xl font-bold text-primary">
              {match.confidence}%
            </div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {t("confidence")}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">{description}</p>

      {match && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${matchStyle}`}
        >
          <div className="font-semibold">{matchLabel}</div>
          <p className="mt-0.5 leading-relaxed">{match.why}</p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("eligibility")}
          </div>
          <ul className="space-y-1">
            {eligibility.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs text-foreground"
              >
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
                {e}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("documentsNeeded")}
          </div>
          <ul className="space-y-1">
            {documents.map((d, i) => (
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

      <div className="mt-4">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 rounded-full border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t("viewWebsite")}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

function inferCategory(name: string, agency: string): (typeof CATEGORIES)[number] {
  const text = `${name} ${agency}`.toLowerCase();
  if (text.includes("legal") || text.includes("lsc")) return "Legal Aid";
  if (text.includes("snap") || text.includes("tanf") || text.includes("food"))
    return "Food & Cash";
  if (text.includes("liheap") || text.includes("utility") || text.includes("energy"))
    return "Utility";
  if (text.includes("shelter") || text.includes("coc") || text.includes("continuum") || text.includes("voucher"))
    return "Emergency Housing";
  if (text.includes("counseling") || text.includes("211") || text.includes("hotline"))
    return "Counseling";
  return "Rental Assistance";
}

function categoryLabel(
  cat: string,
  t: ReturnType<typeof useLanguage>["t"]
): string {
  switch (cat) {
    case "Rental Assistance":
      return t("catRental");
    case "Legal Aid":
      return t("catLegal");
    case "Food & Cash":
      return t("catFood");
    case "Emergency Housing":
      return t("catEmergency");
    case "Utility":
      return t("catUtility");
    case "Counseling":
      return t("catCounseling");
    default:
      return cat;
  }
}
