import { NextResponse } from "next/server";
import { displayName, searchPositivliste } from "../../../lib/positivliste";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 25) || 25, 50);

  if (q.length < 2) {
    return NextResponse.json({ ok: true, q, rows: [], source: "file" });
  }

  try {
    const { rows, source } = await searchPositivliste(q, limit);
    return NextResponse.json({
      ok: true,
      q,
      source,
      rows: rows.map((row) => ({
        isin: row.isin,
        name: displayName(row),
        nameShareclass: row.nameShareclass,
        nameSubfund: row.nameSubfund,
        taxResidence: row.taxResidence,
        registeredYears: row.registeredYears,
      })),
    });
  } catch (error) {
    console.error("positivliste search failed", error);
    return NextResponse.json(
      { ok: false, error: "Søgning fejlede" },
      { status: 500 },
    );
  }
}
