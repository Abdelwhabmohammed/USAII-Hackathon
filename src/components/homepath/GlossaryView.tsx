"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "./LanguageProvider";

interface GlossaryTerm {
  term: string;
  termEs: string;
  category: "Housing" | "Benefits" | "Legal" | "Income";
  shortDef: string;
  shortDefEs: string;
  longDef: string;
  longDefEs: string;
  example?: string;
  exampleEs?: string;
}

const GLOSSARY: GlossaryTerm[] = [
  {
    term: "AMI (Area Median Income)",
    termEs: "AMI (Ingreso Mediano del Área)",
    category: "Income",
    shortDef: "The median income for a specific geographic area, used to determine eligibility for affordable housing programs.",
    shortDefEs: "El ingreso mediano para un área geográfica específica, usado para determinar elegibilidad para programas de vivienda asequible.",
    longDef: "AMI is calculated annually by HUD for each metropolitan area and non-metropolitan county. Most affordable housing programs set income limits as a percentage of AMI — for example, 30% AMI (extremely low), 50% AMI (very low), 80% AMI (low). A family's eligibility depends on where they live, since AMI varies dramatically between regions.",
    longDefEs: "AMI es calculado anualmente por HUD para cada área metropolitana y condado no metropolitano. La mayoría de los programas de vivienda asequible establecen límites de ingresos como porcentaje de AMI — por ejemplo, 30% AMI (extremadamente bajo), 50% AMI (muy bajo), 80% AMI (bajo).",
    example: "If AMI in your area is $80,000, then 80% AMI = $64,000. A family earning less than $64,000 may qualify for low-income programs.",
    exampleEs: "Si el AMI en tu área es $80,000, entonces 80% AMI = $64,000. Una familia que gana menos de $64,000 podría calificar para programas de bajos ingresos.",
  },
  {
    term: "FPL (Federal Poverty Level)",
    termEs: "FPL (Nivel Federal de Pobreza)",
    category: "Income",
    shortDef: "A measure of income issued annually by HHS used to determine eligibility for programs like SNAP, Medicaid, and legal aid.",
    shortDefEs: "Una medida de ingresos emitida anualmente por HHS usada para determinar elegibilidad para programas como SNAP, Medicaid y ayuda legal.",
    longDef: "The Federal Poverty Level is a set of income thresholds that vary by family size and composition. In 2024, the FPL for a family of 4 in the 48 contiguous states is $31,200. Many programs use multiples of FPL — 125% FPL, 150% FPL, 200% FPL — as eligibility cutoffs.",
    longDefEs: "El Nivel Federal de Pobreza es un conjunto de umbrales de ingresos que varían según el tamaño y composición familiar. En 2024, el FPL para una familia de 4 personas en los 48 estados contiguos es $31,200.",
    example: "Legal aid programs often serve households at or below 125% FPL — for a family of 4, that's about $39,000/year.",
    exampleEs: "Los programas de ayuda legal a menudo sirven a hogares al o por debajo del 125% FPL — para una familia de 4, eso es aproximadamente $39,000/año.",
  },
  {
    term: "Continuum of Care (CoC)",
    termEs: "Continuum of Care (CoC)",
    category: "Housing",
    shortDef: "A regional planning body that coordinates housing and services for homeless individuals and families.",
    shortDefEs: "Un cuerpo de planificación regional que coordina vivienda y servicios para personas y familias sin hogar.",
    longDef: "CoCs are HUD-funded local networks that organize and deliver housing and support services to people experiencing homelessness. Each CoC operates a 'coordinated entry' system — a single front door that assesses needs and connects people to the right level of help (emergency shelter, rapid re-housing, permanent supportive housing).",
    longDefEs: "Los CoC son redes locales financiadas por HUD que organizan y entregan vivienda y servicios de apoyo a personas experimentando falta de vivienda. Cada CoC opera un sistema de 'entrada coordinada'.",
    example: "If you're facing imminent homelessness, your local CoC's coordinated entry is the system that will assess your needs and place you in the right program.",
    exampleEs: "Si enfrentas falta de vivienda inminente, la entrada coordinada de tu CoC local es el sistema que evaluará tus necesidades.",
  },
  {
    term: "Rapid Re-Housing",
    termEs: "Realojamiento Rápido",
    category: "Housing",
    shortDef: "Short-term rental assistance and services to help people quickly exit homelessness and return to permanent housing.",
    shortDefEs: "Asistencia de renta a corto plazo y servicios para ayudar a personas a salir rápidamente de la falta de vivienda y volver a vivienda permanente.",
    longDef: "Rapid re-housing provides short-to-medium term rental subsidies (typically 3–6 months, sometimes up to 24 months) plus case management to help households find and maintain housing. It's designed to be a bridge — not a long-term solution like Section 8 vouchers.",
    longDefEs: "El realojamiento rápido proporciona subsidios de renta a corto y mediano plazo (típicamente 3-6 meses) más gestión de casos para ayudar a los hogares a encontrar y mantener vivienda.",
  },
  {
    term: "Section 8 (Housing Choice Voucher)",
    termEs: "Sección 8 (Cupón de Elección de Vivienda)",
    category: "Housing",
    shortDef: "A federal rental assistance program where recipients pay 30% of income toward rent; the voucher covers the rest.",
    shortDefEs: "Un programa federal de asistencia de renta donde los beneficiarios pagan el 30% de sus ingresos hacia la renta; el cupón cubre el resto.",
    longDef: "Section 8 is HUD's largest tenant-based rental assistance program. Vouchers are portable — you can use them with any landlord who accepts them. Recipients pay 30% of their adjusted income toward rent; HUD pays the rest up to a local 'payment standard.' Waitlists are typically years long, so it's not an emergency option.",
    longDefEs: "Sección 8 es el programa más grande de HUD para asistencia de renta basada en inquilino. Los cupones son portátiles. Las listas de espera típicamente son de años.",
  },
  {
    term: "Eviction",
    termEs: "Desalojo",
    category: "Legal",
    shortDef: "The legal process by which a landlord removes a tenant from a rental property.",
    shortDefEs: "El proceso legal mediante el cual un casero remueve a un inquilino de una propiedad de alquiler.",
    longDef: "An eviction is a court process — landlords cannot legally remove tenants without a court order. The process starts with a notice (pay-or-quit, cure-or-quit, unconditional quit), followed by a lawsuit (unlawful detainer), a court hearing, and if the landlord wins, a writ of possession enforced by a sheriff. Tenants have rights at every stage — including the right to a hearing and the right to legal counsel in some jurisdictions.",
    longDefEs: "Un desalojo es un proceso judicial — los caseros no pueden remover legalmente a inquilinos sin una orden judicial. Los inquilinos tienen derechos en cada etapa.",
  },
  {
    term: "Summons (Court Summons)",
    termEs: "Citación (Citación Judicial)",
    category: "Legal",
    shortDef: "A court document that requires you to appear in court on a specific date to respond to an eviction lawsuit.",
    shortDefEs: "Un documento judicial que requiere que comparezcas en corte en una fecha específica para responder a una demanda de desalojo.",
    longDef: "Receiving a summons means your landlord has formally filed an eviction lawsuit. The summons will include the court date, the reason for the lawsuit, and instructions on how to respond. Failing to appear usually results in a default judgment against you — meaning you automatically lose. Always attend court, and bring a lawyer if possible.",
    longDefEs: "Recibir una citación significa que tu casero ha presentado formalmente una demanda de desalojo. Siempre asiste a la corte.",
  },
  {
    term: "Writ of Possession",
    termEs: "Orden de Posesión",
    category: "Legal",
    shortDef: "A court order that authorizes the sheriff to physically remove a tenant from a rental property.",
    shortDefEs: "Una orden judicial que autoriza al sheriff a remover físicamente a un inquilino de una propiedad de alquiler.",
    longDef: "A writ of possession is the final step in the eviction process — it's issued after the landlord wins the court case and the appeal period expires. It typically gives the tenant 5–7 days to vacate voluntarily before law enforcement physically removes them. This is the most urgent stage — contact legal aid immediately if you receive one.",
    longDefEs: "Una orden de posesión es el paso final en el proceso de desalojo. Típicamente da al inquilino 5-7 días para desocupar voluntariamente.",
  },
  {
    term: "LIHEAP",
    termEs: "LIHEAP",
    category: "Benefits",
    shortDef: "A federal program that helps low-income households pay heating and cooling bills.",
    shortDefEs: "Un programa federal que ayuda a hogares de bajos ingresos a pagar facturas de calefacción y refrigeración.",
    longDef: "The Low Income Home Energy Assistance Program (LIHEAP) provides financial assistance to eligible households for energy bills, energy crises, and weatherization. Eligibility is typically set at 150% of FPL or 60% of state median income — whichever is higher. Many states also offer emergency LIHEAP for shut-off notices.",
    longDefEs: "LIHEAP proporciona asistencia financiera a hogares elegibles para facturas de energía, crisis energéticas y climatización.",
  },
  {
    term: "SNAP (Food Stamps)",
    termEs: "SNAP (Cupones de Alimentos)",
    category: "Benefits",
    shortDef: "A federal program that provides monthly food benefits to low-income households.",
    shortDefEs: "Un programa federal que proporciona beneficios mensuales de alimentos a hogares de bajos ingresos.",
    longDef: "The Supplemental Nutrition Assistance Program (SNAP) provides benefits via an EBT card that can be used like a debit card at grocery stores. Eligibility is based on gross income (typically at or below 130% FPL), net income (at or below 100% FPL), and assets. SNAP can free up cash for rent during a housing crisis.",
    longDefEs: "SNAP proporciona beneficios vía una tarjeta EBT. Los beneficios pueden liberar efectivo para renta durante una crisis de vivienda.",
  },
  {
    term: "TANF",
    termEs: "TANF",
    category: "Benefits",
    shortDef: "A federal program that provides time-limited cash assistance to families with children.",
    shortDefEs: "Un programa federal que proporciona asistencia en efectivo a plazo limitado a familias con hijos.",
    longDef: "Temporary Assistance for Needy Families (TANF) provides monthly cash benefits to eligible families with dependent children. Benefits and eligibility rules vary by state. Most families face a 60-month lifetime limit on benefits. TANF often comes with work requirements and supportive services.",
    longDefEs: "TANF proporciona beneficios mensuales en efectivo a familias elegibles con hijos dependientes. La mayoría de las familias enfrentan un límite de por vida de 60 meses.",
  },
  {
    term: "LSC (Legal Services Corporation)",
    termEs: "LSC (Corporación de Servicios Legales)",
    category: "Legal",
    shortDef: "A federal nonprofit that funds free civil legal aid for low-income Americans.",
    shortDefEs: "Una organización federal sin fines de lucro que financia ayuda legal civil gratuita para estadounidenses de bajos ingresos.",
    longDef: "The Legal Services Corporation is the single largest funder of civil legal aid in the US. LSC-funded programs provide free legal help for eviction defense, family law, public benefits appeals, and more. To find your local LSC-funded program, visit lsc.gov/about-lsc/what-legal-aid/get-legal-help.",
    longDefEs: "LSC es el mayor financiador de ayuda legal civil en EE.UU. Los programas financiados por LSC proporcionan ayuda legal gratuita para defensa de desalojo y más.",
  },
  {
    term: "HUD-Approved Housing Counselor",
    termEs: "Consejero de Vivienda Aprobado por HUD",
    category: "Housing",
    shortDef: "A trained professional who provides free or low-cost housing advice through a HUD-approved agency.",
    shortDefEs: "Un profesional entrenado que proporciona consejería de vivienda gratuita o de bajo costo a través de una agencia aprobada por HUD.",
    longDef: "HUD-approved housing counselors can help you understand your rights, navigate rental assistance applications, communicate with your landlord, and develop a budget. They're especially valuable during eviction proceedings. Find one at hud.gov/counseling or by calling 1-800-569-4287.",
    longDefEs: "Los consejeros de vivienda aprobados por HUD pueden ayudarte a entender tus derechos, navegar aplicaciones de asistencia y más.",
  },
  {
    term: "ERA (Emergency Rental Assistance)",
    termEs: "ERA (Asistencia de Emergencia para Renta)",
    category: "Benefits",
    shortDef: "Federal funds administered locally to cover past-due rent and utilities for households facing hardship.",
    shortDefEs: "Fondos federales administrados localmente para cubrir renta atrasada y servicios para hogares enfrentando dificultades.",
    longDef: "The Emergency Rental Assistance program was created during the COVID-19 pandemic. Many states and cities still operate ERA-funded programs through local housing authorities. ERA can cover past-due rent, current rent, and sometimes utilities. Eligibility typically requires income at or below 80% AMI, documented financial hardship, and housing instability risk.",
    longDefEs: "ERA puede cubrir renta atrasada, renta actual y a veces servicios públicos. La elegibilidad típicamente requiere ingresos al o por debajo del 80% AMI.",
  },
  {
    term: "Pay or Quit Notice",
    termEs: "Aviso de Pagar o Desocupar",
    category: "Legal",
    shortDef: "A landlord's written notice giving a tenant a set number of days to pay overdue rent or move out.",
    shortDefEs: "Un aviso escrito del casero dando al inquilino un número establecido de días para pagar renta atrasada o mudarse.",
    longDef: "A pay-or-quit notice is usually the first formal step in the eviction process. It typically gives the tenant 3, 5, 7, or 14 days (depending on state law) to pay everything owed or vacate. If you pay within the notice period, the eviction process usually stops. If you don't, the landlord can file an eviction lawsuit.",
    longDefEs: "Un aviso de pagar o desocupar suele ser el primer paso formal en el proceso de desalojo. Típicamente da al inquilino 3, 5, 7 o 14 días.",
  },
];

