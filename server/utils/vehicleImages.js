/**
 * Unique listing images — never reuse another car's photo.
 * New/passenger listings use Imagin Studio renders matched to brand + model.
 * Fallback: professional SVG labeled with brand/model (never another car's photo).
 */

export const NEW_CAR_YEAR_FROM = 2025;
export const NEW_CAR_MAX_MILEAGE = 1500;

export function placeholderImage(seed = 0, label = 'BENZ') {
  const n = Math.abs(Number(seed) || 0);
  const hue = 38 + (n % 12);
  const dark = 10 + (n % 8);
  const title = String(label || 'BENZ').replace(/[<>&']/g, '').slice(0, 28);
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

const MAKE_ALIAS = {
  'mercedes-benz': 'mercedes',
  mercedes: 'mercedes',
  'land rover': 'landrover',
  'land-rover': 'landrover',
  volkswagen: 'volkswagen',
  'alfa romeo': 'alfa-romeo',
  'rolls-royce': 'rolls-royce',
};

const MODEL_FAMILY = {
  '5 series': '5',
  '3 series': '3',
  '7 series': '7',
  'e-class': 'e-class',
  'c-class': 'c-class',
  's-class': 's-class',
  'a-class': 'a-class',
  'model 3': 'model-3',
  'model y': 'model-y',
  'model s': 'model-s',
  'model x': 'model-x',
  'land cruiser': 'land-cruiser',
  'range rover sport': 'range-rover-sport',
  'range rover': 'range-rover',
  'macan electric': 'macan',
  'f-150 lightning': 'f-150',
  'q6 e-tron': 'q6',
  'id.4': 'id.4',
  'roma spider': 'roma',
  'song plus': 'song-plus',
  'yuan plus': 'yuan-plus',
  'arrizo 8': 'arrizo-8',
  'grand cherokee': 'grand-cherokee',
  'electrified g80': 'g80',
  'f-pace': 'f-pace',
  'cx-60': 'cx-60',
  'cr-v': 'cr-v',
  eqe: 'eqe',
  i4: 'i4',
  gle: 'gle',
  glc: 'glc',
  x5: 'x5',
  x3: 'x3',
  x6: 'x6',
  q7: 'q7',
  q5: 'q5',
  a6: 'a6',
  camry: 'camry',
  rav4: 'rav4',
  tucson: 'tucson',
  sportage: 'sportage',
  'ioniq 5': 'ioniq-5',
  ev6: 'ev6',
  tiguan: 'tiguan',
  golf: 'golf',
  patrol: 'patrol',
  ariya: 'ariya',
  accord: 'accord',
  xc90: 'xc90',
  ex30: 'ex30',
  seal: 'seal',
  han: 'han',
  defender: 'defender',
  temerario: 'temerario',
  forester: 'forester',
  mustang: 'mustang',
  explorer: 'explorer',
  silverado: 'silverado',
  'equinox ev': 'equinox',
  sonata: 'sonata',
  k5: 'k5',
  cayenne: 'cayenne',
  '911': '911',
  rx: 'rx',
  es: 'es',
  nx: 'nx',
  gv70: 'gv70',
  jolion: 'jolion',
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

export function imaginModelFamily(brand, model) {
  const key = String(model || '').toLowerCase().trim();
  if (MODEL_FAMILY[key]) return MODEL_FAMILY[key];
  // first token often works (e.g. "Camry Hybrid" → camry)
  const first = key.split(/\s+/)[0];
  if (MODEL_FAMILY[first]) return MODEL_FAMILY[first];
  return slug(model).replace(/--+/g, '-');
}

/** Real 3D studio render for brand/model/year — unique angle per listing. */
export function carPhoto(brand, model, year, seed = 0, index = 0) {
  const label = [brand, model].filter(Boolean).join(' ') || 'BENZ';
  const make = imaginMake(brand);
  const modelFamily = imaginModelFamily(brand, model);
  if (!make || !modelFamily) return placeholderImage(seed, label);
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const angle = 1 + ((id * 3 + i * 11) % 28);
  const y = Math.min(2100, Math.max(2018, Number(year) || NEW_CAR_YEAR_FROM));
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

/** Unique cover per listing. */
export function imageForVehicle(category, seed = 0, index = 0, label = 'BENZ', meta = {}) {
  if (meta.brand && meta.model && (category === 'passenger' || !category)) {
    return carPhoto(meta.brand, meta.model, meta.year, seed, index);
  }
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const tag = label && label !== 'BENZ' ? label : `Vehicle ${id}`;
  return placeholderImage(id * 31 + i, tag);
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
    let imgKey = null;
    if (img) {
      const s = String(img);
      imgKey = s.startsWith('data:')
        ? `data:${s.length}:${s.slice(-120)}`
        : s.includes('cdn.imagin.studio')
          ? s
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
