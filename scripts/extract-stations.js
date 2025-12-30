#!/usr/bin/env node
/**
 * Extract police station entities from a URL dataset (classified-urls.json).
 *
 * Input (default):  data/classified-urls.json
 * Output (default): data/stations-extracted.json
 *
 * Expected input shapes (auto-detected):
 * - Array of strings: ["https://...", ...]
 * - Array of objects: [{ url, title?, h1? }, ...]
 * - Object with urls array: { urls: [{ url, title?, h1? } | "https://..." ...], ... }
 *
 * Filters to "police_station" URLs (case-insensitive substring match against URL).
 *
 * Deduping:
 * - Normalizes names, then clusters by similarity threshold (default 0.90).
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const get = (key) => {
    const prefix = `--${key}=`;
    const hit = argv.find((a) => a.startsWith(prefix));
    return hit ? hit.slice(prefix.length) : undefined;
  };

  const input = get('in') || path.join(__dirname, '..', 'data', 'classified-urls.json');
  const output = get('out') || path.join(__dirname, '..', 'data', 'stations-extracted.json');
  const threshold = Number(get('threshold') || process.env.STATION_DEDUPE_THRESHOLD || '0.90');

  return {
    input,
    output,
    threshold: Number.isFinite(threshold) ? Math.min(0.999, Math.max(0.5, threshold)) : 0.9,
  };
}

function readJsonFile(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function ensureDirForFile(absPath) {
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function stripQueryAndHash(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.search = '';
    u.hash = '';
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
    return u.toString();
  } catch {
    return null;
  }
}

function toUrlRecords(input) {
  const out = [];

  const push = (v) => {
    if (!v) return;
    if (typeof v === 'string') {
      const normalized = stripQueryAndHash(v);
      if (!normalized) return;
      out.push({ url: normalized });
      return;
    }
    if (typeof v === 'object' && typeof v.url === 'string') {
      const normalized = stripQueryAndHash(v.url);
      if (!normalized) return;
      out.push({
        url: normalized,
        title: typeof v.title === 'string' ? v.title : undefined,
        h1: typeof v.h1 === 'string' ? v.h1 : undefined,
      });
    }
  };

  if (Array.isArray(input)) {
    input.forEach(push);
    return out;
  }

  if (input && typeof input === 'object' && Array.isArray(input.urls)) {
    input.urls.forEach(push);
    return out;
  }

  if (input && typeof input === 'object') {
    for (const key of ['records', 'items', 'data']) {
      if (Array.isArray(input[key])) {
        input[key].forEach(push);
        return out;
      }
    }
  }

  return out;
}

function cleanWhitespace(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function titleCaseName(s) {
  const lowerWords = new Set(['and', 'or', 'the', 'of', 'in', 'at', 'on', 'for', 'to', 'a', 'an']);
  const parts = cleanWhitespace(s).split(' ');
  return parts
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (i > 0 && lowerWords.has(lw)) return lw;
      if (/^[A-Z0-9]{2,}$/.test(w)) return w;
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    })
    .join(' ');
}

function slugify(s) {
  return cleanWhitespace(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeStationName(raw) {
  let s = cleanWhitespace(raw);
  s = s.replace(/^(view|profile|listing)\s*[:-]\s*/i, '');
  s = s.replace(/[_/]+/g, ' ');
  s = s.replace(/\s*-\s*/g, ' ');
  s = cleanWhitespace(s);

  const hasPoliceStation = /\bpolice\s+station\b/i.test(s);
  const hasPolice = /\bpolice\b/i.test(s);
  const hasStation = /\bstation\b/i.test(s);
  if (!hasPoliceStation && (hasPolice || hasStation)) {
    s = s.replace(/\bpolice\b/i, '').replace(/\bstation\b/i, '');
    s = cleanWhitespace(s);
    s = s.length > 0 ? `${s} Police Station` : 'Police Station';
  } else if (!hasPoliceStation) {
    s = `${s} Police Station`;
  }

  s = s.replace(/\bpolice\s+station\s+police\s+station\b/gi, 'Police Station');
  s = cleanWhitespace(s);
  return titleCaseName(s);
}

function extractNameFromUrl(url) {
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    if (!last) return null;
    const decoded = decodeURIComponent(last);
    const cleaned = decoded.replace(/[_-]+/g, ' ').replace(/\.[a-z0-9]+$/i, '');
    const nameLike = cleanWhitespace(cleaned);
    return nameLike.length ? nameLike : null;
  } catch {
    return null;
  }
}

