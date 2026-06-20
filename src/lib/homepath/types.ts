// HomePath AI — Shared types

export type Phase = "landing" | "intake" | "analyzing" | "app";

// Post-analysis views inside the app phase
export type AppView =
  | "dashboard"
  | "action-plan"
  | "programs"
  | "document-analysis"
  | "resources";

export type Language = "en" | "es";

export interface UserProfile {
  location: string;
  householdSize: string;
  incomeStatus: string;
  employmentStatus: string;
  housingStatus: string;
  rentOwed: string;
  evictionTimeline: string;
  additionalContext?: string;
  rawDescription: string;
}

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  ts: number;
  kind?: "intro" | "question" | "answer" | "system";
}

// Result schema returned by /api/analyze (now non-streaming, all-at-once)
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type ConfidenceLabel = "Low" | "Moderate" | "High";
export type MatchLevel = "High Probability" | "Possible Match" | "Requires Verification";

export interface EligibilityMatch {
  program: string;
  matchLevel: MatchLevel;
  confidence: number; // 0–100
  why: string;
  conditions: string[];
  documents: string[];
  sourceName: string;
  sourceUrl: string;
  applicationLink?: string;
  category: "Rental Assistance" | "Legal Aid" | "Food & Cash" | "Emergency Housing" | "Utility" | "Counseling";
}

export interface ResourceItem {
  name: string;
  type: "Government" | "Community" | "Legal Aid" | "Emergency" | "Counseling";
  description: string;
  url: string;
  phone?: string;
  urgency: "Immediate" | "This Week" | "When Ready";
}

export interface ActionItem {
  id: string;
  title: string;
  detail: string;
  estimatedMinutes?: number;
}

export interface ActionPlan {
  today: ActionItem[];
  thisWeek: ActionItem[];
  backupPlan: ActionItem[];
}

export interface RiskCategory {
  label: string;
  level: RiskLevel;
  note: string;
}

export interface HumanEscalation {
  required: boolean;
  reasons: string[];
  referrals: string[];
}

export interface AnalysisResult {
  // Top-level structured fields
  riskScore: number; // 0-100 (higher = more risk)
  riskLevel: RiskLevel;
  confidenceScore: number; // 0-100 (higher = more confident in interpretation)
  confidenceLabel: ConfidenceLabel;
  escalationRequired: boolean;

  // Body content
  situationSummary: string;
  riskAssessment: RiskCategory[];
  eligibility: EligibilityMatch[];
  resources: ResourceItem[];
  actionPlan: ActionPlan;
  humanEscalation: HumanEscalation;
  caveats: string[];
}

// Document analysis result schema
export type DocumentType =
  | "Eviction Notice"
  | "Rent Increase Letter"
  | "Utility Shutoff Notice"
  | "Lease Termination"
  | "Court Summons"
  | "Late Rent Notice"
  | "Other";

export interface DocumentAnalysisResult {
  documentType: DocumentType;
  summary: string;
  keyDates: { label: string; date: string }[];
  keyInformation: { label: string; value: string }[];
  urgentActions: string[];
  yourRights: string[];
  recommendedNextSteps: string[];
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  escalationRequired: boolean;
  caveats: string[];
}

// Persisted progress tracking for action items
export interface ProgressMap {
  // key: `${view}:${itemId}`, value: boolean (completed)
  [key: string]: boolean;
}
