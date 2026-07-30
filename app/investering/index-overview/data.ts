/** Illustrative weights vs ACWI IMI. Based on MSCI / marketcaps-style figures (ca. juni 2026). */

export type RegionId = "usa" | "europe" | "pacific" | "canada" | "israel" | "em";

export const REGION_COLORS: Record<RegionId, string> = {
  usa: "#60a5fa",
  europe: "#34d399",
  pacific: "#fbbf24",
  canada: "#a78bfa",
  israel: "#f472b6",
  em: "#fb923c",
};

export type HierarchyNode = {
  id: string;
  label: string;
  pctOfAcwiImi: number;
  note?: string;
  color?: string;
  children?: HierarchyNode[];
};

/** Large + mid + small (IMI) geographic tree */
export const acwiImiTree: HierarchyNode = {
  id: "acwi-imi",
  label: "ACWI IMI",
  pctOfAcwiImi: 100,
  note: "Næsten hele det investerbare aktiemarked",
  children: [
    {
      id: "world-imi",
      label: "Udviklede markeder (World IMI)",
      pctOfAcwiImi: 87.7,
      note: "23 udviklede lande",
      children: [
        {
          id: "usa-imi",
          label: "USA",
          pctOfAcwiImi: 62.7,
          color: REGION_COLORS.usa,
          note: "Dominerer globale indekser",
          children: [
            {
              id: "sp500-slice",
              label: "S&P 500 (USA large)",
              pctOfAcwiImi: 55,
              color: REGION_COLORS.usa,
              note: "Ca. 500 største amerikanske selskaber — kun USA",
            },
            {
              id: "nasdaq-slice",
              label: "Nasdaq-100 (USA tech-tung)",
              pctOfAcwiImi: 22,
              color: "#22d3ee",
              note: "Ca. 100 store non-financial Nasdaq-selskaber — overlapper med S&P 500",
            },
          ],
        },
        {
          id: "europe-imi",
          label: "Europa",
          pctOfAcwiImi: 13.7,
          color: REGION_COLORS.europe,
          note: "inkl. Danmark, UK, Tyskland m.fl.",
        },
        {
          id: "pacific-imi",
          label: "Pacific",
          pctOfAcwiImi: 8.0,
          color: REGION_COLORS.pacific,
          children: [
            {
              id: "japan-imi",
              label: "Japan",
              pctOfAcwiImi: 5.6,
              color: REGION_COLORS.pacific,
            },
            {
              id: "pacific-ex-japan-imi",
              label: "Pacific ex Japan",
              pctOfAcwiImi: 2.4,
              color: REGION_COLORS.pacific,
              note: "Australien, Hongkong, Singapore m.fl.",
            },
          ],
        },
        {
          id: "canada-imi",
          label: "Canada",
          pctOfAcwiImi: 3.0,
          color: REGION_COLORS.canada,
        },
        {
          id: "israel-imi",
          label: "Israel",
          pctOfAcwiImi: 0.4,
          color: REGION_COLORS.israel,
        },
      ],
    },
    {
      id: "em-imi",
      label: "Emerging markets (EM IMI)",
      pctOfAcwiImi: 12.3,
      color: REGION_COLORS.em,
      note: "24 emerging markets",
    },
  ],
};

export type CountryRow = {
  land: string;
  region: RegionId;
  pct: number;
  /** Globale MSCI-/verdensindekser (uden small-cap-only). */
  worldIndexes: string[];
  /** Nationale / regionale storindekser (uden small cap). */
  nationalIndexes: string[];
  changeNote: string;
};

