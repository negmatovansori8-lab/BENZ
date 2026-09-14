import { query } from '../config/db.js';

const TARGET_CARS = 8500;
const TARGET_HOMES = 1500;
const BATCH = 80;

const PASSENGER = [
  { brand: 'Toyota', models: ['Camry', 'Corolla', 'Prado', 'RAV4', 'Land Cruiser', 'Highlander', 'Hilux', 'Yaris'], bodies: ['Sedan', 'SUV', 'Pickup', 'Hatchback'] },
  { brand: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'A-Class', 'G-Class'], bodies: ['Sedan', 'SUV', 'Hatchback'] },
  { brand: 'BMW', models: ['3 Series', '5 Series', 'X5', 'X3', 'X6', 'X1', '7 Series'], bodies: ['Sedan', 'SUV'] },
  { brand: 'Hyundai', models: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Creta', 'Accent'], bodies: ['Sedan', 'SUV', 'Hatchback'] },
  { brand: 'Kia', models: ['Sportage', 'Sorento', 'Rio', 'K5', 'Cerato', 'Seltos'], bodies: ['Sedan', 'SUV', 'Hatchback'] },
  { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit'], bodies: ['Sedan', 'SUV', 'Hatchback'] },
  { brand: 'Nissan', models: ['Patrol', 'X-Trail', 'Sunny', 'Qashqai', 'Almera'], bodies: ['Sedan', 'SUV'] },
  { brand: 'Volkswagen', models: ['Passat', 'Tiguan', 'Polo', 'Golf', 'Touareg'], bodies: ['Sedan', 'SUV', 'Hatchback'] },
  { brand: 'Lada', models: ['Vesta', 'Granta', 'Niva', 'Largus', 'Kalina'], bodies: ['Sedan', 'SUV', 'Wagon', 'Hatchback'] },
  { brand: 'Chevrolet', models: ['Cobalt', 'Nexia', 'Malibu', 'Tracker', 'Captiva'], bodies: ['Sedan', 'SUV'] },
  { brand: 'Lexus', models: ['LX', 'RX', 'GX', 'ES', 'IS'], bodies: ['Sedan', 'SUV'] },
  { brand: 'Audi', models: ['A6', 'A4', 'Q7', 'Q5', 'A8'], bodies: ['Sedan', 'SUV'] },
  { brand: 'Mitsubishi', models: ['Pajero', 'Outlander', 'Lancer', 'ASX', 'L200'], bodies: ['SUV', 'Sedan', 'Pickup'] },
  { brand: 'Mazda', models: ['CX-5', 'CX-9', 'Mazda 6', 'Mazda 3'], bodies: ['SUV', 'Sedan', 'Hatchback'] },
  { brand: 'Subaru', models: ['Forester', 'Outback', 'XV', 'Legacy'], bodies: ['SUV', 'Wagon', 'Sedan'] },
  { brand: 'Geely', models: ['Coolray', 'Monjaro', 'Atlas', 'Emgrand'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Chery', models: ['Tiggo 7', 'Tiggo 4', 'Arrizo 8', 'Tiggo 8'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Haval', models: ['H6', 'Jolion', 'Dargo', 'H9'], bodies: ['SUV'] },
  { brand: 'BYD', models: ['Song Plus', 'Han', 'Seal', 'Yuan Plus'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Daewoo', models: ['Nexia', 'Matiz', 'Gentra', 'Damas'], bodies: ['Sedan', 'Hatchback', 'Minivan'] },
];

const COMMERCIAL = [
  { brand: 'Shacman', models: ['X3000', 'X5000', 'F3000', 'Dump'], bodies: ['Pickup'] },
  { brand: 'HOWO', models: ['TX', 'A7', 'Sinotruk', 'Dump'], bodies: ['Pickup'] },
  { brand: 'GAZ', models: ['Gazelle Next', 'Valdai', 'Sobol', '3310'], bodies: ['Minivan', 'Pickup'] },
  { brand: 'Isuzu', models: ['NPR', 'NQR', 'Elf', 'Forward'], bodies: ['Pickup'] },
  { brand: 'FAW', models: ['J6', 'J7', 'Tiger', 'Dump'], bodies: ['Pickup'] },
  { brand: 'MAN', models: ['TGS', 'TGX', 'TGM'], bodies: ['Pickup'] },
  { brand: 'DAF', models: ['XF 105', 'CF', 'XF 106'], bodies: ['Pickup'] },
  { brand: 'Volvo', models: ['FH', 'FM', 'FE'], bodies: ['Pickup'] },
];

const SPECIAL = [
  { brand: 'JCB', models: ['3CX', '4CX', 'JS220', 'Backhoe'], bodies: ['Pickup'] },
  { brand: 'Caterpillar', models: ['320', '336', '950', 'Loader'], bodies: ['Pickup'] },
  { brand: 'Komatsu', models: ['PC200', 'WA380', 'D65'], bodies: ['Pickup'] },
  { brand: 'XCMG', models: ['XE215', 'LW300', 'QY25'], bodies: ['Pickup'] },
  { brand: 'Shacman', models: ['Mixer', 'Crane', 'Pump'], bodies: ['Pickup'] },
];

const KAMAZ = [
  { brand: 'KAMAZ', models: ['65115', '6520', '43118', '5490', '65117', '53215', '43114', '54115', '6460', '65201'], bodies: ['Pickup'] },
];

const PARTS = [
  { brand: 'Toyota', models: ['Engine 2AZ', 'Oil filter', 'Brake pads', 'Tires 205/55', 'Alternator', 'Radiator'] },
  { brand: 'BMW', models: ['Engine N55', 'Radiator', 'Xenon ballast', 'Turbo', 'Control arm'] },
  { brand: 'Mercedes-Benz', models: ['LED headlights', 'Shock absorbers', 'Air suspension', 'Gearbox 7G'] },
  { brand: 'KAMAZ', models: ['Turbocharger', 'Brake discs', 'Tires 315/80', 'Fuel pump', 'Starter'] },
  { brand: 'Hyundai', models: ['Battery 70Ah', 'Spark plugs', 'Bumper front', 'CV joint'] },
  { brand: 'Honda', models: ['Alternator', 'Timing belt kit', 'Clutch kit', 'Air filter'] },
];

const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Beige'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Gas', 'Electric'];
const TRANS = ['Automatic', 'Manual'];
const CITIES = ['Душанбе', 'Хуҷанд', 'Кӯлоб', 'Бохтар', 'Ҳисор', 'Ваҳдат', 'Турсунзода', 'Панҷакент'];
const DISTRICTS = ['Сино', 'Шоҳмансур', 'Фирдавсӣ', 'Исмоили Сомонӣ', '82-мкр', '102-мкр', 'Варзоб', 'Рӯдакӣ'];

async function ensureBrand(name) {
  const found = await query('SELECT id FROM brands WHERE name = $1', [name]);
  if (found.rows[0]) return found.rows[0].id;
  const { rows } = await query('INSERT INTO brands (name) VALUES ($1) RETURNING id', [name]);
  return rows[0].id;
}

async function ensureModel(brandId, name) {
  const found = await query('SELECT id FROM models WHERE brand_id = $1 AND name = $2', [brandId, name]);
  if (found.rows[0]) return found.rows[0].id;
  const { rows } = await query('INSERT INTO models (brand_id, name) VALUES ($1, $2) RETURNING id', [brandId, name]);
  return rows[0].id;
}

function imgFor(cat, n) {
  if (cat === 'kamaz') return `/kamaz/${(n % 3) + 1}.jpg`;
  if (cat === 'parts') return `/parts/${(n % 3) + 1}.jpg`;
  if (cat === 'commercial' || cat === 'special') return `/trucks/${(n % 3) + 1}.jpg`;
  return `/cars/${(n % 8) + 1}.jpg`;
}

function homeImg(n) {
  return `/homes/${(n % 3) + 1}.jpg`;
}

async function idMap(groups) {
  const map = new Map();
  for (const g of groups) {
    const brandId = await ensureBrand(g.brand);
    for (const model of g.models) {
      const modelId = await ensureModel(brandId, model);
      map.set(`${g.brand}|${model}`, { brandId, modelId, ...g });
    }
  }
  return map;
}

async function insertCarBatch(rows) {
  if (!rows.length) return;
  const params = [];
  const values = [];
  let i = 1;
  for (const r of rows) {
    values.push(`($${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},'APPROVED',$${i++},$${i++},$${i++})`);
    params.push(
      r.sellerId, r.brandId, r.modelId, r.year, r.price, r.km, r.engine, r.power,
      r.fuel, r.trans, r.body, r.color, r.locId, r.desc, r.phone, r.feat, r.views, r.cat
    );
  }
  const { rows: inserted } = await query(
    `INSERT INTO cars (
       seller_id, brand_id, model_id, year, price_usd, mileage, engine, power,
       fuel, transmission, body, color, location_id, description, phone,
       status, is_featured, views, category
     ) VALUES ${values.join(',')} RETURNING id`,
    params
  );
  const imgParams = [];
  const imgValues = [];
  let j = 1;
  inserted.forEach((row, idx) => {
    imgValues.push(`($${j++},$${j++},0)`);
    imgParams.push(row.id, rows[idx].img);
  });
  await query(`INSERT INTO car_images (car_id, url, sort_order) VALUES ${imgValues.join(',')}`, imgParams);
}

function makePassenger(n, sellers, locs) {
  const g = PASSENGER[n % PASSENGER.length];
  const model = g.models[Math.floor(n / PASSENGER.length) % g.models.length];
  const year = 2008 + (n % 18);
  const km = 8000 + (n * 137) % 240000;
  const price = 3500 + (n * 211) % 92000;
  const body = g.bodies[n % g.bodies.length];
  const fuel = n % 17 === 0 ? 'Electric' : n % 9 === 0 ? 'Hybrid' : n % 4 === 0 ? 'Diesel' : n % 5 === 0 ? 'Gas' : 'Petrol';
  return {
    key: `${g.brand}|${model}`,
    year,
    price,
    km,
    engine: fuel === 'Electric' ? 'Electric motor' : `${(1.2 + (n % 40) / 10).toFixed(1)}L`,
    power: 80 + (n % 320),
    fuel,
    trans: TRANS[n % 2],
    body,
    color: COLORS[n % COLORS.length],
    cat: 'passenger',
    feat: n % 90 === 0,
    views: 80 + (n % 4000),
    img: imgFor('passenger', n),
    desc: `${g.brand} ${model} ${year}, ${km.toLocaleString('ru-RU')} км. ${CITIES[n % CITIES.length]}. Ҳолати хуб, ҳуҷҷатҳо тайёр.`,
    sellerId: sellers[n % sellers.length],
    locId: locs[n % locs.length],
    phone: '+992 90 555 1000',
  };
}

function makeFromGroups(n, groups, cat, sellers, locs) {
  const g = groups[n % groups.length];
  const model = g.models[Math.floor(n / groups.length) % g.models.length];
  const year = 2010 + (n % 16);
  const km = cat === 'parts' ? 0 : 12000 + (n * 223) % 320000;
  const price = cat === 'parts' ? 15 + (n * 17) % 3500 : 9000 + (n * 307) % 80000;
  return {
    key: `${g.brand}|${model}`,
    year,
    price,
    km,
    engine: cat === 'parts' ? '—' : `${(4 + (n % 90) / 10).toFixed(1)}L Diesel`,
    power: cat === 'parts' ? 0 : 140 + (n % 360),
    fuel: cat === 'parts' ? 'Petrol' : 'Diesel',
    trans: cat === 'parts' ? 'Manual' : TRANS[n % 2],
    body: g.bodies ? g.bodies[n % g.bodies.length] : cat === 'parts' ? 'Sedan' : 'Pickup',
    color: COLORS[n % COLORS.length],
    cat,
    feat: n % 70 === 0,
    views: 50 + (n % 2200),
    img: imgFor(cat, n),
    desc: cat === 'parts'
      ? `${g.brand} ${model}. Қисми эҳтиётӣ, санҷидашуда. ${CITIES[n % CITIES.length]}.`
      : `${g.brand} ${model} ${year}. ${cat === 'kamaz' ? 'КамАЗ' : cat === 'special' ? 'Спецтехника' : 'Нақлиёти калон'}. ${CITIES[n % CITIES.length]}.`,
    sellerId: sellers[n % sellers.length],
    locId: locs[n % locs.length],
    phone: '+992 90 555 1000',
  };
}

function makeHome(n, sellers, locs) {
  const kinds = ['apartment', 'house', 'land', 'commerce'];
  const kind = kinds[n % kinds.length];
  const rooms = kind === 'land' ? 0 : 1 + (n % 7);
  const area = kind === 'land' ? 400 + (n % 20) * 50 : 32 + (n % 40) * 6;
  const title = kind === 'apartment'
    ? `Квартираи ${rooms}-ҳуҷрагӣ, ${DISTRICTS[n % DISTRICTS.length]} №${n + 1}`
    : kind === 'house'
      ? `Хонаи ҳавлигӣ, ${CITIES[n % CITIES.length]} №${n + 1}`
      : kind === 'land'
        ? `Замини ${Math.round(area / 100)} сотих, ${CITIES[n % CITIES.length]} №${n + 1}`
        : `Офис / мағоза ${area} м², ${DISTRICTS[n % DISTRICTS.length]} №${n + 1}`;
  return {
    sellerId: sellers[n % sellers.length].id,
    phone: sellers[n % sellers.length].phone,
    title,
    kind,
    rooms,
    area,
    floor: kind === 'apartment' ? 1 + (n % 12) : kind === 'house' ? 1 + (n % 2) : 0,
    floors: kind === 'apartment' ? 5 + (n % 12) : kind === 'house' ? 1 + (n % 2) : 0,
    price: kind === 'land' ? 8000 + (n % 40) * 900 : 18000 + (n % 120) * 1400,
    locId: locs[n % locs.length],
    desc: `${title}. ${CITIES[n % CITIES.length]}. Ҳуҷҷатҳо тайёр, нарх музокирот.`,
    feat: n % 55 === 0,
    views: 40 + (n % 900),
    img: homeImg(n),
  };
}

async function fillCars(need, sellers, locs) {
  const maps = {
    passenger: await idMap(PASSENGER),
    commercial: await idMap(COMMERCIAL),
    special: await idMap(SPECIAL),
    kamaz: await idMap(KAMAZ),
    parts: await idMap(PARTS),
  };
  const mix = [
    ...Array.from({ length: Math.ceil(need * 0.62) }, (_, i) => ['passenger', i]),
    ...Array.from({ length: Math.ceil(need * 0.12) }, (_, i) => ['commercial', i]),
    ...Array.from({ length: Math.ceil(need * 0.06) }, (_, i) => ['special', i]),
    ...Array.from({ length: Math.ceil(need * 0.08) }, (_, i) => ['kamaz', i]),
    ...Array.from({ length: Math.ceil(need * 0.12) }, (_, i) => ['parts', i]),
  ].slice(0, need);

  console.log(`Catalog: adding ${need} vehicles…`);
  for (let offset = 0; offset < mix.length; offset += BATCH) {
    const chunk = mix.slice(offset, offset + BATCH).map(([cat, i], idx) => {
      const n = offset + idx;
      const raw = cat === 'passenger'
        ? makePassenger(i, sellers, locs)
        : makeFromGroups(i, cat === 'commercial' ? COMMERCIAL : cat === 'special' ? SPECIAL : cat === 'kamaz' ? KAMAZ : PARTS, cat, sellers, locs);
      const ids = maps[cat].get(raw.key);
      return { ...raw, brandId: ids.brandId, modelId: ids.modelId };
    });
    await insertCarBatch(chunk);
    if (offset % 800 === 0) console.log(`  cars ${Math.min(offset + BATCH, mix.length)}/${mix.length}`);
  }
}

async function fillHomes(need, sellers, locs) {
  console.log(`Catalog: adding ${need} homes…`);
  for (let offset = 0; offset < need; offset += BATCH) {
    const chunk = Array.from({ length: Math.min(BATCH, need - offset) }, (_, i) => makeHome(offset + i, sellers, locs));
    const params = [];
    const values = [];
    let p = 1;
    for (const h of chunk) {
      values.push(`($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},'APPROVED',$${p++},$${p++})`);
      params.push(h.sellerId, h.title, h.kind, h.rooms, h.area, h.floor, h.floors, h.price, h.locId, h.desc, h.phone, h.feat, h.views);
    }
    const { rows } = await query(
      `INSERT INTO properties (
         seller_id, title, kind, rooms, area_m2, floor, floors, price_usd,
         location_id, description, phone, status, is_featured, views
       ) VALUES ${values.join(',')} RETURNING id`,
      params
    );
    const imgParams = [];
    const imgValues = [];
    let j = 1;
    rows.forEach((row, idx) => {
      imgValues.push(`($${j++},$${j++},0)`);
      imgParams.push(row.id, chunk[idx].img);
    });
    await query(`INSERT INTO property_images (property_id, url, sort_order) VALUES ${imgValues.join(',')}`, imgParams);
  }
}

export async function seedCatalog() {
  const sellers = await query(`SELECT id, phone FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  if (!sellers.rows.length || !locs.rows.length) return;

  const cars = await query(`SELECT COUNT(*)::int AS n FROM cars`);
  const homes = await query(`SELECT COUNT(*)::int AS n FROM properties`);
  const carN = Number(cars.rows[0]?.n || 0);
  const homeN = Number(homes.rows[0]?.n || 0);
  const STEP_CARS = 5000;
  const STEP_HOMES = 800;
  const sellerIds = sellers.rows.map((r) => r.id);
  const locIds = locs.rows.map((r) => r.id);

  if (carN < TARGET_CARS) await fillCars(Math.min(STEP_CARS, TARGET_CARS - carN), sellerIds, locIds);
  if (homeN < TARGET_HOMES) await fillHomes(Math.min(STEP_HOMES, TARGET_HOMES - homeN), sellers.rows, locIds);
  console.log('Catalog seed done.');
}
