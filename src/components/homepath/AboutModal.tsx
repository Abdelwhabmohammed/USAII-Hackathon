"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Sparkles, ShieldCheck, Code2, Users } from "lucide-react";

export function AboutContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="space-y-5">
      {/* What it does */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          What it does
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          HomePath AI helps individuals and families facing housing
          instability understand their options, identify programs they
          <strong> may qualify for</strong>, and receive a personalized
          action plan — turning confusion into clear next steps before
          the situation becomes homelessness.
        </p>
      </section>

      {/* How it works */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Code2 className="h-4 w-4 text-primary" />
          How it works
        </h3>
        <ol className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">1. Intake:</strong>{" "}
            Describe your situation in plain language. AI asks followups
            and extracts a structured profile.
          </li>
          <li>
            <strong className="text-foreground">2. Analysis:</strong> AI
            compares your situation to 10+ real US housing programs (HUD,
            Treasury, HHS, LSC) and explains why each may fit.
          </li>
          <li>
            <strong className="text-foreground">3. Action plan:</strong>{" "}
            Get a prioritized checklist (Today / This Week / Backup) with
            real source links and phone numbers.
          </li>
          <li>
            <strong className="text-foreground">4. Escalation:</strong>{" "}
            If safety concerns are detected or confidence is low, we
            connect you with a human counselor.
          </li>
        </ol>
      </section>

      {/* Responsible AI */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Responsible AI
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            Always says &quot;you <em>may</em> qualify&quot; — never &quot;you qualify&quot;
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            Confidence score on every match — low confidence triggers human referral
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            Real source links (HUD.gov, Treasury.gov, LSC.gov) — no fabricated URLs
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            Human escalation for domestic violence, child safety, medical emergencies, self-harm
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            Not legal advice — final decisions belong to program administrators
          </li>
        </ul>
      </section>

      {/* Tech stack */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Code2 className="h-4 w-4 text-primary" />
          Tech stack
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {[
            "Next.js 16",
            "TypeScript",
            "Tailwind CSS 4",
            "shadcn/ui",
            "Framer Motion",
            "Gemini AI (@google/genai)",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* For whom */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 text-primary" />
          Who it&apos;s for
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Students, workers, caregivers, renters, immigrant families, and
          community case managers trying to understand a complex system —
          often under stress and time pressure.
        </p>
      </section>
    </div>
  );
}

export function AboutModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border-border/60 bg-card p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border/60 bg-gradient-to-br from-primary/5 to-card px-6 py-5">
            <DialogTitle className="flex items-center gap-2 font-serif-display text-2xl font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Info className="h-4 w-4" />
              </span>
              About HomePath AI
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              An AI-powered Housing Stability Guide for families facing eviction.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <AboutContent />
          </div>

          <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
            <Button
              onClick={() => setOpen(false)}
              className="w-full rounded-full bg-primary text-sm font-medium hover:bg-primary/90"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
