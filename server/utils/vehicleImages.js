/**
 * Stock listing covers — one unique image per listing id.
 * Previous bug: KamAZ reused the same Unsplash ids as trucks (only q=78 vs q=80).
 * Now every listing gets a lock-based cover so the same photo never appears twice.
 */

const TAG = {
  passenger: 'car,automobile,sedan',
  commercial: 'truck,lorry,semi-truck',
  kamaz: 'dump-truck,truck,lorry',
  special: 'excavator,crane,bulldozer,construction',
  parts: 'car-engine,mechanic,auto-parts',
};

const CAT_LOCK = {
  passenger: 1_000_000,
  commercial: 2_000_000,
  kamaz: 3_000_000,
  special: 4_000_000,
  parts: 5_000_000,
};

/** Stable unique URL from listing id (+ gallery index). */
export function imageForVehicle(category, seed = 0, index = 0) {
  const cat = category && TAG[category] ? category : 'passenger';
  const tag = TAG[cat];
  const lock =
    (CAT_LOCK[cat] || 0) +
    Math.abs(Number(seed) || 0) * 97 +
    (Number(index) || 0) * 13 +
    1;
  return `https://loremflickr.com/900/600/${tag}?lock=${lock}`;
}

export function isRemoteVehicleImage(url) {
  return /^https?:\/\//i.test(String(url || ''));
}

/** Stock placeholders we are allowed to rewrite on read. */
export function isStockRemoteImage(url) {
  const s = String(url || '');
  return /images\.unsplash\.com/i.test(s) || /loremflickr\.com/i.test(s);
}
