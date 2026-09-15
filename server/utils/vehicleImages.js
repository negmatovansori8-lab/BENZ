/**
 * Passenger covers: local real car photos only (no IMAGE studio / remote watermarks).
 * Specialty: /stock/kamaz /stock/parts /stock/trucks.
 */

const LOCAL_CAR_COUNT = 8;

export function carPhoto(brand, model, year, seed = 0, index = 0) {
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const n = (id * 7 + i * 3 + String(brand || '').length * 5 + String(model || '').length) % LOCAL_CAR_COUNT;
  return `/stock/cars/${n + 1}.jpg`;
}

export function localPassengerPhoto(seed = 0, index = 0) {
  const n = (Math.abs(Number(seed) || 0) + Math.abs(Number(index) || 0) * 3) % LOCAL_CAR_COUNT;
  return `/stock/cars/${n + 1}.jpg`;
}

export function placeholderImage(seed = 0, label = 'BENZ') {
  const n = Math.abs(Number(seed) || 0);
  const hue = 38 + (n % 12);
  const dark = 10 + (n % 8);
  const title = String(label || 'BENZ').replace(/[<>&']/g, '').slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="hsl(${hue} 22% ${dark + 8}%)"/>
    <stop offset="100%" stop-color="hsl(${hue + 8} 28% ${dark}%)"/>
  </linearGradient></defs>
  <rect width="900" height="600" fill="url(#g)"/>
  <text x="450" y="300" text-anchor="middle" fill="#c9a227" font-family="Segoe UI,Arial" font-size="36" font-weight="700">${title}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function imageForVehicle(category, seed = 0, index = 0, meta = {}) {
  const cat = category || 'passenger';
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);

  if (cat === 'parts') return `/stock/parts/${(id % 3) + 1}.jpg`;
  if (cat === 'kamaz') return `/stock/kamaz/${(id % 3) + 1}.jpg`;
  if (cat === 'commercial' || cat === 'special' || cat === 'bus' || cat === 'agricultural') {
    return `/stock/trucks/${(id % 3) + 1}.jpg`;
  }
  if (cat === 'passenger') return carPhoto(meta.brand, meta.model, meta.year, id, i);
  if (meta.brand || meta.model) {
    return placeholderImage(id * 31 + i, [meta.brand, meta.model].filter(Boolean).join(' '));
  }
  return localPassengerPhoto(id, i);
}

export function isRemoteVehicleImage(url) {
  return /^https?:\/\//i.test(String(url || ''));
}

export function isImaginImage(url) {
  return /cdn\.imagin\.studio|imagin\.studio|image\s*studio|mag\s*studio/i.test(String(url || ''));
}

export function isLocalStockUrl(url) {
  const s = String(url || '');
  return (
    s.startsWith('/stock/') ||
    s.startsWith('/cars/') ||
    s.startsWith('/trucks/') ||
    s.startsWith('/kamaz/') ||
    s.startsWith('/parts/') ||
    s.startsWith('/homes/')
  );
}

export function isStockRemoteImage(url) {
  const s = String(url || '');
  return (
    /images\.unsplash\.com/i.test(s) ||
    /loremflickr\.com/i.test(s) ||
    /picsum\.photos/i.test(s) ||
    /cdn\.imagin\.studio/i.test(s) ||
    /^data:image\/svg\+xml/i.test(s) ||
    /^https?:\/\//i.test(s)
  );
}

export function uniqueVehicles(rows = []) {
  const byId = new Set();
  const byTwin = new Set();
  const byImg = new Set();
  const out = [];
  for (const row of rows) {
    if (!row || byId.has(row.id)) continue;
    const twin = `${row.brand || ''}|${row.model || ''}|${row.year || ''}|${row.category || ''}`.toLowerCase();
    if (byTwin.has(twin)) continue;
    const img = Array.isArray(row.images)
      ? (row.images[0]?.url || row.images[0])
      : null;
    const s = img ? String(img) : '';
    const imgKey = s.startsWith('/stock/') || s.startsWith('/cars/')
      ? null
      : (s ? s.split('?')[0] : null);
    if (imgKey && byImg.has(imgKey)) continue;
    byId.add(row.id);
    byTwin.add(twin);
    if (imgKey) byImg.add(imgKey);
    out.push(row);
  }
  return out;
}
