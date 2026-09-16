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

const BRAND_PHOTO_COUNT: Record<string, number> = {
  toyota: 3, audi: 6, lamborghini: 6, 'mercedes-benz': 6, bmw: 6, porsche: 6,
  ferrari: 6, lexus: 6, tesla: 6, honda: 3, hyundai: 3, kia: 3, ford: 3,
  chevrolet: 3, nissan: 3, volkswagen: 3, 'land-rover': 6, jeep: 3, mazda: 3,
  subaru: 3, mitsubishi: 3, volvo: 3, bentley: 6, maserati: 6, dodge: 3,
  'rolls-royce': 6, cadillac: 3, peugeot: 3, renault: 3, skoda: 3, lada: 3,
  byd: 3, haval: 3, geely: 3, chery: 3, genesis: 6, infiniti: 3, acura: 3,
};

function brandSlug(brand: string) {
  return String(brand || '')
    .trim()
    .toLowerCase()
    .replace(/[._]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function coverUrl(c: Car) {
  return c.images?.[0]?.url ? String(c.images[0].url).split('?')[0] : '';
}

/** Unique by id, twin, and identical cover photo (only one of the same image/color). */
export function uniqueByIdAndImage(rows: Car[]): Car[] {
  const ids = new Set<number>();
  const twins = new Set<string>();
  const covers = new Set<string>();
  const out: Car[] = [];
  for (const c of rows) {
    if (!c || ids.has(c.id)) continue;
    const twin = `${c.brand}|${c.model}|${c.year}|${c.category}`.toLowerCase();
    if (twins.has(twin)) continue;
    ids.add(c.id);
    twins.add(twin);
    out.push(c);
  }
  const diversified = diversifyCovers(out);
  const unique: Car[] = [];
  for (const c of diversified) {
    const url = coverUrl(c);
    if (url && covers.has(url)) continue;
    if (url) covers.add(url);
    unique.push(c);
  }
  return unique;
}

/**
 * Distinct covers within this list for specialty + passenger brand stock.
 * When a brand only has 3 shots, later cars of that brand are dropped by cover dedupe.
 */
export function diversifyCovers(rows: Car[]): Car[] {
  const usedSpecialty = new Map<string, Set<number>>();
  const usedBrandShot = new Set<string>();

  return rows.map((car, i) => {
    const cat = car.category || 'passenger';
    const pool = STOCK_POOL[cat];

    if (pool) {
      let used = usedSpecialty.get(pool.folder);
      if (!used) {
        used = new Set();
        usedSpecialty.set(pool.folder, used);
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
    }

    if (cat === 'passenger') {
      const slug = brandSlug(car.brand);
      const count = BRAND_PHOTO_COUNT[slug] || 0;
      if (count > 0) {
        let shot = 0;
        for (let n = 1; n <= count; n++) {
          const key = `${slug}-${n}`;
          if (!usedBrandShot.has(key)) {
            shot = n;
            break;
          }
        }
        if (!shot) {
          // All brand shots taken — leave as-is; cover dedupe will drop clones
          shot = ((Math.abs(Number(car.id)) + i) % count) + 1;
        } else {
          usedBrandShot.add(`${slug}-${shot}`);
        }
        const cover = `/stock/brands/${slug}-${shot}.jpg`;
        const gallery = Array.from({ length: Math.min(3, count) }, (_, g) => ({
          id: 0,
          url: `/stock/brands/${slug}-${((shot - 1 + g) % count) + 1}.jpg`,
          sort_order: g,
        }));
        return { ...car, images: gallery, cover_hue: undefined };
      }
      const carIdx = ((Math.abs(Number(car.id)) + i * 3) % 8) + 1;
      const cover = `/stock/cars/${carIdx}.jpg`;
      if (!usedBrandShot.has(cover)) usedBrandShot.add(cover);
      return {
        ...car,
        images: [{ id: 0, url: cover, sort_order: 0 }],
      };
    }

    return car;
  });
}

/** @deprecated alias */
export const diversifyStockCovers = diversifyCovers;
