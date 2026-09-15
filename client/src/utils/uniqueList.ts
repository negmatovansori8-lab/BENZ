import type { Car } from '../types';

function imageKey(url?: string | null) {
  if (!url) return '';
  const s = String(url);
  if (/picsum\.photos|imagin\.studio/i.test(s)) return s;
  return s.split('?')[0];
}

/** Keep unique vehicles by id and by primary image URL. */
export function uniqueByIdAndImage(rows: Car[]): Car[] {
  const ids = new Set<number>();
  const imgs = new Set<string>();
  const out: Car[] = [];
  for (const c of rows) {
    if (!c || ids.has(c.id)) continue;
    const url = imageKey(c.images?.[0]?.url);
    if (url && imgs.has(url)) continue;
    ids.add(c.id);
    if (url) imgs.add(url);
    out.push(c);
  }
  return out;
}
