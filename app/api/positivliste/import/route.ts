import { NextResponse } from "next/server";
import { hasDatabase } from "../../../lib/db";
import { importPositivlisteToDatabase } from "../../../lib/positivliste";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/positivliste/import
 * Loads the committed 2026 JSON into Neon.
 * Optional header: x-import-secret must match POSITIVLISTE_IMPORT_SECRET when set.
 */
export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  }

  const requiredSecret = process.env.POSITIVLISTE_IMPORT_SECRET;
  if (requiredSecret) {
    const provided = request.headers.get("x-import-secret");
    if (provided !== requiredSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await importPositivlisteToDatabase();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("positivliste import failed", error);
    return NextResponse.json(
      { ok: false, error: "Import fejlede" },
      { status: 500 },
    );
  }
}
