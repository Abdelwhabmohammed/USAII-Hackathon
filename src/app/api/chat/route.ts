import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/gemini";
import { extractJSON } from "@/lib/homepath/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are HomePath AI's intake assistant — a calm, warm, and practical guide for a person describing a housing crisis in the United States.

Your job: have a brief, conversational intake chat (3–5 turns max) to gather enough context for the analysis engine to work with. You are NOT the analyzer — you only collect information conversationally.

What you need to learn (in any order, only ask about what's still missing):
- Location (city/state)
- Household size (adults, children, dependents)
- Income & employment status
- Current housing status (renting, behind on rent, eviction notice received, homeless, etc.)
- Rent owed (approximate amount)
- Eviction timeline (court date? sheriff lockout? just a notice?)

Behavior rules:
1. ALWAYS acknowledge what the user just said in 1 short sentence before asking the next question. Show you listened.
2. Ask only ONE question per turn. Never list multiple questions.
3. Be warm but brief — 2–3 sentences max per reply.
4. Never use legal jargon. Plain language only.
5. If the user mentions safety concerns (domestic violence, self-harm, child safety, medical emergency), respond briefly with empathy and signal ready=true so we can escalate to a human.
6. If the user has shared enough for the analyzer to work (typically: location + housing situation + income/employment context + timeline OR rent owed), OR if they explicitly ask you to analyze, set ready=true.
7. If the user has shared at least 3 substantive messages, set ready=true even if some fields are missing — the analyzer can work with partial info.
8. Never invent information about programs, eligibility, or resources — that's the analyzer's job, not yours.

Output format: respond with ONLY a JSON object, no markdown, no code fences:
{
  "reply": "your reply to the user (2–3 sentences max)",
  "ready": true|false,
  "acknowledged": "one short phrase echoing what the user shared (e.g., 'job loss in Atlanta', 'eviction notice received')"
}`;

const USER_PROMPT = (history: { role: string; content: string }[]) => {
  const transcript = history
    .map((m) => `${m.role === "user" ? "USER" : "BOT"}: ${m.content}`)
    .join("\n");
  return `Conversation so far:\n${transcript}\n\nReply as JSON now.`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const history: { role: string; content: string }[] = Array.isArray(
      body?.history
    )
      ? body.history
      : [];

    if (history.length === 0) {
      return NextResponse.json({ error: "No conversation history." }, { status: 400 });
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT(history) },
      ],
      temperature: 0.6,
    });

    const parsed = extractJSON(text) as
      | { reply?: string; ready?: boolean; acknowledged?: string }
      | null;

    // Fallbacks if the model didn't return valid JSON
    const reply =
      parsed?.reply ||
      "Could you tell me a bit more about your housing situation — where you live and what's happening right now?";
    const ready = Boolean(parsed?.ready);

    return NextResponse.json({ reply, ready, acknowledged: parsed?.acknowledged });
  } catch (err) {
    console.error("/api/chat error", err);
    // Fail soft — return a generic followup so the chat doesn't break
    return NextResponse.json({
      reply:
        "I want to make sure I understand. Could you tell me a bit more about your housing situation — where you live and what's happening right now?",
      ready: false,
      fallback: true,
    });
  }
}
