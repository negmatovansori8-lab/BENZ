/**
 * Unique listing images — never reuse another car's photo.
 * Stock listings use a professional SVG labeled with brand/model
 * so we never show a Mustang for a BYD (or any mismatch).
 */

export function placeholderImage(seed = 0, label = 'BENZ') {
  const n = Math.abs(Number(seed) || 0);
  const hue = 38 + (n % 12); // gold / warm metal family
  const dark = 10 + (n % 8);
  const title = String(label || 'BENZ').replace(/[<>&]/g, '').slice(0, 28);
  const sub = 'BENZ · Official listing';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 22% ${dark + 8}%)"/>
      <stop offset="100%" stop-color="hsl(${hue + 8} 28% ${dark}%)"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c9a227" stop-opacity="0"/>
      <stop offset="50%" stop-color="#c9a227" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#c9a227" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="900" height="600" fill="url(#bg)"/>
  <path d="M120 390h660l-48-120c-12-30-42-50-76-50H280c-30 0-58 16-72 42l-40 78z" fill="#1a1a1c" stroke="#c9a227" stroke-width="3" opacity=".9"/>
  <circle cx="280" cy="400" r="42" fill="#0a0a0b" stroke="#c9a227" stroke-width="3"/>
  <circle cx="620" cy="400" r="42" fill="#0a0a0b" stroke="#c9a227" stroke-width="3"/>
  <circle cx="280" cy="400" r="14" fill="#c9a227" opacity=".55"/>
  <circle cx="620" cy="400" r="14" fill="#c9a227" opacity=".55"/>
  <rect x="0" y="0" width="900" height="4" fill="url(#shine)"/>
  <text x="450" y="250" text-anchor="middle" fill="#f5f5f5" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="36" font-weight="700">${title}</text>
  <text x="450" y="290" text-anchor="middle" fill="#c9a227" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="16" letter-spacing="3">${sub}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Unique cover per listing — labeled placeholder (never another vehicle's photo). */
export function imageForVehicle(category, seed = 0, index = 0, label = 'BENZ') {
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const tag = label && label !== 'BENZ' ? label : `Vehicle ${id}`;
  return placeholderImage(id * 31 + i, tag);
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

/** Dedupe cars by id, brand+model+year, and primary image URL. */
export function uniqueVehicles(rows = []) {
  const byId = new Set();
  const byTwin = new Set();
  const byImg = new Set();
  const out = [];
  for (const row of rows) {
    if (!row || byId.has(row.id)) continue;
    const twin = `${row.brand || ''}|${row.model || ''}|${row.year || ''}|${row.category || ''}`
      .toLowerCase();
    if (byTwin.has(twin)) continue;
    const img = Array.isArray(row.images)
      ? (row.images[0]?.url || row.images[0])
      : null;
    // data: SVGs share a long common prefix — use full string (or length+tail) so we don't collapse listings
    let imgKey = null;
    if (img) {
      const s = String(img);
      imgKey = s.startsWith('data:')
        ? `data:${s.length}:${s.slice(-120)}`
        : s.split('?')[0].slice(0, 220);
    }
    if (imgKey && byImg.has(imgKey)) continue;
    byId.add(row.id);
    byTwin.add(twin);
    if (imgKey) byImg.add(imgKey);
    out.push(row);
  }
  return out;
}

export const NEW_CAR_YEAR_FROM = 2025;
