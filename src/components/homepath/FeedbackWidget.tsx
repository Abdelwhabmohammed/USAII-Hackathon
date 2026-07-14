"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Check, X } from "lucide-react";
import { useFeedback } from "./useSession";
import { useLanguage } from "./LanguageProvider";

export function FeedbackWidget({ itemKey }: { itemKey: string }) {
  const { submit, get } = useFeedback();
  const { language } = useLanguage();
  const existing = get(itemKey);
  const [submitted, setSubmitted] = useState(existing !== undefined);

  const handle = (helpful: boolean) => {
    submit(itemKey, helpful);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary"
      >
        <Check className="h-3.5 w-3.5" />
        {language === "es" ? "Gracias por tu feedback" : "Thanks for your feedback"}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2"
      >
        <span className="text-xs text-muted-foreground">
          {language === "es" ? "¿Fue útil?" : "Was this helpful?"}
        </span>
        <button
          onClick={() => handle(true)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition hover:border-emerald-400/60 hover:bg-emerald-50 hover:text-emerald-600"
          aria-label="Helpful"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handle(false)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition hover:border-rose-400/60 hover:bg-rose-50 hover:text-rose-600"
          aria-label="Not helpful"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
