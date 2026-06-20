"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Pencil,
  Check,
  ArrowRight,
  Loader2,
  RefreshCw,
  Bot,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage, UserProfile } from "@/lib/homepath/types";
import { useLanguage } from "./LanguageProvider";

const DEMO_TEXT =
  "I lost my job last month and just received an eviction notice. I have two children, ages 6 and 9. We live in Atlanta, GA. I'm about $1,800 behind on rent and the court date is in two weeks. I don't know what to do.";

const DEMO_TEXT_ES =
  "Perdí mi trabajo el mes pasado y acabo de recibir un aviso de desalojo. Tengo dos hijos de 6 y 9 años. Vivimos en Atlanta, GA. Debo como $1,800 de renta y la cita en el tribunal es en dos semanas. No sé qué hacer.";

const SUGGESTIONS = [
  { en: "I lost my job and got an eviction notice", es: "Perdí mi trabajo y recibí un aviso de desalojo" },
  { en: "I'm behind on rent and have kids", es: "Debo renta y tengo hijos" },
  { en: "My landlord is threatening to evict me", es: "Mi casero me amenaza con desalojarme" },
  { en: "I need emergency housing", es: "Necesito vivienda de emergencia" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function IntakeChat({
  onProfileReady,
  onBack,
  isDemoMode,
}: {
  onProfileReady: (profile: UserProfile) => void;
  onBack: () => void;
  isDemoMode: boolean;
}) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "bot",
      kind: "intro",
      content: t("botIntro"),
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [extractWarning, setExtractWarning] = useState<string | null>(null);
  const [autoAnalyzeQueued, setAutoAnalyzeQueued] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, isExtracting]);

  useEffect(() => {
    if (isDemoMode && messages.length === 1) {
      setInput(language === "es" ? DEMO_TEXT_ES : DEMO_TEXT);
    }
  }, [isDemoMode, messages.length, language]);

  const buildHistory = useCallback((msgs: ChatMessage[]) => {
    return msgs
      .filter((m) => m.kind !== "intro")
      .map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));
  }, []);

  const runExtraction = useCallback(
    async (msgs: ChatMessage[]) => {
      setIsExtracting(true);
      const thinkingId = uid();
      const thinkingMsg: ChatMessage = {
        id: thinkingId,
        role: "bot",
        kind: "system",
        content: t("readingMsg"),
        ts: Date.now(),
      };
      setMessages((m) => [...m, thinkingMsg]);

      try {
        const rawDescription = msgs
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join(" ");

        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawDescription, language }),
        });
        const data = await res.json();
        const extracted: UserProfile = data.profile;
        if (data.warning) setExtractWarning(data.warning);

        setMessages((m) =>
          m.map((msg) =>
            msg.id === thinkingId
              ? { ...msg, content: t("profileReadyMsg") }
              : msg
          )
        );

        setProfile(extracted);
        setEditMode(true);
      } catch (err) {
        console.error(err);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === thinkingId
              ? { ...msg, content: t("fallbackErrMsg") }
              : msg
          )
        );
        setProfile({
          location: "",
          householdSize: "",
          incomeStatus: "",
          employmentStatus: "",
          housingStatus: "",
          rentOwed: "",
          evictionTimeline: "",
          additionalContext: "",
          rawDescription: msgs
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join(" "),
        });
        setEditMode(true);
      } finally {
        setIsExtracting(false);
      }
    },
    [t, language]
  );

  const sendUser = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || isThinking || isExtracting) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        kind: "answer",
        content: clean,
        ts: Date.now(),
      };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      const newUserCount = userMessageCount + 1;
      setUserMessageCount(newUserCount);

      setIsThinking(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: buildHistory(nextMessages), language }),
        });
        const data = await res.json();
        const reply: string = data.reply;
        const ready: boolean = Boolean(data.ready);

        const botMsg: ChatMessage = {
          id: uid(),
          role: "bot",
          kind: "system",
          content: reply,
          ts: Date.now(),
        };
        await new Promise((r) => setTimeout(r, 400));
        setMessages((m) => [...m, botMsg]);

        if (ready) {
          setAutoAnalyzeQueued(true);
          setTimeout(() => {
            runExtraction([...nextMessages, botMsg]);
          }, 1500);
        }
      } catch (err) {
        console.error("chat error", err);
        const fallbackMsg: ChatMessage = {
          id: uid(),
          role: "bot",
          kind: "system",
          content: language === "es"
            ? "Quiero asegurarme de entender. ¿Puedes contarme dónde vives y qué está pasando con tu vivienda ahora mismo?"
            : "I want to make sure I understand. Could you tell me where you live and what's happening with your housing right now?",
          ts: Date.now(),
        };
        setMessages((m) => [...m, fallbackMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, isThinking, isExtracting, userMessageCount, buildHistory, runExtraction, language]
  );

  const handleManualAnalyze = useCallback(() => {
    if (isExtracting) return;
    runExtraction(messages);
  }, [messages, isExtracting, runExtraction]);

  const handleConfirm = useCallback(() => {
    if (profile) onProfileReady(profile);
  }, [profile, onProfileReady]);

  const handleReset = () => {
    setMessages([
      {
        id: "intro",
        role: "bot",
        kind: "intro",
        content: t("botIntro"),
        ts: Date.now(),
      },
    ]);
    setInput("");
    setProfile(null);
    setEditMode(false);
    setExtractWarning(null);
    setAutoAnalyzeQueued(false);
    setUserMessageCount(0);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {t("backToHome")}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("startOver")}
        </button>
      </div>

      <div className="mb-4 text-center">
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("intakeTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("intakeSubtitle")}
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur">
        <CardContent className="p-0">
          <div
            ref={scrollRef}
            className="scrollbar-calm h-[420px] overflow-y-auto bg-gradient-to-b from-background to-muted/30 px-4 py-5 sm:px-6"
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`mb-3 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "bot" && (
                    <span className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : m.kind === "system"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-card text-card-foreground border border-border/60"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {(isThinking || isExtracting) && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-border/60 bg-card px-3 py-2">
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!editMode && (
            <div className="border-t border-border/60 bg-card/50 p-3 sm:p-4">
              {messages.length === 1 && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.en}
                      onClick={() => sendUser(s[language])}
                      className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                    >
                      {s[language]}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendUser(input);
                    }
                  }}
                  placeholder={t("inputPlaceholder")}
                  rows={1}
                  className="min-h-[44px] flex-1 resize-none rounded-2xl border-border/60 bg-background text-sm focus-visible:ring-primary"
                />
                <Button
                  onClick={() => sendUser(input)}
                  disabled={!input.trim() || isThinking || isExtracting}
                  className="h-11 w-11 rounded-full bg-primary p-0 shadow-sm hover:bg-primary/90"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {userMessageCount >= 1 && !autoAnalyzeQueued && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-primary/5 px-3 py-2.5"
                >
                  <p className="text-xs text-primary">{t("analyzeSkipAhead")}</p>
                  <Button
                    size="sm"
                    onClick={handleManualAnalyze}
                    disabled={isThinking || isExtracting}
                    className="rounded-full bg-primary px-4 text-xs hover:bg-primary/90"
                  >
                    {isExtracting ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="mr-1.5 h-3 w-3" />
                    )}
                    {t("analyzingNow")}
                  </Button>
                </motion.div>
              )}

              {autoAnalyzeQueued && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("autoAnalyzeMsg")}
                </motion.div>
              )}
            </div>
          )}

          {editMode && profile && (
            <div className="border-t border-border/60 bg-card/80 p-4 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-foreground">
                    {t("yourProfile")}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("yourProfileSub")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-primary"
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  {t("editable")}
                </Badge>
              </div>

              {extractWarning && (
                <div className="mb-4 rounded-lg border border-amber-300/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-800">
                  {extractWarning}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <ProfileField
                  label={t("fieldLocation")}
                  value={profile.location}
                  onChange={(v) => setProfile({ ...profile, location: v })}
                  placeholder="City, State"
                />
                <ProfileField
                  label={t("fieldHousehold")}
                  value={profile.householdSize}
                  onChange={(v) => setProfile({ ...profile, householdSize: v })}
                  placeholder={language === "es" ? "ej., 2 adultos, 2 niños" : "e.g., 2 adults, 2 children"}
                />
                <ProfileField
                  label={t("fieldIncome")}
                  value={profile.incomeStatus}
                  onChange={(v) => setProfile({ ...profile, incomeStatus: v })}
                  placeholder={language === "es" ? "ej., Sin ingresos tras pérdida de empleo" : "e.g., No income after job loss"}
                />
                <ProfileField
                  label={t("fieldEmployment")}
                  value={profile.employmentStatus}
                  onChange={(v) => setProfile({ ...profile, employmentStatus: v })}
                  placeholder={language === "es" ? "ej., Desempleado desde el mes pasado" : "e.g., Unemployed since last month"}
                />
                <ProfileField
                  label={t("fieldHousing")}
                  value={profile.housingStatus}
                  onChange={(v) => setProfile({ ...profile, housingStatus: v })}
                  placeholder={language === "es" ? "ej., Alquilando, recibí aviso de desalojo" : "e.g., Renting, received eviction notice"}
                />
                <ProfileField
                  label={t("fieldRentOwed")}
                  value={profile.rentOwed}
                  onChange={(v) => setProfile({ ...profile, rentOwed: v })}
                  placeholder={language === "es" ? "ej., $1,800 adeudados" : "e.g., $1,800 past due"}
                />
                <ProfileField
                  label={t("fieldTimeline")}
                  value={profile.evictionTimeline}
                  onChange={(v) => setProfile({ ...profile, evictionTimeline: v })}
                  placeholder={language === "es" ? "ej., Cita judicial en 2 semanas" : "e.g., Court date in 2 weeks"}
                />
                <ProfileField
                  label={t("fieldAdditional")}
                  value={profile.additionalContext || ""}
                  onChange={(v) => setProfile({ ...profile, additionalContext: v })}
                  placeholder={language === "es" ? "Otra información relevante" : "Anything else relevant"}
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={handleManualAnalyze}
                  className="rounded-full text-sm text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  {t("reExtract")}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="rounded-full bg-primary px-5 text-sm font-medium shadow-sm hover:bg-primary/90"
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {t("looksGood")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-lg border-border/60 bg-background text-sm focus-visible:ring-primary"
      />
    </div>
  );
}
