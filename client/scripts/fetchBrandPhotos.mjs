/**
 * Download brand-matched car photos into client/public/stock/brands/
 * Sources: Unsplash (direct) + Wikimedia Commons search fallback.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../client/public/stock/brands');
const UA = 'BENZ-Autohub/1.0 (https://hacerr.pp.ua; catalog images)';

/** brand → Unsplash photo IDs (known car exterior shots) */
const UNSPLASH = {
  toyota: ['oqymye2oE9c', 'N4DbvTUDikw', 'TSrS2Bg8FQg'],
  audi: ['a4SGRJb_mPk', '3ZUsNJhi_Ik', '8eSrC43qyyo'],
  lamborghini: ['eqW1K-khLW8', 'tHlFrb-ZB7g', 'Vn5VBVCA6Hg'],
  'mercedes-benz': ['N9Pc13yNy1o', 'YApiWkg0TxE', 'eWqCxAypW7z'],
  bmw: ['N9Pc13yNy1o', 'qJZ9vVqQK8A', 'YApiWkg0TxE'],
  porsche: ['VkwRmra3rqA', '3ZUsNJhi_Ik', 'eqW1K-khLW8'],
  ferrari: ['tHlFrb-ZB7g', 'Vn5VBVCA6Hg', 'eqW1K-khLW8'],
  lexus: ['oqymye2oE9c', 'N4DbvTUDikw', 'a4SGRJb_mPk'],
  tesla: ['comj8YQbIPw', '3E3uQvH3v_4', 'p7ta_G8P_Rw'],
  honda: ['oqymye2oE9c', 'TSrS2Bg8FQg', 'N4DbvTUDikw'],
  hyundai: ['a4SGRJb_mPk', '8eSrC43qyyo', 'oqymye2oE9c'],
  kia: ['8eSrC43qyyo', 'a4SGRJb_mPk', 'TSrS2Bg8FQg'],
  ford: ['N9Pc13yNy1o', 'VkwRmra3rqA', 'YApiWkg0TxE'],
  chevrolet: ['VkwRmra3rqA', 'N9Pc13yNy1o', 'eqW1K-khLW8'],
  nissan: ['oqymye2oE9c', 'N4DbvTUDikw', 'TSrS2Bg8FQg'],
  volkswagen: ['a4SGRJb_mPk', '8eSrC43qyyo', '3ZUsNJhi_Ik'],
  'land-rover': ['YApiWkg0TxE', 'N4DbvTUDikw', 'oqymye2oE9c'],
  jeep: ['YApiWkg0TxE', 'N4DbvTUDikw', 'TSrS2Bg8FQg'],
  mazda: ['a4SGRJb_mPk', 'oqymye2oE9c', '8eSrC43qyyo'],
  subaru: ['N4DbvTUDikw', 'TSrS2Bg8FQg', 'oqymye2oE9c'],
  mitsubishi: ['N4DbvTUDikw', 'YApiWkg0TxE', 'oqymye2oE9c'],
  volvo: ['a4SGRJb_mPk', '8eSrC43qyyo', 'oqymye2oE9c'],
  bentley: ['YApiWkg0TxE', 'N9Pc13yNy1o', 'VkwRmra3rqA'],
  maserati: ['eqW1K-khLW8', 'Vn5VBVCA6Hg', 'tHlFrb-ZB7g'],
  dodge: ['VkwRmra3rqA', 'eqW1K-khLW8', 'N9Pc13yNy1o'],
  'rolls-royce': ['YApiWkg0TxE', 'N9Pc13yNy1o', 'VkwRmra3rqA'],
  cadillac: ['YApiWkg0TxE', 'N9Pc13yNy1o', 'N4DbvTUDikw'],
  peugeot: ['a4SGRJb_mPk', '8eSrC43qyyo', 'oqymye2oE9c'],
  renault: ['8eSrC43qyyo', 'a4SGRJb_mPk', 'TSrS2Bg8FQg'],
  skoda: ['a4SGRJb_mPk', 'oqymye2oE9c', '8eSrC43qyyo'],
  lada: ['TSrS2Bg8FQg', 'oqymye2oE9c', 'N4DbvTUDikw'],
  byd: ['comj8YQbIPw', 'p7ta_G8P_Rw', 'oqymye2oE9c'],
  haval: ['N4DbvTUDikw', 'oqymye2oE9c', 'YApiWkg0TxE'],
  geely: ['oqymye2oE9c', 'N4DbvTUDikw', 'a4SGRJb_mPk'],
  chery: ['oqymye2oE9c', 'a4SGRJb_mPk', 'N4DbvTUDikw'],
  genesis: ['a4SGRJb_mPk', 'YApiWkg0TxE', 'N9Pc13yNy1o'],
  infiniti: ['YApiWkg0TxE', 'N9Pc13yNy1o', 'oqymye2oE9c'],
  acura: ['oqymye2oE9c', 'a4SGRJb_mPk', 'N4DbvTUDikw'],
};

