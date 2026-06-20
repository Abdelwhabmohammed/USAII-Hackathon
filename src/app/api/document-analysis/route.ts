import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/gemini";
import {
  DOCUMENT_ANALYSIS_SYSTEM,
  DOCUMENT_ANALYSIS_USER,
  extractJSON,
  normalizeDocumentAnalysis,
} from "@/lib/homepath/prompts";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = (body?.text ?? "").trim();
    const language: "en" | "es" = body?.language === "es" ? "es" : "en";

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "Please paste at least a sentence or two from your document." },
        { status: 400 }
      );
    }

    try {
      const raw = await chatCompletion({
        messages: [
          { role: "system", content: DOCUMENT_ANALYSIS_SYSTEM },
          { role: "user", content: DOCUMENT_ANALYSIS_USER(text, language) },
        ],
        temperature: 0.3,
      });

      const result = normalizeDocumentAnalysis(extractJSON(raw));

      if (!result) {
        return NextResponse.json({
          analysis: {
            documentType: "Other",
            summary:
              "We couldn't fully parse this document. Please try pasting a clearer copy, or consult a housing counselor for help understanding it.",
            keyDates: [],
            keyInformation: [],
            urgentActions: [
              "Contact 211 or a HUD-approved housing counselor to review this document with you.",
            ],
            yourRights: [],
            recommendedNextSteps: [
              "Bring the original document to a legal aid office or housing counselor.",
            ],
            confidenceScore: 30,
            confidenceLabel: "Low",
            escalationRequired: true,
            caveats: [
              "This is plain-language guidance, not legal advice.",
              "A lawyer or housing counselor can give case-specific advice.",
            ],
          },
          meta: { usedFallback: true, language, generatedAt: new Date().toISOString() },
        });
      }

      return NextResponse.json({
        analysis: result,
        meta: {
          usedFallback: false,
          language,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (llmErr) {
      console.error("LLM call failed", llmErr);
      return NextResponse.json(
        { error: "We couldn't analyze this document right now. Please try again." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("/api/document-analysis error", err);
    return NextResponse.json(
      { error: "Internal error during document analysis." },
      { status: 500 }
    );
  }
}
