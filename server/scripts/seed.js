import '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { pool, query, initDb, execSql, schemaPath } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const img = (_id, carIndex = 0, photoIndex = 0) =>
  `/cars/${((carIndex + photoIndex) % 8) + 1}.jpg`;

const BRANDS = [
  { name: 'BMW', logo: 'https://logo.clearbit.com/bmw.com' },
  { name: 'Mercedes-Benz', logo: 'https://logo.clearbit.com/mercedes-benz.com' },
  { name: 'Toyota', logo: 'https://logo.clearbit.com/toyota.com' },
  { name: 'Lexus', logo: 'https://logo.clearbit.com/lexus.com' },
  { name: 'Audi', logo: 'https://logo.clearbit.com/audi.com' },
  { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com' },
  { name: 'Porsche', logo: 'https://logo.clearbit.com/porsche.com' },
  { name: 'Hyundai', logo: 'https://logo.clearbit.com/hyundai.com' },
  { name: 'Kia', logo: 'https://logo.clearbit.com/kia.com' },
  { name: 'Honda', logo: 'https://logo.clearbit.com/honda.com' },
  { name: 'Ford', logo: 'https://logo.clearbit.com/ford.com' },
  { name: 'Chevrolet', logo: 'https://logo.clearbit.com/chevrolet.com' },
];

const MODELS = {
  BMW: ['X5', 'X3', '3 Series', '5 Series', 'M4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLE', 'S-Class', 'GLC'],
  Toyota: ['Camry', 'Land Cruiser', 'RAV4', 'Corolla', 'Highlander'],
  Lexus: ['LX', 'RX', 'ES', 'GX', 'IS'],
  Audi: ['A6', 'Q7', 'A4', 'Q5', 'e-tron'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera'],
  Hyundai: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata'],
  Kia: ['Sportage', 'K5', 'Sorento', 'Telluride'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot'],
  Ford: ['Mustang', 'F-150', 'Explorer', 'Bronco'],
  Chevrolet: ['Camaro', 'Tahoe', 'Malibu', 'Silverado'],
};

const LOCATIONS = [
  ['Tajikistan', 'Dushanbe'],
  ['Tajikistan', 'Khujand'],
  ['Tajikistan', 'Kulob'],
  ['Tajikistan', 'Bokhtar'],
  ['Uzbekistan', 'Tashkent'],
  ['Kazakhstan', 'Almaty'],
  ['Kazakhstan', 'Astana'],
  ['Russia', 'Moscow'],
  ['Kyrgyzstan', 'Bishkek'],
];

const USERS = [
  { name: 'Admin Autohub', email: 'admin@autohub.tj', password: 'Admin123!', role: 'ADMIN', phone: '+992 90 000 0001' },
  { name: 'Farzona Karimova', email: 'farzona@autohub.tj', password: 'Password123!', role: 'SELLER', phone: '+992 90 111 1001' },
  { name: 'Rustam Saidov', email: 'rustam@autohub.tj', password: 'Password123!', role: 'SELLER', phone: '+992 90 111 1002' },
  { name: 'Dilshod Nazarov', email: 'dilshod@autohub.tj', password: 'Password123!', role: 'SELLER', phone: '+992 90 111 1003' },
  { name: 'Madina Yusupova', email: 'madina@autohub.tj', password: 'Password123!', role: 'SELLER', phone: '+992 90 111 1004' },
  { name: 'Jamshed Rahimov', email: 'jamshed@autohub.tj', password: 'Password123!', role: 'SELLER', phone: '+992 90 111 1005' },
  { name: 'Nigina Sharipova', email: 'nigina@autohub.tj', password: 'Password123!', role: 'USER', phone: '+992 90 222 2001' },
  { name: 'Parviz Islomov', email: 'parviz@autohub.tj', password: 'Password123!', role: 'USER', phone: '+992 90 222 2002' },
  { name: 'Shahlo Qodirova', email: 'shahlo@autohub.tj', password: 'Password123!', role: 'USER', phone: '+992 90 222 2003' },
  { name: 'Aziz Bekov', email: 'aziz@autohub.tj', password: 'Password123!', role: 'USER', phone: '+992 90 222 2004' },
  { name: 'Lola Mirzoeva', email: 'lola@autohub.tj', password: 'Password123!', role: 'USER', phone: '+992 90 222 2005' },
];

const CARS = [
  { brand: 'BMW', model: 'X5', year: 2022, price: 58900, mileage: 28400, engine: '3.0L Twin-Turbo I6', power: 335, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Carbon Black', vin: 'WBAJB0C50NWG12001', loc: 0, seller: 1, feat: true, views: 1840, desc: 'BMW X5 xDrive40i дар ҳолати олӣ. Салони чармӣ, панорама, HUD ва пакет M Sport.' },
  { brand: 'Mercedes-Benz', model: 'C-Class', year: 2021, price: 41200, mileage: 35600, engine: '2.0L Turbo I4', power: 255, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Obsidian Black', vin: 'W1KWF8EB5MR120002', loc: 0, seller: 2, feat: true, views: 1620, desc: 'C300 AMG Line. Як соҳиб, хидматрасонии расмии Mercedes.' },
  { brand: 'Toyota', model: 'Camry', year: 2020, price: 24800, mileage: 51200, engine: '2.5L I4', power: 203, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Pearl White', vin: '4T1C11AK5LU120003', loc: 1, seller: 3, feat: false, views: 2210, desc: 'Camry XLE бо салони беж. Мошини оилавӣ, бе садама.' },
  { brand: 'Tesla', model: 'Model 3', year: 2023, price: 39900, mileage: 12800, engine: 'Dual Motor AWD', power: 366, fuel: 'Electric', trans: 'Automatic', body: 'Sedan', color: 'Midnight Silver', vin: '5YJ3E1EB8PF120004', loc: 0, seller: 4, feat: true, views: 3100, desc: 'Long Range AWD. Autopilot, 15" экран, ҳудуди 500 км.' },
  { brand: 'Lexus', model: 'LX', year: 2021, price: 92000, mileage: 24100, engine: '5.7L V8', power: 383, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Atomic Silver', vin: 'JTJHY7AX5M4120005', loc: 0, seller: 5, feat: true, views: 980, desc: 'LX 570. Люкс SUV барои кӯҳ ва шаҳр. Mark Levinson audio.' },
  { brand: 'Audi', model: 'Q7', year: 2020, price: 47500, mileage: 44300, engine: '3.0L TFSI V6', power: 335, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Glacier White', vin: 'WA1LAAF78LD120006', loc: 5, seller: 1, feat: false, views: 870, desc: 'Q7 S-Line. 7 ҷой, пневмоподвеска, Virtual Cockpit.' },
  { brand: 'Porsche', model: '911', year: 2019, price: 118000, mileage: 18700, engine: '3.0L Twin-Turbo H6', power: 443, fuel: 'Petrol', trans: 'Automatic', body: 'Coupe', color: 'Guards Red', vin: 'WP0AB2A99KS120007', loc: 7, seller: 2, feat: true, views: 2540, desc: '911 Carrera S. PDK, Sport Chrono, салони чарми Carmine.' },
  { brand: 'Hyundai', model: 'Tucson', year: 2022, price: 26900, mileage: 19800, engine: '1.6L Turbo', power: 180, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Amazon Grey', vin: 'KM8J3CAL5NU120008', loc: 0, seller: 3, feat: false, views: 1430, desc: 'Tucson N-Line. Гарантияи боқимонда, камераи 360.' },
  { brand: 'Kia', model: 'Sportage', year: 2023, price: 28500, mileage: 9200, engine: '2.5L I4', power: 187, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Gravity Grey', vin: 'KNDP3CAC8P7120009', loc: 1, seller: 4, feat: false, views: 1190, desc: 'Насли нав, салони рақамӣ, круиз-контроль.' },
  { brand: 'Honda', model: 'Civic', year: 2021, price: 21400, mileage: 33100, engine: '1.5L Turbo', power: 180, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Aegean Blue', vin: '2HGFC1E59MH120010', loc: 4, seller: 5, feat: false, views: 760, desc: 'Civic Touring. Экономия ва динамика дар як ҷо.' },
  { brand: 'Ford', model: 'Mustang', year: 2018, price: 33500, mileage: 41200, engine: '5.0L V8', power: 460, fuel: 'Petrol', trans: 'Manual', body: 'Coupe', color: 'Race Red', vin: '1FA6P8CF5J5120011', loc: 0, seller: 1, feat: true, views: 1980, desc: 'Mustang GT Premium. Қуттии механикӣ, MagneRide.' },
  { brand: 'Chevrolet', model: 'Tahoe', year: 2021, price: 54800, mileage: 38900, engine: '5.3L V8', power: 355, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Black', vin: '1GNSKNKD5MR120012', loc: 5, seller: 2, feat: false, views: 640, desc: 'Tahoe RST. 8 ҷой, буксировка 3.8 т.' },
  { brand: 'BMW', model: '3 Series', year: 2019, price: 27800, mileage: 62400, engine: '2.0L Turbo I4', power: 255, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Mineral Grey', vin: 'WBA5R1C50KAK20013', loc: 2, seller: 3, feat: false, views: 890, desc: '330i M Sport. Adaptive LED, хармони Kardon.' },
  { brand: 'Mercedes-Benz', model: 'GLE', year: 2022, price: 67500, mileage: 21500, engine: '3.0L I6 Mild Hybrid', power: 362, fuel: 'Hybrid', trans: 'Automatic', body: 'SUV', color: 'Selenite Grey', vin: '4JGFB4KB3NA120014', loc: 0, seller: 4, feat: true, views: 1320, desc: 'GLE 450 4MATIC. Burmester, off-road пакет.' },
  { brand: 'Toyota', model: 'Land Cruiser', year: 2020, price: 78500, mileage: 47800, engine: '4.6L V8', power: 309, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'White Pearl', vin: 'JTMHY05J5L4120015', loc: 0, seller: 5, feat: true, views: 2760, desc: 'Land Cruiser 200 VX-R. Подготовка ба кӯҳҳои Тоҷикистон.' },
  { brand: 'Audi', model: 'A6', year: 2021, price: 42900, mileage: 30700, engine: '2.0L TFSI', power: 245, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Mythos Black', vin: 'WAUF2AFC5MN120016', loc: 1, seller: 1, feat: false, views: 710, desc: 'A6 45 TFSI Quattro. Matrix LED, Bang & Olufsen.' },
  { brand: 'Tesla', model: 'Model Y', year: 2023, price: 45500, mileage: 15400, engine: 'Long Range AWD', power: 384, fuel: 'Electric', trans: 'Automatic', body: 'SUV', color: 'Pearl White', vin: '7SAYGDEE8PA120017', loc: 7, seller: 2, feat: false, views: 1670, desc: 'Model Y Long Range. 7 ҷой, Acceleration Boost.' },
  { brand: 'Lexus', model: 'RX', year: 2022, price: 51200, mileage: 18200, engine: '2.4L Turbo Hybrid', power: 246, fuel: 'Hybrid', trans: 'Automatic', body: 'SUV', color: 'Nightfall Mica', vin: '2T2BAMCA2NC120018', loc: 0, seller: 3, feat: false, views: 540, desc: 'RX 350h. Оромӣ ва сарфаи сӯзишворӣ.' },
  { brand: 'Porsche', model: 'Cayenne', year: 2020, price: 69800, mileage: 36400, engine: '3.0L Turbo V6', power: 335, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Jet Black', vin: 'WP1AA2AY3LDA20019', loc: 5, seller: 4, feat: false, views: 1010, desc: 'Cayenne S. Пневмо, спорт-хроно, панорама.' },
  { brand: 'Honda', model: 'CR-V', year: 2021, price: 27200, mileage: 29800, engine: '1.5L Turbo', power: 190, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Sonic Gray', vin: '7FARW2H89ME120020', loc: 3, seller: 5, feat: false, views: 680, desc: 'CR-V Touring. Honda Sensing, боми панорамавӣ.' },
  { brand: 'BMW', model: 'X3', year: 2020, price: 36400, mileage: 45100, engine: '2.0L Turbo I4', power: 248, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Phytonic Blue', vin: '5UXTY5C05L9A20021', loc: 0, seller: 1, feat: false, views: 920, desc: 'X3 xDrive30i. Comfort Access, head-up display.' },
  { brand: 'Mercedes-Benz', model: 'E-Class', year: 2019, price: 38900, mileage: 58300, engine: '2.0L Turbo I4', power: 255, fuel: 'Diesel', trans: 'Automatic', body: 'Sedan', color: 'Polar White', vin: 'WDDZF4JB5KA120022', loc: 1, seller: 2, feat: false, views: 810, desc: 'E220d AMG Line. Расход паст, салони Executive.' },
  { brand: 'Toyota', model: 'RAV4', year: 2022, price: 31200, mileage: 22100, engine: '2.5L Hybrid', power: 219, fuel: 'Hybrid', trans: 'Automatic', body: 'SUV', color: 'Blueprint', vin: '2T3W1RFV9NW120023', loc: 0, seller: 3, feat: false, views: 1540, desc: 'RAV4 Hybrid XSE. AWD, Toyota Safety Sense 2.0.' },
  { brand: 'Kia', model: 'K5', year: 2022, price: 23900, mileage: 17600, engine: '1.6L Turbo', power: 180, fuel: 'Petrol', trans: 'Automatic', body: 'Sedan', color: 'Snow White Pearl', vin: '5XXG64J25NG120024', loc: 4, seller: 4, feat: false, views: 470, desc: 'K5 GT-Line. Дизайни купе-монанд, LED-оптика.' },
  { brand: 'Hyundai', model: 'Santa Fe', year: 2021, price: 29800, mileage: 40200, engine: '2.5L I4', power: 191, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Typhoon Silver', vin: '5NMS3DAJ2MH120025', loc: 2, seller: 5, feat: false, views: 530, desc: 'Santa Fe Calligraphy. 6 ҷой, нармафзори SmartSense.' },
  { brand: 'Ford', model: 'F-150', year: 2021, price: 42500, mileage: 46800, engine: '3.5L EcoBoost V6', power: 400, fuel: 'Petrol', trans: 'Automatic', body: 'Pickup', color: 'Antimatter Blue', vin: '1FTFW1E59MFA20026', loc: 8, seller: 1, feat: false, views: 390, desc: 'F-150 Lariat. SuperCrew, Pro Power Onboard.' },
  { brand: 'Chevrolet', model: 'Camaro', year: 2019, price: 31200, mileage: 27400, engine: '6.2L V8', power: 455, fuel: 'Petrol', trans: 'Automatic', body: 'Coupe', color: 'Shock Yellow', vin: '1G1FH1R79K0120027', loc: 0, seller: 2, feat: false, views: 1120, desc: 'Camaro SS 1LE. Track package, Brembo.' },
  { brand: 'Audi', model: 'Q5', year: 2020, price: 36800, mileage: 41900, engine: '2.0L TFSI', power: 248, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Navarra Blue', vin: 'WA1BNAFY7L2120028', loc: 6, seller: 3, feat: false, views: 610, desc: 'Q5 45 TFSI. Quattro, virtual cockpit plus.' },
  { brand: 'Lexus', model: 'ES', year: 2021, price: 34500, mileage: 26300, engine: '2.5L Hybrid', power: 215, fuel: 'Hybrid', trans: 'Automatic', body: 'Sedan', color: 'Caviar', vin: '58ADZ1B15MU120029', loc: 0, seller: 4, feat: false, views: 440, desc: 'ES 300h Luxury. Оромтарин седани бизнес-класс.' },
  { brand: 'Porsche', model: 'Macan', year: 2022, price: 62400, mileage: 14900, engine: '2.9L Twin-Turbo V6', power: 375, fuel: 'Petrol', trans: 'Automatic', body: 'SUV', color: 'Miami Blue', vin: 'WP1AB2A59NLB20030', loc: 0, seller: 5, feat: true, views: 880, desc: 'Macan GTS. Спорт-хроно, PASM, садои спорт-выхлоп.' },
];

const CAR_IMAGES = {
  'BMW|X5': ['1555215695-3004980ad54e', '1549399542-7e3f8b79c341', '1606664515524-ed2f786a0bd6'],
  'Mercedes-Benz|C-Class': ['1618843479313-40f8afb4b4d8', '1617531653332-bd460b6d4e4a', '1702238390143-2c46a16f70d8'],
  'Toyota|Camry': ['1621007947382-bb3c3994e3fb', '1619767886558-efdc259c0e34', '1609521263047-f8f205293f24'],
  'Tesla|Model 3': ['1560958089-b8a1929cea89', '1617704548623-340376564e68', '1561584125-0b6a1b0b0b0b'],
  'Lexus|LX': ['1549317661-bd32c8ce0db2', '1503376780353-7e6692767b70', '1494976388531-d1058494cdd8'],
  'Audi|Q7': ['1606664515524-ed2f786a0bd6', '1614200180615-27e4ba3e2717', '1542362567-b31e875736d8'],
  'Porsche|911': ['1503376780353-7e6692767b70', '1502877338530-cc23cd64bce9', '1614162692294-c6ddb20d2a1c'],
  'Hyundai|Tucson': ['1619767886558-efdc259c0e34', '1609521263047-f8f205293f24', '1549317661-bd32c8ce0db2'],
  'Kia|Sportage': ['1609521263047-f8f205293f24', '1617531653332-bd460b6d4e4a', '1542362567-b31e875736d8'],
  'Honda|Civic': ['1590362896111-0d0b0b0b0b0b', '1494976388531-d1058494cdd8', '1549317661-bd32c8ce0db2'],
  'Ford|Mustang': ['1494976388531-d1058494cdd8', '1502877338530-cc23cd64bce9', '1503376780353-7e6692767b70'],
  'Chevrolet|Tahoe': ['1533473359331-0135ef1b58bf', '1549317661-bd32c8ce0db2', '1492144535807-6783d2627bd0'],
  'BMW|3 Series': ['1555215695-3004980ad54e', '1614200180615-27e4ba3e2717', '1542362567-b31e875736d8'],
  'Mercedes-Benz|GLE': ['1618843479313-40f8afb4b4d8', '1617531653332-bd460b6d4e4a', '1492144535807-6783d2627bd0'],
  'Toyota|Land Cruiser': ['1533473359331-0135ef1b58bf', '1549317661-bd32c8ce0db2', '1492144535807-6783d2627bd0'],
  'Audi|A6': ['1606664515524-ed2f786a0bd6', '1542362567-b31e875736d8', '1614200180615-27e4ba3e2717'],
  'Tesla|Model Y': ['1560958089-b8a1929cea89', '1617704548623-340376564e68', '1492144535807-6783d2627bd0'],
  'Lexus|RX': ['1549399542-7e3f8b79c341', '1549317661-bd32c8ce0db2', '1492144535807-6783d2627bd0'],
  'Porsche|Cayenne': ['1503376780353-7e6692767b70', '1614162692294-c6ddb20d2a1c', '1492144535807-6783d2627bd0'],
  'Honda|CR-V': ['1494976388531-d1058494cdd8', '1609521263047-f8f205293f24', '1549317661-bd32c8ce0db2'],
  'BMW|X3': ['1555215695-3004980ad54e', '1549399542-7e3f8b79c341', '1492144535807-6783d2627bd0'],
  'Mercedes-Benz|E-Class': ['1618843479313-40f8afb4b4d8', '1542362567-b31e875736d8', '1614200180615-27e4ba3e2717'],
  'Toyota|RAV4': ['1621007947382-bb3c3994e3fb', '1609521263047-f8f205293f24', '1533473359331-0135ef1b58bf'],
  'Kia|K5': ['1619767886558-efdc259c0e34', '1542362567-b31e875736d8', '1494976388531-d1058494cdd8'],
  'Hyundai|Santa Fe': ['1619767886558-efdc259c0e34', '1533473359331-0135ef1b58bf', '1492144535807-6783d2627bd0'],
  'Ford|F-150': ['1533473359331-0135ef1b58bf', '1492144535807-6783d2627bd0', '1549317661-bd32c8ce0db2'],
  'Chevrolet|Camaro': ['1494976388531-d1058494cdd8', '1502877338530-cc23cd64bce9', '1503376780353-7e6692767b70'],
  'Audi|Q5': ['1606664515524-ed2f786a0bd6', '1614200180615-27e4ba3e2717', '1492144535807-6783d2627bd0'],
  'Lexus|ES': ['1549399542-7e3f8b79c341', '1542362567-b31e875736d8', '1614200180615-27e4ba3e2717'],
  'Porsche|Macan': ['1503376780353-7e6692767b70', '1614162692294-c6ddb20d2a1c', '1549317661-bd32c8ce0db2'],
};

const FALLBACK_IMGS = [
  '1503376780353-7e6692767b70',
  '1494976388531-d1058494cdd8',
  '1542362567-b31e875736d8',
  '1492144535807-6783d2627bd0',
  '1555215695-3004980ad54e',
];

export async function seedDatabase({ close = true, skipSchema = false } = {}) {
  await initDb();
  console.log('Reading schema…');
  if (!skipSchema) {
    const schema = fs.readFileSync(schemaPath(), 'utf8');
    await execSql(schema);
  }

  console.log('Clearing tables…');
  await query(`
    TRUNCATE reviews, notifications, messages, conversations, favorites,
             car_images, cars, property_images, properties, models, brands, locations, login_events, users
    RESTART IDENTITY CASCADE
  `);

  console.log('Inserting brands & models…');
  const brandIds = {};
  const modelIds = {};
  for (const b of BRANDS) {
    const { rows } = await query(
      `INSERT INTO brands (name, logo) VALUES ($1, $2) RETURNING id`,
      [b.name, b.logo]
    );
    brandIds[b.name] = rows[0].id;
    for (const m of MODELS[b.name] || []) {
      const r = await query(
        `INSERT INTO models (brand_id, name) VALUES ($1, $2) RETURNING id`,
        [rows[0].id, m]
      );
      modelIds[`${b.name}|${m}`] = r.rows[0].id;
    }
  }

  console.log('Inserting locations…');
  const locIds = [];
  for (const [country, city] of LOCATIONS) {
    const { rows } = await query(
      `INSERT INTO locations (country, city) VALUES ($1, $2) RETURNING id`,
      [country, city]
    );
    locIds.push(rows[0].id);
  }

  console.log('Inserting users…');
  const userIds = [];
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, phone, role, avatar)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [u.name, u.email, hash, u.phone, u.role, null]
    );
    userIds.push(rows[0].id);
  }

  console.log('Inserting cars…');
  const carIds = [];
  for (let i = 0; i < CARS.length; i++) {
    const c = CARS[i];
    const status = i === 28 ? 'PENDING' : i === 27 ? 'SOLD' : 'APPROVED';
    const soldAt = status === 'SOLD' ? new Date(Date.now() - 86400000 * 12) : null;
    const createdOffset = (CARS.length - i) * 86400000 * 2;
    const { rows } = await query(
      `INSERT INTO cars (
         seller_id, brand_id, model_id, year, price_usd, mileage, engine, power,
         fuel, transmission, body, color, vin, location_id, description, phone,
         status, is_featured, views, sold_at, created_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, NOW() - ($21 || ' milliseconds')::interval)
       RETURNING id`,
      [
        userIds[c.seller],
        brandIds[c.brand],
        modelIds[`${c.brand}|${c.model}`],
        c.year, c.price, c.mileage, c.engine, c.power, c.fuel, c.trans, c.body,
        c.color, c.vin, locIds[c.loc], c.desc, USERS[c.seller].phone,
        status, c.feat, c.views, soldAt, String(createdOffset),
      ]
    );
    const carId = rows[0].id;
    carIds.push(carId);
    const photos = CAR_IMAGES[`${c.brand}|${c.model}`] || FALLBACK_IMGS;
    for (let p = 0; p < photos.length; p++) {
      await query(
        `INSERT INTO car_images (car_id, url, sort_order) VALUES ($1,$2,$3)`,
        [carId, img(photos[p], i, p), p]
      );
    }
  }

  console.log('Favorites, messages, notifications, reviews…');
  const buyer = userIds[6];
  await query(`INSERT INTO favorites (user_id, car_id) VALUES ($1,$2), ($1,$3), ($1,$4)`, [buyer, carIds[0], carIds[3], carIds[14]]);
  await query(`INSERT INTO favorites (user_id, car_id) VALUES ($1,$2), ($1,$3)`, [userIds[7], carIds[4], carIds[6]]);
  await query(`UPDATE cars SET favorites_count = (SELECT COUNT(*) FROM favorites WHERE car_id = cars.id)`);

  const { rows: conv } = await query(
    `INSERT INTO conversations (buyer_id, seller_id, car_id) VALUES ($1,$2,$3) RETURNING id`,
    [buyer, userIds[1], carIds[0]]
  );
  await query(
    `INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
     ($1, $2, 'Салом! BMW X5 ҳанӯз дастрас аст?', NOW() - INTERVAL '2 hours'),
     ($1, $3, 'Салом, ҳа. Метавонем имрӯз нишон диҳем.', NOW() - INTERVAL '1 hour 40 minutes'),
     ($1, $2, 'Нархро каме паст карда метавонед?', NOW() - INTERVAL '1 hour')`,
    [conv[0].id, buyer, userIds[1]]
  );

  await query(
    `INSERT INTO notifications (user_id, type, title, body, related_id) VALUES
     ($1, 'listing_approved', 'Listing approved', 'Your Toyota Camry is now live.', $2),
     ($3, 'new_message', 'New message', 'Nigina Sharipova messaged you about BMW X5.', $4),
     ($5, 'favorite', 'Car added to favorites', 'Someone saved your Tesla Model 3.', $6)`,
    [userIds[3], carIds[2], userIds[1], conv[0].id, userIds[4], carIds[3]]
  );

  await query(
    `INSERT INTO reviews (reviewer_id, seller_id, car_id, rating, comment) VALUES
     ($1, $2, $3, 5, 'Фурӯшанда хеле профессионал. Мошин ҳамон тавре ки дар эълон.'),
     ($4, $5, $6, 4, 'Музокира осон буд, тавсия медиҳам.')`,
    [userIds[6], userIds[1], carIds[0], userIds[7], userIds[2], carIds[1]]
  );

  console.log('Seed complete.');
  console.log('Admin:  admin@autohub.tj / Admin123!');
  console.log('Seller: rustam@autohub.tj / Password123!');
  console.log('User:   nigina@autohub.tj / Password123!');
  if (close) await pool.end();
}

const thisFile = fileURLToPath(import.meta.url);
const launched = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (thisFile === launched) {
  seedDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
