"use client";

import { motion } from "framer-motion";
import {
  LifeBuoy,
  ExternalLink,
  Phone,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, ResourceItem } from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";

const EXTRA_RESOURCES: ResourceItem[] = [
  {
    name: "National Low Income Housing Coalition",
    type: "Community",
    description:
      "Advocacy organization with deep resources on rental assistance, vouchers, and housing policy.",
    url: "https://nlihc.org/",
    urgency: "When Ready",
  },
  {
    name: "Consumer Financial Protection Bureau — Housing",
    type: "Government",
    description:
      "Federal resource on tenant rights, mortgage relief, and avoiding housing scams.",
    url: "https://www.consumerfinance.gov/housing/",
    urgency: "When Ready",
  },
  {
    name: "Just Shelter",
    type: "Community",
    description:
      "Directory of over 1,200 organizations providing shelter and homelessness prevention services.",
    url: "https://justshelter.org/",
    urgency: "This Week",
  },
  {
    name: "Eviction Lab",
    type: "Community",
    description:
      "Princeton University research project with eviction data, tenant rights by state, and policy resources.",
    url: "https://evictionlab.org/",
    urgency: "When Ready",
  },
];

export function ResourcesView({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useLanguage();
  const allResources = [...analysis.resources, ...EXTRA_RESOURCES];

  const immediate = allResources.filter((r) => r.urgency === "Immediate");
  const thisWeek = allResources.filter((r) => r.urgency === "This Week");
  const whenReady = allResources.filter((r) => r.urgency === "When Ready");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
          {t("resourcesTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("resourcesSubtitle")}
        </p>
      </div>

      {/* Escalation alert */}
      {analysis.escalationRequired && (
        <Card className="rounded-2xl border-rose-300/60 bg-rose-50/70 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-700" />
              <div>
                <p className="text-sm font-semibold text-rose-900">
                  {t("escalationTitle")}
                </p>
                <p className="mt-1 text-xs text-rose-800">
                  {analysis.humanEscalation.reasons[0] ||
                    (t("referrals") + ": " + analysis.humanEscalation.referrals.join(", "))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 211 call CTA */}
      <Card className="overflow-hidden rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-card shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <div className="font-serif-display text-lg font-semibold text-foreground">
                {t("callNow")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("urgencyImmediate")} — {t("guidanceOnly")}
              </div>
            </div>
          </div>
          <Button
            asChild
            className="rounded-full bg-primary px-5 text-sm font-medium shadow-sm hover:bg-primary/90"
          >
            <a href="https://www.211.org/" target="_blank" rel="noopener noreferrer">
              2-1-1
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Urgent resources */}
      <ResourceSection
        title={t("urgencyImmediate")}
        icon={AlertTriangle}
        resources={immediate}
        accent="rose"
      />
      <ResourceSection
        title={t("urgencyThisWeek")}
        icon={Clock}
        resources={thisWeek}
        accent="amber"
      />
      <ResourceSection
        title={t("urgencyWhenReady")}
        icon={LifeBuoy}
        resources={whenReady}
        accent="emerald"
      />
    </div>
  );
}

function ResourceSection({
  title,
  icon: Icon,
  resources,
  accent,
}: {
  title: string;
  icon: typeof Clock;
  resources: ResourceItem[];
  accent: "rose" | "amber" | "emerald";
}) {
  const accentMap = {
    rose: "bg-rose-50 text-rose-700 border-rose-300/60",
    amber: "bg-amber-50 text-amber-700 border-amber-300/60",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-300/60",
  };

  if (resources.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${accentMap[accent]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h2 className="font-serif-display text-lg font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r, i) => (
          <ResourceCard key={`${r.name}-${i}`} resource={r} />
        ))}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const { t } = useLanguage();
  const typeIcons: Record<ResourceItem["type"], string> = {
    Government: "🏛",
    Community: "🤝",
    "Legal Aid": "⚖️",
    Emergency: "🚨",
    Counseling: "💬",
  };
  const urgencyStyle: Record<ResourceItem["urgency"], string> = {
    Immediate: "border-rose-300/60 bg-rose-50/40 text-rose-700",
    "This Week": "border-amber-300/60 bg-amber-50/40 text-amber-700",
    "When Ready": "border-emerald-300/50 bg-emerald-50/40 text-emerald-700",
  };
  const urgencyLabel: Record<ResourceItem["urgency"], string> = {
    Immediate: t("urgencyImmediate"),
    "This Week": t("urgencyThisWeek"),
    "When Ready": t("urgencyWhenReady"),
  };

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-xl" aria-hidden>
            {typeIcons[resource.type]}
          </span>
          <div>
            <h3 className="font-serif-display text-sm font-semibold leading-snug text-foreground">
              {resource.name}
            </h3>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {resource.type}
            </div>
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition group-hover:text-primary" />
      </div>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {resource.description}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${urgencyStyle[resource.urgency]}`}
        >
          {urgencyLabel[resource.urgency]}
        </span>
        {resource.phone && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {resource.phone}
          </span>
        )}
      </div>
    </motion.a>
  );
}
