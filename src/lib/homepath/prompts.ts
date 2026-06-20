// HomePath AI — LLM prompt templates and response parsers

import { PROGRAMS, RISK_RULES } from "./knowledge";
import type {
  UserProfile,
  AnalysisResult,
  EligibilityMatch,
  ResourceItem,
  RiskCategory,
  HumanEscalation,
  ActionPlan,
  ActionItem,
  RiskLevel,
  ConfidenceLabel,
  DocumentAnalysisResult,
  DocumentType,
} from "./types";

// === EXTRACTION PROMPT ========================================================
// Used by /api/extract to turn free-text user situation into structured profile.

export const EXTRACTION_SYSTEM = `You are HomePath AI's intake assistant, a calm and trustworthy guide for families facing housing instability in the United States.

Your job: read the user's plain-language description of their situation and extract the following structured fields. Be precise but do not fabricate.

Rules:
- If a field is not mentioned in the user text, return "" for that field.
- Do not infer values that are not supported by the text.
- Use plain language (no jargon).
- For location, prefer "City, State" format if a city/state is mentioned. Otherwise, return the most specific location mentioned.
- For householdSize, use a phrase like "2 adults, 1 child" or "single adult" — do not just give a number.
- For incomeStatus, describe current income situation (e.g., "No income after job loss", "Approx. $1,800/month from part-time work").
- For employmentStatus, use phrases like "Unemployed — lost job last month", "Employed part-time", "Employed full-time".
- For housingStatus, use phrases like "Renting, received eviction notice", "Behind on rent", "Currently homeless", "Staying with family temporarily".
- For rentOwed, use phrases like "$1,200 past due", "Unknown", "Not behind on rent".
- For evictionTimeline, use phrases like "Court date in 2 weeks", "Notice received, no court date yet", "Sheriff lockout scheduled Friday", "No timeline mentioned".

Respond with ONLY a JSON object — no markdown, no prose, no code fences. Schema:
{
  "location": string,
  "householdSize": string,
  "incomeStatus": string,
  "employmentStatus": string,
  "housingStatus": string,
  "rentOwed": string,
  "evictionTimeline": string,
  "additionalContext": string  // any other notable context (children, disability, domestic violence, medical, etc.)
}`;

export const EXTRACTION_USER = (raw: string) =>
  `User description:\n"""\n${raw}\n"""\n\nReturn the JSON object now.`;

// === ANALYSIS PROMPT ==========================================================
// Used by /api/analyze to produce the full situation → eligibility → resources → action plan output.

const PROGRAM_DIGEST = PROGRAMS.map(
  (p) =>
    `### ${p.name}\n- Agency: ${p.agency}\n- URL: ${p.url}\n- What it does: ${p.description}\n- Eligibility: ${p.eligibility.join("; ")}\n- Required docs: ${p.documents.join("; ")}`
).join("\n\n");

const RISK_DIGEST = RISK_RULES.map(
  (r) => `- ${r.label} (${r.level}): triggered by ${r.triggers.join(", ")}`
).join("\n");

