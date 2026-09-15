import Papa from "papaparse";

export function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Accept publish-to-web CSV URLs as-is; convert the "web page" (pubhtml)
// flavor to CSV; derive the CSV endpoint from a normal sheet URL (works with
// anyone-with-link sheets via the gviz endpoint).
export function deriveCsvUrl(raw: string): string {
  if (raw.includes("output=csv") || raw.includes("tqx=out:csv")) {
    return raw;
  }
  if (/spreadsheets\/d\/e\/[^/]+\/pubhtml/.test(raw)) {
    const gidMatch = raw.match(/[#&?]gid=(\d+)/);
    const gid = gidMatch ? `gid=${gidMatch[1]}&single=true&` : "";
    return raw.replace(/pubhtml.*$/, `pub?${gid}output=csv`);
  }
  // Only plain /d/<id>/ URLs — never the /d/e/<published-id>/ kind.
  const idMatch = raw.match(/spreadsheets\/d\/(?!e\/)([^/]+)/);
  if (idMatch) {
    const gidMatch = raw.match(/[#&?]gid=(\d+)/);
    const gid = gidMatch ? `&gid=${gidMatch[1]}` : "";
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?tqx=out:csv${gid}`;
  }
  return raw;
}

export function parseSheetRows(csv: string): string[][] {
  return Papa.parse<string[]>(csv.trim(), { skipEmptyLines: true }).data;
}
