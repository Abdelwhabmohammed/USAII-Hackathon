"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  HeartHandshake,
  Sparkles,
  Clock,
  Users,
  Building2,
  ScrollText,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "./LanguageProvider";

const STATS = [
  { icon: Clock, key: "stat1Value" as const, labelKey: "stat1Label" as const, value: { en: "7-step", es: "7-pasos" }, label: { en: "Guided journey", es: "Recorrido guiado" } },
  { icon: Users, key: "stat2Value" as const, labelKey: "stat2Label" as const, value: { en: "10+", es: "10+" }, label: { en: "Real programs", es: "Programas reales" } },
  { icon: Building2, key: "stat3Value" as const, labelKey: "stat3Label" as const, value: { en: "Federal", es: "Federal" }, label: { en: "HUD · Treasury · HHS", es: "HUD · Tesoro · HHS" } },
];

export function LandingHero({
  onStart,
  onDemo,
}: {
  onStart: () => void;
  onDemo: () => void;
}) {
  const { t, language } = useLanguage();

  const FEATURES = [
    { icon: Sparkles, title: t("featureSituationTitle"), desc: t("featureSituationDesc") },
    { icon: HeartHandshake, title: t("featureEligibilityTitle"), desc: t("featureEligibilityDesc") },
    { icon: ScrollText, title: t("featureActionPlanTitle"), desc: t("featureActionPlanDesc") },
    { icon: LifeBuoy, title: t("featureEscalationTitle"), desc: t("featureEscalationDesc") },
  ];

  const journeySteps =
    language === "es"
      ? [
          ["1", "Describe tu situación", "Chat en lenguaje sencillo"],
          ["2", "Análisis con IA", "Clasificación de riesgo"],
          ["3", "Interpretación de elegibilidad", "Posibles coincidencias"],
          ["4", "Recuperación de recursos", "Programas reales de HUD"],
          ["5", "Capa de razonamiento", "Por qué cada programa encaja"],
          ["6", "Plan de acción personalizado", "Hoy / esta semana / respaldo"],
          ["7", "Escalado humano", "Cuando la seguridad está en riesgo"],
        ]
      : [
          ["1", "Describe your situation", "Plain-language chat"],
          ["2", "AI situation analysis", "Risk classification"],
          ["3", "Eligibility interpretation", "May-qualify matches"],
          ["4", "Resource retrieval", "Real HUD programs"],
          ["5", "AI reasoning layer", "Why each program fits"],
          ["6", "Personalized action plan", "Today / this week / backup"],
          ["7", "Human escalation", "When safety is at stake"],
        ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="outline"
            className="mb-5 border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
          >
            <Sparkles className="mr-1.5 h-3 w-3" />
            {t("badge")}
          </Badge>
          <h1 className="font-serif-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("heroTitle1")}
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("heroSubtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={onStart}
              className="group h-12 rounded-full bg-primary px-7 text-base font-medium text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg"
            >
              {t("startIntake")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onDemo}
              className="h-12 rounded-full border-primary/30 bg-card px-7 text-base font-medium text-primary shadow-sm transition hover:border-primary/60 hover:bg-primary/5"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t("tryDemo")}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {STATS.map((s) => (
              <div key={s.labelKey} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                  <s.icon className="h-4 w-4 text-secondary-foreground" />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-foreground">
                    {s.value[language]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.label[language]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/80 shadow-xl shadow-primary/5 backdrop-blur">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-primary/10 via-card to-accent/20 px-6 py-5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {language === "es" ? "Tu recorrido de 7 pasos" : "Your 7-step journey"}
                </div>
                <div className="mt-1 font-serif-display text-xl font-semibold text-foreground">
                  {language === "es"
                    ? "Confusión → claridad → acción"
                    : "Confusion → clarity → action"}
                </div>
              </div>
              <ol className="divide-y divide-border/60 px-6 py-2">
                {journeySteps.map(([n, title, sub]) => (
                  <li key={n} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {n}
                    </span>
                    <div className="flex flex-1 items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sub}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-16 sm:mt-20">
        <div className="mb-6 text-center">
          <h2 className="font-serif-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("whatYoullGet")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("whatYoullGetSub")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
            >
              <Card className="h-full rounded-2xl border-border/60 bg-card/70 transition hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif-display text-base font-semibold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
