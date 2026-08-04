/**
 * Rebuild data/skats-positivliste-2026.json from Skat's Excel,
 * then optionally import into Neon when DATABASE_URL is set.
 *
 * Usage:
 *   node scripts/import-skats-positivliste.mjs
 *   node scripts/import-skats-positivliste.mjs --download
 *   node scripts/import-skats-positivliste.mjs --db
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const EXCEL_URL =
  "https://skat.dk/media/5bdgifbu/juni-2026-abis-liste-2021-2026.xlsx";
const EXCEL_PATH = path.join(
  process.cwd(),
  "juni-2026-abis-liste-2021-2026.xlsx",
);
const JSON_PATH = path.join(
  process.cwd(),
  "data",
  "skats-positivliste-2026.json",
);

const args = new Set(process.argv.slice(2));

function clean(value) {
  const s = String(value ?? "").trim();
  if (!s || s === "[tom]") return null;
  return s;
}

async function downloadExcel() {
  console.log("Downloading", EXCEL_URL);
  const res = await fetch(EXCEL_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(EXCEL_PATH, buf);
  console.log("Saved", EXCEL_PATH, `(${buf.length} bytes)`);
}

function buildJson() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(
      `Missing ${EXCEL_PATH}. Run with --download first, or place the xlsx in the project root.`,
    );
  }

  const wb = XLSX.readFile(EXCEL_PATH);
  if (!wb.SheetNames.includes("2026")) {
    throw new Error(`Sheet "2026" not found. Sheets: ${wb.SheetNames.join(", ")}`);
  }

  const raw = XLSX.utils.sheet_to_json(wb.Sheets["2026"], { defval: "" });
  const rows = raw
    .map((r) => ({
      isin: clean(r["ISIN-kode/-Code"]),
      nameShareclass: clean(r["Navn andelsklasse/Name Shareclass"]),
      nameSubfund: clean(r["Navn afdeling/Name Sub-fund"]),
      name: clean(r["Navn/Name"]),
      taxResidence: clean(r["Skattemæssigt hjemsted/Tax residence"]),
      registeredYears: clean(r["Registrerede år/Registered "]),
    }))
    .filter((r) => r.isin && r.isin !== "Udstedt uden");

  const payload = {
    source: EXCEL_URL,
    sourcePage:
      "https://skat.dk/erhverv/ekapital/vaerdipapirer/beviser-og-aktier-i-investeringsforeninger-og-selskaber-ifpa",
    sheet: "2026",
    version: "Juni 2026",
    published: "2026-06-29",
    importedAt: new Date().toISOString(),
    count: rows.length,
    rows,
  };

  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(payload));
  console.log(`Wrote ${rows.length} rows → ${JSON_PATH}`);
  return payload;
}

async function importToDb(payload) {
  const { neon } = require("@neondatabase/serverless");
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(url);
  console.log("Ensuring table…");
  await sql`
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
  await sql`
    CREATE INDEX IF NOT EXISTS skats_positivliste_isin_year_idx
    ON skats_positivliste (isin, sheet_year)
  `;

  console.log("Clearing 2026 rows…");
  await sql`DELETE FROM skats_positivliste WHERE sheet_year = 2026`;

  console.log(`Inserting ${payload.rows.length} rows…`);
  let imported = 0;
  for (const row of payload.rows) {
    await sql`
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
        ${payload.source},
        ${payload.importedAt}
      )
    `;
    imported += 1;
    if (imported % 500 === 0) console.log(`  ${imported}…`);
  }
  console.log(`Imported ${imported} rows into skats_positivliste`);
}

async function main() {
  if (args.has("--download")) {
    await downloadExcel();
  }

  const payload = buildJson();

  if (args.has("--db")) {
    await importToDb(payload);
  } else {
    console.log(
      "JSON ready. Re-run with --db (and DATABASE_URL) to load into Neon.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