function looksLikeUsefulName(s) {
  const t = cleanWhitespace(s);
  if (t.length < 3) return false;
  if (/^browse by category$/i.test(t)) return false;
  if (/^search\b/i.test(t)) return false;
  if (/^find\b/i.test(t) && /\bnear you\b/i.test(t)) return false;
  return true;
}

function extractStationName(rec) {
  if (rec.h1 && looksLikeUsefulName(rec.h1)) return { name: rec.h1, extractedFrom: 'h1' };
  if (rec.title && looksLikeUsefulName(rec.title)) return { name: rec.title, extractedFrom: 'title' };
  const fromUrl = extractNameFromUrl(rec.url);
  if (fromUrl && looksLikeUsefulName(fromUrl)) return { name: fromUrl, extractedFrom: 'url' };
  return null;
}

function normalizedKey(name) {
  return cleanWhitespace(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\bthe\b/g, ' ')
    .replace(/\bpolice\b/g, ' police ')
    .replace(/\bstation\b/g, ' station ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardTokens(a, b) {
  const ta = new Set(a.split(' ').filter(Boolean));
  const tb = new Set(b.split(' ').filter(Boolean));
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function trigrams(s) {
  const x = `  ${s}  `;
  const out = new Set();
  for (let i = 0; i < x.length - 2; i++) out.add(x.slice(i, i + 3));
  return out;
}

function jaccardTrigrams(a, b) {
  const ga = trigrams(a);
  const gb = trigrams(b);
  if (ga.size === 0 && gb.size === 0) return 1;
  if (ga.size === 0 || gb.size === 0) return 0;
  let inter = 0;
  for (const g of ga) if (gb.has(g)) inter += 1;
  const union = ga.size + gb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function similarity(aName, bName) {
  const a = normalizedKey(aName);
  const b = normalizedKey(bName);
  if (a === b) return 1;
  return Math.max(jaccardTokens(a, b), jaccardTrigrams(a, b));
}

function clusterStations(candidates, threshold) {
  const stations = [];

  const assign = (cand) => {
    const normalized = normalizeStationName(cand.name);
    const slug = slugify(normalized);
    const source = {
      url: cand.rec.url,
      title: cand.rec.title,
      h1: cand.rec.h1,
      extractedFrom: cand.extractedFrom,
    };

    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < stations.length; i++) {
      const score = similarity(stations[i].name, normalized);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0 && bestScore >= threshold) {
      const st = stations[bestIdx];
      st.urls.push(cand.rec.url);
      st.sources.push(source);
      st.canonicalUrl = [st.canonicalUrl, cand.rec.url].sort((a, b) => a.length - b.length)[0];
      return;
    }

    stations.push({
      name: normalized,
      slug,
      canonicalUrl: cand.rec.url,
      urls: [cand.rec.url],
      sources: [source],
    });
  };

  for (const cand of candidates) assign(cand);

  for (const st of stations) {
    st.urls = Array.from(new Set(st.urls)).sort((a, b) => a.localeCompare(b));
    st.sources = st.sources.sort((a, b) => a.url.localeCompare(b.url));
  }

  return stations.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inAbs = path.isAbsolute(args.input) ? args.input : path.join(process.cwd(), args.input);
  const outAbs = path.isAbsolute(args.output) ? args.output : path.join(process.cwd(), args.output);

  if (!fs.existsSync(inAbs)) {
    throw new Error(`Input file not found: ${inAbs}\nProvide --in=... or create data/classified-urls.json`);
  }

  const raw = readJsonFile(inAbs);
  const records = toUrlRecords(raw);
  const policeStationRecords = records.filter((r) => r.url.toLowerCase().includes('police_station'));

  const candidates = [];
  for (const rec of policeStationRecords) {
    const extracted = extractStationName(rec);
    if (!extracted) continue;
    candidates.push({ name: extracted.name, rec, extractedFrom: extracted.extractedFrom });
  }

  const stations = clusterStations(candidates, args.threshold);

  const output = {
    generatedAt: new Date().toISOString(),
    inputFile: inAbs,
    totalPoliceStationUrls: policeStationRecords.length,
    totalStations: stations.length,
    stations,
  };

  ensureDirForFile(outAbs);
  fs.writeFileSync(outAbs, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`Read: ${inAbs}`);
  console.log(`Police_station URLs: ${policeStationRecords.length}`);
  console.log(`Stations (deduped): ${stations.length} (threshold=${args.threshold})`);
  console.log(`Wrote: ${outAbs}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