export const topCountries: CountryRow[] = [
  {
    land: "USA",
    region: "usa",
    pct: 62.7,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["S&P 500", "Nasdaq-100", "Dow Jones", "Russell 1000"],
    changeNote: "Steget markant over det seneste årti",
  },
  {
    land: "Japan",
    region: "pacific",
    pct: 5.6,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["Nikkei 225", "TOPIX"],
    changeNote: "Faldende andel ift. USA",
  },
  {
    land: "Taiwan",
    region: "em",
    pct: 3.4,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI"],
    nationalIndexes: ["TAIEX", "FTSE Taiwan"],
    changeNote: "Vokset med tech-sektoren",
  },
  {
    land: "Storbritannien",
    region: "europe",
    pct: 3.1,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["FTSE 100", "FTSE 250"],
    changeNote: "Stabil, men mindre end før",
  },
  {
    land: "Canada",
    region: "canada",
    pct: 3.0,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["S&P/TSX 60", "S&P/TSX Composite"],
    changeNote: "Relativt stabil",
  },
  {
    land: "Kina",
    region: "em",
    pct: 2.7,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI"],
    nationalIndexes: ["CSI 300", "Hang Seng", "FTSE China 50"],
    changeNote: "Varierer med indeksdefinition",
  },
  {
    land: "Frankrig",
    region: "europe",
    pct: 2.2,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["CAC 40"],
    changeNote: "Del af europæisk vægt",
  },
  {
    land: "Schweiz",
    region: "europe",
    pct: 2.0,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["SMI", "SPI"],
    changeNote: "Farmaci og defensive selskaber",
  },
  {
    land: "Tyskland",
    region: "europe",
    pct: 2.0,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["DAX", "MDAX"],
    changeNote: "Lavere andel end for 10–15 år siden",
  },
  {
    land: "Indien",
    region: "em",
    pct: 1.9,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI"],
    nationalIndexes: ["Nifty 50", "SENSEX", "Nifty 100"],
    changeNote: "Steget blandt emerging markets",
  },
  {
    land: "Korea",
    region: "em",
    pct: 1.5,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI"],
    nationalIndexes: ["KOSPI 200", "KOSPI"],
    changeNote: "Tech og industri",
  },
  {
    land: "Australien",
    region: "pacific",
    pct: 1.5,
    worldIndexes: ["MSCI ACWI IMI", "MSCI ACWI", "MSCI World"],
    nationalIndexes: ["S&P/ASX 200", "S&P/ASX 100"],
    changeNote: "Råvarer og banker",
  },
];

export type IndexExplainer = {
  id: string;
  name: string;
  pctOfAcwiImi: number | null;
  summary: string;
  includes: string;
  excludes: string;
};

export const indexExplainers: IndexExplainer[] = [
  {
    id: "acwi-imi",
    name: "MSCI ACWI IMI",
    pctOfAcwiImi: 100,
    summary: "“Næsten hele verdens aktiemarked” — large, mid og small cap i udviklede og emerging markets.",
    includes: "Ca. 47 lande · large/mid/small",
    excludes: "Meget små / illikvide selskaber uden for investable universe",
  },
  {
    id: "acwi",
    name: "MSCI ACWI",
    pctOfAcwiImi: 89.0,
    summary: "Samme lande som ACWI IMI, men primært large og mid cap — uden small cap.",
    includes: "Udviklede + emerging · large/mid",
    excludes: "Small cap (~11 % af ACWI IMI)",
  },
  {
    id: "world",
    name: "MSCI World",
    pctOfAcwiImi: 78.1,
    summary: "Kun udviklede markeder. Populær “global” fond — men uden emerging markets.",
    includes: "23 udviklede lande · large/mid",
    excludes: "Emerging markets + small cap",
  },
  {
    id: "sp500",
    name: "S&P 500",
    pctOfAcwiImi: 55,
    summary:
      "De ca. 500 største amerikanske selskaber. Ofte ~halvdelen (eller mere) af en global portefølje i praksis — men stadig kun USA.",
    includes: "USA large cap på tværs af sektorer",
    excludes: "Resten af verden + amerikanske small/mid uden for top 500",
  },
  {
    id: "nasdaq",
    name: "Nasdaq-100",
    pctOfAcwiImi: 22,
    summary:
      "Ca. 100 af de største non-financial selskaber noteret på Nasdaq. Meget tech-tungt (Apple, Microsoft, Nvidia m.fl.) og stærkt overlappende med S&P 500.",
    includes: "USA · store Nasdaq-noterede vækst/tech-selskaber",
    excludes: "Finanssektoren, resten af USA, hele verden uden for Nasdaq-100",
  },
];

export type FundCoverage = {
  name: string;
  indeks: string;
  approxPct: number;
  covers: string;
  misses: string;
};

