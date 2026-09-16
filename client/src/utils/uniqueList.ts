import type { Car } from '../types';

/** Pool sizes must match client/public/stock/{folder}/N.jpg */
export const STOCK_POOL: Record<string, { folder: string; count: number }> = {
  kamaz: { folder: 'kamaz', count: 36 },
  commercial: { folder: 'trucks', count: 36 },
  special: { folder: 'trucks', count: 36 },
  bus: { folder: 'trucks', count: 36 },
  agricultural: { folder: 'trucks', count: 36 },
  parts: { folder: 'parts', count: 36 },
};

/** Unique by id and brand+model+year+category. */
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
  return diversifyStockCovers(out);
}

/**
 * Distinct cover per specialty listing in this list.
 * If the photo pool is exhausted, apply a hue tint so cards still look different.
 */
export function diversifyStockCovers(rows: Car[]): Car[] {
  const usedByFolder = new Map<string, Set<number>>();

  return rows.map((car, i) => {
    const pool = STOCK_POOL[car.category || ''];
    if (!pool) return car;

    let used = usedByFolder.get(pool.folder);
    if (!used) {
      used = new Set();
      usedByFolder.set(pool.folder, used);
    }

    let idx = ((Math.abs(Number(car.id)) * 11 + i * 7) % pool.count) + 1;
    let reused = used.has(idx);
    if (reused) {
      let free = 0;
      for (let n = 1; n <= pool.count; n++) {
        if (!used.has(n)) {
          free = n;
          break;
        }
      }
      if (free) {
        idx = free;
        reused = false;
      }
    }
    used.add(idx);

    const cover = `/stock/${pool.folder}/${idx}.jpg`;
    const gallery = [
      { id: 0, url: cover, sort_order: 0 },
      { id: 0, url: `/stock/${pool.folder}/${((idx - 1 + 5) % pool.count) + 1}.jpg`, sort_order: 1 },
      { id: 0, url: `/stock/${pool.folder}/${((idx - 1 + 11) % pool.count) + 1}.jpg`, sort_order: 2 },
    ];

    const cover_hue = reused ? ((Math.abs(Number(car.id)) * 53 + i * 19) % 300) + 25 : undefined;

    return { ...car, images: gallery, cover_hue };
  });
}
