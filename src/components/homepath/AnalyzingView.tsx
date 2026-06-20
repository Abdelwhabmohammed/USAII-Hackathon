"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles, Activity, FileCheck2, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "./LanguageProvider";

export function AnalyzingView() {
  const { t, language } = useLanguage();
  const steps = [
    { icon: Activity, label: language === "es" ? "Analizando situación" : "Analyzing situation" },
    { icon: FileCheck2, label: language === "es" ? "Interpretando elegibilidad" : "Interpreting eligibility" },
    { icon: ListChecks, label: language === "es" ? "Construyendo plan de acción" : "Building action plan" },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-12 sm:px-6">
      <Card className="overflow-hidden rounded-3xl border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          <h2 className="font-serif-display text-2xl font-semibold text-foreground">
            {language === "es" ? "Analizando tu situación" : "Analyzing your situation"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "es"
              ? "Esto puede tardar hasta 30 segundos mientras la IA revisa los programas que podrían ayudarte."
              : "This may take up to 30 seconds while the AI reviews programs that may help you."}
          </p>

          <div className="mt-6 space-y-3 text-left">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 * i }}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm text-foreground">{s.label}</span>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
