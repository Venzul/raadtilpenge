import { NextResponse } from "next/server";
import { ensureSchema, getSql, hasDatabase } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  }

  let body: {
    section?: string;
    tabKey?: string;
    calculator?: string;
    visitorId?: string;
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const section = String(body.section ?? "").trim();
  const tabKey = String(body.tabKey ?? "").trim();
  const calculator = String(body.calculator ?? tabKey).trim();
  const visitorId = String(body.visitorId ?? "").trim();
  const inputs = body.inputs ?? null;

  if (!section || !tabKey || !visitorId || !inputs || typeof inputs !== "object") {
    return NextResponse.json(
      { ok: false, error: "section, tabKey, visitorId and inputs are required" },
      { status: 400 },
    );
  }

  try {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO calculator_runs (
        section, tab_key, calculator, visitor_id, inputs, outputs
      )
      VALUES (
        ${section},
        ${tabKey},
        ${calculator},
        ${visitorId},
        ${inputs},
        ${body.outputs ?? {}}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("calculator run insert failed", error);
    return NextResponse.json(
      { ok: false, error: "Failed to store calculator run" },
      { status: 500 },
    );
  }
}