const CATEGORY_COLORS = {
  Housing: "bg-primary/10 text-primary border-primary/30",
  Benefits: "bg-emerald-100/60 text-emerald-700 border-emerald-300/50",
  Legal: "bg-amber-100/60 text-amber-700 border-amber-300/50",
  Income: "bg-violet-100/60 text-violet-700 border-violet-300/50",
};

export function GlossaryView() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "Housing", "Benefits", "Legal", "Income"];
  const categoryLabels: Record<string, string> = language === "es"
    ? {
        all: "Todas",
        Housing: "Vivienda",
        Benefits: "Beneficios",
        Legal: "Legal",
        Income: "Ingresos",
      }
    : {
        all: "All",
        Housing: "Housing",
        Benefits: "Benefits",
        Legal: "Legal",
        Income: "Income",
      };

  const filtered = useMemo(() => {
    return GLOSSARY.filter((term) => {
      if (activeCategory !== "all" && term.category !== activeCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const searchText = `${term.term} ${term.termEs} ${term.shortDef} ${term.shortDefEs} ${term.longDef} ${term.longDefEs}`.toLowerCase();
        return searchText.includes(q);
      }
      return true;
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
          {language === "es" ? "Glosario" : "Glossary"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {language === "es"
            ? "Definiciones en lenguaje sencillo de los términos de vivienda, beneficios e ingresos que puedes encontrar."
            : "Plain-language definitions of housing, benefits, and income terms you may encounter."}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === "es" ? "Buscar términos…" : "Search terms…"}
          className="h-11 rounded-full border-border/60 bg-card pl-9 pr-4 text-sm focus-visible:ring-primary"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 bg-card text-muted-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Terms grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-border/60 bg-card/60">
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === "es" ? "Sin resultados." : "No results."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((term, i) => (
            <motion.div
              key={term.term}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card className="h-full rounded-2xl border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-serif-display text-base font-semibold text-foreground">
                    {language === "es" ? term.termEs : term.term}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`border ${CATEGORY_COLORS[term.category]} text-[10px]`}
                  >
                    {categoryLabels[term.category]}
                  </Badge>
                </div>
                {language === "es" && term.term !== term.termEs && (
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    {language === "es" ? "EN: " : "ES: "}
                    {language === "es" ? term.term : term.termEs}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-foreground">
                  {language === "es" ? term.shortDefEs : term.shortDef}
                </p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
                    {language === "es" ? "Leer más" : "Read more"}
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {language === "es" ? term.longDefEs : term.longDef}
                  </p>
                  {(language === "es" ? term.exampleEs : term.example) && (
                    <p className="mt-2 rounded-lg bg-secondary/40 px-3 py-2 text-xs italic text-foreground">
                      <strong className="not-italic">
                        {language === "es" ? "Ejemplo: " : "Example: "}
                      </strong>
                      {language === "es" ? term.exampleEs : term.example}
                    </p>
                  )}
                </details>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
