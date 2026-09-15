import type { Car } from '../types';

/** Keep unique vehicles by id and by primary image URL. */
export function uniqueByIdAndImage(rows: Car[]): Car[] {
  const ids = new Set<number>();
  const imgs = new Set<string>();
  const out: Car[] = [];
  for (const c of rows) {
    if (!c || ids.has(c.id)) continue;
    const url = c.images?.[0]?.url ? String(c.images[0].url).split('?')[0] : '';
    if (url && imgs.has(url)) continue;
    ids.add(c.id);
    if (url) imgs.add(url);
    out.push(c);
  }
  return out;
}
