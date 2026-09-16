/**
 * Download diverse specialty stock photos (trucks, kamaz, parts, homes)
 * into client/public/stock/{folder}/N.jpg via Wikimedia Commons.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STOCK = path.join(__dirname, '../public/stock');
const UA = 'BENZ-Autohub/1.0 (https://hacerr.pp.ua; catalog images)';
const TARGET = 12;

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
  ],
  homes: [
    'modern apartment interior living room',
    'suburban house exterior',
    'real estate apartment kitchen',
    'modern villa exterior',
    'city apartment balcony',
    'house with garden',
    'office commercial interior',
    'luxury apartment bedroom',
    'townhouse exterior',
    'land plot countryside',
    'modern flat living room',
    'cottage house facade',
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

async function fillFolder(folder, queries) {
  const dir = path.join(STOCK, folder);
  fs.mkdirSync(dir, { recursive: true });
  const usedUrls = new Set();
  let got = 0;
  // Keep existing 1..N if present; fill up to TARGET
  for (let i = 1; i <= TARGET; i++) {
    if (fs.existsSync(path.join(dir, `${i}.jpg`))) got += 1;
  }
  console.log(`${folder}: have ${got}/${TARGET}`);

  for (const q of queries) {
    if (got >= TARGET) break;
    try {
      const hits = await searchCommons(q);
      await sleep(450);
      for (const hit of hits) {
        if (got >= TARGET) break;
        if (!hit.url || usedUrls.has(hit.url)) continue;
        const next = got + 1;
        const dest = path.join(dir, `${next}.jpg`);
        if (fs.existsSync(dest) && next <= got) continue;
        // Find next free slot
        let slot = 1;
        while (slot <= TARGET && fs.existsSync(path.join(dir, `${slot}.jpg`))) slot += 1;
        if (slot > TARGET) break;
        try {
          const n = await save(hit.url, path.join(dir, `${slot}.jpg`));
          usedUrls.add(hit.url);
          got += 1;
          console.log('ok', folder, slot, Math.round(n / 1024) + 'kb', hit.title.slice(0, 50));
          await sleep(250);
        } catch (e) {
          console.log('skip', folder, e.message);
        }
      }
    } catch (e) {
      console.log('fail', folder, q, e.message);
      await sleep(1500);
    }
  }
  return got;
}

const summary = {};
for (const [folder, queries] of Object.entries(QUERIES)) {
  summary[folder] = await fillFolder(folder, queries);
  await sleep(600);
}
console.log('DONE', summary);
fs.writeFileSync(path.join(STOCK, 'specialty-manifest.json'), JSON.stringify(summary, null, 2));
