import { body } from 'express-validator';
import { CarModel } from '../models/Car.js';
import { FavoriteModel } from '../models/Favorite.js';
import { UserModel } from '../models/User.js';
import { query, withTransaction } from '../config/db.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { parsePagination, paginate, sanitizeString } from '../utils/helpers.js';
import { notify } from '../services/analyticsService.js';
import { imageForVehicle, isStockRemoteImage, isImaginImage, uniqueVehicles, carPhoto, NEW_CAR_YEAR_FROM } from '../utils/vehicleImages.js';

const FUEL = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Gas'];
const TRANS = ['Automatic', 'Manual'];
const BODY = [
  'Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Minivan', 'Sports', 'Pickup',
  'Truck', 'Heavy Truck', 'Bus', 'Coach', 'Tractor', 'Ambulance', 'Fire Truck',
  'Police', 'Commercial Van', 'Construction', 'Marine', 'Aircraft', 'Motorcycle',
  'Scooter', 'Bicycle',
];

export const carCreateRules = [
  body('brand_id').isInt(),
  body('model_id').isInt(),
  body('year').isInt({ min: 1950, max: 2100 }),
  body('price_usd').isFloat({ min: 0 }),
  body('mileage').isInt({ min: 0 }),
  body('fuel').isIn(FUEL),
  body('transmission').isIn(TRANS),
  body('body').isIn(BODY),
];

function imageUrlsFromRequest(req) {
  const files = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const extra = req.body.image_urls
    ? (Array.isArray(req.body.image_urls) ? req.body.image_urls : [req.body.image_urls])
    : [];
  return [...files, ...extra].filter(Boolean);
}

function localCarUrl(carId, index = 0, category = 'passenger', label = 'BENZ', meta = {}) {
  return imageForVehicle(category || 'passenger', carId, index, label, meta);
}

function parseImages(images) {
  if (!images) return [];
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(images) ? images : [];
}

