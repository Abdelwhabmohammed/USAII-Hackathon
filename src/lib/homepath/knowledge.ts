// HomePath AI — Knowledge base of real housing assistance programs
// Sources: HUD, US interagency programs, well-known community/legal-aid orgs.
// Used as grounding context for the AI's eligibility interpretation.

export interface ProgramRecord {
  name: string;
  agency: string;
  url: string;
  description: string;
  eligibility: string[];
  documents: string[];
  appliesTo: string[]; // user situations this typically helps with
}

export const PROGRAMS: ProgramRecord[] = [
  {
    name: "Emergency Rental Assistance (ERA)",
    agency: "U.S. Treasury / Local Housing Authority",
    url: "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
    description:
      "Federal program that provides funds to assist households unable to pay rent or utilities due to financial hardship. Many states still operate ERA-funded programs through local housing authorities.",
    eligibility: [
      "Household income at or below 80% of Area Median Income (AMI)",
      "Demonstrated financial hardship (job loss, medical, etc.)",
      "Risk of homelessness or housing instability (e.g., eviction notice, past-due rent)",
      "Valid lease in the household's name (in most cases)",
    ],
    documents: [
      "Photo ID for all adults in household",
      "Current lease agreement",
      "Proof of income loss (termination letter, pay stubs, unemployment award)",
      "Past-due rent notice or eviction summons",
      "Utility shut-off notice if applying for utility help",
    ],
    appliesTo: ["eviction", "rent_owed", "job_loss", "behind_on_rent"],
  },
  {
    name: "HUD Housing Choice Voucher (Section 8)",
    agency: "U.S. Department of Housing and Urban Development",
    url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    description:
      "Long-term rental assistance for very low-income families, the elderly, and people with disabilities. Recipients pay 30% of income toward rent; the voucher covers the rest up to a local payment standard.",
    eligibility: [
      "Income at or below 50% of Area Median Income (AMI)",
      "U.S. citizenship or eligible immigration status",
      "Pass background screening per local PHA policy",
      "Waitlists are typically long — not an emergency option",
    ],
    documents: [
      "Birth certificates and SSNs for all household members",
      "Photo ID",
      "Income verification (pay stubs, benefit letters)",
      "Current lease or landlord information",
    ],
    appliesTo: ["low_income", "long_term", "disability", "elderly"],
  },
  {
    name: "Continuum of Care (CoC) Emergency Shelter & Rapid Re-Housing",
    agency: "HUD / Local Continuum of Care",
    url: "https://www.hudexchange.info/programs/coc/",
    description:
      "Locally coordinated crisis-response system: emergency shelter, rapid re-housing (short-term rental subsidy + services), and permanent supportive housing. Coordinated entry is the front door.",
    eligibility: [
      "Literally homeless or fleeing domestic violence (HUD Category 1–4)",
      "Income at or below 30% AMI for most CoC programs",
      "Willingness to participate in case management",
    ],
    documents: [
      "Identification (or sworn statement if unavailable)",
      "Verification of homelessness (outreach worker letter, shelter intake)",
      "Income statement",
    ],
    appliesTo: ["homeless", "fleeing_violence", "imminent_eviction"],
  },
  {
    name: "Low Income Home Energy Assistance Program (LIHEAP)",
    agency: "U.S. Department of Health & Human Services",
    url: "https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap",
    description:
      "Helps low-income households pay heating and cooling bills, and in some cases covers emergency utility shut-off or repair. Operated through state LIHEAP grantees.",
    eligibility: [
      "Income at or below 150% of Federal Poverty Guidelines (most states)",
      "Or automatic eligibility via SNAP, SSI, or TANF",
      "Responsible for paying utility bills",
    ],
    documents: [
      "Photo ID",
      "Recent utility bill",
      "Proof of income for all adults",
      "Shut-off notice if applying for emergency LIHEAP",
    ],
    appliesTo: ["utility_shutoff", "low_income"],
  },
  {
    name: "SNAP / Food Assistance",
    agency: "USDA Food and Nutrition Service / State agency",
    url: "https://www.fns.usda.gov/snap",
    description:
      "Supplemental Nutrition Assistance Program — monthly food benefits. Frees up cash for rent during a housing crisis. Often administered alongside TANF and Medicaid.",
    eligibility: [
      "Gross monthly income at or below 130% of Federal Poverty Level (most cases)",
      "Net income at or below 100% FPL",
      "Asset limits vary by state and household composition",
      "Work requirements for some adults without dependents",
    ],
    documents: [
      "Photo ID and SSN",
      "Proof of income",
      "Proof of housing costs (lease, mortgage)",
      "Proof of dependent care costs",
    ],
    appliesTo: ["low_income", "job_loss", "children"],
  },
  {
    name: "TANF (Temporary Assistance for Needy Families)",
    agency: "HHS / State agency",
    url: "https://www.acf.hhs.gov/ofa/programs/help-families",
    description:
      "Time-limited cash assistance for families with children. Can be used for rent, utilities, and basic needs. Often paired with work requirements and supportive services.",
    eligibility: [
      "Family with a dependent child under 18 (or 19 if in school)",
      "Income well below state TANF standard (varies)",
      "U.S. citizenship or eligible legal residency",
      "Cooperation with child support and work requirements",
    ],
    documents: [
      "Birth certificates for children",
      "Photo ID for adults",
      "Proof of income and assets",
      "School enrollment verification for older children",
    ],
    appliesTo: ["children", "low_income", "job_loss"],
  },
  {
    name: "Legal Aid Society / LSC-Funded Legal Services",
    agency: "Legal Services Corporation",
    url: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help",
    description:
      "Free civil legal help for low-income people, including eviction defense, lease disputes, and public benefits appeals. Critical for tenants with a court date.",
    eligibility: [
      "Income at or below 125% of Federal Poverty Guidelines (most programs)",
      "Civil legal matter (eviction, denial of benefits, family law)",
      "No felony conviction disqualifying per program policy",
    ],
    documents: [
      "Court summons or eviction notice",
      "Lease and any correspondence with landlord",
      "Proof of income",
      "Photo ID",
    ],
    appliesTo: ["eviction_court", "lease_dispute", "benefits_denied"],
  },
  {
    name: "211 Local Resource Hotline",
    agency: "United Way Worldwide",
    url: "https://www.211.org/",
    description:
      "Free 24/7 hotline (dial 2-1-1) that connects callers to local housing, food, utility, and crisis resources. Best first call when unsure where to turn.",
    eligibility: ["No eligibility requirements — open to all"],
    documents: ["None required"],
    appliesTo: ["universal", "first_call"],
  },
  {
    name: "HUD-Approved Housing Counseling",
    agency: "HUD Office of Housing Counseling",
    url: "https://www.hud.gov/program_offices/housing/sfh/hcc",
    description:
      "Free or low-cost counseling from HUD-approved agencies. Counselors help with eviction prevention, budget review, and navigating rental assistance applications.",
    eligibility: ["Open to all; some agencies prioritize low-income households"],
    documents: [
      "Recent income documents",
      "Lease and rent ledger",
      "Any correspondence from landlord or court",
    ],
    appliesTo: ["universal", "counseling", "eviction_prevention"],
  },
  {
    name: "National Domestic Violence Hotline",
    agency: "Texas Council on Family Violence (federally funded)",
    url: "https://www.thehotline.org/",
    description:
      "24/7 confidential support, safety planning, and referrals to local shelters and legal advocates for anyone experiencing domestic violence. Call 1-800-799-7233 or text 'START' to 88788.",
    eligibility: ["No eligibility requirements — confidential support for all"],
    documents: ["None required"],
    appliesTo: ["domestic_violence", "fleeing_violence", "safety"],
  },
];

