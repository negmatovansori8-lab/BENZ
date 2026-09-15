import { query } from '../config/db.js';

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

function realisticPrice(g, year, cat, n) {
  if (cat === 'parts') return 15 + (n * 13) % 420;
  const luxury = ['Mercedes-Benz', 'BMW', 'Lexus', 'Audi'].includes(g.brand);
  const age = Math.max(0, 2026 - year);
  if (cat === 'passenger') {
    const base = luxury ? 16000 : 7200;
    const drop = age * (luxury ? 700 : 260);
    const jitter = (n * 97) % (luxury ? 4000 : 2200);
    return Math.max(luxury ? 6500 : 1800, Math.round(base - drop + jitter));
  }
  return Math.max(7000, Math.round(11000 + (n * 113) % 16000 - age * 180));
}

function buildCar(g, model, year, cat, n, sellers, locs) {
  const km = cat === 'parts' ? 0 : 8000 + (n * 137) % 240000;
  const price = realisticPrice(g, year, cat, n);
  const body = g.bodies ? g.bodies[n % g.bodies.length] : cat === 'parts' ? 'Sedan' : 'Pickup';
  const fuel = cat === 'parts' || cat === 'kamaz' || cat === 'commercial' || cat === 'special'
    ? (cat === 'parts' ? 'Petrol' : 'Diesel')
    : n % 17 === 0 ? 'Electric' : n % 9 === 0 ? 'Hybrid' : n % 4 === 0 ? 'Diesel' : n % 5 === 0 ? 'Gas' : 'Petrol';
  const label = cat === 'parts'
    ? `${g.brand} ${model}. Қисми эҳтиётӣ, санҷидашуда. ${CITIES[n % CITIES.length]}.`
    : cat === 'kamaz'
      ? `${g.brand} ${model} ${year}. КамАЗ. ${CITIES[n % CITIES.length]}.`
      : cat === 'special'
        ? `${g.brand} ${model} ${year}. Спецтехника. ${CITIES[n % CITIES.length]}.`
        : cat === 'commercial'
          ? `${g.brand} ${model} ${year}. Нақлиёти калон. ${CITIES[n % CITIES.length]}.`
          : `${g.brand} ${model} ${year}, ${km.toLocaleString('ru-RU')} км. ${CITIES[n % CITIES.length]}. Ҳолати хуб, ҳуҷҷатҳо тайёр.`;
  return {
    key: `${g.brand}|${model}`,
    year,
    price,
    km,
    engine: cat === 'parts' ? '—' : fuel === 'Electric' ? 'Electric motor' : `${(cat === 'passenger' ? 1.2 + (n % 40) / 10 : 4 + (n % 90) / 10).toFixed(1)}L`,
    power: cat === 'parts' ? 0 : 80 + (n % 320),
    fuel,
    trans: cat === 'parts' ? 'Manual' : TRANS[n % 2],
    body,
    color: COLORS[n % COLORS.length],
    cat,
    feat: n % 18 === 0,
    views: 80 + (n % 4000),
    img: imgFor(cat, n),
    desc: label,
    sellerId: sellers[n % sellers.length],
    locId: locs[n % locs.length],
    phone: '+992 90 555 1000',
  };
}

function makeHome(n, sellers, kind, rooms, area, locId) {
  const title = kind === 'apartment'
    ? `Квартираи ${rooms}-ҳуҷрагӣ, ${DISTRICTS[n % DISTRICTS.length]}`
    : kind === 'house'
      ? `Хонаи ҳавлигӣ, ${CITIES[n % CITIES.length]}`
      : kind === 'land'
        ? `Замини ${Math.round(area / 100)} сотих, ${CITIES[n % CITIES.length]}`
        : `Офис / мағоза ${area} м², ${DISTRICTS[n % DISTRICTS.length]}`;
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
    locId,
    desc: `${title}. ${CITIES[n % CITIES.length]}. Ҳуҷҷатҳо тайёр, нарх музокирот.`,
    feat: n % 55 === 0,
    views: 40 + (n % 900),
    img: homeImg(n),
  };
}

async function removeDuplicateCars() {
  await query(`
    DELETE FROM cars
    WHERE id NOT IN (
      SELECT min_id FROM (
        SELECT MIN(id) AS min_id
        FROM cars
        GROUP BY brand_id, model_id, year, category
      ) t
    )
  `);
}

async function removeDuplicateHomes() {
  await query(`
    DELETE FROM properties
    WHERE id NOT IN (
      SELECT min_id FROM (
        SELECT MIN(id) AS min_id
        FROM properties
        GROUP BY kind, rooms, COALESCE(area_m2, 0), location_id
      ) t
    )
  `);
}