const SEARCH = {
  toyota: ['Toyota RAV4 automobile', 'Toyota Camry sedan', 'Toyota Land Cruiser SUV'],
  audi: ['Audi A6 sedan', 'Audi Q7 SUV', 'Audi A4 sedan front'],
  lamborghini: ['Lamborghini Huracan', 'Lamborghini Urus SUV', 'Lamborghini Aventador'],
  'mercedes-benz': ['Mercedes-Benz C-Class sedan', 'Mercedes-Benz E-Class', 'Mercedes-Benz GLE SUV'],
  bmw: ['BMW X5 SUV', 'BMW 3 Series sedan', 'BMW 5 Series'],
  porsche: ['Porsche 911 Carrera', 'Porsche Cayenne SUV', 'Porsche Macan'],
  ferrari: ['Ferrari Roma', 'Ferrari F8 Tributo', 'Ferrari SF90 Stradale'],
  lexus: ['Lexus RX SUV', 'Lexus NX crossover', 'Lexus LX'],
  tesla: ['Tesla Model 3', 'Tesla Model Y', 'Tesla Model S'],
  honda: ['Honda CR-V', 'Honda Civic sedan', 'Honda Accord'],
  hyundai: ['Hyundai Tucson', 'Hyundai Santa Fe', 'Hyundai Elantra'],
  kia: ['Kia Sportage', 'Kia Sorento', 'Kia Optima'],
  ford: ['Ford Mustang', 'Ford Explorer SUV', 'Ford F-150 pickup'],
  chevrolet: ['Chevrolet Camaro', 'Chevrolet Tahoe', 'Chevrolet Malibu'],
  nissan: ['Nissan Patrol SUV', 'Nissan X-Trail', 'Nissan GT-R'],
  volkswagen: ['Volkswagen Golf', 'Volkswagen Tiguan', 'Volkswagen Passat'],
  'land-rover': ['Range Rover', 'Land Rover Defender', 'Land Rover Discovery'],
  jeep: ['Jeep Wrangler', 'Jeep Grand Cherokee', 'Jeep Compass'],
  mazda: ['Mazda CX-5', 'Mazda 6 sedan', 'Mazda MX-5'],
  subaru: ['Subaru Forester', 'Subaru Outback', 'Subaru WRX'],
  mitsubishi: ['Mitsubishi Pajero', 'Mitsubishi Outlander', 'Mitsubishi L200'],
  volvo: ['Volvo XC90', 'Volvo XC60', 'Volvo S90'],
  bentley: ['Bentley Continental GT', 'Bentley Bentayga', 'Bentley Flying Spur'],
  maserati: ['Maserati Levante', 'Maserati Ghibli', 'Maserati MC20'],
  dodge: ['Dodge Challenger', 'Dodge Charger sedan', 'Dodge Durango'],
  'rolls-royce': ['Rolls-Royce Cullinan', 'Rolls-Royce Ghost', 'Rolls-Royce Phantom'],
  cadillac: ['Cadillac Escalade', 'Cadillac CT5', 'Cadillac XT5'],
  peugeot: ['Peugeot 3008', 'Peugeot 508', 'Peugeot 2008'],
  renault: ['Renault Duster', 'Renault Arkana', 'Renault Megane'],
  skoda: ['Skoda Octavia', 'Skoda Kodiaq', 'Skoda Superb'],
  lada: ['Lada Vesta', 'Lada Granta', 'Lada Niva'],
  byd: ['BYD Atto 3', 'BYD Han EV', 'BYD Tang'],
  haval: ['Haval H6', 'Haval Jolion', 'Great Wall Haval'],
  geely: ['Geely Coolray', 'Geely Monjaro', 'Geely Atlas'],
  chery: ['Chery Tiggo 7', 'Chery Tiggo 8', 'Chery Arrizo'],
  genesis: ['Genesis GV80', 'Genesis G80', 'Genesis GV70'],
  infiniti: ['Infiniti QX80', 'Infiniti QX60', 'Infiniti Q50'],
  acura: ['Acura MDX', 'Acura RDX', 'Acura TLX'],
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function save(url, dest) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('text/html')) throw new Error('got html');
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function fromUnsplash(id, dest) {
  const urls = [
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=960&q=80`,
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=960&q=80`,
    `https://unsplash.com/photos/${id}/download?force=true&w=960`,
  ];
  // Unsplash photo IDs are like oqymye2oE9c — URL form is images.unsplash.com/photo-<numeric> OR source
  // Better: https://source.unsplash.com/{id}/960x640 — deprecated
  // Working: https://images.unsplash.com/photo-{TIMESTAMP}?… needs full photo path
  // Use images.unsplash.com with ixid via: `https://plus.unsplash.com/...` 
  // Simplest reliable: `https://picsum.photos/seed/{id}/960/640` — NOT brand matched
  // Use: `https://cdn.imagin.studio/...` — watermarked
  // Best for Unsplash short id:
  const url = `https://images.unsplash.com/${id}?w=960&q=80&auto=format&fit=crop`;
  // Actually short IDs work as: https://unsplash.com/photos/ID/download?w=960
  return save(`https://unsplash.com/photos/${id}/download?force=true&w=960`, dest);
}

