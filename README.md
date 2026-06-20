# HomePath AI

An AI-powered Housing Stability Guide that helps families facing eviction understand their options, identify programs they may qualify for, and receive a personalized action plan — before the situation becomes homelessness.

Built for the USAII Global AI Hackathon 2026 (Undergraduate Track, Challenge 4, Direction B: Housing Stability Guide).

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide
- **Fonts:** Fraunces (serif display) + Inter (sans body) via Google Fonts
- **AI:** `@google/genai` (Google Gemini) — backend only
- **State:** React hooks + localStorage (no global store needed for MVP)

No database required for the MVP. Prisma is installed and configured but unused.

---

## Features

### 15 capabilities implemented

| # | Feature | Where |
|---|---------|-------|
| 1 | AI housing assessment and intake | `IntakeChat` + `/api/chat` + `/api/extract` |
| 2 | Housing risk classification (Low / Moderate / High / Critical) | Backend `riskLevel` field |
| 3 | Prioritized action plans (structured JSON) | `actionPlan.today` / `thisWeek` / `backupPlan` |
| 4 | Emergency rental assistance recommendations | Eligibility + Programs views |
| 5 | Legal aid referrals | Eligibility + Resources views |
| 6 | Progress tracking (localStorage) | `useProgress` hook + Action Plan view |
| 7 | Human escalation for high-risk cases | Backend `escalationRequired` flag |
| 8 | Responsible AI safeguards | "May qualify" language, confidence %, source links, caveats, persistent banner |
| 9 | AI document analysis (eviction notices, rent increases, utility shutoffs) | `/api/document-analysis` + Document Analysis view |
| 10 | English and Spanish support | `i18n.ts` + `LanguageProvider` + header toggle |
| 11 | Program Explorer | `ProgramsView` (search + filter) |
| 12 | Multi-page user experience | `Sidebar` + 5 views (single-route SPA) |
| 13 | Personalized dashboard | `DashboardView` |
| 14 | Housing risk score (0–100) | Backend `riskScore` field, displayed as gauge |
| 15 | Action Plan Center | `ActionPlanView` with 3 columns + % progress |

### User journey (7 steps, end-to-end)

1. **Describe your situation** — plain-language chat with AI-driven followups
2. **AI situation analysis** — risk classification with confidence score
3. **Eligibility interpretation** — "you may qualify" matches against real HUD/Treasury/HHS programs
4. **Resource retrieval** — local + national resources with phone numbers
5. **AI reasoning layer** — explains why each program may fit
6. **Personalized action plan** — Today / This Week / Backup Plan with checkable items
7. **Human escalation** — when safety concerns detected or confidence is low

---

## File Structure

```
my-project/
├── README.md                              # You are here
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                        # shadcn/ui config
├── Caddyfile                              # Gateway config (XTransformPort handling)
└── src/
    ├── app/
    │   ├── layout.tsx                     # Root layout — fonts + metadata
    │   ├── page.tsx                       # Main page — phase router + LanguageProvider
    │   ├── globals.css                    # Calm palette, animations, scrollbars
    │   └── api/
    │       ├── chat/route.ts              # POST — conversational intake
    │       ├── extract/route.ts           # POST — extract structured UserProfile
    │       ├── analyze/route.ts           # POST — main analysis (non-streaming)
    │       └── document-analysis/route.ts # POST — analyze pasted documents
    ├── lib/
    │   ├── utils.ts                       # cn() helper
    │   ├── db.ts                          # Prisma client (unused in MVP)
    │   └── homepath/
    │       ├── types.ts                   # All TypeScript types
    │       ├── knowledge.ts               # 10 real US housing programs + risk rules
    │       ├── prompts.ts                 # LLM prompts + JSON parsers + fallback
    │       └── i18n.ts                    # EN/ES string tables (~120 keys)
    ├── components/
    │   ├── ui/                            # ~60 shadcn/ui components (preinstalled)
    │   └── homepath/
    │       ├── LanguageProvider.tsx       # React Context for language + t() hook
    │       ├── useProgress.ts             # localStorage hook for action items
    │       ├── SiteHeader.tsx             # Sticky header + language toggle
    │       ├── ResponsibleAIBanner.tsx    # Amber "guidance not guarantee" banner
    │       ├── LandingHero.tsx            # Landing page hero
    │       ├── IntakeChat.tsx             # Hybrid chat → profile form intake
    │       ├── AnalyzingView.tsx          # Loading screen during /api/analyze
    │       ├── Sidebar.tsx                # Desktop sidebar + MobileNav
    │       ├── DashboardView.tsx          # Dashboard with risk score gauge
    │       ├── ActionPlanView.tsx         # Action Plan Center with checkboxes
    │       ├── ProgramsView.tsx           # Program Explorer (search + filter)
    │       ├── DocumentAnalysisView.tsx   # Document Analysis page
    │       └── ResourcesView.tsx          # Resources grouped by urgency
    └── hooks/
        ├── use-mobile.ts
        └── use-toast.ts
```