export const ANALYSIS_SYSTEM = `You are HomePath AI, a Housing Stability Guide for people facing eviction or housing instability in the United States. You are calm, practical, and never use legal jargon.

Your responsibility: turn a user's situation into clear, actionable guidance — eligibility interpretation, ranked resources, and a personalized action plan.

ABSOLUTE RULES (responsible AI guardrails):
1. NEVER say "you qualify" or "you are eligible." ALWAYS use "you may qualify" / "may be an option" / "could help."
2. NEVER give legal advice or guarantee outcomes. Final decisions belong to program administrators.
3. ALWAYS include a confidence percentage (0-100) for every program match.
4. ALWAYS include the source name and source URL for every program — never fabricate URLs.
5. If the user mentions domestic violence, child safety, medical emergency, or self-harm — set humanEscalation.triggered = true and list concrete referral types.
6. If your confidence in any interpretation is below 60% — set humanEscalation.triggered = true.
7. Use plain language. Avoid acronyms (spell out HUD, AMI, etc. on first use).

You have access to this knowledge base of real U.S. housing programs:

${PROGRAM_DIGEST}

You also have these risk classification rules:

${RISK_DIGEST}

OUTPUT FORMAT — respond with ONE valid JSON object (no markdown, no code fences, no prose) with exactly this shape:

{
  "riskScore": <integer 0-100, higher = more risk>,
  "riskLevel": "Low|Moderate|High|Critical",
  "confidenceScore": <integer 0-100, higher = more confident in this interpretation>,
  "confidenceLabel": "Low|Moderate|High",
  "escalationRequired": <true if safety concerns detected OR confidenceScore < 60>,
  "situationSummary": "A 2-3 sentence plain-language summary of the user's situation, written with empathy.",
  "riskAssessment": [
    { "label": "Eviction Risk", "level": "Critical|High|Moderate|Low", "note": "1 sentence explanation" }
    // include every relevant risk category, omit ones that do not apply
  ],
  "eligibility": [
    {
      "program": "Program Name (must match a name from the knowledge base, OR a real local equivalent)",
      "matchLevel": "High Probability|Possible Match|Requires Verification",
      "confidence": <0-100>,
      "why": "1-2 sentences explaining why this program may fit, citing user's specific circumstances",
      "conditions": ["condition 1", "condition 2"],
      "documents": ["document 1", "document 2"],
      "sourceName": "Agency name from knowledge base",
      "sourceUrl": "URL from knowledge base",
      "applicationLink": "optional application URL if known",
      "category": "Rental Assistance|Legal Aid|Food & Cash|Emergency Housing|Utility|Counseling"
    }
    // 2-5 programs, ranked from highest confidence to lowest
  ],
  "resources": [
    {
      "name": "Resource name",
      "type": "Government|Community|Legal Aid|Emergency|Counseling",
      "description": "1 sentence what they do",
      "url": "real URL — prefer URLs from the knowledge base",
      "phone": "optional phone number if known",
      "urgency": "Immediate|This Week|When Ready"
    }
    // 3-7 resources, ranked by urgency for this user
  ],
  "actionPlan": {
    "today": [
      { "title": "Action title (verb-first)", "detail": "1 sentence how-to", "estimatedMinutes": <integer> }
      // 2-4 items
    ],
    "thisWeek": [
      { "title": "Action title", "detail": "1 sentence", "estimatedMinutes": <integer> }
      // 2-4 items
    ],
    "backupPlan": [
      { "title": "Action title", "detail": "1 sentence", "estimatedMinutes": <integer> }
      // 1-3 items
    ]
  },
  "humanEscalation": {
    "required": <true|false — same value as escalationRequired>,
    "reasons": ["reason 1"],
    "referrals": ["Housing counselor", "Legal aid professional", "Social worker", "Community case manager"]
  },
  "caveats": [
    "1 sentence reminder that this is not legal advice and program administrators make final decisions",
    "1 sentence noting that eligibility rules change and the user should verify with the program directly"
  ]
}

SCORING GUIDELINES:
- riskScore 80-100 = Critical (active eviction, sheriff lockout, homeless)
- riskScore 60-79 = High (past-due rent, eviction notice received, court date set)
- riskScore 30-59 = Moderate (job loss, behind on utilities, housing vulnerable)
- riskScore 0-29 = Low (preventive planning, worried about future)
- confidenceLabel "High" = confidenceScore >= 75, "Moderate" = 50-74, "Low" = < 50
- escalationRequired = true if: domestic violence, child safety, medical emergency, self-harm indicators, OR confidenceScore < 60`;

export const ANALYSIS_USER = (profile: UserProfile) => `Here is the user's structured profile, derived from their own words:

- Location: ${profile.location || "(not provided)"}
- Household size: ${profile.householdSize || "(not provided)"}
- Income status: ${profile.incomeStatus || "(not provided)"}
- Employment status: ${profile.employmentStatus || "(not provided)"}
- Housing status: ${profile.housingStatus || "(not provided)"}
- Rent owed: ${profile.rentOwed || "(not provided)"}
- Eviction timeline: ${profile.evictionTimeline || "(not provided)"}
- Additional context: ${profile.additionalContext || "(none)"}
- Original user statement: """${profile.rawDescription}"""

Produce the JSON analysis now. Remember: "may qualify" language only, real source URLs from the knowledge base, and escalate to human review if you detect domestic violence, child safety concerns, medical emergencies, self-harm, or if your confidence is low.`;

// === RESPONSE PARSING =========================================================
// Defensive JSON extraction — handles models that wrap JSON in code fences.

