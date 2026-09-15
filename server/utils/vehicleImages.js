/**
 * Listing covers:
 * - passenger → real brand/model studio render (Imagin)
 * - kamaz / parts / trucks → local gallery
 * - other specialty → unique fallback (not random landscapes for cars)
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

const MAKE_ALIAS = {
  'mercedes-benz': 'mercedes',
  mercedes: 'mercedes',
  'land rover': 'landrover',
  'land-rover': 'landrover',
  volkswagen: 'volkswagen',
};

const MODEL_FAMILY = {
  '5 series': '5',
  '3 series': '3',
  '7 series': '7',
  'e-class': 'e-class',
  'c-class': 'c-class',
  's-class': 's-class',
  'a-class': 'a-class',
  'g-class': 'g-class',
  'model 3': 'model-3',
  'model y': 'model-y',
  'model s': 'model-s',
  'model x': 'model-x',
  'land cruiser': 'land-cruiser',
  'range rover': 'range-rover',
  'range rover sport': 'range-rover-sport',
  'f-pace': 'f-pace',
  'f-type': 'f-type',
  'ioniq 5': 'ioniq-5',
  'cr-v': 'cr-v',
  'grand cherokee': 'grand-cherokee',
  'cx-5': 'cx-5',
  'cx-9': 'cx-9',
  'id.4': 'id.4',
  'amg gt': 'amg-gt',
  wrx: 'wrx',
  mustang: 'mustang',
  camry: 'camry',
  corolla: 'corolla',
  prado: 'land-cruiser-prado',
  rav4: 'rav4',
  x5: 'x5',
  x3: 'x3',
  x6: 'x6',
  x1: 'x1',
  gle: 'gle',
  glc: 'glc',
  q7: 'q7',
  q5: 'q5',
  a6: 'a6',
  a4: 'a4',
  rx: 'rx',
  es: 'es',
  nx: 'nx',
  lx: 'lx',
  '911': '911',
  cayenne: 'cayenne',
  macan: 'macan',
  tucson: 'tucson',
  'santa fe': 'santa-fe',
  sportage: 'sportage',
  sorento: 'sorento',
  patrol: 'patrol',
  civic: 'civic',
  accord: 'accord',
  highlander: 'highlander',
  durango: 'durango',
  charger: 'charger',
  challenger: 'challenger',
  cobalt: 'cobalt',
  elantra: 'elantra',
  sonata: 'sonata',
  tiguan: 'tiguan',
  passat: 'passat',
  golf: 'golf',
  forester: 'forester',
  outback: 'outback',
  'f-150': 'f-150',
  explorer: 'explorer',
  bronco: 'bronco',
  focus: 'focus',
  camaro: 'camaro',
  tahoe: 'tahoe',
  silverado: 'silverado',
  malibu: 'malibu',
  wrangler: 'wrangler',
  compass: 'compass',
  'x-trail': 'x-trail',
  qashqai: 'qashqai',
  sunny: 'sunny',
  'gt-r': 'gt-r',
  pilot: 'pilot',
  fit: 'fit',
  k5: 'k5',
  ev6: 'ev6',
  seltos: 'seltos',
  touareg: 'touareg',
  xc90: 'xc90',
  xc60: 'xc60',
  s90: 's90',
  pajero: 'pajero',
  outlander: 'outlander',
  defender: 'defender',
  discovery: 'discovery',
  xf: 'xf',
  seal: 'seal',
  han: 'han',
  'song plus': 'song-plus',
  'yuan plus': 'yuan-plus',
  jolion: 'jolion',
  monjaro: 'monjaro',
};

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[._]/g, '-')
    .replace(/\s+/g, '-');
}

export function imaginMake(brand) {
  const key = String(brand || '').toLowerCase().trim();
  return MAKE_ALIAS[key] || slug(brand).replace(/-/g, '');
}

export function imaginModelFamily(model) {
  const key = String(model || '').toLowerCase().trim();
  if (MODEL_FAMILY[key]) return MODEL_FAMILY[key];
  const first = key.split(/\s+/)[0];
  if (MODEL_FAMILY[first]) return MODEL_FAMILY[first];
  return slug(model).replace(/--+/g, '-');
}

/** Real car render matched to brand + model (Mercedes, BMW, …). */
export function carPhoto(brand, model, year, seed = 0, index = 0) {
  const make = imaginMake(brand);
  const modelFamily = imaginModelFamily(model);
  if (!make || !modelFamily) {
    return placeholderImage(seed, [brand, model].filter(Boolean).join(' ') || 'BENZ');
  }
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const angle = 1 + ((id * 3 + i * 11) % 28);
  const y = Math.min(2100, Math.max(2015, Number(year) || 2024));
  const paint = 40 + ((id + i) % 30);
  return (
    `https://cdn.imagin.studio/getImage?customer=img` +
    `&make=${encodeURIComponent(make)}` +
    `&modelFamily=${encodeURIComponent(modelFamily)}` +
    `&modelYear=${y}` +
    `&angle=${angle}` +
    `&zoomType=fullscreen` +
    `&width=900` +
    `&paintId=pspc00${paint}`
  );
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

/** Cover for a listing — passenger cars use real studio photos. */
export function imageForVehicle(category, seed = 0, index = 0, meta = {}) {
  const cat = category || 'passenger';
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);

  if (cat === 'parts') return `/parts/${(id % 3) + 1}.jpg`;
  if (cat === 'kamaz') return `/kamaz/${(id % 3) + 1}.jpg`;
  if (cat === 'commercial' || cat === 'special' || cat === 'bus' || cat === 'agricultural') {
    return `/trucks/${(id % 3) + 1}.jpg`;
  }
  if (cat === 'passenger' && meta.brand && meta.model) {
    return carPhoto(meta.brand, meta.model, meta.year, id, i);
  }
  if (meta.brand || meta.model) {
    return placeholderImage(id * 31 + i, [meta.brand, meta.model].filter(Boolean).join(' '));
  }
  const hint = TAG_HINT[cat] || 'vehicle';
  return `https://picsum.photos/seed/benz-${hint}-${id}-${i}/900/600`;
}

export function isRemoteVehicleImage(url) {
  return /^https?:\/\//i.test(String(url || ''));
}

export function isImaginImage(url) {
  return /cdn\.imagin\.studio/i.test(String(url || ''));
}

export function isStockRemoteImage(url) {
  const s = String(url || '');
  return (
    /images\.unsplash\.com/i.test(s) ||
    /loremflickr\.com/i.test(s) ||
    /picsum\.photos/i.test(s) ||
    /^data:image\/svg\+xml/i.test(s)
  );
}

/** Dedupe by id + full image URL (keep query for CDN uniqueness). */
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
    const imgKey = img ? String(img) : null;
    if (imgKey && byImg.has(imgKey)) continue;
    byId.add(row.id);
    byTwin.add(twin);
    if (imgKey) byImg.add(imgKey);
    out.push(row);
  }
  return out;
}
