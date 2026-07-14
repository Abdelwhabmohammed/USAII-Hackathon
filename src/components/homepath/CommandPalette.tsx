"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  FileSearch,
  LifeBuoy,
  BookOpen,
  CalendarClock,
  Info,
  Sun,
  Moon,
  Globe,
  Home,
  RotateCcw,
} from "lucide-react";
import type { AppView } from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";

interface Command {
  id: string;
  label: string;
  labelEs?: string;
  icon: typeof Home;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  onView,
  onRestart,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onView: (v: AppView) => void;
  onRestart: () => void;
}) {
  const { t, language, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState("");

  // Reset query when palette opens/closes
  useEffect(() => {
    if (!open)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
  }, [open]);

  const commands: Command[] = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      labelEs: "Ir al Panel",
      icon: LayoutDashboard,
      action: () => { onView("dashboard"); onOpenChange(false); },
    },
    {
      id: "action-plan",
      label: "Go to Action Plan",
      labelEs: "Ir al Plan de Acción",
      icon: ListChecks,
      action: () => { onView("action-plan"); onOpenChange(false); },
    },
    {
      id: "timeline",
      label: "Go to Timeline",
      labelEs: "Ir a Cronología",
      icon: CalendarClock,
      action: () => { onView("timeline"); onOpenChange(false); },
    },
    {
      id: "programs",
      label: "Go to Programs",
      labelEs: "Ir a Programas",
      icon: Building2,
      action: () => { onView("programs"); onOpenChange(false); },
    },
    {
      id: "document-analysis",
      label: "Analyze a document",
      labelEs: "Analizar un documento",
      icon: FileSearch,
      action: () => { onView("document-analysis"); onOpenChange(false); },
    },
    {
      id: "resources",
      label: "Go to Resources",
      labelEs: "Ir a Recursos",
      icon: LifeBuoy,
      action: () => { onView("resources"); onOpenChange(false); },
    },
    {
      id: "glossary",
      label: "Go to Glossary",
      labelEs: "Ir al Glosario",
      icon: BookOpen,
      action: () => { onView("glossary"); onOpenChange(false); },
    },
    {
      id: "about",
      label: "About HomePath AI",
      labelEs: "Acerca de HomePath AI",
      icon: Info,
      action: () => { onView("about"); onOpenChange(false); },
    },
    {
      id: "toggle-language",
      label: `Switch to ${language === "en" ? "Spanish" : "English"}`,
      icon: Globe,
      action: () => { toggleLang(); onOpenChange(false); },
    },
    {
      id: "toggle-theme",
      label: `Switch to ${theme === "light" ? "dark" : "light"} mode`,
      labelEs: `Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`,
      icon: theme === "light" ? Moon : Sun,
      action: () => { toggleTheme(); onOpenChange(false); },
    },
    {
      id: "restart",
      label: "Start over",
      labelEs: "Empezar de nuevo",
      icon: RotateCcw,
      action: () => { onRestart(); onOpenChange(false); },
    },
  ];

  const filtered = commands.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const label = (c.labelEs && language === "es" ? c.labelEs : c.label).toLowerCase();
    return label.includes(q) || c.id.includes(q);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[20%] max-w-xl gap-0 overflow-hidden rounded-2xl border-border/60 bg-card p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="border-b border-border/60">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === "es" ? "Escribe un comando…" : "Type a command…"}
            className="w-full bg-transparent px-5 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {language === "es" ? "Sin resultados." : "No results."}
            </div>
          ) : (
            filtered.map((cmd) => {
              const label = cmd.labelEs && language === "es" ? cmd.labelEs : cmd.label;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-primary/5"
                >
                  <cmd.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span className="flex-1">{label}</span>
                  {cmd.shortcut && (
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-border/60 bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          {language === "es"
            ? "Presiona Esc para cerrar · Cmd+K para abrir"
            : "Press Esc to close · Cmd+K to open"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