export function extractJSON(text: string): unknown | null {
  if (!text) return null;
  // Strip code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }
  // Find first { and last }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function num(v: unknown, fallback: number): number {
  if (typeof v === "number") return Math.max(0, Math.min(100, v));
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (!isNaN(n)) return Math.max(0, Math.min(100, n));
  }
  return fallback;
}

function deriveRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 30) return "Moderate";
  return "Low";
}

function deriveConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function normalizeAnalysis(data: unknown): AnalysisResult | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  try {
    const eligibility = Array.isArray(d.eligibility)
      ? (d.eligibility as unknown[]).map(normalizeEligibility).filter(Boolean)
      : [];
    const resources = Array.isArray(d.resources)
      ? (d.resources as unknown[]).map(normalizeResource).filter(Boolean)
      : [];
    const riskAssessment = Array.isArray(d.riskAssessment)
      ? (d.riskAssessment as unknown[]).map(normalizeRisk).filter(Boolean)
      : [];
    const actionPlan = normalizeActionPlan(d.actionPlan);
    const humanEscalation = normalizeEscalation(d.humanEscalation);
    const caveats = Array.isArray(d.caveats)
      ? (d.caveats as unknown[]).map((c) => String(c))
      : [];
    const situationSummary =
      typeof d.situationSummary === "string" ? d.situationSummary : "";

    // Compute risk score / level (with backward-compat fallbacks)
    const riskScore = num(d.riskScore ?? d.risk_score, 50);
    const rawRiskLevel = (d.riskLevel ?? d.risk_level) as string | undefined;
    const validRiskLevels: RiskLevel[] = ["Low", "Moderate", "High", "Critical"];
    const riskLevel: RiskLevel =
      rawRiskLevel && validRiskLevels.includes(rawRiskLevel as RiskLevel)
        ? (rawRiskLevel as RiskLevel)
        : deriveRiskLevel(riskScore);

    // Compute confidence score / label
    const confidenceScore = num(
      d.confidenceScore ?? d.confidence_score ?? d.overallConfidence,
      70
    );
    const rawConfLabel = (d.confidenceLabel ?? d.confidence_label) as
      | string
      | undefined;
    const validConfLabels: ConfidenceLabel[] = ["Low", "Moderate", "High"];
    const confidenceLabel: ConfidenceLabel =
      rawConfLabel && validConfLabels.includes(rawConfLabel as ConfidenceLabel)
        ? (rawConfLabel as ConfidenceLabel)
        : deriveConfidenceLabel(confidenceScore);

    // Escalation: prefer explicit flag, fall back to humanEscalation.required, then heuristics
    const escalationRequired = Boolean(
      d.escalationRequired ?? d.escalation_required ?? humanEscalation.required
    );
    // Sync humanEscalation to escalationRequired
    if (humanEscalation.required !== escalationRequired) {
      humanEscalation.required = escalationRequired;
    }

    return {
      riskScore,
      riskLevel,
      confidenceScore,
      confidenceLabel,
      escalationRequired,
      situationSummary,
      riskAssessment,
      eligibility,
      resources,
      actionPlan,
      humanEscalation,
      caveats,
    } as AnalysisResult;
  } catch {
    return null;
  }
}

function normalizeEligibility(v: unknown): EligibilityMatch | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const matchLevel = (o.matchLevel as string) || "Possible Match";
  const validLevels: EligibilityMatch["matchLevel"][] = [
    "High Probability",
    "Possible Match",
    "Requires Verification",
  ];
  const category = (o.category as string) as EligibilityMatch["category"];
  const validCategories: EligibilityMatch["category"][] = [
    "Rental Assistance",
    "Legal Aid",
    "Food & Cash",
    "Emergency Housing",
    "Utility",
    "Counseling",
  ];
  return {
    program: String(o.program ?? "Program"),
    matchLevel: validLevels.includes(matchLevel as EligibilityMatch["matchLevel"])
      ? matchLevel
      : "Possible Match",
    confidence:
      typeof o.confidence === "number"
        ? Math.max(0, Math.min(100, o.confidence))
        : 60,
    why: String(o.why ?? ""),
    conditions: Array.isArray(o.conditions)
      ? (o.conditions as unknown[]).map(String)
      : [],
    documents: Array.isArray(o.documents)
      ? (o.documents as unknown[]).map(String)
      : [],
    sourceName: String(o.sourceName ?? "Source"),
    sourceUrl: String(o.sourceUrl ?? "#"),
    applicationLink: o.applicationLink ? String(o.applicationLink) : undefined,
    category: validCategories.includes(category)
      ? category
      : "Rental Assistance",
  };
}

