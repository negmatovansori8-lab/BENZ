import { query } from '../config/db.js';

const BATCH = 80;

const PASSENGER = [
  { brand: 'Toyota', models: ['Camry', 'Corolla', 'Prado', 'RAV4', 'Land Cruiser', 'Highlander', 'Hilux', 'Yaris', 'Supra', 'Fortuner', 'Alphard', 'Avalon', 'C-HR', '4Runner'], bodies: ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Minivan'] },
  { brand: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'A-Class', 'G-Class', 'AMG GT', 'CLA', 'GLS', 'EQS', 'Maybach S'], bodies: ['Sedan', 'SUV', 'Hatchback', 'Coupe'] },
  { brand: 'BMW', models: ['3 Series', '5 Series', 'X5', 'X3', 'X6', 'X1', '7 Series', 'M4', 'X7', 'iX', 'M5', 'X4'], bodies: ['Sedan', 'SUV', 'Coupe'] },
  { brand: 'Audi', models: ['A6', 'A4', 'Q7', 'Q5', 'A8', 'RS6', 'TT', 'Q8', 'e-tron', 'A3', 'RS7', 'Q3', 'A5'], bodies: ['Sedan', 'SUV', 'Wagon', 'Coupe', 'Hatchback'] },
  { brand: 'Lexus', models: ['LX', 'RX', 'GX', 'ES', 'IS', 'LC', 'NX', 'UX', 'LM'], bodies: ['Sedan', 'SUV', 'Coupe', 'Minivan'] },
  { brand: 'Porsche', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Cayman', '718 Boxster'], bodies: ['Coupe', 'SUV', 'Sedan'] },
  { brand: 'Ferrari', models: ['Roma', 'F8 Tributo', 'SF90', '296 GTB', 'Purosangue', 'Roma Spider'], bodies: ['Coupe', 'SUV'] },
  { brand: 'Lamborghini', models: ['Huracan', 'Urus', 'Revuelto', 'Temerario', 'Huracan EVO', 'Urus Performante'], bodies: ['Coupe', 'SUV'] },
  { brand: 'Bentley', models: ['Continental GT', 'Bentayga', 'Flying Spur'], bodies: ['Coupe', 'SUV', 'Sedan'] },
  { brand: 'Rolls-Royce', models: ['Ghost', 'Cullinan', 'Spectre', 'Phantom'], bodies: ['Sedan', 'SUV', 'Coupe'] },
  { brand: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'], bodies: ['Sedan', 'SUV', 'Pickup'] },
  { brand: 'Ford', models: ['Mustang', 'Explorer', 'F-150', 'Focus', 'Bronco', 'Edge', 'Escape', 'Ranger'], bodies: ['Coupe', 'SUV', 'Pickup', 'Hatchback'] },
  { brand: 'Chevrolet', models: ['Camaro', 'Tahoe', 'Malibu', 'Tracker', 'Silverado', 'Traverse', 'Equinox'], bodies: ['Coupe', 'SUV', 'Sedan', 'Pickup'] },
  { brand: 'Dodge', models: ['Charger', 'Challenger', 'Durango', 'Ram 1500'], bodies: ['Sedan', 'Coupe', 'SUV', 'Pickup'] },
  { brand: 'Jeep', models: ['Wrangler', 'Grand Cherokee', 'Compass', 'Gladiator', 'Cherokee'], bodies: ['SUV', 'Pickup'] },
  { brand: 'Nissan', models: ['Patrol', 'X-Trail', 'Sunny', 'Qashqai', 'GT-R', 'Pathfinder', 'Altima', 'Murano'], bodies: ['SUV', 'Sedan', 'Coupe'] },
  { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Odyssey', 'Pilot'], bodies: ['Sedan', 'SUV', 'Hatchback', 'Minivan'] },
  { brand: 'Hyundai', models: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Ioniq 5', 'Palisade', 'Creta', 'Accent'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Kia', models: ['Sportage', 'Sorento', 'K5', 'EV6', 'Seltos', 'Carnival', 'Cerato', 'Telluride'], bodies: ['SUV', 'Sedan', 'Minivan'] },
  { brand: 'Volkswagen', models: ['Passat', 'Tiguan', 'Golf', 'Touareg', 'ID.4', 'Jetta', 'Polo', 'Arteon'], bodies: ['Sedan', 'SUV', 'Hatchback'] },
  { brand: 'Volvo', models: ['XC90', 'XC60', 'S90', 'XC40', 'EX30', 'S60'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Subaru', models: ['Forester', 'Outback', 'WRX', 'Ascent', 'Crosstrek'], bodies: ['SUV', 'Wagon', 'Sedan'] },
  { brand: 'Mazda', models: ['CX-5', 'CX-9', 'Mazda 6', 'MX-5', 'CX-60', 'CX-30'], bodies: ['SUV', 'Sedan', 'Coupe'] },
  { brand: 'Mitsubishi', models: ['Pajero', 'Outlander', 'L200', 'Eclipse Cross', 'ASX'], bodies: ['SUV', 'Pickup'] },
  { brand: 'Land Rover', models: ['Range Rover', 'Defender', 'Discovery', 'Range Rover Sport', 'Evoque'], bodies: ['SUV'] },
  { brand: 'Maserati', models: ['Ghibli', 'Levante', 'MC20', 'Grecale'], bodies: ['Sedan', 'SUV', 'Coupe'] },
  { brand: 'Genesis', models: ['G80', 'GV70', 'GV80', 'G90'], bodies: ['Sedan', 'SUV'] },
  { brand: 'BYD', models: ['Song Plus', 'Han', 'Seal', 'Yuan Plus', 'Tang', 'Atto 3'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Geely', models: ['Coolray', 'Monjaro', 'Atlas', 'Preface', 'Okavango'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Chery', models: ['Tiggo 7', 'Tiggo 8', 'Arrizo 8', 'Tiggo 4', 'Tiggo 9'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Haval', models: ['H6', 'Jolion', 'Dargo', 'H9', 'F7'], bodies: ['SUV'] },
  { brand: 'Lada', models: ['Vesta', 'Granta', 'Niva', 'Largus'], bodies: ['Sedan', 'SUV', 'Wagon'] },
  { brand: 'Skoda', models: ['Octavia', 'Kodiaq', 'Superb', 'Kamiq'], bodies: ['Sedan', 'SUV', 'Wagon'] },
  { brand: 'Peugeot', models: ['3008', '5008', '508', '2008'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Renault', models: ['Duster', 'Arkana', 'Megane', 'Captur'], bodies: ['SUV', 'Sedan', 'Hatchback'] },
  { brand: 'Infiniti', models: ['QX80', 'QX60', 'Q50'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Acura', models: ['MDX', 'RDX', 'TLX'], bodies: ['SUV', 'Sedan'] },
  { brand: 'Cadillac', models: ['Escalade', 'XT5', 'CT5'], bodies: ['SUV', 'Sedan'] },
];

const COMMERCIAL = [
  { brand: 'Shacman', models: ['X3000', 'X5000', 'F3000', 'X6000', 'H3000', 'Dump 8x4', 'Tractor 4x2'], bodies: ['Truck', 'Heavy Truck'] },
  { brand: 'HOWO', models: ['TX', 'A7', 'Sinotruk', 'T5G', 'N7W', 'Dump 6x4', 'Mixer 8x4'], bodies: ['Truck', 'Heavy Truck'] },
  { brand: 'GAZ', models: ['Gazelle Next', 'Valdai', 'Sobol', 'Gazelle NN', 'Next A21', 'Business Van'], bodies: ['Commercial Van', 'Minivan'] },
  { brand: 'Isuzu', models: ['NPR', 'NQR', 'Forward', 'ELF', 'Giga', 'NPR 75'], bodies: ['Truck'] },
  { brand: 'FAW', models: ['J6', 'J7', 'Tiger', 'CA3250', 'Liberation'], bodies: ['Heavy Truck', 'Truck'] },
  { brand: 'MAN', models: ['TGS', 'TGX', 'TGM', 'TGL', 'TGX 18.510'], bodies: ['Heavy Truck', 'Truck'] },
  { brand: 'DAF', models: ['XF 105', 'CF', 'XF 106', 'XF 480', 'CF 440'], bodies: ['Heavy Truck'] },
  { brand: 'Volvo', models: ['FH', 'FM', 'FE', 'FH16', 'FMX', 'FL'], bodies: ['Heavy Truck', 'Truck'] },
  { brand: 'Scania', models: ['R450', 'S500', 'G410', 'R500', 'S650', 'P360'], bodies: ['Heavy Truck'] },
  { brand: 'Ford', models: ['Transit', 'Ranger', 'Transit Custom', 'Cargo 350'], bodies: ['Commercial Van', 'Pickup'] },
  { brand: 'Mercedes-Benz', models: ['Actros', 'Atego', 'Arocs', 'Sprinter Chassis'], bodies: ['Heavy Truck', 'Truck'] },
  { brand: 'Iveco', models: ['Stralis', 'Eurocargo', 'Daily', 'S-Way'], bodies: ['Heavy Truck', 'Truck', 'Commercial Van'] },
  { brand: 'MAZ', models: ['5440', '6312', '6501', '5551'], bodies: ['Heavy Truck', 'Truck'] },
  { brand: 'Dongfeng', models: ['Captain', 'Kinland', 'KC Dump'], bodies: ['Truck', 'Heavy Truck'] },
];

const BUS = [
  { brand: 'Yutong', models: ['ZK6122', 'City Bus', 'Coach 55', 'ZK6899', 'E12 Electric'], bodies: ['Bus', 'Coach'] },
  { brand: 'King Long', models: ['XMQ6129', 'City 12m', 'XMQ6112', 'Coach 49'], bodies: ['Bus', 'Coach'] },
  { brand: 'Mercedes-Benz', models: ['Sprinter Bus', 'Tourismo', 'Citaro', 'Intouro'], bodies: ['Bus', 'Coach'] },
  { brand: 'Volvo', models: ['B8R', '9700', '7900 Electric'], bodies: ['Bus', 'Coach'] },
  { brand: 'GAZ', models: ['Vector Next', 'CityRide'], bodies: ['Bus'] },
  { brand: 'PAZ', models: ['3205', '3204', 'Next'], bodies: ['Bus'] },
  { brand: 'LiAZ', models: ['5292', '4270'], bodies: ['Bus'] },
];

const SPECIAL = [
  { brand: 'JCB', models: ['3CX', '4CX', 'JS220', 'JS130', '3CX Eco', 'Teletruk'], bodies: ['Construction'] },
  { brand: 'Caterpillar', models: ['320', '336', '950', '140M', 'D6', '730 Articulated'], bodies: ['Construction'] },
  { brand: 'Komatsu', models: ['PC200', 'WA380', 'D65', 'PC300', 'HM300'], bodies: ['Construction'] },
  { brand: 'XCMG', models: ['XE215', 'LW300', 'QY25', 'XS183', 'GR215'], bodies: ['Construction'] },
  { brand: 'Mercedes-Benz', models: ['Ambulance Sprinter', 'Police Sprinter', 'Unimog U5023'], bodies: ['Ambulance', 'Police'] },
  { brand: 'MAN', models: ['Fire Truck TGM', 'Rescue TGS'], bodies: ['Fire Truck'] },
  { brand: 'Shacman', models: ['Mixer', 'Crane', 'Water Tanker'], bodies: ['Construction'] },
  { brand: 'Liebherr', models: ['LTM 1050', 'A 918'], bodies: ['Construction'] },
  { brand: 'Hitachi', models: ['ZX210', 'ZX350'], bodies: ['Construction'] },
];

const AGRICULTURAL = [
  { brand: 'John Deere', models: ['6R', '8R', 'Tractor 6120', '7R', 'S780 Combine'], bodies: ['Tractor'] },
  { brand: 'MTZ', models: ['82.1', '1221', '1523', 'BELARUS 952'], bodies: ['Tractor'] },
  { brand: 'New Holland', models: ['T7', 'T6', 'T5', 'CR8.90'], bodies: ['Tractor'] },
  { brand: 'Case IH', models: ['Puma 150', 'Magnum 280', 'Farmall 110'], bodies: ['Tractor'] },
  { brand: 'Claas', models: ['Axion 800', 'Arion 630'], bodies: ['Tractor'] },
];

const MOTORCYCLE = [
  { brand: 'Yamaha', models: ['R1', 'MT-07', 'NMAX'], bodies: ['Motorcycle', 'Scooter'] },
  { brand: 'Honda', models: ['CBR650R', 'PCX', 'Africa Twin'], bodies: ['Motorcycle', 'Scooter'] },
  { brand: 'Kawasaki', models: ['Ninja 650', 'Z900'], bodies: ['Motorcycle'] },
  { brand: 'Harley-Davidson', models: ['Street Glide', 'Iron 883'], bodies: ['Motorcycle'] },
  { brand: 'Ducati', models: ['Panigale V2', 'Monster'], bodies: ['Motorcycle', 'Sports'] },
];

const MARINE = [
  { brand: 'Yamaha Marine', models: ['242X', 'SX190'], bodies: ['Marine'] },
  { brand: 'BRP', models: ['Sea-Doo GTX', 'Spark'], bodies: ['Marine'] },
];

const AIRCRAFT = [
  { brand: 'Cessna', models: ['172 Skyhawk', '182 Skylane'], bodies: ['Aircraft'] },
  { brand: 'Airbus', models: ['H125 Helicopter'], bodies: ['Aircraft'] },
];

const KAMAZ = [
  {
    brand: 'KAMAZ',
    models: [
      '65115', '6520', '43118', '5490', '65117', '54901', '53215', '54115',
      '65225', '65201', '43114', '5350', '63501', '6460', '45143', '65116',
      '5308', '4308', '43253', '53605', '54902', '65801',
    ],
    bodies: ['Heavy Truck', 'Truck'],
  },
];

const PARTS = [
  { brand: 'Toyota', models: ['Engine 2AZ', 'Engine 1ZZ', 'Oil filter', 'Brake pads', 'Tires 205/55', 'Tires 265/65', 'Alternator', 'Radiator', 'Spark plugs', 'Air filter', 'Timing belt', 'Water pump', 'CV joint', 'Shock absorber', 'Battery 70Ah', 'Cabin filter', 'Fuel pump', 'Starter', 'Clutch kit', 'Thermostat'] },
  { brand: 'BMW', models: ['Engine N55', 'Engine B48', 'Radiator', 'Xenon ballast', 'Turbo', 'Control arm', 'Oil filter', 'Brake discs', 'Battery', 'Air filter', 'Spark plugs', 'Water pump', 'Timing chain kit', 'Cabin filter', 'Shock absorber'] },
  { brand: 'Mercedes-Benz', models: ['LED headlights', 'Shock absorbers', 'Air suspension', 'Gearbox 7G', 'Brake pads', 'Cabin filter', 'Oil filter', 'Radiator', 'Turbo OM651', 'Alternator', 'Battery 80Ah', 'CV joint', 'Water pump', 'Fuel filter'] },
  { brand: 'Audi', models: ['Turbo TFSI', 'Quattro CV joint', 'LED matrix light', 'Oil filter', 'Brake pads', 'Air filter', 'DSG clutch', 'Radiator', 'Water pump', 'Spark plugs', 'Cabin filter', 'Control arm'] },
  { brand: 'Lamborghini', models: ['Carbon brake pads', 'Air filter sport', 'Oil filter', 'Spark plugs racing', 'Clutch ceramic', 'Brake discs carbon'] },
  { brand: 'Porsche', models: ['PDK filter', 'Brake pads', 'Air filter', 'Oil filter', 'Spark plugs', 'Coolant pump', 'Ignition coil'] },
  { brand: 'Lexus', models: ['Oil filter', 'Brake pads', 'Air filter', 'Cabin filter', 'Spark plugs', 'Alternator', 'Water pump', 'Timing belt'] },
  { brand: 'Honda', models: ['Alternator', 'Timing belt kit', 'Clutch kit', 'Air filter', 'Oil filter', 'Brake pads', 'CV joint', 'Radiator', 'Spark plugs', 'Water pump'] },
  { brand: 'Hyundai', models: ['Battery 70Ah', 'Spark plugs', 'Bumper front', 'CV joint', 'Air filter', 'Brake pads', 'Oil filter', 'Radiator', 'Alternator', 'Timing belt'] },
  { brand: 'Kia', models: ['Bumper front', 'Oil filter', 'Brake pads', 'Air filter', 'Battery 60Ah', 'Spark plugs', 'CV joint', 'Cabin filter'] },
  { brand: 'Nissan', models: ['Timing belt kit', 'Oil filter', 'Brake pads', 'Air filter', 'Radiator', 'Alternator', 'Spark plugs', 'Clutch kit'] },
  { brand: 'Ford', models: ['Brake pads', 'Oil filter', 'Air filter', 'Alternator', 'Spark plugs', 'Radiator', 'Water pump', 'CV joint'] },
  { brand: 'Volkswagen', models: ['Clutch kit', 'Oil filter', 'Brake pads', 'DSG filter', 'Air filter', 'Water pump', 'Spark plugs', 'Timing belt'] },
  { brand: 'Mitsubishi', models: ['Transfer case', 'Oil filter', 'Brake pads', 'Air filter', 'Radiator', 'CV joint', 'Spark plugs'] },
  { brand: 'Chevrolet', models: ['Side mirror', 'Oil filter', 'Brake pads', 'Spark plugs', 'Alternator', 'Air filter', 'Radiator'] },
  { brand: 'Lada', models: ['Starter', 'Oil filter', 'Brake pads', 'Air filter', 'Alternator', 'Clutch kit', 'Radiator', 'Spark plugs'] },
  { brand: 'KAMAZ', models: ['Turbocharger', 'Brake discs', 'Tires 315/80', 'Fuel pump', 'Starter', 'Clutch kit', 'Radiator', 'Oil filter', 'Air compressor', 'Steering pump', 'Alternator', 'Water pump'] },
  { brand: 'Scania', models: ['Brake pads', 'Oil filter', 'Fuel filter', 'Turbo', 'Clutch kit', 'Radiator'] },
  { brand: 'Volvo', models: ['Brake pads', 'Oil filter', 'Air filter', 'Turbo', 'Alternator', 'Clutch kit'] },
  { brand: 'MAN', models: ['Brake pads', 'Oil filter', 'Fuel filter', 'Radiator', 'Starter', 'Clutch kit'] },
];

const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Beige'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Gas', 'Electric'];
const TRANS = ['Automatic', 'Manual'];
const CITIES = ['Душанбе', 'Хуҷанд', 'Кӯлоб', 'Бохтар', 'Ҳисор', 'Ваҳдат', 'Турсунзода', 'Панҷакент'];
const DISTRICTS = ['Сино', 'Шоҳмансур', 'Фирдавсӣ', 'Исмоили Сомонӣ', '82-мкр', '102-мкр', 'Варзоб', 'Рӯдакӣ'];

const ALLOWED_BODIES = new Set(['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Pickup', 'Minivan']);
function safeBody(body, fallback = 'Sedan') {
  const b = String(body || fallback);
  if (ALLOWED_BODIES.has(b)) return b;
  if (/sport|coupe|gt|roma|mustang|911|huracan|revuelto/i.test(b)) return 'Coupe';
  if (/truck|pickup|van|bus|tractor|construction|marine|aircraft|motorcycle/i.test(b)) return 'Pickup';
  if (/wagon/i.test(b)) return 'Wagon';
  if (/hatch/i.test(b)) return 'Hatchback';
  if (/suv|crossover/i.test(b)) return 'SUV';
  return fallback;
}

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

import { carPhoto, imageForVehicle } from '../utils/vehicleImages.js';

function imgFor(cat, n, brand = '', model = '', year = 2024) {
  return imageForVehicle(cat, n, 0, { brand, model, year });
}

function homeImg(n) {
  return `/stock/homes/${(Math.abs(n) % 12) + 1}.jpg`;
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
      r.fuel, r.trans, safeBody(r.body), r.color, r.locId, r.desc, r.phone, r.feat, r.views, r.cat
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
    const r = rows[idx];
    const gallery = [
      r.img,
      imgFor(r.cat, r.n ?? idx + 1, r.brandName || '', r.modelName || '', r.year),
      imgFor(r.cat, (r.n ?? idx) + 17, r.brandName || '', r.modelName || '', r.year),
      imgFor(r.cat, (r.n ?? idx) + 31, r.brandName || '', r.modelName || '', r.year),
    ];
    const seen = new Set();
    let sort = 0;
    for (const url of gallery) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      imgValues.push(`($${j++},$${j++},$${j++})`);
      imgParams.push(row.id, url, sort);
      sort += 1;
      if (sort >= 4) break;
    }
    if (sort === 0) {
      imgValues.push(`($${j++},$${j++},0)`);
      imgParams.push(row.id, r.img || '/stock/cars/1.jpg');
    }
  });
  await query(`INSERT INTO car_images (car_id, url, sort_order) VALUES ${imgValues.join(',')}`, imgParams);
}

function realisticPrice(g, year, cat, n) {
  if (cat === 'parts') return 15 + (n * 13) % 420;
  if (cat === 'motorcycle') return 1800 + (n * 97) % 12000;
  if (cat === 'marine') return 12000 + (n * 211) % 40000;
  if (cat === 'aircraft') return 90000 + (n * 401) % 180000;
  if (cat === 'bus' || cat === 'agricultural') return 18000 + (n * 173) % 55000;
  const luxury = ['Mercedes-Benz', 'BMW', 'Lexus', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Land Rover', 'Jaguar'].includes(g.brand);
  const age = Math.max(0, 2026 - year);
  if (cat === 'passenger') {
    const base = luxury ? 22000 : 7200;
    const drop = age * (luxury ? 900 : 260);
    const jitter = (n * 97) % (luxury ? 12000 : 2200);
    return Math.max(luxury ? 8500 : 1800, Math.round(base - drop + jitter));
  }
  return Math.max(7000, Math.round(11000 + (n * 113) % 16000 - age * 180));
}

function buildCar(g, model, year, cat, n, sellers, locs) {
  const km = cat === 'parts' ? 0
    : cat === 'aircraft' || cat === 'marine' ? 200 + (n * 37) % 4000
    : cat === 'motorcycle' ? 1500 + (n * 97) % 45000
    : 8000 + (n * 137) % 240000;
  const price = realisticPrice(g, year, cat, n);
  const body = safeBody(g.bodies ? g.bodies[n % g.bodies.length] : cat === 'parts' ? 'Sedan' : 'Pickup');
  const fuel = cat === 'parts'
    ? 'Petrol'
    : ['Tesla', 'BYD'].includes(g.brand) || /EV|Ioniq|ID\.|Taycan|Seal|Han|EQS|EQE|Cybertruck|Atto/i.test(model)
      ? 'Electric'
      : cat === 'motorcycle' || cat === 'marine' || cat === 'aircraft'
        ? 'Petrol'
        : cat === 'kamaz' || cat === 'commercial' || cat === 'special' || cat === 'bus' || cat === 'agricultural'
          ? 'Diesel'
          : /Hybrid|e-BOXER|PHEV|Plugin/i.test(model) || n % 11 === 0 ? 'Hybrid'
            : n % 4 === 0 ? 'Diesel'
              : n % 5 === 0 ? 'Gas'
                : 'Petrol';
  const label = cat === 'parts'
    ? `${g.brand} ${model}. Қисми эҳтиётӣ, санҷидашуда. ${CITIES[n % CITIES.length]}.`
    : `${g.brand} ${model} ${year}. ${body}. ${CITIES[n % CITIES.length]}.`;
  return {
    key: `${g.brand}|${model}`,
    brandName: g.brand,
    modelName: model,
    n,
    year,
    price,
    km,
    engine: cat === 'parts' ? '—' : fuel === 'Electric' ? 'Electric motor' : `${(cat === 'passenger' || cat === 'motorcycle' ? 1.2 + (n % 40) / 10 : 4 + (n % 90) / 10).toFixed(1)}L`,
    power: cat === 'parts' ? 0 : 80 + (n % 520),
    fuel,
    trans: cat === 'parts' || cat === 'motorcycle' ? 'Manual' : TRANS[n % 2],
    body,
    color: COLORS[n % COLORS.length],
    cat,
    feat: n % 22 === 0,
    views: 80 + (n % 4000),
    img: imgFor(cat, n, g.brand, model, year),
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
  // Same brand + model + year + category — keep one
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

export async function cleanupDuplicateListings() {
  await removeDuplicateCars();
  await removeDuplicateHomes();
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
  // Many unique brand|model|year|cat combinations (no image-based collapse)
  const years = cat === 'passenger'
    ? [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
    : cat === 'parts'
      ? [2022, 2023, 2024, 2025, 2026]
      : [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
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
  const groups = {
    passenger: PASSENGER,
    commercial: COMMERCIAL,
    special: SPECIAL,
    kamaz: KAMAZ,
    parts: PARTS,
    bus: BUS,
    agricultural: AGRICULTURAL,
    motorcycle: MOTORCYCLE,
    marine: MARINE,
    aircraft: AIRCRAFT,
  };
  const maps = {};
  for (const [cat, list] of Object.entries(groups)) {
    maps[cat] = await idMap(list);
  }
  const found = await query(`
    SELECT b.name AS brand, m.name AS model, c.year, c.category
    FROM cars c
    JOIN brands b ON b.id = c.brand_id
    JOIN models m ON m.id = c.model_id
  `);
  const existing = new Set(found.rows.map((r) => `${r.brand}|${r.model}|${r.year}|${r.category}`));
  const pending = Object.entries(groups)
    .flatMap(([cat, list]) => uniqueGroupRows(list, cat, sellers, locs, existing))
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

  // Brand-matched covers for passenger; specialty uses 36-slot local stock pools
  await query(`
    UPDATE car_images ci
    SET url = CASE c.category
      WHEN 'parts' THEN '/stock/parts/' || (((c.id * 13 + COALESCE(LENGTH(m.name), 0) * 5) % 36) + 1)::text || '.jpg'
      WHEN 'kamaz' THEN '/stock/kamaz/' || (((c.id * 11 + COALESCE(LENGTH(m.name), 0) * 7) % 36) + 1)::text || '.jpg'
      WHEN 'commercial' THEN '/stock/trucks/' || (((c.id * 17 + LENGTH(b.name) * 3 + COALESCE(LENGTH(m.name), 0)) % 36) + 1)::text || '.jpg'
      WHEN 'special' THEN '/stock/trucks/' || (((c.id * 19 + LENGTH(b.name) * 5 + COALESCE(LENGTH(m.name), 0)) % 36) + 1)::text || '.jpg'
      WHEN 'bus' THEN '/stock/trucks/' || (((c.id * 23 + COALESCE(LENGTH(m.name), 0) * 9) % 36) + 1)::text || '.jpg'
      WHEN 'agricultural' THEN '/stock/trucks/' || (((c.id * 29 + COALESCE(LENGTH(m.name), 0) * 11) % 36) + 1)::text || '.jpg'
      WHEN 'passenger' THEN '/stock/brands/' ||
        trim(both '-' from regexp_replace(lower(b.name), '[^a-z0-9]+', '-', 'g')) ||
        '-' || ((((c.id * 7) + COALESCE(LENGTH(m.name), 0) * 3 + (c.year % 10)) % 3) + 1)::text || '.jpg'
      ELSE '/stock/cars/' || ((c.id % 8) + 1)::text || '.jpg'
    END
    FROM cars c
    JOIN brands b ON b.id = c.brand_id
    LEFT JOIN models m ON m.id = c.model_id
    WHERE ci.car_id = c.id
  `);
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
  await query(`
    UPDATE property_images
    SET url = '/stock/homes/' || ((((property_id * 17) % 12) + 1))::text || '.jpg'
    WHERE url NOT LIKE '/uploads/%'
  `);
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
          CASE WHEN b.name IN ('Mercedes-Benz', 'BMW', 'Lexus', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Land Rover', 'Maserati')
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
  // Featured = dream cars people love to look at
  await query(`UPDATE cars SET is_featured = FALSE`);
  await query(`
    UPDATE cars SET is_featured = TRUE
    WHERE id IN (
      SELECT c.id FROM cars c
      JOIN brands b ON b.id = c.brand_id
      JOIN models m ON m.id = c.model_id
      WHERE c.status = 'APPROVED' AND c.category = 'passenger'
        AND b.name IN (
          'Lamborghini','Ferrari','Porsche','Bentley','Rolls-Royce','Maserati',
          'Mercedes-Benz','BMW','Audi','Lexus','Tesla','Land Rover','Genesis'
        )
      ORDER BY
        CASE b.name
          WHEN 'Lamborghini' THEN 0 WHEN 'Ferrari' THEN 1 WHEN 'Porsche' THEN 2
          WHEN 'Bentley' THEN 3 WHEN 'Rolls-Royce' THEN 4 WHEN 'Maserati' THEN 5
          ELSE 10
        END,
        c.power DESC NULLS LAST,
        c.year DESC
      LIMIT 40
    )
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
