// Standalone snapshot refresher: fetches the news and highlights sheets and
// writes src/data/news-snapshot.json + src/data/highlights-snapshot.json.
// Run manually via `npm run refresh-news`.
// Reads NEWS_SHEET_CSV_URL and HIGHLIGHTS_SHEET_CSV_URL from the environment
// or a local .env file.
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

function loadEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const envFile = fs.readFileSync(".env", "utf8");
    for (const line of envFile.split("\n")) {
      const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`));
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
  return "";
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function deriveCsvUrl(raw) {
  if (raw.includes("output=csv") || raw.includes("tqx=out:csv")) {
    return raw;
  }
  if (/spreadsheets\/d\/e\/[^/]+\/pubhtml/.test(raw)) {
    const gidMatch = raw.match(/[#&?]gid=(\d+)/);
    const gid = gidMatch ? `gid=${gidMatch[1]}&single=true&` : "";
    return raw.replace(/pubhtml.*$/, `pub?${gid}output=csv`);
  }
  const idMatch = raw.match(/spreadsheets\/d\/(?!e\/)([^/]+)/);
  if (idMatch) {
    const gidMatch = raw.match(/[#&?]gid=(\d+)/);
    const gid = gidMatch ? `&gid=${gidMatch[1]}` : "";
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?tqx=out:csv${gid}`;
  }
  return raw;
}

function columnMapper(columnNames) {
  return (rows) => {
    if (rows.length < 2) throw new Error("sheet returned no data rows");
    const headers = rows[0].map(normalizeKey);
    const idx = columnNames.map((name) => headers.indexOf(name));
    return rows
      .slice(1)
      .map((row) =>
        Object.fromEntries(
          columnNames.map((name, i) => [name, (row[idx[i]] ?? "").trim()])
        )
      );
  };
}

const SHEETS = [
  {
    env: "NEWS_SHEET_CSV_URL",
    snapshot: "src/data/news-snapshot.json",
    columns: ["slno", "date", "title", "url", "imageurl"],
    // Snapshot keys must match the field names the site's libs read.
    rename: { imageurl: "image" },
    keep: (item) => item.title !== "" && item.url !== "",
  },
  {
    env: "HIGHLIGHTS_SHEET_CSV_URL",
    snapshot: "src/data/highlights-snapshot.json",
    columns: ["slno", "title", "description", "url", "imageurl"],
    rename: { imageurl: "image" },
    keep: (item) => item.title !== "" && item.url !== "",
  },
];

let anySuccess = false;
let anyConfigured = false;

for (const sheet of SHEETS) {
  const raw = loadEnv(sheet.env);
  if (!raw) {
    console.warn(`${sheet.env} is not set — skipping ${sheet.snapshot}`);
    continue;
  }
  anyConfigured = true;
  try {
    const res = await fetch(deriveCsvUrl(raw), {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const map = columnMapper(sheet.columns);
    const items = map(Papa.parse((await res.text()).trim(), { skipEmptyLines: true }).data)
      .map((item) =>
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [
            sheet.rename?.[key] ?? key,
            value,
          ])
        )
      )
      .filter(sheet.keep)
      .sort((a, b) => Number(b.slno || 0) - Number(a.slno || 0));
    const abs = path.resolve(sheet.snapshot);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, JSON.stringify(items, null, 2) + "\n");
    console.log(`Snapshot written: ${items.length} items -> ${sheet.snapshot}`);
    anySuccess = true;
  } catch (err) {
    console.error(`${sheet.env} fetch failed: ${err}`);
  }
}

if (!anyConfigured) {
  console.error("No sheet URLs configured (.env or environment). Nothing to do.");
  process.exit(1);
}
process.exit(anySuccess ? 0 : 1);