export const fundCoverage: FundCoverage[] = [
  {
    name: "Sparinvest INDEX Globale Aktier KL",
    indeks: "MSCI ACWI IMI",
    approxPct: 100,
    covers: "Næsten hele verdensmarkedet inkl. small cap",
    misses: "—",
  },
  {
    name: "Sparinvest INDEX MSCI ACWI",
    indeks: "MSCI ACWI",
    approxPct: 89,
    covers: "Udviklede + emerging (large/mid)",
    misses: "Small cap",
  },
  {
    name: "Storebrand Indeks – Alle Markeder",
    indeks: "MSCI ACWI (screenet)",
    approxPct: 85,
    covers: "Bred global eksponering med ESG-screening",
    misses: "Small cap + selskaber frasorteret af screening",
  },
  {
    name: "Nordnet Global Indeks / MSCI World-fonde",
    indeks: "MSCI World",
    approxPct: 78,
    covers: "Udviklede markeder",
    misses: "Emerging markets (+ typisk small cap)",
  },
  {
    name: "Invesco FTSE All-World",
    indeks: "FTSE All-World",
    approxPct: 90,
    covers: "Global large/mid (udviklede + emerging)",
    misses: "Small cap (typisk)",
  },
  {
    name: "Amundi S&P 500 / Sparinvest INDEX S&P 500",
    indeks: "S&P 500",
    approxPct: 55,
    covers: "Store amerikanske selskaber på tværs af sektorer",
    misses: "Europa, Pacific, EM, USA uden for S&P 500",
  },
  {
    name: "Nasdaq-100 ETF’er (fx EQQQ / CNDX)",
    indeks: "Nasdaq-100",
    approxPct: 22,
    covers: "Store Nasdaq-selskaber — især tech og vækst",
    misses: "Finans, bred USA, Europa, Pacific, EM",
  },
];

export type CoverageToggle = {
  id: "world" | "em" | "small";
  label: string;
  description: string;
  pct: number;
};

export const coveragePieces: CoverageToggle[] = [
  {
    id: "world",
    label: "MSCI World (udviklede)",
    description: "Large/mid i udviklede lande",
    pct: 78.1,
  },
  {
    id: "em",
    label: "+ Emerging markets",
    description: "Løfter dig op mod ACWI",
    pct: 10.8,
  },
  {
    id: "small",
    label: "+ Small cap",
    description: "Løfter dig op mod ACWI IMI",
    pct: 11.0,
  },
];

export const KEY_STATS = [
  {
    value: "~99 %",
    label: "af det investerbare aktiemarked",
    detail: "dækket af ACWI IMI",
  },
  {
    value: "47",
    label: "lande i indekset",
    detail: "23 udviklede · 24 emerging",
  },
  {
    value: "~8.000+",
    label: "selskaber",
    detail: "large, mid og small cap",
  },
] as const;

/** Holding periods shown in the returns section */
export const RETURN_PERIODS = [1, 3, 5, 10, 20, 30] as const;
export type ReturnPeriod = (typeof RETURN_PERIODS)[number];

export type IndexReturnSeries = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  /** Annualized net total return (%) by holding period. 20Y/30Y are approximate. */
  annualized: Record<ReturnPeriod, number>;
};

/**
 * Illustrative annualized net returns (USD), primarily from MSCI factsheets
 * as of ~jun 2026. S&P 500 from recent total-return estimates. 20Y/30Y are
 * rounded long-horizon approximations for education — not live quotes.
 */
export const indexReturns: IndexReturnSeries[] = [
  {
    id: "nasdaq",
    name: "Nasdaq-100",
    shortName: "Nasdaq",
    color: "#22d3ee",
    annualized: { 1: 25.0, 3: 27.2, 5: 17.4, 10: 22.2, 20: 16.8, 30: 11.0 },
  },
  {
    id: "sp500",
    name: "S&P 500",
    shortName: "S&P 500",
    color: "#60a5fa",
    annualized: { 1: 20.3, 3: 20.0, 5: 13.0, 10: 15.2, 20: 11.4, 30: 10.5 },
  },
  {
    id: "world",
    name: "MSCI World",
    shortName: "World",
    color: "#34d399",
    annualized: { 1: 21.3, 3: 19.2, 5: 11.5, 10: 13.1, 20: 8.5, 30: 7.5 },
  },
  {
    id: "acwi",
    name: "MSCI ACWI",
    shortName: "ACWI",
    color: "#fbbf24",
    annualized: { 1: 23.7, 3: 19.7, 5: 11.0, 10: 12.8, 20: 8.2, 30: 7.4 },
  },
  {
    id: "em",
    name: "MSCI Emerging Markets",
    shortName: "EM",
    color: "#fb923c",
    annualized: { 1: 43.5, 3: 23.0, 5: 7.2, 10: 10.1, 20: 7.8, 30: 9.0 },
  },
];

export function growthOfPrincipal(
  annualizedPct: number,
  years: number,
  principal = 10_000,
): number {
  return principal * Math.pow(1 + annualizedPct / 100, years);
}

export function buildGrowthPath(
  annualizedPct: number,
  years: number,
  principal = 10_000,
): { year: number; value: number }[] {
  const points: { year: number; value: number }[] = [
    { year: 0, value: principal },
  ];
  for (let y = 1; y <= years; y += 1) {
    points.push({
      year: y,
      value: growthOfPrincipal(annualizedPct, y, principal),
    });
  }
  return points;
}
