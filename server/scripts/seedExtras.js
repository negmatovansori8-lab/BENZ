import { query, execSql } from '../config/db.js';

async function ensureBrand(name) {
  const found = await query('SELECT id FROM brands WHERE name = $1', [name]);
  if (found.rows[0]) return found.rows[0].id;
  const { rows } = await query('INSERT INTO brands (name) VALUES ($1) RETURNING id', [name]);
  return rows[0].id;
}

async function ensureModel(brandId, name) {
  const found = await query('SELECT id FROM models WHERE brand_id = $1 AND name = $2', [brandId, name]);
  if (found.rows[0]) return found.rows[0].id;
  const { rows } = await query(
    'INSERT INTO models (brand_id, name) VALUES ($1, $2) RETURNING id',
    [brandId, name]
  );
  return rows[0].id;
}

async function seedCommercial() {
  const sellers = await query(`SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id LIMIT 6`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  const sellerIds = sellers.rows.map((r) => r.id);
  const locIds = locs.rows.map((r) => r.id);
  if (!sellerIds.length || !locIds.length) return;

  const items = [
    { brand: 'Shacman', model: 'X3000', year: 2024, price: 62000, km: 18000, engine: '11.0L Diesel', power: 375, body: 'Pickup', cat: 'commercial', feat: true, img: '/trucks/1.jpg', desc: 'Самосвал Shacman X3000. Барои сохтмон ва кӯҳҳои Тоҷикистон.' },
    { brand: 'HOWO', model: 'TX', year: 2023, price: 54800, km: 41000, engine: '10.0L Diesel', power: 371, body: 'Pickup', cat: 'commercial', feat: true, img: '/trucks/1.jpg', desc: 'HOWO TX самосвал. Евро-5, кабинаи хоб.' },
    { brand: 'DAF', model: 'XF 105', year: 2014, price: 39200, km: 89000, engine: '12.9L Diesel', power: 460, body: 'Pickup', cat: 'commercial', feat: false, img: '/trucks/2.jpg', desc: 'Седельный тягач DAF XF 105. Барои масофаҳои дур.' },
    { brand: 'GAZ', model: 'Gazelle Next', year: 2021, price: 16800, km: 67000, engine: '2.8L Diesel', power: 149, body: 'Minivan', cat: 'commercial', feat: false, img: '/trucks/2.jpg', desc: 'Газел Next тентованный. Барои боркашии шаҳрӣ.' },
    { brand: 'Isuzu', model: 'NPR', year: 2019, price: 22400, km: 98000, engine: '5.2L Diesel', power: 150, body: 'Pickup', cat: 'commercial', feat: false, img: '/trucks/2.jpg', desc: 'Isuzu NPR. Боркаши миёна, боэътимод.' },
    { brand: 'FAW', model: 'J6', year: 2022, price: 41000, km: 52000, engine: '8.6L Diesel', power: 350, body: 'Pickup', cat: 'commercial', feat: false, img: '/trucks/1.jpg', desc: 'FAW J6 самосвал. Нархи хуб, қисмҳо дастрас.' },
    { brand: 'MAN', model: 'TGS', year: 2016, price: 45500, km: 210000, engine: '12.4L Diesel', power: 440, body: 'Pickup', cat: 'commercial', feat: false, img: '/trucks/2.jpg', desc: 'MAN TGS тягач. Европа, хидматрасонии пурра.' },
    { brand: 'JCB', model: '3CX', year: 2020, price: 42000, km: 6200, engine: '4.4L Diesel', power: 109, body: 'Pickup', cat: 'special', feat: true, img: '/trucks/3.jpg', desc: 'Экскаватор-погрузчик JCB 3CX. Спецтехника барои сохтмон.' },
    { brand: 'Shacman', model: 'Mixer', year: 2021, price: 51000, km: 38000, engine: '10.0L Diesel', power: 336, body: 'Pickup', cat: 'special', feat: false, img: '/trucks/3.jpg', desc: 'Бетономешалка Shacman. 10 м³.' },
  ];

  console.log('Seeding large vehicles & special equipment…');
  for (let i = 0; i < items.length; i++) {
    const c = items[i];
    const brandId = await ensureBrand(c.brand);
    const modelId = await ensureModel(brandId, c.model);
    const { rows } = await query(
      `INSERT INTO cars (
         seller_id, brand_id, model_id, year, price_usd, mileage, engine, power,
         fuel, transmission, body, color, location_id, description, phone,
         status, is_featured, views, category
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Diesel','Manual',$9,$10,$11,$12,$13,'APPROVED',$14,$15,$16)
       RETURNING id`,
      [
        sellerIds[i % sellerIds.length],
        brandId,
        modelId,
        c.year,
        c.price,
        c.km,
        c.engine,
        c.power,
        c.body,
        'White',
        locIds[i % locIds.length],
        c.desc,
        '+992 90 555 1000',
        c.feat,
        400 + i * 70,
        c.cat,
      ]
    );
    await query(`INSERT INTO car_images (car_id, url, sort_order) VALUES ($1,$2,0)`, [rows[0].id, c.img]);
  }
}

async function listingExists(brand, model) {
  const { rows } = await query(
    `SELECT 1 FROM cars c
     JOIN brands b ON b.id = c.brand_id
     JOIN models m ON m.id = c.model_id
     WHERE b.name = $1 AND m.name = $2 LIMIT 1`,
    [brand, model]
  );
  return !!rows[0];
}

async function insertVehicle(c, sellerId, locId) {
  if (await listingExists(c.brand, c.model)) return;
  const brandId = await ensureBrand(c.brand);
  const modelId = await ensureModel(brandId, c.model);
  const { rows } = await query(
    `INSERT INTO cars (
       seller_id, brand_id, model_id, year, price_usd, mileage, engine, power,
       fuel, transmission, body, color, location_id, description, phone,
       status, is_featured, views, category
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'APPROVED',$16,$17,$18)
     RETURNING id`,
    [
      sellerId, brandId, modelId, c.year, c.price, c.km, c.engine, c.power,
      c.fuel || 'Diesel', c.trans || 'Manual', c.body, c.color || 'White', locId, c.desc, '+992 90 555 1000',
      c.feat || false, c.views || 500, c.cat,
    ]
  );
  const photos = Array.isArray(c.imgs) && c.imgs.length ? c.imgs : [c.img];
  for (let p = 0; p < photos.length; p++) {
    await query(`INSERT INTO car_images (car_id, url, sort_order) VALUES ($1,$2,$3)`, [rows[0].id, photos[p], p]);
  }
}

async function seedMorePassenger() {
  const sellers = await query(`SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id LIMIT 6`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  if (!sellers.rows.length || !locs.rows.length) return;

  const car = (i) => [`/cars/${(i % 8) + 1}.jpg`, `/cars/${((i + 2) % 8) + 1}.jpg`, `/cars/${((i + 4) % 8) + 1}.jpg`];
  const items = [
    { brand: 'Toyota', model: 'Prado', year: 2018, price: 42500, km: 98000, engine: '2.7L I4', power: 163, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Pearl White', cat: 'passenger', feat: true, views: 3420, desc: 'Land Cruiser Prado 150. 4WD, барои кӯҳҳои Тоҷикистон. Як соҳиб, бе садама.' },
    { brand: 'Toyota', model: 'Corolla', year: 2019, price: 16800, km: 72000, engine: '1.6L I4', power: 122, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Silver', cat: 'passenger', feat: true, views: 2890, desc: 'Corolla классик. Сарфаи бензин, хидматрасонии пурра, ҳолати олӣ.' },
    { brand: 'Mercedes-Benz', model: 'S-Class', year: 2017, price: 38900, km: 86000, engine: '3.0L V6', power: 333, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Black', cat: 'passenger', feat: true, views: 2100, desc: 'S 400. Салони чармӣ, массаж, панорама. Мошини бизнес-класс.' },
    { brand: 'BMW', model: '5 Series', year: 2018, price: 27400, km: 91000, engine: '2.0L Diesel', power: 190, fuel: 'Diesel', trans: 'Automatic', body: 'Sedan', color: 'Grey', cat: 'passenger', feat: true, views: 1760, desc: '520d M Sport. Расход паст, салони спорт, LED.' },
    { brand: 'Honda', model: 'Accord', year: 2017, price: 15200, km: 118000, engine: '2.4L I4', power: 185, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'White', cat: 'passenger', feat: false, views: 1540, desc: 'Accord. Мошини боэътимод барои оила. Кондиционер, камера.' },
    { brand: 'Hyundai', model: 'Elantra', year: 2021, price: 18600, km: 34000, engine: '1.6L I4', power: 128, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Blue', cat: 'passenger', feat: false, views: 1320, desc: 'Elantra нав. Гарантия, экрани калон, круиз.' },
    { brand: 'Hyundai', model: 'Sonata', year: 2020, price: 21400, km: 48000, engine: '2.0L I4', power: 150, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Black', cat: 'passenger', feat: false, views: 980, desc: 'Sonata. Седани калон, салони зебо, як соҳиб.' },
    { brand: 'Kia', model: 'Sorento', year: 2019, price: 24800, km: 67000, engine: '2.2L Diesel', power: 200, fuel: 'Diesel', trans: 'Automatic', body: 'SUV', color: 'Dark Grey', cat: 'passenger', feat: true, views: 1210, desc: 'Sorento 7-ҷой. Барои оилаи калон, 4WD.' },
    { brand: 'Nissan', model: 'Patrol', year: 2016, price: 36500, km: 124000, engine: '5.6L V8', power: 400, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'White', cat: 'passenger', feat: true, views: 1880, desc: 'Patrol Y62. Қувваи баланд, барои роҳҳои вайрон.' },
    { brand: 'Nissan', model: 'X-Trail', year: 2018, price: 17900, km: 89000, engine: '2.0L I4', power: 144, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Grey', cat: 'passenger', feat: false, views: 870, desc: 'X-Trail. Кроссовери ором, камераи 360.' },
    { brand: 'Mitsubishi', model: 'Pajero', year: 2015, price: 22800, km: 156000, engine: '3.2L Diesel', power: 190, fuel: 'Diesel', trans: 'Automatic', body: 'SUV', color: 'Black', cat: 'passenger', feat: true, views: 2410, desc: 'Pajero 4. Легендаи кӯҳ. Дизел, 7 ҷой.' },
    { brand: 'Volkswagen', model: 'Passat', year: 2018, price: 16400, km: 102000, engine: '1.8L TSI', power: 180, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'White', cat: 'passenger', feat: false, views: 760, desc: 'Passat B8. Немис, хидматрасонии расмӣ.' },
    { brand: 'Volkswagen', model: 'Tiguan', year: 2019, price: 19800, km: 74000, engine: '2.0L TSI', power: 180, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Blue', cat: 'passenger', feat: false, views: 940, desc: 'Tiguan 4Motion. Кроссовери шаҳрӣ, салони тоза.' },
    { brand: 'Chevrolet', model: 'Cobalt', year: 2020, price: 9200, km: 54000, engine: '1.5L I4', power: 105, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'White', cat: 'passenger', feat: true, views: 4100, desc: 'Cobalt. Нархи хуб, қисмҳо арзон, барои рӯзмарра.' },
    { brand: 'Lada', model: 'Vesta', year: 2021, price: 7800, km: 41000, engine: '1.6L I4', power: 106, fuel: 'Petrol', trans: 'Manual', body: 'Sedan', color: 'Grey', cat: 'passenger', feat: false, views: 1670, desc: 'Vesta. Мошини нав, кафолат, сарфаи сӯзишворӣ.' },
    { brand: 'Lada', model: 'Granta', year: 2019, price: 5400, km: 68000, engine: '1.6L I4', power: 87, fuel: 'Petrol', trans: 'Manual', body: 'Sedan', color: 'White', cat: 'passenger', feat: false, views: 1520, desc: 'Granta. Арзон ва содда. Барои шаҳр.' },
    { brand: 'Daewoo', model: 'Nexia', year: 2014, price: 3900, km: 142000, engine: '1.5L I4', power: 80, fuel: 'Petrol', trans: 'Manual', body: 'Sedan', color: 'Silver', cat: 'passenger', feat: false, views: 2280, desc: 'Nexia. Қисмҳо дар ҳар бозор ҳаст. Ҳолати корӣ.' },
    { brand: 'Mazda', model: 'CX-5', year: 2018, price: 18900, km: 82000, engine: '2.0L I4', power: 150, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Red', cat: 'passenger', feat: false, views: 690, desc: 'CX-5. Дизайни зебо, салони сифатнок.' },
    { brand: 'Subaru', model: 'Forester', year: 2017, price: 17200, km: 99000, engine: '2.5L Boxer', power: 182, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Green', cat: 'passenger', feat: false, views: 540, desc: 'Forester AWD. Барои зимистон ва кӯҳ.' },
    { brand: 'Lexus', model: 'GX', year: 2016, price: 34800, km: 112000, engine: '4.6L V8', power: 301, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Black', cat: 'passenger', feat: true, views: 1340, desc: 'GX 460. Люкс ва 4WD. Марк Левинсон.' },
    { brand: 'Mercedes-Benz', model: 'GLC', year: 2019, price: 31200, km: 61000, engine: '2.0L Turbo', power: 211, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'White', cat: 'passenger', feat: false, views: 1110, desc: 'GLC 300. Кроссовери премиум, панорама.' },
    { brand: 'BMW', model: 'X6', year: 2017, price: 33500, km: 104000, engine: '3.0L Diesel', power: 258, fuel: 'Diesel', trans: 'Automatic', body: 'SUV', color: 'Black', cat: 'passenger', feat: true, views: 1490, desc: 'X6 30d. Купе-кроссовер, салони M, камераи 360.' },
    { brand: 'Honda', model: 'Pilot', year: 2018, price: 22600, km: 88000, engine: '3.5L V6', power: 280, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Grey', cat: 'passenger', feat: false, views: 430, desc: 'Pilot. 8 ҷой, барои оилаи калон.' },
    { brand: 'Kia', model: 'Rio', year: 2020, price: 11200, km: 39000, engine: '1.6L I4', power: 123, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'White', cat: 'passenger', feat: false, views: 1840, desc: 'Rio. Компакт, нав, кафолат боқӣ мондааст.' },
    { brand: 'Toyota', model: 'Highlander', year: 2017, price: 26800, km: 97000, engine: '3.5L V6', power: 295, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'White', cat: 'passenger', feat: false, views: 720, desc: 'Highlander. 7 ҷой, боэътимоди Toyota.' },
  ];

  console.log('Seeding extra passenger cars…');
  for (let i = 0; i < items.length; i++) {
    const c = items[i];
    await insertVehicle(
      { ...c, imgs: car(i) },
      sellers.rows[i % sellers.rows.length].id,
      locs.rows[i % locs.rows.length].id
    );
  }
}

async function seedKamaz() {
  const sellers = await query(`SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id LIMIT 6`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  if (!sellers.rows.length || !locs.rows.length) return;
  const items = [
    { brand: 'KAMAZ', model: '65115', year: 2018, price: 28500, km: 142000, engine: '11.8L Diesel', power: 300, body: 'Pickup', cat: 'kamaz', feat: true, img: '/kamaz/3.jpg', desc: 'КамАЗ 65115 борбар. 15 тонна, ҳолати корӣ.' },
    { brand: 'KAMAZ', model: '6520', year: 2021, price: 41200, km: 64000, engine: '11.8L Diesel', power: 400, body: 'Pickup', cat: 'kamaz', feat: true, img: '/kamaz/1.jpg', desc: 'КамАЗ 6520 самосвал. Барои сохтмон.' },
    { brand: 'KAMAZ', model: '43118', year: 2016, price: 26800, km: 187000, engine: '10.8L Diesel', power: 260, body: 'Pickup', cat: 'kamaz', feat: true, img: '/kamaz/2.jpg', desc: 'КамАЗ 43118 шасси 6x6. Барои роҳҳои кӯҳӣ.' },
    { brand: 'KAMAZ', model: '5490', year: 2019, price: 35500, km: 210000, engine: '12.0L Diesel', power: 401, body: 'Pickup', cat: 'kamaz', feat: false, img: '/kamaz/2.jpg', desc: 'КамАЗ 5490 тягач. Кабинаи хоб, круиз.' },
    { brand: 'KAMAZ', model: '65117', year: 2017, price: 23900, km: 156000, engine: '11.8L Diesel', power: 300, body: 'Pickup', cat: 'kamaz', feat: false, img: '/kamaz/3.jpg', desc: 'КамАЗ 65117 тентованный. 15 тонна.' },
    { brand: 'KAMAZ', model: '53215', year: 2014, price: 18500, km: 240000, engine: '10.8L Diesel', power: 240, body: 'Pickup', cat: 'kamaz', feat: false, img: '/kamaz/1.jpg', desc: 'КамАЗ 53215 классик. Қисмҳо дастрас.' },
  ];
  console.log('Seeding KAMAZ…');
  for (let i = 0; i < items.length; i++) {
    await insertVehicle(items[i], sellers.rows[i % sellers.rows.length].id, locs.rows[i % locs.rows.length].id);
  }
}

async function seedParts() {
  const sellers = await query(`SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id LIMIT 6`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  if (!sellers.rows.length || !locs.rows.length) return;
  const items = [
    { brand: 'BMW', model: 'Engine N55', year: 2018, price: 2200, km: 0, engine: '3.0L', power: 306, body: 'Sedan', fuel: 'Petrol', cat: 'parts', feat: true, img: '/parts/1.jpg', desc: 'Муҳаррики BMW N55. Санҷидашуда, бо кафолат.' },
    { brand: 'Toyota', model: 'Tires 205/55 R16', year: 2024, price: 280, km: 0, engine: '—', power: 0, body: 'Sedan', fuel: 'Petrol', cat: 'parts', feat: true, img: '/parts/2.jpg', desc: '4 дона шинаи нав. Барои Camry ва Corolla.' },
    { brand: 'Mercedes-Benz', model: 'LED headlights', year: 2020, price: 450, km: 0, engine: '—', power: 0, body: 'Sedan', fuel: 'Petrol', cat: 'parts', feat: false, img: '/parts/3.jpg', desc: 'Фараҳои LED аслӣ. C-Class / E-Class.' },
    { brand: 'KAMAZ', model: 'Turbocharger', year: 2019, price: 890, km: 0, engine: '11.8L', power: 0, body: 'Pickup', fuel: 'Diesel', cat: 'parts', feat: true, img: '/parts/1.jpg', desc: 'Турбинаи КамАЗ. Нав, бастабандӣ.' },
    { brand: 'Hyundai', model: 'Battery 70Ah', year: 2025, price: 95, km: 0, engine: '—', power: 0, body: 'Sedan', fuel: 'Petrol', cat: 'parts', feat: false, img: '/parts/3.jpg', desc: 'Батарея 70Ah. 18 моҳ кафолат.' },
    { brand: 'KAMAZ', model: 'Brake discs', year: 2023, price: 160, km: 0, engine: '—', power: 0, body: 'Pickup', fuel: 'Diesel', cat: 'parts', feat: false, img: '/parts/3.jpg', desc: 'Дискҳои тормозӣ барои КамАЗ 65115 / 6520.' },
    { brand: 'Audi', model: 'Gearbox 7G', year: 2017, price: 1800, km: 0, engine: '—', power: 0, body: 'Sedan', fuel: 'Petrol', cat: 'parts', feat: false, img: '/parts/1.jpg', desc: 'Қуттии суръати Audi 7G-Tronic. Санҷидашуда.' },
    { brand: 'KAMAZ', model: 'Tires 315/80 R22.5', year: 2024, price: 420, km: 0, engine: '—', power: 0, body: 'Pickup', fuel: 'Diesel', cat: 'parts', feat: true, img: '/parts/2.jpg', desc: 'Шинаҳои боркаш 315/80. 4 дона.' },
  ];
  console.log('Seeding spare parts…');
  for (let i = 0; i < items.length; i++) {
    await insertVehicle(items[i], sellers.rows[i % sellers.rows.length].id, locs.rows[i % locs.rows.length].id);
  }
}

async function syncCategories() {
  await query(`
    UPDATE cars SET category = 'kamaz'
    WHERE category <> 'parts' AND brand_id IN (SELECT id FROM brands WHERE name = 'KAMAZ')
  `);
  await query(`UPDATE cars SET category = 'commercial' WHERE category = 'bus'`);
  await query(`
    UPDATE car_images SET url = '/kamaz/' || (((car_id - 1) % 3) + 1)::text || '.jpg'
    WHERE car_id IN (SELECT id FROM cars WHERE category = 'kamaz')
  `);
  const kamaz = await query(`SELECT COUNT(*)::int AS n FROM cars WHERE category = 'kamaz'`);
  if (Number(kamaz.rows[0]?.n || 0) < 4) await seedKamaz();
  const parts = await query(`SELECT COUNT(*)::int AS n FROM cars WHERE category = 'parts'`);
  if (Number(parts.rows[0]?.n || 0) === 0) await seedParts();
}

async function seedHomes() {
  const sellers = await query(`SELECT id, phone FROM users WHERE role IN ('SELLER', 'ADMIN') ORDER BY id LIMIT 6`);
  const locs = await query('SELECT id FROM locations ORDER BY id');
  if (!sellers.rows.length || !locs.rows.length) return;

  const homes = [
    { title: 'Квартираи 3-ҳуҷрагӣ, Сино', kind: 'apartment', rooms: 3, area: 86, floor: 5, floors: 9, price: 72000, feat: true, img: '/homes/3.jpg', desc: 'Квартираи таъмиршуда дар ноҳияи Сино. Лифт, барқи устувор, назди мактаб.' },
    { title: 'Хонаи 2-ошёна бо ҳавлӣ', kind: 'house', rooms: 6, area: 210, floor: 2, floors: 2, price: 145000, feat: true, img: '/homes/2.jpg', desc: 'Хонаи шахсӣ дар Душанбе. Ҳавлӣ, гараж, об ва газ.' },
    { title: 'Квартираи 1-ҳуҷрагӣ, Хуҷанд', kind: 'apartment', rooms: 1, area: 42, floor: 3, floors: 5, price: 28500, feat: false, img: '/homes/1.jpg', desc: 'Студия барои ҷуфтҳои ҷавон. Маркази Хуҷанд.' },
    { title: 'Квартираи 2-ҳуҷрагӣ, Кӯлоб', kind: 'apartment', rooms: 2, area: 64, floor: 2, floors: 4, price: 34000, feat: false, img: '/homes/3.jpg', desc: 'Хонаи оилавӣ, ҳамсояҳои ором, бозори наздик.' },
    { title: 'Офис 80 м², маркази шаҳр', kind: 'commerce', rooms: 3, area: 80, floor: 4, floors: 8, price: 98000, feat: false, img: '/homes/1.jpg', desc: 'Ҷойи тиҷоратӣ. Паркинг, интернет, назди бонкҳо.' },
    { title: 'Замини 6 сотих, Варзоб', kind: 'land', rooms: 0, area: 600, floor: 0, floors: 0, price: 22000, feat: true, img: '/homes/2.jpg', desc: 'Замин барои хонаи тобистона. Роҳи хуб, манзараи кӯҳ.' },
  ];

  console.log('Seeding homes…');
  for (let i = 0; i < homes.length; i++) {
    const h = homes[i];
    const seller = sellers.rows[i % sellers.rows.length];
    const { rows } = await query(
      `INSERT INTO properties (
         seller_id, title, kind, rooms, area_m2, floor, floors, price_usd,
         location_id, description, phone, status, is_featured, views
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'APPROVED',$12,$13)
       RETURNING id`,
      [
        seller.id, h.title, h.kind, h.rooms, h.area, h.floor, h.floors, h.price,
        locs.rows[i % locs.rows.length].id, h.desc, seller.phone, h.feat, 120 + i * 40,
      ]
    );
    await query(
      `INSERT INTO property_images (property_id, url, sort_order) VALUES ($1,$2,0)`,
      [rows[0].id, h.img]
    );
  }
}

export async function migrateAndSeedExtras() {
  try {
    await query(`ALTER TABLE cars ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'passenger'`);
  } catch (err) {
    console.warn('category column:', err.message);
  }

  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`);
  } catch (err) {
    console.warn('last_login_at column:', err.message);
  }

  await execSql(`
    CREATE TABLE IF NOT EXISTS login_events (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await execSql(`
    CREATE TABLE IF NOT EXISTS properties (
      id              SERIAL PRIMARY KEY,
      seller_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title           VARCHAR(180) NOT NULL,
      kind            VARCHAR(40) NOT NULL DEFAULT 'apartment',
      rooms           INTEGER NOT NULL DEFAULT 1,
      area_m2         INTEGER,
      floor           INTEGER,
      floors          INTEGER,
      price_usd       NUMERIC(12, 2) NOT NULL,
      location_id     INTEGER REFERENCES locations(id),
      description     TEXT,
      phone           VARCHAR(40),
      status          VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
      is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
      views           INTEGER NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS property_images (
      id           SERIAL PRIMARY KEY,
      property_id  INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      url          TEXT NOT NULL,
      sort_order   INTEGER NOT NULL DEFAULT 0
    );
  `);

  const extra = await query(`SELECT COUNT(*)::int AS n FROM cars WHERE category <> 'passenger'`);
  if (Number(extra.rows[0]?.n || 0) === 0) await seedCommercial();

  const homes = await query(`SELECT COUNT(*)::int AS n FROM properties`);
  if (Number(homes.rows[0]?.n || 0) === 0) await seedHomes();

  await syncCategories();
  await seedMorePassenger();
}