---

## Backend Contract

### `POST /api/analyze`

**Request:**
```json
{
  "profile": {
    "location": "Atlanta, GA",
    "householdSize": "1 adult, 2 children",
    "incomeStatus": "No income after job loss",
    "employmentStatus": "Unemployed — lost job last month",
    "housingStatus": "Renting, received eviction notice",
    "rentOwed": "$1,800 past due",
    "evictionTimeline": "Court date in 2 weeks",
    "additionalContext": "Has two children ages 6 and 9",
    "rawDescription": "I lost my job last month and just received an eviction notice..."
  },
  "language": "en"
}
```

**Response (non-streaming, all at once):**
```json
{
  "analysis": {
    "riskScore": 85,
    "riskLevel": "Critical",
    "confidenceScore": 85,
    "confidenceLabel": "High",
    "escalationRequired": true,
    "situationSummary": "...",
    "riskAssessment": [
      { "label": "Eviction Risk", "level": "Critical", "note": "..." }
    ],
    "eligibility": [
      {
        "program": "Emergency Rental Assistance (ERA)",
        "matchLevel": "High Probability",
        "confidence": 85,
        "why": "...",
        "conditions": ["..."],
        "documents": ["..."],
        "sourceName": "U.S. Treasury / Local Housing Authority",
        "sourceUrl": "https://...",
        "category": "Rental Assistance"
      }
    ],
    "resources": [
      {
        "name": "211 — Dial 2-1-1",
        "type": "Emergency",
        "description": "...",
        "url": "https://www.211.org/",
        "phone": "2-1-1",
        "urgency": "Immediate"
      }
    ],
    "actionPlan": {
      "today":      [{ "id": "today-0-abc1", "title": "...", "detail": "...", "estimatedMinutes": 15 }],
      "thisWeek":   [{ "id": "week-0-def2",  "title": "...", "detail": "...", "estimatedMinutes": 45 }],
      "backupPlan": [{ "id": "backup-0-ghi3","title": "...", "detail": "...", "estimatedMinutes": 30 }]
    },
    "humanEscalation": {
      "required": true,
      "reasons": ["..."],
      "referrals": ["Housing counselor", "Legal aid professional", "Social worker", "Community case manager"]
    },
    "caveats": [
      "This is not legal advice...",
      "Eligibility rules may change..."
    ]
  },
  "meta": {
    "usedFallback": false,
    "language": "en",
    "generatedAt": "2026-06-20T18:04:00.000Z"
  }
}
```

### `POST /api/document-analysis`

**Request:**
```json
{ "text": "NOTICE TO VACATE ...", "language": "en" }
```

**Response:**
```json
{
  "analysis": {
    "documentType": "Eviction Notice",
    "summary": "...",
    "keyDates": [{ "label": "Pay or vacate deadline", "date": "2026-03-29" }],
    "keyInformation": [{ "label": "Landlord name", "value": "ABC Property Management" }],
    "urgentActions": ["..."],
    "yourRights": ["You may have the right to..."],
    "recommendedNextSteps": ["..."],
    "confidenceScore": 95,
    "confidenceLabel": "High",
    "escalationRequired": false,
    "caveats": ["..."]
  },
  "meta": { "usedFallback": false, "language": "en", "generatedAt": "..." }
}
```

### `POST /api/chat`

Conversational intake — one turn at a time.

**Request:**
```json
{
  "history": [
    { "role": "user", "content": "I lost my job..." },
    { "role": "assistant", "content": "I'm sorry to hear..." }
  ],
  "language": "en"
}
```

**Response:**
```json
{
  "reply": "Thank you for sharing that. Could you tell me where you live?",
  "ready": false,
  "acknowledged": "job loss in Atlanta"
}
```

### `POST /api/extract`

Turns free-text chat into a structured `UserProfile`.

**Request:**
```json
{ "rawDescription": "I lost my job... I live in Atlanta...", "language": "en" }
```

**Response:**
```json
{
  "profile": {
    "location": "Atlanta, GA",
    "householdSize": "1 adult, 2 children",
    "incomeStatus": "No income after job loss",
    "employmentStatus": "Unemployed",
    "housingStatus": "Renting, received eviction notice",
    "rentOwed": "$1,800 past due",
    "evictionTimeline": "Court date in 2 weeks",
    "additionalContext": "...",
    "rawDescription": "..."
  }
}
```

---

## Quickstart

### Prerequisites