function rewriteImageUrl(url, carId, index, category = 'passenger', label = 'BENZ', meta = {}) {
  const cat = category || 'passenger';
  const raw = url == null ? '' : String(url);
  if (raw.startsWith('/uploads/')) return raw;
  if (raw.startsWith('/homes/') || raw === '/hero.jpg') return raw;
  if (isImaginImage(raw)) return raw;
  if (raw.startsWith('data:image/svg+xml')) {
    // Prefer matched studio photo for passenger when we know brand/model
    if (meta.brand && meta.model && cat === 'passenger') {
      return carPhoto(meta.brand, meta.model, meta.year, carId, index);
    }
    return raw;
  }
  if (
    !raw ||
    isStockRemoteImage(raw) ||
    raw.startsWith('/cars/') ||
    raw.startsWith('/trucks/') ||
    raw.startsWith('/kamaz/') ||
    raw.startsWith('/parts/')
  ) {
    return imageForVehicle(cat, carId, index, label, meta);
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return localCarUrl(carId, index, cat, label, meta);
}

export function shapeCar(row, favoriteIds = []) {
  if (!row) return row;
  const label = [row.brand, row.model].filter(Boolean).join(' ') || 'BENZ';
  const meta = { brand: row.brand, model: row.model, year: row.year };
  const images = parseImages(row.images).map((img, i) => ({
    ...(typeof img === 'object' && img ? img : { url: img }),
    url: rewriteImageUrl(typeof img === 'object' ? img.url : img, row.id, i, row.category, label, meta),
  }));
  const filled = images.length
    ? images
    : [{ id: 0, url: localCarUrl(row.id, 0, row.category, label, meta), sort_order: 0 }];
  return {
    ...row,
    images: filled,
    is_favorite: favoriteIds.includes(row.id),
    is_new: (row.category || 'passenger') === 'passenger' && Number(row.year) >= NEW_CAR_YEAR_FROM,
    location: row.city ? `${row.city}, ${row.country}` : row.country || null,
  };
}

export const CarController = {
  list: asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query);
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const { rows, total } = await CarModel.list({
      ...req.query,
      page,
      limit,
      offset,
      q: req.query.q || req.query.search,
      minPrice: req.query.minPrice || req.query.min_price,
      maxPrice: req.query.maxPrice || req.query.max_price,
      yearFrom: req.query.yearFrom || req.query.year_from || req.query.year,
      yearTo: req.query.yearTo || req.query.year_to,
      minMileage: req.query.minMileage || req.query.min_mileage,
      maxMileage: req.query.maxMileage || req.query.max_mileage,
    });
    const shaped = uniqueVehicles(rows.map((r) => shapeCar(r, favoriteIds)));
    res.json({
      success: true,
      ...paginate({ rows: shaped, total, page, limit }),
    });
  }),

  featured: asyncHandler(async (req, res) => {
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const rows = await CarModel.featured(8);
    res.json({ success: true, data: uniqueVehicles(rows.map((r) => shapeCar(r, favoriteIds))) });
  }),

  recent: asyncHandler(async (req, res) => {
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const rows = await CarModel.recent(12);
    res.json({ success: true, data: uniqueVehicles(rows.map((r) => shapeCar(r, favoriteIds))) });
  }),

  popular: asyncHandler(async (req, res) => {
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const rows = await CarModel.popular(8);
    res.json({ success: true, data: uniqueVehicles(rows.map((r) => shapeCar(r, favoriteIds))) });
  }),

  getOne: asyncHandler(async (req, res) => {
    const car = await CarModel.findById(req.params.id);
    if (!car) throw new AppError('Car not found', 404);

    const isOwner = req.user && req.user.id === car.seller_id;
    const isAdmin = req.user && req.user.role === 'ADMIN';
    if (car.status !== 'APPROVED' && !isOwner && !isAdmin) {
      throw new AppError('Car not found', 404);
    }

    await CarModel.incrementViews(car.id);
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const shaped = shapeCar({ ...car, views: car.views + 1 }, favoriteIds);
    if (!isOwner && !isAdmin && shaped.vin) {
      shaped.vin = shaped.vin.slice(0, 3) + '***********' + shaped.vin.slice(-3);
    }
    res.json({ success: true, data: shaped });
  }),

  create: asyncHandler(async (req, res) => {
    const urls = imageUrlsFromRequest(req);
    const brandId = Number(req.body.brand_id);
    const modelId = Number(req.body.model_id);
    const year = Number(req.body.year);
    const category = req.body.category || 'passenger';

    const twin = await query(
      `SELECT c.id FROM cars c
       WHERE c.brand_id = $1 AND c.model_id = $2 AND c.year = $3 AND c.category = $4
       LIMIT 1`,
      [brandId, modelId, year, category]
    );
    if (twin.rows[0]) {
      throw new AppError('This brand, model and year already exists', 409);
    }
    if (urls.length) {
      const imgDup = await query(
        `SELECT car_id FROM car_images WHERE url = ANY($1::text[]) LIMIT 1`,
        [urls]
      );
      if (imgDup.rows[0]) {
        throw new AppError('One of the images is already used by another listing', 409);
      }
    }

    const car = await withTransaction(async (client) => {
      if (req.user.role === 'USER') {
        await client.query(`UPDATE users SET role = 'SELLER', updated_at = NOW() WHERE id = $1`, [req.user.id]);
      }
      const created = await CarModel.create(
        {
          seller_id: req.user.id,
          brand_id: brandId,
          model_id: modelId,
          year,
          price_usd: Number(req.body.price_usd),
          mileage: Number(req.body.mileage),
          engine: sanitizeString(req.body.engine, 80),
          power: req.body.power ? Number(req.body.power) : null,
          fuel: req.body.fuel,
          transmission: req.body.transmission,
          body: req.body.body,
          color: sanitizeString(req.body.color, 40),
          vin: sanitizeString(req.body.vin, 32),
          location_id: req.body.location_id ? Number(req.body.location_id) : null,
          description: sanitizeString(req.body.description, 4000),
          phone: sanitizeString(req.body.phone || req.user.phone, 40),
          status: 'PENDING',
          category,
        },
        client
      );
      if (urls.length) await CarModel.addImages(created.id, urls, client);
      return created;
    });

    const full = await CarModel.findById(car.id);
    res.status(201).json({ success: true, data: shapeCar(full) });
  }),

  update: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    const isOwner = existing.seller_id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403);

    const urls = imageUrlsFromRequest(req);
    await withTransaction(async (client) => {
      const fields = {};
      const map = [
        'brand_id', 'model_id', 'year', 'price_usd', 'mileage', 'engine', 'power',
        'fuel', 'transmission', 'body', 'color', 'vin', 'location_id', 'description', 'phone', 'category',
      ];
      for (const key of map) {
        if (req.body[key] !== undefined && req.body[key] !== '') fields[key] = req.body[key];
      }
      if (isOwner && !isAdmin && existing.status === 'REJECTED') fields.status = 'PENDING';
      if (isOwner && req.body.status && ['PAUSED', 'APPROVED'].includes(req.body.status) && existing.status !== 'SOLD') {
        if (req.body.status === 'PAUSED') fields.status = 'PAUSED';
        if (req.body.status === 'APPROVED' && existing.status === 'PAUSED') fields.status = 'APPROVED';
      }
      await CarModel.update(existing.id, fields, client);
      if (urls.length) await CarModel.replaceImages(existing.id, urls, client);
    });

    const full = await CarModel.findById(existing.id);
    res.json({ success: true, data: shapeCar(full) });
  }),

  remove: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    if (existing.seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }
    await CarModel.remove(existing.id);
    res.json({ success: true, message: 'Listing deleted' });
  }),

  markSold: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    if (existing.seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }
    const car = await CarModel.update(existing.id, { status: 'SOLD', sold_at: new Date() });
    await notify({
      userId: existing.seller_id,
      type: 'car_sold',
      title: 'Car sold',
      body: `${existing.brand} ${existing.model} marked as sold.`,
      relatedId: existing.id,
    });
    res.json({ success: true, data: shapeCar(car) });
  }),

  pause: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    if (existing.seller_id !== req.user.id) throw new AppError('Forbidden', 403);
    const next = existing.status === 'PAUSED' ? 'APPROVED' : 'PAUSED';
    const car = await CarModel.update(existing.id, { status: next });
    res.json({ success: true, data: shapeCar(car) });
  }),

  mine: asyncHandler(async (req, res) => {
    const rows = await CarModel.bySeller(req.user.id, req.query.status);
    res.json({ success: true, data: rows.map((r) => shapeCar(r)) });
  }),

  dashboard: asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS active,
         COUNT(*) FILTER (WHERE status = 'SOLD')::int AS sold,
         COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'PAUSED')::int AS paused,
         COALESCE(SUM(views), 0)::int AS views,
         COALESCE(SUM(favorites_count), 0)::int AS favorites
       FROM cars WHERE seller_id = $1`,
      [req.user.id]
    );
    const listings = await CarModel.bySeller(req.user.id);
    res.json({ success: true, stats: rows[0], listings: listings.map((r) => shapeCar(r)) });
  }),
};

export { UserModel };
