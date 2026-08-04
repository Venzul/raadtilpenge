import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function ensureSchema(): Promise<void> {
  if (!hasDatabase()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getSql();
      await db`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          path TEXT NOT NULL,
          section TEXT,
          tab_key TEXT,
          visitor_id TEXT NOT NULL,
          props JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`
        CREATE TABLE IF NOT EXISTS calculator_runs (
          id BIGSERIAL PRIMARY KEY,
          section TEXT NOT NULL,
          tab_key TEXT NOT NULL,
          calculator TEXT NOT NULL,
          visitor_id TEXT NOT NULL,
          inputs JSONB NOT NULL,
          outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`
        CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
        ON analytics_events (created_at DESC)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS analytics_events_tab_created_idx
        ON analytics_events (section, tab_key, created_at DESC)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS analytics_events_visitor_idx
        ON analytics_events (visitor_id)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS calculator_runs_tab_created_idx
        ON calculator_runs (section, tab_key, created_at DESC)
      `;
      await db`
        CREATE TABLE IF NOT EXISTS skats_positivliste (
          id BIGSERIAL PRIMARY KEY,
          isin TEXT NOT NULL,
          name_shareclass TEXT,
          name_subfund TEXT,
          name TEXT,
          tax_residence TEXT,
          registered_years TEXT,
          sheet_year INT NOT NULL DEFAULT 2026,
          source TEXT,
          imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await db`
        CREATE INDEX IF NOT EXISTS skats_positivliste_isin_year_idx
        ON skats_positivliste (isin, sheet_year)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS skats_positivliste_name_shareclass_idx
        ON skats_positivliste (name_shareclass)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS skats_positivliste_sheet_year_idx
        ON skats_positivliste (sheet_year)
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}
