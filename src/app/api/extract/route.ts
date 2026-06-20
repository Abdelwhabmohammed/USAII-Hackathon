import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/gemini";
import {
  EXTRACTION_SYSTEM,
  EXTRACTION_USER,
  extractJSON,
} from "@/lib/homepath/prompts";
import type { UserProfile } from "@/lib/homepath/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawDescription: string = (body?.rawDescription ?? "").trim();

    if (!rawDescription || rawDescription.length < 10) {
      return NextResponse.json(
        { error: "Please describe your situation in a sentence or two." },
        { status: 400 }
      );
    }

    const text = await chatCompletion({
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM },
        { role: "user", content: EXTRACTION_USER(rawDescription) },
      ],
      temperature: 0.2,
    });

    const parsed = extractJSON(text) as Partial<UserProfile> | null;

    const profile: UserProfile = {
      location: parsed?.location ?? "",
      householdSize: parsed?.householdSize ?? "",
      incomeStatus: parsed?.incomeStatus ?? "",
      employmentStatus: parsed?.employmentStatus ?? "",
      housingStatus: parsed?.housingStatus ?? "",
      rentOwed: parsed?.rentOwed ?? "",
      evictionTimeline: parsed?.evictionTimeline ?? "",
      additionalContext: parsed?.additionalContext ?? "",
      rawDescription,
    };

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("/api/extract error", err);
    // Fail soft — return an empty profile so the user can still edit it manually.
    const body = await req.json().catch(() => ({}));
    const rawDescription: string = (body?.rawDescription ?? "").trim();
    return NextResponse.json({
      profile: {
        location: "",
        householdSize: "",
        incomeStatus: "",
        employmentStatus: "",
        housingStatus: "",
        rentOwed: "",
        evictionTimeline: "",
        additionalContext: "",
        rawDescription,
      } as UserProfile,
      warning:
        "We couldn't auto-extract your details — please fill in the form below manually.",
    });
  }
}
