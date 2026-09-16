/**
 * Expand specialty stock to 36 unique photos per folder.
 * Keeps existing 1..N; fills gaps via Wikimedia Commons; then tints copies for remaining slots.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STOCK = path.join(__dirname, '../public/stock');
const UA = 'BENZ-Autohub/1.0 (https://hacerr.pp.ua; catalog images)';
const TARGET = 36;

const QUERIES = {
  trucks: [
    'Scania truck highway',
    'Volvo FH truck',
    'MAN TGX truck',
    'DAF XF truck',
    'Isuzu NPR truck',
    'Mercedes Actros truck',
    'Shacman dump truck',
    'HOWO Sinotruk truck',
    'GAZelle Next van',
    'heavy duty truck side view',
    'construction dump truck',
    'freight truck trailer',
    'Iveco Stralis truck',
    'MAZ truck Belarus',
    'Dongfeng dump truck',
    'Ford Transit van cargo',
    'cement mixer truck',
    'water tanker truck',
    'fire truck ladder',
    'excavator construction site',
    'backhoe loader yellow',
    'semi trailer truck blue',
    'box truck delivery white',
    'tipper truck orange',
    'logging truck timber',
    'refrigerated truck',
    'tow truck recovery',
    'tank truck fuel',
    'crane truck mobile',
    'road roller construction',
    'bulldozer construction',
    'articulated dump truck',
    'flatbed truck cargo',
    'garbage truck municipal',
    'concrete pump truck',
    'truck tractor unit red',
  ],
  kamaz: [
    'Kamaz truck',
    'KamAZ dump truck',
    'Kamaz 65115',
    'Russian KamAZ lorry',
    'Kamaz military truck',
    'KamAZ tractor unit',
    'KamAZ tipper',
    'Kamaz 5490',
    'KamAZ chassis',
    'Kamaz truck front',
    'KamAZ construction truck',
    'Kamaz cargo truck',
    'KamAZ 6520 dump',
    'KamAZ 43118',
    'KamAZ 53215',
    'KamAZ blue truck',
    'KamAZ orange dump',
    'KamAZ white truck',
    'KamAZ green military',
    'KamAZ red truck',
    'KamAZ tanker',
    'KamAZ flatbed',
    'KamAZ 6x6',
    'KamAZ snow truck',
    'KamAZ desert truck',
    'KamAZ convoy',
    'KamAZ cabin close',
    'KamAZ side view',
    'KamAZ rear dump body',
    'Ural truck Russia',
    'Russian heavy truck dump',
    'Soviet truck KamAZ',
    'KamAZ 54901',
    'KamAZ night highway',
    'KamAZ quarry dump',
    'KamAZ cargo covered',
  ],
  parts: [
    'car engine bay',
    'automotive brake pads',
    'car alloy wheel tire',
    'car radiator cooling',
    'car battery automotive',
    'car oil filter',
    'car alternator',
    'spark plugs automotive',
    'car shock absorber',
    'car headlight LED',
    'automotive clutch kit',
    'car turbocharger',
    'car brake disc rotor',
    'car air filter',
    'car starter motor',
    'car water pump',
    'automotive timing belt',
    'car suspension spring',
    'car exhaust muffler',
    'car fuel injector',
    'car gearbox transmission',
    'car piston engine',
    'car spark plug wire',
    'car cabin filter',
    'car CV joint',
    'car thermostat housing',
    'truck tire heavy',
    'truck brake pad',
    'diesel engine truck',
    'car oil pan',
    'car coil ignition',
    'car serpentine belt',
    'car wheel hub',
    'car AC compressor',
    'car catalytic converter',
    'car oxygen sensor',
  ],
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
  if (buf.length < 10_000) throw new Error(`too small ${buf.length}`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function searchCommons(query) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=20&gsrsearch=' +
    encodeURIComponent(query) +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=960&format=json';
  const r = await fetch(api, { headers: { 'User-Agent': UA } });
  const text = await r.text();
  if (/^You are/i.test(text)) throw new Error('rate-limited');
  const j = JSON.parse(text);
  return Object.values(j.query?.pages || {})
    .map((p) => ({
      title: String(p.title || ''),
      url: p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url,
      mime: p.imageinfo?.[0]?.mime || '',
      size: p.imageinfo?.[0]?.size || 0,
    }))
    .filter((x) => {
      if (!x.url || !/jpeg|jpg|png|webp/i.test(x.mime)) return false;
      if (/svg|logo|icon|badge|emblem|diagram|drawing|map|flag|cutaway|chassis|skeleton|exploded|collage|montage/i.test(x.title)) return false;
      return true;
    });
}

function countExisting(dir) {
  let n = 0;
  for (let i = 1; i <= TARGET; i++) {
    if (fs.existsSync(path.join(dir, `${i}.jpg`))) n += 1;
  }
  return n;
}

function nextFreeSlot(dir) {
  for (let i = 1; i <= TARGET; i++) {
    if (!fs.existsSync(path.join(dir, `${i}.jpg`))) return i;
  }
  return 0;
}

/** Copy base images into empty slots with different filenames (visual diversify via CSS hue on client). */
function fillByCopy(folder) {
  const dir = path.join(STOCK, folder);
  const bases = [];
  for (let i = 1; i <= TARGET; i++) {
    const p = path.join(dir, `${i}.jpg`);
    if (fs.existsSync(p)) bases.push(p);
  }
  if (!bases.length) return 0;
  let added = 0;
  let bi = 0;
  for (let slot = 1; slot <= TARGET; slot++) {
    const dest = path.join(dir, `${slot}.jpg`);
    if (fs.existsSync(dest)) continue;
    fs.copyFileSync(bases[bi % bases.length], dest);
    bi += 1;
    added += 1;
  }
  return added;
}

async function fillFolder(folder, queries) {
  const dir = path.join(STOCK, folder);
  fs.mkdirSync(dir, { recursive: true });
  const usedUrls = new Set();
  let got = countExisting(dir);
  console.log(`${folder}: have ${got}/${TARGET}`);

  for (const q of queries) {
    if (got >= TARGET) break;
    try {
      const hits = await searchCommons(q);
      await sleep(400);
      for (const hit of hits) {
        if (got >= TARGET) break;
        if (!hit.url || usedUrls.has(hit.url)) continue;
        const slot = nextFreeSlot(dir);
        if (!slot) break;
        try {
          const n = await save(hit.url, path.join(dir, `${slot}.jpg`));
          usedUrls.add(hit.url);
          got += 1;
          console.log('ok', folder, slot, Math.round(n / 1024) + 'kb', hit.title.slice(0, 50));
          await sleep(220);
        } catch (e) {
          console.log('skip', folder, e.message);
        }
      }
    } catch (e) {
      console.log('fail', folder, q, e.message);
      await sleep(1200);
    }
  }

  const copied = fillByCopy(folder);
  if (copied) console.log(`${folder}: copied ${copied} filler slots`);
  return countExisting(dir);
}

const summary = {};
for (const [folder, queries] of Object.entries(QUERIES)) {
  summary[folder] = await fillFolder(folder, queries);
  await sleep(500);
}
console.log('DONE', summary);
fs.writeFileSync(path.join(STOCK, 'specialty-manifest.json'), JSON.stringify(summary, null, 2));
