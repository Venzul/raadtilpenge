import { readFileSync } from "fs";
import { join } from "path";
import { ensureSchema, getSql, hasDatabase } from "./db";

export type PositivlisteRow = {
  isin: string;
  nameShareclass: string | null;
  nameSubfund: string | null;
  name: string | null;
  taxResidence: string | null;
  registeredYears: string | null;
};

export type PositivlisteMeta = {
  source: string;
  sourcePage: string;
  sheet: string;
  version: string;
  published: string;
  importedAt: string;
  count: number;
};

type PositivlisteFile = PositivlisteMeta & {
  rows: PositivlisteRow[];
  versionLabel?: string;
};

let cachedFile: PositivlisteFile | null = null;

function loadFile(): PositivlisteFile {
  if (cachedFile) return cachedFile;
  const path = join(process.cwd(), "data", "skats-positivliste-2026.json");
  cachedFile = JSON.parse(readFileSync(path, "utf8")) as PositivlisteFile;
  return cachedFile;
}

export function getPositivlisteMeta(): PositivlisteMeta {
  const file = loadFile();
  return {
    source: file.source,
    sourcePage: file.sourcePage,
    sheet: file.sheet,
    version: file.version ?? `Juni ${file.sheet}`,
    published: file.published,
    importedAt: file.importedAt,
    count: file.count,
  };
}

export function displayName(row: PositivlisteRow): string {
  return row.nameShareclass || row.nameSubfund || row.name || row.isin;
}

function matchesQuery(row: PositivlisteRow, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    row.isin.toLowerCase().includes(needle) ||
    (row.nameShareclass?.toLowerCase().includes(needle) ?? false) ||
    (row.nameSubfund?.toLowerCase().includes(needle) ?? false) ||
    (row.name?.toLowerCase().includes(needle) ?? false)
  );
}

export function searchPositivlisteFromFile(
  query: string,
  limit = 25,
): PositivlisteRow[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return loadFile()
    .rows.filter((row) => matchesQuery(row, q))
    .slice(0, limit);
}

export function findByIsinsFromFile(
  isins: string[],
): Map<string, PositivlisteRow> {
  const wanted = new Set(isins.map((i) => i.toUpperCase()));
  const map = new Map<string, PositivlisteRow>();
  for (const row of loadFile().rows) {
    const key = row.isin.toUpperCase();
    if (wanted.has(key)) map.set(key, row);
  }
  return map;
}

async function dbHasRows(): Promise<boolean> {
  const db = getSql();
  const existing = await db`
    SELECT 1 AS ok FROM skats_positivliste WHERE sheet_year = 2026 LIMIT 1
  `;
  return existing.length > 0;
}

export async function searchPositivliste(
  query: string,
  limit = 25,
): Promise<{ rows: PositivlisteRow[]; source: "database" | "file" }> {
  const q = query.trim();
  if (q.length < 2) return { rows: [], source: "file" };

  if (hasDatabase()) {
    try {
      await ensureSchema();
      if (await dbHasRows()) {
        const db = getSql();
        const pattern = `%${q}%`;
        const result = await db`
          SELECT isin, name_shareclass, name_subfund, name, tax_residence, registered_years
          FROM skats_positivliste
          WHERE sheet_year = 2026
            AND (
              isin ILIKE ${pattern}
              OR COALESCE(name_shareclass, '') ILIKE ${pattern}
              OR COALESCE(name_subfund, '') ILIKE ${pattern}
              OR COALESCE(name, '') ILIKE ${pattern}
            )
          ORDER BY
            CASE WHEN isin ILIKE ${q} THEN 0
                 WHEN isin ILIKE ${pattern} THEN 1
                 ELSE 2 END,
            COALESCE(name_shareclass, name_subfund, name, isin)
          LIMIT ${limit}
        `;
        return {
          source: "database",
          rows: result.map((r) => ({
            isin: String(r.isin),
            nameShareclass: (r.name_shareclass as string | null) ?? null,
            nameSubfund: (r.name_subfund as string | null) ?? null,
            name: (r.name as string | null) ?? null,
            taxResidence: (r.tax_residence as string | null) ?? null,
            registeredYears: (r.registered_years as string | null) ?? null,
          })),
        };
      }
    } catch (error) {
      console.error("positivliste DB search failed, falling back to file", error);
    }
  }

  return { rows: searchPositivlisteFromFile(q, limit), source: "file" };
}

export async function findByIsins(
  isins: string[],
): Promise<{ map: Map<string, PositivlisteRow>; source: "database" | "file" }> {
  const unique = [
    ...new Set(isins.filter(Boolean).map((i) => i.toUpperCase())),
  ];
  if (unique.length === 0) return { map: new Map(), source: "file" };

  if (hasDatabase()) {
    try {
      await ensureSchema();
      if (await dbHasRows()) {
        const db = getSql();
        const result = await db`
          SELECT isin, name_shareclass, name_subfund, name, tax_residence, registered_years
          FROM skats_positivliste
          WHERE sheet_year = 2026
            AND upper(isin) = ANY(${unique})
        `;
        const map = new Map<string, PositivlisteRow>();
        for (const r of result) {
          map.set(String(r.isin).toUpperCase(), {
            isin: String(r.isin),
            nameShareclass: (r.name_shareclass as string | null) ?? null,
            nameSubfund: (r.name_subfund as string | null) ?? null,
            name: (r.name as string | null) ?? null,
            taxResidence: (r.tax_residence as string | null) ?? null,
            registeredYears: (r.registered_years as string | null) ?? null,
          });
        }
        return { map, source: "database" };
      }
    } catch (error) {
      console.error("positivliste DB lookup failed, falling back to file", error);
    }
  }

  return { map: findByIsinsFromFile(unique), source: "file" };
}

/** Import/replace 2026 sheet into Neon from the committed JSON. */
export async function importPositivlisteToDatabase(): Promise<{
  imported: number;
}> {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not set");
  }

  await ensureSchema();
  const db = getSql();
  const file = loadFile();
  const meta = getPositivlisteMeta();

  await db`DELETE FROM skats_positivliste WHERE sheet_year = 2026`;

  let imported = 0;
  for (const row of file.rows) {
    await db`
      INSERT INTO skats_positivliste (
        isin, name_shareclass, name_subfund, name,
        tax_residence, registered_years, sheet_year, source, imported_at
      ) VALUES (
        ${row.isin},
        ${row.nameShareclass},
        ${row.nameSubfund},
        ${row.name},
        ${row.taxResidence},
        ${row.registeredYears},
        2026,
        ${meta.source},
        ${meta.importedAt}
      )
    `;
    imported += 1;
  }

  return { imported };
}
