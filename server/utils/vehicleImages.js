/**
 * Passenger covers: curated real car photos (no IMAGE studio watermark).
 * Specialty: local /kamaz /parts /trucks galleries.
 */

const LOCAL_CAR_COUNT = 8;

/** Verified Unsplash IDs — real automobiles only. */
const PHOTOS = [
  '1552519507-da1b975cd568',
  '1618843479313-40f8ac5a9f65',
  '1606664515524-ed2f786a0bd6',
  '1492144534655-ae79c964c9d7',
  '1503376780353-7e6692767b70',
  '1542362567-b073e7c4e9f0',
  '1555215695-3004980ad54e',
  '1617531653332-bd460b3d65bb',
  '1553440569-bcc3878deb59',
  '1549399542-7e3f8b79c341',
  '1606220945770-b5b6c2c55bf1',
  '1609521263047-f8f205293f24',
  '1605559424843-9e4c228bf1c2',
  '1544636331-e26879cd4d9b',
  '1511919884226-fd3cad54629b',
  '1503736334956-4d8f2e29cd83',
  '1614200179396-2bdb77e0f3e9',
  '1583121274602-3e2820c69888',
  '1494976388531-d1058494cdd8',
  '1621007947382-bb3c3994e3fb',
  '1563720223185-11003d516935',
  '1606016157555-9c4c957df6b9',
  '1560958089-b8a192261813',
  '1533473359331-0135ef1b58bf',
  '1519641471654-76ce0107ad1b',
  '1494905998402-395d579af36f',
  '1485291571150-772bcfc10da5',
  '1449965408864-e677f2ad2a1a',
  '1549317661-bd432e5588d4',
  '1502877338535-766e1452684a',
  '1550355291-bbee04a92027',
  '1541899481282-d53bffe3c35d',
  '1525609004556-c46c7d6cf023',
  '1616422285623-13ff0162193b',
];

const BRAND_POOL = {
  'mercedes-benz': [0, 1, 2, 3, 4, 5],
  bmw: [6, 7, 8, 9, 10],
  audi: [11, 12, 13, 14],
  porsche: [15, 16, 17, 18],
  toyota: [19, 20, 21, 23, 24],
  lexus: [19, 20, 3, 4],
  tesla: [22, 11, 12],
  honda: [23, 24, 25],
  hyundai: [25, 26, 27],
  kia: [26, 27, 28],
  ford: [28, 29, 30],
  chevrolet: [29, 30, 31],
  volkswagen: [11, 12, 13],
  nissan: [23, 24, 32],
  jeep: [25, 26, 33],
  'land rover': [2, 3, 25],
  jaguar: [15, 16, 3],
  mazda: [19, 23, 27],
  subaru: [23, 24, 28],
  volvo: [11, 12, 25],
};

function hashStr(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Real car photo — unique per listing, no IMAGE studio watermark. */
export function carPhoto(brand, model, year, seed = 0, index = 0) {
  const id = Math.abs(Number(seed) || 0);
  const i = Math.abs(Number(index) || 0);
  const key = String(brand || '').toLowerCase().trim();
  const brandKey = key.includes('land') ? 'land rover' : key;
  const idxs = BRAND_POOL[brandKey];
  let photoId;
  if (idxs && idxs.length) {
    const pick = idxs[(id + i * 3) % idxs.length];
    photoId = PHOTOS[pick % PHOTOS.length];
  } else {
    photoId = PHOTOS[(id * 17 + i * 31 + hashStr(`${brand}|${model}|${year}`)) % PHOTOS.length];
  }
  return (
    `https://images.unsplash.com/photo-${photoId}` +
    `?auto=format&fit=crop&w=900&h=600&q=80&sig=${id}-${i}`
  );
}

export function localPassengerPhoto(seed = 0, index = 0) {
  const n = (Math.abs(Number(seed) || 0) + Math.abs(Number(index) || 0) * 3) % LOCAL_CAR_COUNT;
  return `/cars/${n + 1}.jpg`;
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

  if (cat === 'parts') return `/parts/${(id % 3) + 1}.jpg`;
  if (cat === 'kamaz') return `/kamaz/${(id % 3) + 1}.jpg`;
  if (cat === 'commercial' || cat === 'special' || cat === 'bus' || cat === 'agricultural') {
    return `/trucks/${(id % 3) + 1}.jpg`;
  }
  if (cat === 'passenger') {
    if (meta.brand && meta.model) return carPhoto(meta.brand, meta.model, meta.year, id, i);
    return localPassengerPhoto(id, i);
  }
  if (meta.brand || meta.model) {
    return placeholderImage(id * 31 + i, [meta.brand, meta.model].filter(Boolean).join(' '));
  }
  return localPassengerPhoto(id, i);
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
    /loremflickr\.com/i.test(s) ||
    /picsum\.photos/i.test(s) ||
    /cdn\.imagin\.studio/i.test(s) ||
    /^data:image\/svg\+xml/i.test(s)
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
    const imgKey = img ? String(img) : null;
    if (imgKey && byImg.has(imgKey)) continue;
    byId.add(row.id);
    byTwin.add(twin);
    if (imgKey) byImg.add(imgKey);
    out.push(row);
  }
  return out;
}