- Node.js 18+ or Bun
- A `GEMINI_API_KEY` in your `.env` file (get one at https://aistudio.google.com/apikey)

### Install & run

```bash
bun install
bun run dev      # dev server on http://localhost:3000
bun run lint     # ESLint
```

The app runs on port 3000. Only the `/` route is user-facing (per sandbox rules) — everything is a single-route SPA.

### Try the demo

1. Open the app
2. Click **"Try the demo scenario"** — pre-fills the eviction scenario
3. Send the message → AI replies contextually
4. Click **"Analyze now"** or wait for auto-trigger
5. Review the extracted profile → click **"Looks good — analyze"**
6. Wait ~15–30s for the Dashboard to load
7. Explore the 5 views via the sidebar (desktop) or bottom nav (mobile)
8. Toggle EN/ES in the header

---

## Architecture Notes

### Phase router (single-page SPA)

`src/app/page.tsx` manages 4 phases via React state:

```
landing  →  intake  →  analyzing  →  app
   ↓         ↓           ↓            ↓
 LandingHero  IntakeChat  AnalyzingView  Sidebar + 5 views
```

After analysis, the "app" phase shows a 5-view hub:

| View | Component | Purpose |
|------|-----------|---------|
| Dashboard | `DashboardView` | Risk score gauge, confidence, situation summary, top programs, quick actions |
| Action Plan | `ActionPlanView` | 3 columns (Today / This Week / Backup) with checkable items + % progress |
| Programs | `ProgramsView` | Searchable + filterable list of all 10 housing programs |
| Document Analysis | `DocumentAnalysisView` | Paste a document → AI explains type, dates, urgent actions |
| Resources | `ResourcesView` | All resources grouped by urgency (Immediate / This Week / When Ready) |

### Responsible AI guardrails (always visible)

- Persistent amber banner on every page: "This is guidance, not a guarantee"
- Per-card "you MAY qualify" badges — never "you qualify"
- Confidence % on every program match + overall confidence on dashboard
- Real source links (HUD.gov, Treasury.gov, LSC.gov, etc.) — no fabrication
- Backend decides `escalationRequired` — frontend just renders it
- Caveats at end of analysis + document analysis

### i18n

- 120+ string keys in `src/lib/homepath/i18n.ts`
- `LanguageProvider` wraps the entire app via React Context
- `useLanguage()` hook returns `{ language, setLanguage, toggle, t }`
- Header has a globe toggle button — switches EN ↔ ES instantly
- Demo text and quick-reply suggestions are also localized

### Progress tracking

- `useProgress()` hook stores checkbox state in `localStorage` under `homepath-progress-v1`
- Keys are `${section}:${itemId}` (e.g. `today:today-0-abc1`)
- % complete appears in both the sidebar and the Action Plan view
- Reset button clears all progress

### Knowledge base

`src/lib/homepath/knowledge.ts` contains 10 real US housing programs:

1. Emergency Rental Assistance (ERA) — U.S. Treasury
2. HUD Housing Choice Voucher (Section 8)
3. Continuum of Care (CoC) Emergency Shelter & Rapid Re-Housing — HUD
4. Low Income Home Energy Assistance Program (LIHEAP) — HHS
5. SNAP / Food Assistance — USDA
6. TANF (Temporary Assistance for Needy Families) — HHS
7. Legal Aid Society / LSC-Funded Legal Services — LSC
8. 211 Local Resource Hotline — United Way
9. HUD-Approved Housing Counseling
10. National Domestic Violence Hotline

Each program has: name, agency, URL, description, eligibility rules, required documents, and applicable user situations.

---

## Visual Design — "Calm & Trustworthy"

- **Primary color:** Soft teal `#0F766E` (oklch 0.45 0.09 180)
- **Background:** Warm cream `#FBF8F4` (oklch 0.985 0.012 80)
- **Accents:** Sage green + warm terracotta
- **Typography:** Fraunces serif for headlines, Inter sans for body
- **Texture:** Subtle radial-gradient paper overlay (no harsh contrast)
- **Cards:** Rounded 2xl/3xl with soft shadows
- **Animations:** Subtle fade-up + thinking dots — never jarring

Designed for users under stress: nothing flashes, nothing shouts, everything feels steady.

---

## Known Limitations

- The Gemini API calls can take 15–35s — the `AnalyzingView` sets expectations
- If Gemini fails to return valid JSON, `buildFallbackAnalysis()` provides a heuristic-based result with `usedFallback: true` in the meta
- Document analysis is capped at 8,000 characters of pasted text
- The app is a single-route SPA — there's no URL routing between views (state-based only)
- No persistence of the analysis result across page reloads (would need sessionStorage or a backend session)

---

## License

Built for the USAII Global AI Hackathon 2026. Not legal advice — final eligibility decisions belong to program administrators.