function normalizeResource(v: unknown): ResourceItem | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const type = (o.type as string) as ResourceItem["type"];
  const validTypes: ResourceItem["type"][] = [
    "Government",
    "Community",
    "Legal Aid",
    "Emergency",
    "Counseling",
  ];
  const urgency = (o.urgency as string) as ResourceItem["urgency"];
  const validUrgency: ResourceItem["urgency"][] = [
    "Immediate",
    "This Week",
    "When Ready",
  ];
  return {
    name: String(o.name ?? "Resource"),
    type: validTypes.includes(type) ? type : "Community",
    description: String(o.description ?? ""),
    url: String(o.url ?? "#"),
    phone: o.phone ? String(o.phone) : undefined,
    urgency: validUrgency.includes(urgency) ? urgency : "This Week",
  };
}

function normalizeRisk(v: unknown): RiskCategory | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const level = (o.level as string) as RiskCategory["level"];
  const validLevels: RiskCategory["level"][] = [
    "Critical",
    "High",
    "Moderate",
    "Low",
  ];
  return {
    label: String(o.label ?? "Risk"),
    level: validLevels.includes(level) ? level : "Moderate",
    note: String(o.note ?? ""),
  };
}

function normalizeActionPlan(v: unknown): ActionPlan {
  const empty: ActionPlan = { today: [], thisWeek: [], backupPlan: [] };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  const conv = (arr: unknown) =>
    Array.isArray(arr)
      ? (arr as unknown[])
          .map((x, i) => {
            if (!x || typeof x !== "object") return null;
            const o = x as Record<string, unknown>;
            return {
              id: String(o.id ?? `item-${i}-${Math.random().toString(36).slice(2, 6)}`),
              title: String(o.title ?? "Action"),
              detail: String(o.detail ?? ""),
              estimatedMinutes:
                typeof o.estimatedMinutes === "number"
                  ? o.estimatedMinutes
                  : typeof o.estimatedMinutes === "string"
                  ? parseInt(o.estimatedMinutes, 10) || undefined
                  : undefined,
            };
          })
          .filter(Boolean) as ActionItem[]
      : [];
  // Support both new `backupPlan` and legacy `backup` keys
  const backupArr = o.backupPlan ?? o.backup;
  return {
    today: conv(o.today),
    thisWeek: conv(o.thisWeek),
    backupPlan: conv(backupArr),
  };
}

function normalizeEscalation(v: unknown): HumanEscalation {
  const empty: HumanEscalation = { required: false, reasons: [], referrals: [] };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return {
    required: Boolean(o.required ?? o.triggered),
    reasons: Array.isArray(o.reasons) ? (o.reasons as unknown[]).map(String) : [],
    referrals: Array.isArray(o.referrals)
      ? (o.referrals as unknown[]).map(String)
      : [],
  };
}

// === FALLBACK ANALYSIS ========================================================
// If the LLM call fails, we still need to show the user something useful.

