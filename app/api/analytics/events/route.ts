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
    name?: string;
    path?: string;
    section?: string | null;
    tabKey?: string | null;
    visitorId?: string;
    props?: Record<string, string>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const path = String(body.path ?? "").trim();
  const visitorId = String(body.visitorId ?? "").trim();

  if (!name || !path || !visitorId) {
    return NextResponse.json(
      { ok: false, error: "name, path and visitorId are required" },
      { status: 400 },
    );
  }

  try {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO analytics_events (name, path, section, tab_key, visitor_id, props)
      VALUES (
        ${name},
        ${path},
        ${body.section ?? null},
        ${body.tabKey ?? null},
        ${visitorId},
        ${body.props ?? {}}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("analytics event insert failed", error);
    return NextResponse.json(
      { ok: false, error: "Failed to store event" },
      { status: 500 },
    );
  }
}
