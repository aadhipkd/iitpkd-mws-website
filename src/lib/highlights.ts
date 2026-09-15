import fs from "node:fs";
import path from "node:path";
import { deriveCsvUrl, normalizeKey, parseSheetRows } from "./sheet";

export interface HighlightItem {
  slno: string;
  title: string;
  description: string;
  url: string;
  image: string;
}

const SNAPSHOT_PATH = path.resolve("src/data/highlights-snapshot.json");

export function parseHighlightsCsv(csv: string): HighlightItem[] {
  const rows = parseSheetRows(csv);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeKey);
  const col = (name: string) => headers.indexOf(name);

  const iSlno = col("slno");
  const iTitle = col("title");
  const iDesc = col("description");
  const iUrl = col("url");
  const iImage = col("imageurl");

  return rows
    .slice(1)
    .map((row) => ({
      slno: (row[iSlno] ?? "").trim(),
      title: (row[iTitle] ?? "").trim(),
      description: (row[iDesc] ?? "").trim(),
      url: (row[iUrl] ?? "").trim(),
      image: (row[iImage] ?? "").trim(),
    }))
    .filter((item) => item.title !== "" && item.url !== "")
    .sort((a, b) => Number(b.slno || 0) - Number(a.slno || 0));
}

function readSnapshot(): HighlightItem[] {
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as HighlightItem[];
  } catch {
    return [];
  }
}

export async function getHighlights(): Promise<HighlightItem[]> {
  const raw =
    import.meta.env.HIGHLIGHTS_SHEET_CSV_URL ??
    process.env.HIGHLIGHTS_SHEET_CSV_URL;

  if (raw && raw.trim() !== "") {
    try {
      const res = await fetch(deriveCsvUrl(raw.trim()), {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = parseHighlightsCsv(await res.text());
      if (items.length > 0) return items;
      throw new Error("sheet returned no usable rows");
    } catch (err) {
      console.warn(
        `[highlights] live fetch failed, falling back to snapshot: ${err}`
      );
    }
  } else {
    console.warn("[highlights] HIGHLIGHTS_SHEET_CSV_URL not set, using snapshot");
  }

  return readSnapshot();
}
