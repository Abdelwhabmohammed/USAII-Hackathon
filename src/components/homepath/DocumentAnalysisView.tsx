"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileSearch,
  Loader2,
  AlertCircle,
  Calendar,
  Info,
  AlertTriangle,
  ShieldCheck,
  ListChecks,
  ArrowRight,
  UserCog,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentAnalysisResult } from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";

const SAMPLE_EVICT = `NOTICE TO VACATE

To: John Doe, Tenant
From: ABC Property Management
Date: March 15, 2026
Property: 123 Main Street, Apt 4B, Atlanta, GA 30303

You are hereby notified that your tenancy at the above-referenced property is terminated due to non-payment of rent. The total amount owed is $1,800, covering rent for February and March 2026.

You have 14 days from the date of this notice to pay the full amount owed or vacate the property. Failure to do so will result in eviction proceedings being filed in court.

If you wish to dispute this notice, you may do so in writing within 7 days.
Sincerely,
ABC Property Management
(404) 555-1234`;

const SAMPLE_RENT = `NOTICE OF RENT INCREASE

To: Maria Rodriguez, Tenant
From: Sunrise Apartments LLC
Date: April 2, 2026

This letter serves as formal notice that your monthly rent will increase from $1,200 to $1,500, effective June 1, 2026. This represents a $300 (25%) monthly increase.

This increase is in accordance with your lease agreement, Section 4.2, which allows for rent adjustments with 60 days' written notice.

If you have questions or wish to discuss payment plan options, please contact our office at (555) 987-6543.

Sunrise Apartments LLC`;

const SAMPLE_UTILITY = `DISCONNECTION NOTICE — FINAL

Account Holder: James Chen
Account #: 8847291
Service Address: 456 Oak Ave, Atlanta, GA 30308

Dear Customer:

Your gas account is currently past due in the amount of $342.18. Despite previous notices, payment has not been received.

Your service is scheduled for disconnection on May 20, 2026, unless full payment is received by 5:00 PM on that date.

To avoid disconnection:
1. Pay the full amount online at paygas.example.com
2. Call us at 1-800-555-GAS1 to make a payment arrangement
3. Apply for energy assistance through LIHEAP

If you have a medical condition requiring continuous gas service, please submit a medical certification form within 48 hours.

Georgia Gas Company`;

export function DocumentAnalysisView() {
  const { t, language } = useLanguage();
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (text.trim().length < 20) {
      setError(language === "es" ? "Pega al menos una oración." : "Please paste at least a sentence.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/document-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (language === "es" ? "Error desconocido" : "Unknown error"));
      } else {
        setResult(data.analysis);
      }
    } catch (e) {
      console.error(e);
      setError(language === "es" ? "No pudimos analizar el documento." : "We couldn't analyze the document.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
          {t("docTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("docSubtitle")}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-900">
        <ShieldCheck className="h-4 w-4 flex-shrink-0" />
        <span>{t("notLegalAdvice")}</span>
      </div>

      {/* Input */}
      <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {language === "es" ? "Texto del documento" : "Document text"}
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("docInputPlaceholder")}
            rows={8}
            className="resize-y rounded-xl border-border/60 bg-background text-sm focus-visible:ring-primary"
          />
          {error && (
            <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              onClick={analyze}
              disabled={analyzing || text.trim().length < 20}
              className="rounded-full bg-primary px-5 text-sm font-medium shadow-sm hover:bg-primary/90"
            >
              {analyzing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSearch className="mr-1.5 h-3.5 w-3.5" />
              )}
              {analyzing ? t("docAnalyzing") : t("docAnalyzeBtn")}
            </Button>
            <div className="text-xs text-muted-foreground">
              {language === "es" ? "O prueba un ejemplo:" : "Or try a sample:"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <SampleBtn label={t("docSampleEviction")} onClick={() => setText(SAMPLE_EVICT)} />
              <SampleBtn label={t("docSampleRent")} onClick={() => setText(SAMPLE_RENT)} />
              <SampleBtn label={t("docSampleUtility")} onClick={() => setText(SAMPLE_UTILITY)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Top: type + confidence + escalation */}
          <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("docType")}
                  </div>
                  <div className="mt-1 font-serif-display text-2xl font-bold text-foreground">
                    {result.documentType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("confidence")}
                  </div>
                  <div className="font-serif-display text-2xl font-bold text-primary">
                    {result.confidenceScore}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {result.confidenceLabel === "High"
                      ? t("confHigh")
                      : result.confidenceLabel === "Moderate"
                      ? t("confModerate")
                      : t("confLow")}
                  </div>
                </div>
              </div>
              {result.escalationRequired && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-300/60 bg-rose-50/70 px-3 py-2 text-xs text-rose-800">
                  <UserCog className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    {language === "es"
                      ? "Recomendamos hablar con un consejero de vivienda o abogado sobre este documento."
                      : "We recommend talking to a housing counselor or lawyer about this document."}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("docSummary")}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Two-col: key dates + key info */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("docKeyDates")}
                  </h3>
                </div>
                {result.keyDates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {language === "es" ? "Sin fechas específicas." : "No specific dates."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {result.keyDates.map((d, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="text-right font-medium text-foreground">{d.date}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("docKeyInfo")}
                  </h3>
                </div>
                {result.keyInformation.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {language === "es" ? "Sin información clave." : "No key information."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {result.keyInformation.map((d, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="text-right font-medium text-foreground">{d.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Urgent actions */}
          {result.urgentActions.length > 0 && (
            <Card className="rounded-2xl border-rose-300/60 bg-rose-50/40 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-700">
                    {t("docUrgentActions")}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {result.urgentActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-rose-900">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-600" />
                      {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Rights + Next steps */}
          <div className="grid gap-4 lg:grid-cols-2">
            {result.yourRights.length > 0 && (
              <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("docRights")}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.yourRights.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {result.recommendedNextSteps.length > 0 && (
              <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("docNextSteps")}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.recommendedNextSteps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Caveats */}
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
        </motion.div>
      )}
    </div>
  );
}

function SampleBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    >
      {label}
    </button>
  );
}