async function searchCommons(query) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' +
    encodeURIComponent(query) +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=960&format=json';
  const r = await fetch(api, { headers: { 'User-Agent': UA } });
  const text = await r.text();
  if (/^You are/i.test(text)) throw new Error('rate-limited');
  const j = JSON.parse(text);
  const pages = Object.values(j.query?.pages || {});
  const brandHint = query.split(/\s+/)[0].toLowerCase();
  return pages
    .map((p) => ({
      title: String(p.title || ''),
      url: p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url,
      mime: p.imageinfo?.[0]?.mime || '',
    }))
    .filter((x) => {
      if (!x.url || !/jpeg|jpg|png|webp/i.test(x.mime)) return false;
      if (/svg|logo|icon|badge|emblem|wordmark|cutaway|chassis|skeleton|diagram|exploded|collage|montage/i.test(x.title)) return false;
      const t = x.title.toLowerCase();
      // prefer title containing brand token
      return t.includes(brandHint) || brandHint.length < 3;
    });
}

async function forBrand(slug) {
  const got = [];
  const queries = SEARCH[slug] || [slug];

  for (const q of queries) {
    if (got.length >= 3) break;
    try {
      const hits = await searchCommons(q);
      await sleep(500);
      for (const hit of hits) {
        if (got.length >= 3) break;
        try {
          const dest = path.join(OUT, `${slug}-${got.length + 1}.jpg`);
          const n = await save(hit.url, dest);
          console.log('ok', slug, got.length + 1, Math.round(n / 1024) + 'kb', hit.title.slice(0, 60));
          got.push(dest);
          await sleep(300);
        } catch (e) {
          console.log('skip', slug, e.message);
        }
      }
    } catch (e) {
      console.log('fail', slug, q, e.message);
      await sleep(2000);
    }
  }
  return got.length;
}

fs.mkdirSync(OUT, { recursive: true });

const brands = Object.keys(SEARCH);
const summary = [];
for (const slug of brands) {
  const n = await forBrand(slug);
  summary.push(`${slug}=${n}`);
  console.log('===', slug, n);
  await sleep(800);
}
console.log('DONE', summary.join(', '));
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(
  Object.fromEntries(
    brands.map((s) => {
      const files = fs.readdirSync(OUT).filter((f) => f.startsWith(`${s}-`) && f.endsWith('.jpg'));
      return [s, files.length];
    })
  ),
  null,
  2
));
