"use client";

import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

export function ResponsibleAIBanner({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const { t, language } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
        <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {language === "es"
            ? "HomePath AI ofrece orientación — no asesoría legal. Verifica siempre con el programa directamente."
            : `${t("brand")} offers guidance — not legal advice. Always verify with the program directly.`}
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50 via-amber-50/60 to-orange-50/40 px-5 py-4 sm:px-6">
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-md p-1 text-amber-700/60 transition hover:bg-amber-100/60 hover:text-amber-900"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-200/70">
          <AlertTriangle className="h-5 w-5 text-amber-800" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-900">
            {language === "es"
              ? "Esto es orientación, no una garantía."
              : "This is guidance, not a guarantee."}
          </p>
          <p className="text-xs leading-relaxed text-amber-800/90">
            {language === "es"
              ? "HomePath AI te ayuda a entender tus opciones — no determina elegibilidad. Siempre decimos \"podrías calificar\", nunca lo tomes como final. Las decisiones finales pertenecen a los administradores del programa."
              : "HomePath AI helps you understand options — it does not determine eligibility. Always say \"you may qualify,\" never trust it as final. Final decisions belong to program administrators."}
          </p>
        </div>
      </div>
    </div>
  );
}
