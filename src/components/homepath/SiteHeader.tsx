"use client";

import { Home, ShieldCheck, Globe, Moon, Sun, Info, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { CrisisResourcesBar } from "./CrisisResources";

export function SiteHeader({
  onRestart,
  onAbout,
  onCommandPalette,
}: {
  onRestart?: () => void;
  onAbout?: () => void;
  onCommandPalette?: () => void;
}) {
  const { language, toggle: toggleLang, t } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md no-print">
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Crisis resources */}
          <CrisisResourcesBar variant="header" />

          {/* Command palette hint */}
          {onCommandPalette && (
            <button
              onClick={onCommandPalette}
              className="hidden items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:bg-primary/5 hover:text-primary md:flex"
              aria-label="Command palette"
            >
              <Command className="h-3 w-3" />
              <span>K</span>
            </button>
          )}

          {/* Guidance badge */}
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>{t("guidanceOnly")}</span>
          </div>

          {/* About */}
          {onAbout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAbout}
              className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-primary/5 hover:text-primary"
              aria-label="About"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-primary/5 hover:text-primary"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Language toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
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
