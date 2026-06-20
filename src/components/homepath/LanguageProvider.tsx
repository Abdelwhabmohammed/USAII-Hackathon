"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Language } from "@/lib/homepath/types";
import { t as translate, type StringKey } from "@/lib/homepath/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggle: () => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggle = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "es" : "en"));
  }, []);

  const t = useCallback(
    (key: StringKey) => translate(key, language),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