export interface RiskRule {
  label: string;
  triggers: string[]; // keywords or situation markers
  level: "Critical" | "High" | "Moderate" | "Low";
  defaultNote: string;
}

export const RISK_RULES: RiskRule[] = [
  {
    label: "Eviction Risk",
    triggers: ["eviction", "eviction notice", "court summons", "sheriff", "lockout"],
    level: "Critical",
    defaultNote:
      "Active eviction proceeding detected — court deadlines may be imminent. Legal counsel and emergency rental assistance should be sought immediately.",
  },
  {
    label: "Rental Assistance Need",
    triggers: ["behind on rent", "rent owed", "past due", "cannot pay rent"],
    level: "High",
    defaultNote:
      "Past-due rent identified. Emergency Rental Assistance may help cover arrears before the situation escalates to eviction.",
  },
  {
    label: "Emergency Housing Need",
    triggers: ["homeless", "shelter", "no place", "kicked out", "fled"],
    level: "Critical",
    defaultNote:
      "Imminent or current loss of housing. Contact the local Continuum of Care and 211 for same-day shelter options.",
  },
  {
    label: "Utility Assistance Need",
    triggers: ["utility", "shut off", "electricity", "gas", "water"],
    level: "Moderate",
    defaultNote:
      "Utility shut-off risk identified. LIHEAP may be available to prevent disconnection.",
  },
  {
    label: "Legal Support Need",
    triggers: ["court", "summons", "lawsuit", "lawyer", "attorney"],
    level: "High",
    defaultNote:
      "Legal proceeding referenced. Free eviction defense may be available through LSC-funded legal aid in your area.",
  },
  {
    label: "Child Safety Concern",
    triggers: ["children", "minor", "abuse", "unsafe", "domestic violence"],
    level: "Critical",
    defaultNote:
      "Household includes dependent children. Connecting with a housing counselor and child welfare resources is strongly recommended.",
  },
];
