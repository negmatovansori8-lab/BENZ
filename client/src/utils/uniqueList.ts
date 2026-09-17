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

/** Near-duplicate truck shots — only one index from each family may appear in a list. */
const TRUCK_FAMILIES: number[][] = [
  [1, 13, 25], // orange dump + hues
  [2, 14, 26],
  [3, 15, 27],
  [4, 16, 28],
  [5, 17, 29],
  [6, 18, 30],
  [7, 19, 31], // keep single fire look
  [8, 20, 32],
  [9, 21, 33],
  [10, 22, 34],
  [11, 23, 35],
  [12, 24, 36],
];

function familyOf(idx: number): number {
  for (let i = 0; i < TRUCK_FAMILIES.length; i++) {
    if (TRUCK_FAMILIES[i].includes(idx)) return i;
  }
  return idx;
}

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

/** Prefer model-matched stock for heavy vehicles. */
function preferredTruckIndex(car: Car): number | null {
  const m = `${car.brand} ${car.model} ${car.body}`.toLowerCase();
  if (/excavator|jcb|komatsu|caterpillar|xcmg|hitachi|liebherr|3cx|js220|pc200/.test(m)) return 3;
  if (/fire|rescue|ambulance|police/.test(m)) return 7;
  if (/dump|tipper|shacman|howo|faw|mixer|crane|water/.test(m)) return 1;
  if (/scania|daf|man|volvo|actros|tractor|trailer/.test(m)) return 4;
  if (/gaz|isuzu|npr|gazelle|van|transit/.test(m)) return 2;
  if (/cement|lafarge|tanker/.test(m)) return 5;
  return null;
}

/** Unique by id, twin, and identical cover photo (only one of the same image/color). */
export function uniqueByIdAndImage(rows: Car[]): Car[] {
  const ids = new Set<number>();
  const twins = new Set<string>();
  const covers = new Set<string>();
  const families = new Set<number>();
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
    const m = url.match(/\/(\d+)\.jpg$/i);
    if (m) {
      const fam = familyOf(Number(m[1]));
      if (families.has(fam)) continue;
      families.add(fam);
    }
    if (url) covers.add(url);
    unique.push(c);
  }
  return unique;
}

/**
 * Distinct covers within this list for specialty + passenger brand stock.
 */
export function diversifyCovers(rows: Car[]): Car[] {
  const usedSpecialty = new Map<string, Set<number>>();
  const usedFamilies = new Map<string, Set<number>>();
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
      let famUsed = usedFamilies.get(pool.folder);
      if (!famUsed) {
        famUsed = new Set();
        usedFamilies.set(pool.folder, famUsed);
      }

      const prefer = pool.folder === 'trucks' ? preferredTruckIndex(car) : null;
      let idx = prefer && !used.has(prefer) && !famUsed.has(familyOf(prefer))
        ? prefer
        : ((Math.abs(Number(car.id)) * 11 + i * 7) % pool.count) + 1;

      const tryPick = (candidate: number) => {
        const fam = familyOf(candidate);
        if (used.has(candidate) || famUsed.has(fam)) return false;
        idx = candidate;
        return true;
      };

      if (used.has(idx) || famUsed.has(familyOf(idx))) {
        let picked = false;
        // Prefer base shots 1..12 first (more visually distinct than hue copies)
        for (let n = 1; n <= Math.min(12, pool.count); n++) {
          if (tryPick(n)) {
            picked = true;
            break;
          }
        }
        if (!picked) {
          for (let n = 1; n <= pool.count; n++) {
            if (tryPick(n)) {
              picked = true;
              break;
            }
          }
        }
      }

      used.add(idx);
      famUsed.add(familyOf(idx));
      const cover = `/stock/${pool.folder}/${idx}.jpg`;
      const gallery = [
        { id: 0, url: cover, sort_order: 0 },
        { id: 0, url: `/stock/${pool.folder}/${((idx - 1 + 5) % pool.count) + 1}.jpg`, sort_order: 1 },
        { id: 0, url: `/stock/${pool.folder}/${((idx - 1 + 11) % pool.count) + 1}.jpg`, sort_order: 2 },
      ];
      return { ...car, images: gallery, cover_hue: undefined };
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
          shot = ((Math.abs(Number(car.id)) + i) % count) + 1;
        } else {
          usedBrandShot.add(`${slug}-${shot}`);
        }
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
