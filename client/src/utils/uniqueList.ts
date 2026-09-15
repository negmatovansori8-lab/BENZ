import type { Car } from '../types';

function imageKey(url?: string | null) {
  if (!url) return '';
  // Full URL for CDN covers so each listing stays unique
  return String(url);
}

/** Keep unique vehicles by id and by primary image URL. */
export function uniqueByIdAndImage(rows: Car[]): Car[] {
  const ids = new Set<number>();
  const imgs = new Set<string>();
  const twins = new Set<string>();
  const out: Car[] = [];
  for (const c of rows) {
    if (!c || ids.has(c.id)) continue;
    const twin = `${c.brand}|${c.model}|${c.year}|${c.category}`.toLowerCase();
    if (twins.has(twin)) continue;
    const url = imageKey(c.images?.[0]?.url);
    if (url && imgs.has(url)) continue;
    ids.add(c.id);
    twins.add(twin);
    if (url) imgs.add(url);
    out.push(c);
  }
  return out;
}
