import { NextResponse } from "next/server";
import { displayName, findByIsins, getPositivlisteMeta } from "../../../lib/positivliste";
import { RECOMMENDED_ETFS } from "../../../lib/recommended-etfs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isins = RECOMMENDED_ETFS.map((e) => e.isin).filter(
      (v): v is string => Boolean(v),
    );
    const { map, source } = await findByIsins(isins);
    const meta = getPositivlisteMeta();

    return NextResponse.json({
      ok: true,
      source,
      meta,
      etfs: RECOMMENDED_ETFS.map((etf) => {
        const match = etf.isin ? map.get(etf.isin.toUpperCase()) : undefined;
        return {
          ticker: etf.ticker,
          isin: etf.isin,
          navn: etf.navn,
          kontotyper: etf.kontotyper,
          danishImb: Boolean(etf.danishImb),
          onList: Boolean(match),
          listName: match ? displayName(match) : null,
        };
      }),
    });
  } catch (error) {
    console.error("positivliste recommended failed", error);
    return NextResponse.json(
      { ok: false, error: "Kunne ikke hente anbefalede ETF'er" },
      { status: 500 },
    );
  }
}
