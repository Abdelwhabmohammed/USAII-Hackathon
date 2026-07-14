"use client";

import { Phone, AlertTriangle, Heart } from "lucide-react";
import { useState } from "react";

const CRISIS_LINES = [
  {
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    description: "24/7 free and confidential support for people in distress.",
    href: "tel:988",
  },
  {
    name: "211 Local Resources",
    number: "2-1-1",
    description: "24/7 hotline for housing, food, utility, and crisis resources.",
    href: "tel:211",
  },
  {
    name: "National Domestic Violence Hotline",
    number: "1-800-799-7233",
    description: "24/7 confidential support. Call or text START to 88788.",
    href: "tel:18007997233",
  },
];

export function CrisisResourcesBar({ variant = "footer" }: { variant?: "footer" | "header" | "banner" }) {
  const [expanded, setExpanded] = useState(false);

  if (variant === "header") {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 rounded-full border border-rose-300/60 bg-rose-50/70 px-3 py-1.5 text-xs font-medium text-rose-800 transition hover:bg-rose-100/70"
        aria-label="Crisis resources"
      >
        <Heart className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Crisis help</span>
        <span className="sm:hidden">Help</span>
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <div className="rounded-2xl border border-rose-300/50 bg-gradient-to-br from-rose-50 to-pink-50/40 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-rose-200/70">
            <AlertTriangle className="h-5 w-5 text-rose-700" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-rose-900">
              In immediate crisis? You're not alone.
            </h3>
            <p className="mt-1 text-xs text-rose-800/90">
              These free, confidential hotlines are available 24/7.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {CRISIS_LINES.map((line) => (
                <a
                  key={line.name}
                  href={line.href}
                  className="group flex items-center gap-2 rounded-lg border border-rose-200 bg-white/70 px-3 py-2 text-left transition hover:bg-white"
                >
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-rose-600" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-rose-900">
                      {line.number}
                    </div>
                    <div className="truncate text-[10px] text-rose-700">
                      {line.name}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // footer variant — always visible in footer
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      <span className="font-medium">24/7 crisis lines:</span>
      {CRISIS_LINES.map((line) => (
        <a
          key={line.name}
          href={line.href}
          className="inline-flex items-center gap-1 transition hover:text-rose-600"
        >
          <Phone className="h-2.5 w-2.5" />
          <span className="font-medium">{line.number}</span>
        </a>
      ))}
    </div>
  );
}