function uniqueGroupRows(groups, cat, sellers, locs, existing) {
  const rows = [];
  let n = 0;
  const years = cat === 'passenger'
    ? [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    : cat === 'parts'
      ? [2024]
      : [2014, 2016, 2018, 2020, 2022, 2024];
  for (const g of groups) {
    for (const model of g.models) {
      for (const year of years) {
        const key = `${g.brand}|${model}|${year}|${cat}`;
        if (existing.has(key)) continue;
        rows.push(buildCar(g, model, year, cat, n, sellers, locs));
        n += 1;
      }
    }
  }
  return rows;
}

async function fillCars(_need, sellers, locs) {
  const maps = {
    passenger: await idMap(PASSENGER),
    commercial: await idMap(COMMERCIAL),
    special: await idMap(SPECIAL),
    kamaz: await idMap(KAMAZ),
    parts: await idMap(PARTS),
  };
  const found = await query(`
    SELECT b.name AS brand, m.name AS model, c.year, c.category
    FROM cars c
    JOIN brands b ON b.id = c.brand_id
    JOIN models m ON m.id = c.model_id
  `);
  const existing = new Set(found.rows.map((r) => `${r.brand}|${r.model}|${r.year}|${r.category}`));
  const pending = [
    ...uniqueGroupRows(PASSENGER, 'passenger', sellers, locs, existing),
    ...uniqueGroupRows(COMMERCIAL, 'commercial', sellers, locs, existing),
    ...uniqueGroupRows(SPECIAL, 'special', sellers, locs, existing),
    ...uniqueGroupRows(KAMAZ, 'kamaz', sellers, locs, existing),
    ...uniqueGroupRows(PARTS, 'parts', sellers, locs, existing),
  ]
    .map((raw) => {
      const ids = maps[raw.cat].get(raw.key);
      if (!ids) return null;
      const combo = `${raw.key}|${raw.year}|${raw.cat}`;
      if (existing.has(combo)) return null;
      existing.add(combo);
      return { ...raw, brandId: ids.brandId, modelId: ids.modelId };
    })
    .filter(Boolean);

  console.log(`Catalog: adding ${pending.length} unique vehicles…`);
  for (let offset = 0; offset < pending.length; offset += BATCH) {
    await insertCarBatch(pending.slice(offset, offset + BATCH));
  }
}

async function fillHomes(sellers, locs) {
  const found = await query(`
    SELECT kind, rooms, COALESCE(area_m2, 0) AS area, location_id
    FROM properties
  `);
  const existing = new Set(found.rows.map((r) => `${r.kind}|${r.rooms}|${r.area}|${r.location_id}`));
  const kinds = ['apartment', 'house', 'land', 'commerce'];
  const pending = [];
  let n = 0;
  for (const locId of locs) {
    for (const kind of kinds) {
      const roomOpts = kind === 'land' ? [0] : [1, 2, 3, 4];
      const areaOpts = kind === 'land' ? [400, 600, 800] : kind === 'commerce' ? [45, 80, 120] : [42, 64, 86, 128];
      for (const rooms of roomOpts) {
        for (const area of areaOpts) {
          const key = `${kind}|${rooms}|${area}|${locId}`;
          if (existing.has(key)) continue;
          existing.add(key);
          pending.push(makeHome(n, sellers, kind, rooms, area, locId));
          n += 1;
        }
      }
    }
  }
  console.log(`Catalog: adding ${pending.length} unique homes…`);
  for (let offset = 0; offset < pending.length; offset += BATCH) {
    const chunk = pending.slice(offset, offset + BATCH);
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

async function normalizePrices() {
  await query(`
    UPDATE cars c
    SET price_usd = CASE
      WHEN c.category = 'parts' THEN GREATEST(10, LEAST(650, 20 + (c.id % 500)))
      WHEN c.category = 'passenger' THEN GREATEST(
        1800,
        LEAST(
          28000,
          CASE WHEN b.name IN ('Mercedes-Benz', 'BMW', 'Lexus', 'Audi')
            THEN 8000 + GREATEST(0, c.year - 2010) * 650 + (c.id % 3500)
            ELSE 2000 + GREATEST(0, c.year - 2010) * 320 + (c.id % 2200)
          END
        )
      )
      ELSE GREATEST(7000, LEAST(30000, 9000 + (c.id % 14000)))
    END
    FROM brands b
    WHERE b.id = c.brand_id
  `);
  await query(`
    UPDATE properties
    SET price_usd = GREATEST(6000, LEAST(95000, price_usd))
    WHERE price_usd > 95000
  `);
}

export async function seedCatalog() {
  const sellers = await query(`SELECT id, phone FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  if (!sellers.rows.length || !locs.rows.length) return;

  await removeDuplicateCars();
  await removeDuplicateHomes();
  await normalizePrices();

  const sellerIds = sellers.rows.map((r) => r.id);
  const locIds = locs.rows.map((r) => r.id);

  await fillCars(0, sellerIds, locIds);
  await fillHomes(sellers.rows, locIds);
  console.log('Catalog seed done.');
}
