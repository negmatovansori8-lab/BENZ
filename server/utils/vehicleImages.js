/**
 * Unique stock covers — one stable URL per listing id (+ gallery index).
 * Never reuse the same image URL across different vehicles.
 */

const TAG_HINT = {
  passenger: 'car',
  commercial: 'truck',
  kamaz: 'lorry',
  bus: 'bus',
  special: 'excavator',
  agricultural: 'tractor',
  motorcycle: 'motorcycle',
  marine: 'yacht',
  aircraft: 'airplane',
  parts: 'engine',
};

/** Deterministic unique cover. Picsum seed guarantees no collisions across ids. */
export function imageForVehicle(category, seed = 0, index = 0) {
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const hint = TAG_HINT[category] || 'vehicle';
  // Unique seed string → unique photo; hint is only for readability in URL
  return `https://picsum.photos/seed/benz-${hint}-${id}-${i}/900/600`;
}

/** Professional SVG placeholder when remote image fails (no cross-listing reuse). */
export function placeholderImage(seed = 0, label = 'BENZ') {
  const n = Math.abs(Number(seed) || 0);
  const hue = (n * 47) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 18% 16%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360} 22% 10%)"/>
    </linearGradient></defs>
    <rect width="900" height="600" fill="url(#g)"/>
    <text x="450" y="300" text-anchor="middle" fill="#c9a227" font-family="Segoe UI,Arial" font-size="42" font-weight="700">${String(label).slice(0, 18)}</text>
    <text x="450" y="348" text-anchor="middle" fill="#a1a1aa" font-family="Segoe UI,Arial" font-size="18">No photo</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function isRemoteVehicleImage(url) {
  return /^https?:\/\//i.test(String(url || ''));
}

export function isStockRemoteImage(url) {
  const s = String(url || '');
  return (
    /images\.unsplash\.com/i.test(s) ||
    /loremflickr\.com/i.test(s) ||
    /picsum\.photos/i.test(s)
  );
}

/** Dedupe cars by id and by image URL (keep first). */
export function uniqueVehicles(rows = []) {
  const byId = new Set();
  const byImg = new Set();
  const out = [];
  for (const row of rows) {
    if (!row || byId.has(row.id)) continue;
    const img = Array.isArray(row.images)
      ? (row.images[0]?.url || row.images[0])
      : null;
    const imgKey = img ? String(img).split('?')[0] : null;
    if (imgKey && byImg.has(imgKey)) continue;
    byId.add(row.id);
    if (imgKey) byImg.add(imgKey);
    out.push(row);
  }
  return out;
}
