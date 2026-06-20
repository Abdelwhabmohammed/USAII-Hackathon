import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/gemini";
import {
  ANALYSIS_SYSTEM,
  ANALYSIS_USER,
  extractJSON,
  normalizeAnalysis,
  buildFallbackAnalysis,
} from "@/lib/homepath/prompts";
import type { UserProfile } from "@/lib/homepath/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = body?.profile as UserProfile | undefined;
    const language: "en" | "es" = body?.language === "es" ? "es" : "en";

    if (!profile || !profile.rawDescription) {
      return NextResponse.json(
        { error: "Missing user profile." },
        { status: 400 }
      );
    }

    let analysis;
    let usedFallback = false;

    try {
      const text = await chatCompletion({
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM },
          {
            role: "user",
            content:
              ANALYSIS_USER(profile) +
              (language === "es"
                ? "\n\nNote: User's primary language is Spanish — keep the situation summary simple and translatable."
                : ""),
          },
        ],
        temperature: 0.4,
      });

      analysis = normalizeAnalysis(extractJSON(text));
      if (!analysis) {
        analysis = buildFallbackAnalysis(profile);
        usedFallback = true;
      }
    } catch (llmErr) {
      console.error("LLM call failed, using fallback", llmErr);
      analysis = buildFallbackAnalysis(profile);
      usedFallback = true;
    }

    return NextResponse.json({
      analysis,
      meta: {
        usedFallback,
        language,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("/api/analyze error", err);
    return NextResponse.json(
      { error: "Internal error during analysis." },
      { status: 500 }
    );
  }
}
