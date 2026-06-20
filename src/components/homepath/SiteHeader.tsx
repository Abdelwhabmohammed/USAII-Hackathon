"use client";

import { Home, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";

export function SiteHeader({
  onRestart,
}: {
  onRestart?: () => void;
}) {
  const { language, toggle, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={onRestart}
          className="group flex items-center gap-2.5 text-left"
          aria-label="HomePath AI — return to start"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Home className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif-display text-lg font-semibold tracking-tight text-foreground">
              {t("brand")}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("tagline")}
            </span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>{t("guidanceOnly")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            className="h-8 rounded-full border-border/60 bg-card/60 px-3 text-xs font-medium text-foreground hover:bg-primary/5 hover:text-primary"
            aria-label="Toggle language"
          >
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            {t("language")}
          </Button>
        </div>
      </div>
    </header>
  );
}
