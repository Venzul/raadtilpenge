/**
 * ETF'er anbefalet under Aktie kontotyper — med rigtige ISIN-koder
 * til opslag i Skats positivliste (ABIS).
 */
export type RecommendedEtf = {
  ticker: string;
  isin: string | null;
  navn: string;
  kontotyper: string[];
  /** Danske IMB'er står typisk ikke på ABIS-listen, men beskattes alligevel som aktieindkomst. */
  danishImb?: boolean;
};

export const RECOMMENDED_ETFS: RecommendedEtf[] = [
  {
    ticker: "P500",
    isin: "IE000UBAW7M3",
    navn: "Amundi S&P 500 UCITS ETF",
    kontotyper: ["Børneopsparing"],
  },
  {
    ticker: "FWRA",
    isin: "IE000716YHJ7",
    navn: "Invesco FTSE All-World",
    kontotyper: ["Børneopsparing"],
  },
  {
    ticker: "ESGW",
    isin: "IE00BJQRDK83",
    navn: "Invesco MSCI World ESG Universal",
    kontotyper: ["Børneopsparing"],
  },
  {
    ticker: "Nordnet Global",
    isin: null,
    navn: "Nordnet Global Indeks",
    kontotyper: ["Børneopsparing"],
    danishImb: true,
  },
  {
    ticker: "SPVIGAKL",
    isin: null,
    navn: "Sparinvest INDEX Globale Aktier KL",
    kontotyper: ["Alm. aktiedepot"],
    danishImb: true,
  },
  {
    ticker: "STIIAM",
    isin: null,
    navn: "Storebrand Indeks - Alle Markeder A5",
    kontotyper: ["Alm. aktiedepot"],
    danishImb: true,
  },
  {
    ticker: "DK0064866222",
    isin: "DK0064866222",
    navn: "Sparinvest INDEX MSCI ACWI",
    kontotyper: ["Alm. aktiedepot"],
    danishImb: true,
  },
  {
    ticker: "DK0064866305",
    isin: "DK0064866305",
    navn: "Sparinvest INDEX S&P 500",
    kontotyper: ["Alm. aktiedepot"],
    danishImb: true,
  },
  {
    ticker: "SPYL",
    isin: "IE000XZSV718",
    navn: "SPDR S&P 500 UCITS ETF",
    kontotyper: ["ASK", "Pension"],
  },
  {
    ticker: "PRAW",
    isin: "LU2089238203",
    navn: "Amundi Prime Global UCITS ETF",
    kontotyper: ["ASK", "Pension"],
  },
  {
    ticker: "WEBN",
    isin: "IE0003XJA0J9",
    navn: "Amundi Prime All Country World (Acc)",
    kontotyper: ["ASK", "Pension"],
  },
  {
    ticker: "WEBG",
    isin: "IE0009HF1MK9",
    navn: "Amundi Prime All Country World (Dist)",
    kontotyper: ["ASK", "Pension"],
  },
  {
    ticker: "SPYI",
    isin: "IE00B3YLTY66",
    navn: "SPDR MSCI ACWI IMI UCITS",
    kontotyper: ["ASK", "Pension"],
  },
  {
    ticker: "IUSQ",
    isin: "IE00B6R52259",
    navn: "iShares MSCI ACWI UCITS ETF",
    kontotyper: ["ASK", "Pension"],
  },
];
