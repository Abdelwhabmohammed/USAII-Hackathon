// HomePath AI — i18n string tables (English + Spanish)
import type { Language } from "./types";

export const STRINGS = {
  // Brand & global
  brand: { en: "HomePath AI", es: "HomePath AI" },
  tagline: {
    en: "Housing Stability Guide",
    es: "Guía de Estabilidad de Vivienda",
  },
  guidanceOnly: {
    en: "Guidance, not legal advice",
    es: "Orientación, no asesoría legal",
  },

  // Header
  startOver: { en: "Start over", es: "Empezar de nuevo" },
  backToHome: { en: "Back to home", es: "Volver al inicio" },
  language: { en: "Español", es: "English" },

  // Landing
  badge: {
    en: "AI-Powered Housing Stability Guide",
    es: "Guía de Estabilidad de Vivienda con IA",
  },
  heroTitle1: {
    en: "From housing crisis",
    es: "De crisis de vivienda",
  },
  heroTitle2: { en: "to clear next steps.", es: "a pasos claros." },
  heroSubtitle: {
    en: "HomePath AI helps families facing eviction understand their options, identify programs they may qualify for, and receive a personalized action plan — before the situation becomes homelessness.",
    es: "HomePath AI ayuda a familias enfrentando desalojo a entender sus opciones, identificar programas para los que podrían calificar, y recibir un plan de acción personalizado — antes de que la situación se convierta en desamparo.",
  },
  startIntake: { en: "Start your intake", es: "Comenzar evaluación" },
  tryDemo: { en: "Try the demo scenario", es: "Probar escenario demo" },
  whatYoullGet: { en: "What you'll get", es: "Lo que obtendrás" },
  whatYoullGetSub: {
    en: "A specific, end-to-end user journey — not a generic help portal.",
    es: "Un recorrido específico de principio a fin — no un portal genérico de ayuda.",
  },
  featureSituationTitle: { en: "Situation analysis", es: "Análisis de situación" },
  featureSituationDesc: {
    en: "Describe your situation in plain words. AI listens, classifies risks, and explains what's happening.",
    es: "Describe tu situación con tus palabras. La IA escucha, clasifica riesgos y explica qué está pasando.",
  },
  featureEligibilityTitle: {
    en: "Eligibility interpretation",
    es: "Interpretación de elegibilidad",
  },
  featureEligibilityDesc: {
    en: "We compare your circumstances to real HUD, Treasury, and community program rules — and explain why each may fit.",
    es: "Comparamos tus circunstancias con reglas reales de HUD, Tesoro y programas comunitarios — y explicamos por qué cada uno podría funcionar.",
  },
  featureActionPlanTitle: { en: "Action plan", es: "Plan de acción" },
  featureActionPlanDesc: {
    en: "Get a personalized checklist: what to do today, this week, and as backup — with links and phone numbers.",
    es: "Recibe una lista personalizada: qué hacer hoy, esta semana y como respaldo — con enlaces y números de teléfono.",
  },
  featureEscalationTitle: {
    en: "Human escalation",
    es: "Escalado humano",
  },
  featureEscalationDesc: {
    en: "If we detect a safety concern or low confidence, we connect you with a housing counselor or legal aid.",
    es: "Si detectamos un riesgo de seguridad o baja confianza, te conectamos con un consejero de vivienda o ayuda legal.",
  },

  // Footer
  footerTagline: { en: "Housing Stability Guide", es: "Guía de Estabilidad de Vivienda" },
  footerDisclaimer: {
    en: "Guidance only · not legal advice · final decisions belong to program administrators",
    es: "Solo orientación · no es asesoría legal · las decisiones finales pertenecen a los administradores del programa",
  },

  // Intake
  intakeTitle: { en: "Tell me what's going on", es: "Cuéntame qué está pasando" },
  intakeSubtitle: {
    en: "Describe your situation in plain language. I'll listen, ask followups, and pull together a profile you can review.",
    es: "Describe tu situación con tus palabras. Escucharé, haré preguntas de seguimiento y armaré un perfil que podrás revisar.",
  },
  botIntro: {
    en: "Hi, I'm here to help. Tell me what's going on with your housing situation — in your own words. There's no wrong way to start.",
    es: "Hola, estoy aquí para ayudarte. Cuéntame qué está pasando con tu situación de vivienda — con tus propias palabras. No hay una manera incorrecta de empezar.",
  },
  inputPlaceholder: {
    en: "Type your message… (Shift+Enter for newline)",
    es: "Escribe tu mensaje… (Shift+Enter para nueva línea)",
  },
  analyzingNow: { en: "Analyze now", es: "Analizar ahora" },
  analyzeSkipAhead: {
    en: "Want to skip ahead? I can analyze what you've shared so far.",
    es: "¿Quieres saltar adelante? Puedo analizar lo que has compartido hasta ahora.",
  },
  autoAnalyzeMsg: {
    en: "I have enough to work with — pulling together your profile now…",
    es: "Tengo suficiente información — armando tu perfil ahora…",
  },
  yourProfile: { en: "Your profile", es: "Tu perfil" },
  yourProfileSub: {
    en: "Edit anything I got wrong — then we'll analyze your options.",
    es: "Edita lo que haya entendido mal — luego analizaremos tus opciones.",
  },
  editable: { en: "Editable", es: "Editable" },
  reExtract: { en: "Re-extract", es: "Re-extraer" },
  looksGood: { en: "Looks good — analyze", es: "Se ve bien — analizar" },
  readingMsg: {
    en: "Reading everything you've shared…",
    es: "Leyendo todo lo que has compartido…",
  },
  profileReadyMsg: {
    en: "Here's what I heard. Please review and edit anything I got wrong — then we'll analyze your options.",
    es: "Esto es lo que entendí. Por favor revisa y edita lo que haya mal — luego analizaremos tus opciones.",
  },
  fallbackErrMsg: {
    en: "Sorry, I had trouble processing that. You can fill in your details manually below.",
    es: "Lo siento, tuve problemas procesando eso. Puedes completar tus datos manualmente abajo.",
  },

  // Profile fields
  fieldLocation: { en: "Location", es: "Ubicación" },
  fieldHousehold: { en: "Household size", es: "Tamaño del hogar" },
  fieldIncome: { en: "Income status", es: "Estado de ingresos" },
  fieldEmployment: { en: "Employment status", es: "Estado de empleo" },
  fieldHousing: { en: "Housing status", es: "Estado de vivienda" },
  fieldRentOwed: { en: "Rent owed", es: "Renta adeudada" },
  fieldTimeline: { en: "Eviction timeline", es: "Cronología de desalojo" },
  fieldAdditional: { en: "Additional context", es: "Contexto adicional" },

  // Sidebar / app views
  navDashboard: { en: "Dashboard", es: "Panel" },
  navActionPlan: { en: "Action Plan", es: "Plan de Acción" },
  navPrograms: { en: "Programs", es: "Programas" },
  navDocument: { en: "Document Analysis", es: "Análisis de Documentos" },
  navResources: { en: "Resources", es: "Recursos" },

  // Dashboard
  dashboardTitle: { en: "Your housing dashboard", es: "Tu panel de vivienda" },
  dashboardSubtitle: {
    en: "An overview of your situation, risk level, and what to do next.",
    es: "Una visión general de tu situación, nivel de riesgo y próximos pasos.",
  },
  riskScore: { en: "Risk score", es: "Puntuación de riesgo" },
  riskLevel: { en: "Risk level", es: "Nivel de riesgo" },
  confidence: { en: "Confidence", es: "Confianza" },
  situationSummary: { en: "Your situation", es: "Tu situación" },
  riskAssessment: { en: "Risk assessment", es: "Evaluación de riesgo" },
  eligiblePrograms: { en: "Programs you may qualify for", es: "Programas para los que podrías calificar" },
  quickActions: { en: "Quick actions", es: "Acciones rápidas" },
  viewAllPrograms: { en: "View all programs", es: "Ver todos los programas" },
  viewActionPlan: { en: "View action plan", es: "Ver plan de acción" },
  analyzeDocument: { en: "Analyze a document", es: "Analizar un documento" },
  escalationTitle: {
    en: "We'd feel better if a human helped you with this.",
    es: "Estaríamos más tranquilos si un humano te ayuda con esto.",
  },
  escalationReasons: { en: "Why we recommend a human", es: "Por qué recomendamos un humano" },
  referrals: { en: "Recommended referrals", es: "Referidos recomendados" },

  // Risk levels
  riskLow: { en: "Low", es: "Bajo" },
  riskModerate: { en: "Moderate", es: "Moderado" },
  riskHigh: { en: "High", es: "Alto" },
  riskCritical: { en: "Critical", es: "Crítico" },

  // Confidence labels
  confLow: { en: "Low", es: "Baja" },
  confModerate: { en: "Moderate", es: "Moderada" },
  confHigh: { en: "High", es: "Alta" },

  // Match levels
  matchHigh: { en: "High Probability", es: "Alta Probabilidad" },
  matchPossible: { en: "Possible Match", es: "Posible Coincidencia" },
  matchRequires: { en: "Requires Verification", es: "Requiere Verificación" },

  // Action Plan Center
  actionPlanTitle: { en: "Action Plan Center", es: "Centro de Plan de Acción" },
  actionPlanSubtitle: {
    en: "Track your progress. Check off items as you complete them.",
    es: "Rastrea tu progreso. Marca los elementos a medida que los completas.",
  },
  today: { en: "Today", es: "Hoy" },
  thisWeek: { en: "This Week", es: "Esta Semana" },
  backupPlan: { en: "Backup Plan", es: "Plan de Respaldo" },
  progress: { en: "Progress", es: "Progreso" },
  completed: { en: "Completed", es: "Completado" },
  of: { en: "of", es: "de" },
  noItems: { en: "No items.", es: "Sin elementos." },
  estMinutes: { en: "min", es: "min" },
  markComplete: { en: "Mark as complete", es: "Marcar como completado" },
  markIncomplete: { en: "Mark as not done", es: "Marcar como no hecho" },

  // Program Explorer
  programsTitle: { en: "Program Explorer", es: "Explorador de Programas" },
  programsSubtitle: {
    en: "Browse all housing assistance programs in our knowledge base.",
    es: "Explora todos los programas de asistencia de vivienda en nuestra base de conocimientos.",
  },
  searchPlaceholder: { en: "Search programs…", es: "Buscar programas…" },
  allCategories: { en: "All categories", es: "Todas las categorías" },
  eligibility: { en: "Eligibility", es: "Elegibilidad" },
  documentsNeeded: { en: "Documents you'll need", es: "Documentos necesarios" },
  source: { en: "Source", es: "Fuente" },
  whyItFits: { en: "Why this may fit", es: "Por qué podría funcionar" },
  mayQualifyBadge: {
    en: "You may qualify",
    es: "Podrías calificar",
  },
  noResults: { en: "No programs match your search.", es: "Ningún programa coincide con tu búsqueda." },

  // Categories
  catRental: { en: "Rental Assistance", es: "Asistencia de Renta" },
  catLegal: { en: "Legal Aid", es: "Ayuda Legal" },
  catFood: { en: "Food & Cash", es: "Comida y Efectivo" },
  catEmergency: { en: "Emergency Housing", es: "Vivienda de Emergencia" },
  catUtility: { en: "Utility", es: "Servicios Públicos" },
  catCounseling: { en: "Counseling", es: "Consejería" },

  // Document Analysis
  docTitle: { en: "Document Analysis", es: "Análisis de Documentos" },
  docSubtitle: {
    en: "Paste the text of an eviction notice, rent increase letter, utility shutoff notice, or court summons. We'll explain it in plain language.",
    es: "Pega el texto de un aviso de desalojo, carta de aumento de renta, aviso de corte de servicios o citación judicial. Te lo explicaremos en lenguaje sencillo.",
  },
  docInputPlaceholder: {
    en: "Paste the document text here…",
    es: "Pega el texto del documento aquí…",
  },
  docAnalyzeBtn: { en: "Analyze document", es: "Analizar documento" },
  docAnalyzing: { en: "Reading your document…", es: "Leyendo tu documento…" },
  docType: { en: "Document type", es: "Tipo de documento" },
  docSummary: { en: "Summary", es: "Resumen" },
  docKeyDates: { en: "Key dates", es: "Fechas clave" },
  docKeyInfo: { en: "Key information", es: "Información clave" },
  docUrgentActions: { en: "Urgent actions", es: "Acciones urgentes" },
  docRights: { en: "Your possible rights", es: "Tus posibles derechos" },
  docNextSteps: { en: "Recommended next steps", es: "Próximos pasos recomendados" },
  docSampleEviction: { en: "Try a sample eviction notice", es: "Probar aviso de desalojo de ejemplo" },
  docSampleRent: { en: "Try a sample rent increase", es: "Probar aumento de renta de ejemplo" },
  docSampleUtility: { en: "Try a sample utility shutoff", es: "Probar corte de servicios de ejemplo" },

  // Resources
  resourcesTitle: { en: "Resources", es: "Recursos" },
  resourcesSubtitle: {
    en: "Local and national organizations that can help.",
    es: "Organizaciones locales y nacionales que pueden ayudar.",
  },
  callNow: { en: "Call 211 for live help", es: "Llama al 211 para ayuda en vivo" },
  viewWebsite: { en: "Visit website", es: "Visitar sitio web" },
  urgencyImmediate: { en: "Immediate", es: "Inmediato" },
  urgencyThisWeek: { en: "This Week", es: "Esta Semana" },
  urgencyWhenReady: { en: "When Ready", es: "Cuando Puedas" },

  // Caveats
  notLegalAdvice: {
    en: "This is not legal advice and final eligibility decisions are made by program administrators.",
    es: "Esto no es asesoría legal y las decisiones finales de elegibilidad las toman los administradores del programa.",
  },
  verifyDirectly: {
    en: "Eligibility rules and program availability may change — verify directly with each program before applying.",
    es: "Las reglas de elegibilidad y disponibilidad de programas pueden cambiar — verifica directamente con cada programa antes de aplicar.",
  },

  // Generic
  loading: { en: "Loading…", es: "Cargando…" },
  tryAgain: { en: "Try again", es: "Intentar de nuevo" },
  error: { en: "Something went wrong", es: "Algo salió mal" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Language): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}
