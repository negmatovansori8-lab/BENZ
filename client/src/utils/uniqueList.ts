import type { Car } from '../types';

/** Unique by id and brand+model+year+category. Local stock photos may repeat. */
export function uniqueByIdAndImage(rows: Car[]): Car[] {
  const ids = new Set<number>();
  const twins = new Set<string>();
  const remoteImgs = new Set<string>();
  const out: Car[] = [];
  for (const c of rows) {
    if (!c || ids.has(c.id)) continue;
    const twin = `${c.brand}|${c.model}|${c.year}|${c.category}`.toLowerCase();
    if (twins.has(twin)) continue;
    const url = c.images?.[0]?.url ? String(c.images[0].url) : '';
    const isLocalStock =
      url.startsWith('/stock/') ||
      url.startsWith('/cars/') ||
      url.startsWith('/trucks/') ||
      url.startsWith('/kamaz/') ||
      url.startsWith('/parts/') ||
      url.startsWith('/homes/') ||
      url.startsWith('/uploads/');
    if (url && !isLocalStock) {
      const key = url.split('?')[0];
      if (remoteImgs.has(key)) continue;
      remoteImgs.add(key);
    }
    ids.add(c.id);
    twins.add(twin);
    out.push(c);
  }
  return out;
}