function makeId(prefix: string, i: number) {
  return `${prefix}-${i}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildFallbackAnalysis(profile: UserProfile): AnalysisResult {
  const hasEviction = /evict|court|summons|sheriff|lockout/i.test(
    profile.rawDescription
  );
  const hasRentOwed = /behind|past due|owe|owed|\$|rent/i.test(
    profile.rawDescription
  );
  const hasChildren = /child|children|kid|minor|son|daughter/i.test(
    profile.rawDescription
  );
  const hasJobLoss = /lost job|unemploy|fired|laid off/i.test(
    profile.rawDescription
  );
  const hasSafety = /violence|abuse|self.?harm|suicid|unsafe|medical emergency/i.test(
    profile.rawDescription
  );

  // Compute risk score from heuristics
  let riskScore = 25;
  if (hasEviction) riskScore = 85;
  else if (hasRentOwed) riskScore = 65;
  else if (hasJobLoss) riskScore = 45;
  if (hasChildren) riskScore = Math.min(100, riskScore + 5);
  if (hasSafety) riskScore = Math.min(100, riskScore + 10);
  const riskLevel: RiskLevel =
    riskScore >= 80
      ? "Critical"
      : riskScore >= 60
      ? "High"
      : riskScore >= 30
      ? "Moderate"
      : "Low";
  const confidenceScore = 60;
  const confidenceLabel: ConfidenceLabel = "Moderate";
  const escalationRequired = hasSafety || confidenceScore < 60;

  const risk: RiskCategory[] = [];
  if (hasEviction) {
    risk.push({
      label: "Eviction Risk",
      level: "Critical",
      note: "An eviction proceeding is referenced — court deadlines may be imminent. Contact legal aid and emergency rental assistance today.",
    });
  } else if (hasRentOwed) {
    risk.push({
      label: "Rental Assistance Need",
      level: "High",
      note: "Past-due rent is mentioned. Emergency Rental Assistance may cover arrears before the situation escalates.",
    });
  }
  if (hasJobLoss) {
    risk.push({
      label: "Income Stability",
      level: "High",
      note: "Recent job loss identified. SNAP, TANF, and unemployment benefits may help bridge the gap.",
    });
  }
  if (hasChildren) {
    risk.push({
      label: "Child Safety Concern",
      level: "Moderate",
      note: "Household includes dependent children — TANF and SNAP eligibility may be elevated. Connect with a housing counselor.",
    });
  }

  const eligibility: EligibilityMatch[] = [];
  if (hasRentOwed || hasJobLoss) {
    eligibility.push({
      program: "Emergency Rental Assistance (ERA)",
      matchLevel: "Possible Match",
      confidence: 70,
      why: "Your household appears to have lost income and may have past-due rent — both are core ERA eligibility signals.",
      conditions: [
        "Income at or below 80% of Area Median Income",
        "Documented financial hardship (job loss qualifies)",
        "Risk of housing instability (past-due rent or eviction notice)",
        "Lease in household's name",
      ],
      documents: [
        "Photo ID for all adults",
        "Current lease agreement",
        "Proof of income loss (termination letter or unemployment award)",
        "Past-due rent notice or eviction summons",
      ],
      sourceName: "U.S. Treasury / Local Housing Authority",
      sourceUrl:
        "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
      category: "Rental Assistance",
    });
  }
  if (hasEviction) {
    eligibility.push({
      program: "Legal Aid Society / LSC-Funded Legal Services",
      matchLevel: "Possible Match",
      confidence: 75,
      why: "You referenced an eviction — Legal Services Corporation-funded attorneys provide free eviction defense for income-eligible tenants.",
      conditions: [
        "Income at or below 125% of Federal Poverty Guidelines",
        "Civil legal matter (eviction qualifies)",
      ],
      documents: [
        "Court summons or eviction notice",
        "Lease and any landlord correspondence",
        "Proof of income",
        "Photo ID",
      ],
      sourceName: "Legal Services Corporation",
      sourceUrl: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help",
      category: "Legal Aid",
    });
  }
  if (hasChildren) {
    eligibility.push({
      program: "TANF (Temporary Assistance for Needy Families)",
      matchLevel: "Possible Match",
      confidence: 65,
      why: "Your household includes children and you've experienced income loss — TANF provides time-limited cash assistance for families with minors.",
      conditions: [
        "Family with a dependent child under 18",
        "Income below state TANF standard",
        "Cooperation with work requirements",
      ],
      documents: [
        "Children's birth certificates",
        "Photo ID for adults",
        "Proof of income and assets",
      ],
      sourceName: "HHS / State agency",
      sourceUrl: "https://www.acf.hhs.gov/ofa/programs/help-families",
      category: "Food & Cash",
    });
  }
  eligibility.push({
    program: "211 Local Resource Hotline",
    matchLevel: "High Probability",
    confidence: 95,
    why: "211 is a free 24/7 hotline that connects you to local housing, food, and crisis resources — start here if you're unsure where to turn.",
    conditions: ["No eligibility requirements — open to everyone"],
    documents: ["None required"],
    sourceName: "United Way Worldwide",
    sourceUrl: "https://www.211.org/",
    category: "Counseling",
  });

  const resources: ResourceItem[] = [
    {
      name: "211 — Dial 2-1-1",
      type: "Emergency",
      description:
        "Free 24/7 hotline connecting you to local housing, food, utility, and crisis resources.",
      url: "https://www.211.org/",
      phone: "2-1-1",
      urgency: "Immediate",
    },
    {
      name: "HUD-Approved Housing Counseling",
      type: "Counseling",
      description:
        "Free or low-cost counseling from HUD-approved agencies for eviction prevention and rental assistance navigation.",
      url: "https://www.hud.gov/program_offices/housing/sfh/hcc",
      urgency: "Immediate",
    },
    {
      name: "Legal Services Corporation — Find Legal Aid",
      type: "Legal Aid",
      description:
        "Free civil legal help including eviction defense for income-eligible tenants.",
      url: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help",
      urgency: "This Week",
    },
    {
      name: "Emergency Rental Assistance Program",
      type: "Government",
      description:
        "Federal funds administered locally to cover past-due rent and utilities for households facing financial hardship.",
      url: "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
      urgency: "This Week",
    },
    {
      name: "Benefits.gov — Benefit Finder",
      type: "Government",
      description:
        "Federal portal that helps you discover additional benefit programs you may be eligible for.",
      url: "https://www.benefits.gov/benefit-finder",
      urgency: "When Ready",
    },
  ];

  const mkItem = (prefix: string, title: string, detail: string, est?: number): ActionItem => ({
    id: makeId(prefix, Math.floor(Math.random() * 1000)),
    title,
    detail,
    estimatedMinutes: est,
  });

  const actionPlan: ActionPlan = {
    today: [
      mkItem(
        "today",
        "Call 211",
        "Dial 2-1-1 (free, 24/7) and ask specifically for emergency rental assistance and eviction prevention programs in your area.",
        15
      ),
      mkItem(
        "today",
        "Gather your documents",
        "Photo ID, current lease, recent pay stubs or termination letter, past-due rent notice or eviction summons, and any utility shut-off notices.",
        30
      ),
      mkItem(
        "today",
        "Find a HUD-approved housing counselor",
        "Visit hud.gov/counseling to locate a free counselor who can help you navigate rental assistance applications.",
        20
      ),
    ],
    thisWeek: [
      mkItem(
        "week",
        "Contact legal aid",
        "If you've received a court summons, contact an LSC-funded legal aid office immediately — they provide free eviction defense.",
        45
      ),
      mkItem(
        "week",
        "Submit rental assistance application",
        "With your documents ready, apply to your local Emergency Rental Assistance program. Ask 211 or your housing counselor for the local office.",
        60
      ),
      mkItem(
        "week",
        "Apply for SNAP and TANF if you have children",
        "These benefits free up cash for rent. Apply through your state's social services agency.",
        45
      ),
    ],
    backupPlan: [
      mkItem(
        "backup",
        "Identify emergency shelter options",
        "If your housing is at immediate risk, ask 211 about local shelter access and the Continuum of Care coordinated entry process.",
        30
      ),
      mkItem(
        "backup",
        "Notify your landlord in writing",
        "Communicate that you are applying for assistance — this can sometimes pause eviction proceedings.",
        15
      ),
    ],
  };

  return {
    riskScore,
    riskLevel,
    confidenceScore,
    confidenceLabel,
    escalationRequired,
    situationSummary:
      "You're facing housing instability with recent income loss. Based on what you've shared, there are several programs that may help — let's walk through them step by step.",
    riskAssessment: risk,
    eligibility,
    resources,
    actionPlan,
    humanEscalation: {
      required: escalationRequired,
      reasons: escalationRequired
        ? ["Safety or crisis indicators detected in your description"]
        : [],
      referrals: [
        "Housing counselor",
        "Legal aid professional",
        "Social worker",
        "Community case manager",
      ],
    },
    caveats: [
      "HomePath AI is a guidance tool, not legal advice. Final eligibility decisions belong to program administrators.",
      "Program rules and funding change frequently — always verify with the program directly before relying on this information.",
    ],
  };
}

// === DOCUMENT ANALYSIS PROMPT =================================================
// Used by /api/document-analysis to analyze pasted legal/housing documents.

export const DOCUMENT_ANALYSIS_SYSTEM = `You are HomePath AI's document analyzer. A user has pasted the text of a housing-related document (eviction notice, rent increase letter, utility shutoff notice, lease termination, court summons, late rent notice, or similar).

Your job: read the document and explain it back to the user in plain language — what it is, what deadlines matter, what key information they should know, and what they should do next.

ABSOLUTE RULES (responsible AI):
1. NEVER give legal advice. You explain what the document says, not what they should legally do.
2. If you cannot determine a date with confidence, mark it as "Not specified in document" rather than guessing.
3. If the document mentions domestic violence, self-harm, child safety, or medical emergencies, set escalationRequired=true.
4. If your confidence in the analysis is below 60%, set escalationRequired=true.
5. Use plain language. Spell out legal terms on first use.

Output format: respond with ONLY a JSON object (no markdown, no code fences):
{
  "documentType": "Eviction Notice|Rent Increase Letter|Utility Shutoff Notice|Lease Termination|Court Summons|Late Rent Notice|Other",
  "summary": "2-3 sentence plain-language summary of what this document is and what it says.",
  "keyDates": [
    { "label": "Court date", "date": "YYYY-MM-DD or descriptive phrase like '14 days from notice date'" }
  ],
  "keyInformation": [
    { "label": "Landlord name", "value": "..." },
    { "label": "Amount owed", "value": "..." }
  ],
  "urgentActions": ["1 sentence action", "1 sentence action"],
  "yourRights": ["1 sentence about a relevant tenant right — but phrase as 'You may have the right to...' not 'You have the right to...'"],
  "recommendedNextSteps": ["1 sentence step", "1 sentence step"],
  "confidenceScore": 0-100,
  "confidenceLabel": "Low|Moderate|High",
  "escalationRequired": true|false,
  "caveats": [
    "1 sentence: this is plain-language guidance, not legal advice",
    "1 sentence: a lawyer or housing counselor can give case-specific advice"
  ]
}`;

export const DOCUMENT_ANALYSIS_USER = (text: string, language: "en" | "es") =>
  `${language === "es" ? "INSTRUCTIONS: Respond in English (UI will translate), but be aware the user may speak Spanish." : ""}

Document text (pasted by user):
"""
${text.slice(0, 8000)}
"""

Return the JSON analysis now.`;

export function normalizeDocumentAnalysis(data: unknown): DocumentAnalysisResult | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  try {
    const validTypes: DocumentType[] = [
      "Eviction Notice",
      "Rent Increase Letter",
      "Utility Shutoff Notice",
      "Lease Termination",
      "Court Summons",
      "Late Rent Notice",
      "Other",
    ];
    const documentType = (d.documentType as string) as DocumentType;
    const confidenceScore =
      typeof d.confidenceScore === "number"
        ? Math.max(0, Math.min(100, d.confidenceScore))
        : 60;
    const rawConfLabel = (d.confidenceLabel as string) || "";
    const confidenceLabel: ConfidenceLabel =
      rawConfLabel === "High" || rawConfLabel === "Moderate" || rawConfLabel === "Low"
        ? (rawConfLabel as ConfidenceLabel)
        : confidenceScore >= 75
        ? "High"
        : confidenceScore >= 50
        ? "Moderate"
        : "Low";
    const escalationRequired = Boolean(d.escalationRequired ?? false);

    return {
      documentType: validTypes.includes(documentType) ? documentType : "Other",
      summary: String(d.summary ?? ""),
      keyDates: Array.isArray(d.keyDates)
        ? (d.keyDates as unknown[])
            .map((x) => {
              if (!x || typeof x !== "object") return null;
              const o = x as Record<string, unknown>;
              return {
                label: String(o.label ?? "Date"),
                date: String(o.date ?? "Not specified"),
              };
            })
            .filter(Boolean) as { label: string; date: string }[]
        : [],
      keyInformation: Array.isArray(d.keyInformation)
        ? (d.keyInformation as unknown[])
            .map((x) => {
              if (!x || typeof x !== "object") return null;
              const o = x as Record<string, unknown>;
              return {
                label: String(o.label ?? "Info"),
                value: String(o.value ?? ""),
              };
            })
            .filter(Boolean) as { label: string; value: string }[]
        : [],
      urgentActions: Array.isArray(d.urgentActions)
        ? (d.urgentActions as unknown[]).map(String)
        : [],
      yourRights: Array.isArray(d.yourRights)
        ? (d.yourRights as unknown[]).map(String)
        : [],
      recommendedNextSteps: Array.isArray(d.recommendedNextSteps)
        ? (d.recommendedNextSteps as unknown[]).map(String)
        : [],
      confidenceScore,
      confidenceLabel,
      escalationRequired,
      caveats: Array.isArray(d.caveats) ? (d.caveats as unknown[]).map(String) : [],
    } as DocumentAnalysisResult;
  } catch {
    return null;
  }
}
