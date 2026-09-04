import { body } from 'express-validator';
import { CarModel } from '../models/Car.js';
import { FavoriteModel } from '../models/Favorite.js';
import { UserModel } from '../models/User.js';
import { query, withTransaction } from '../config/db.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { parsePagination, paginate, sanitizeString } from '../utils/helpers.js';
import { notify } from '../services/analyticsService.js';

const FUEL = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Gas'];
const TRANS = ['Automatic', 'Manual'];
const BODY = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Pickup', 'Minivan'];

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

function localCarUrl(carId, index = 0, category = 'passenger') {
  const n = Math.abs(Number(carId) + index - 1);
  if (category === 'kamaz') return `/kamaz/${(n % 3) + 1}.jpg`;
  if (category === 'parts') return `/parts/${(n % 3) + 1}.jpg`;
  if (category === 'special') return '/trucks/3.jpg';
  if (category === 'commercial') return `/trucks/${(n % 2) + 1}.jpg`;
  return `/cars/${(n % 8) + 1}.jpg`;
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

function rewriteImageUrl(url, carId, index, category = 'passenger') {
  const cat = category || 'passenger';
  if (cat === 'kamaz') {
    if (url && String(url).startsWith('/kamaz/')) return url;
    return localCarUrl(carId, index, 'kamaz');
  }
  if (cat === 'parts') {
    if (url && String(url).startsWith('/parts/')) return url;
    return localCarUrl(carId, index, 'parts');
  }
  if (cat === 'special') {
    if (url && String(url).startsWith('/trucks/')) return url;
    return '/trucks/3.jpg';
  }
  if (cat === 'commercial') {
    if (url && String(url).startsWith('/trucks/')) return url;
    return localCarUrl(carId, index, 'commercial');
  }
  if (
    url &&
    (String(url).startsWith('/uploads/') ||
      String(url).startsWith('/cars/') ||
      String(url).startsWith('/trucks/') ||
      String(url).startsWith('/homes/') ||
      String(url).startsWith('/kamaz/') ||
      String(url).startsWith('/parts/') ||
      url === '/hero.jpg')
  ) {
    return url;
  }
  return localCarUrl(carId, index, 'passenger');
}

export function shapeCar(row, favoriteIds = []) {
  if (!row) return row;
  const images = parseImages(row.images).map((img, i) => ({
    ...(typeof img === 'object' && img ? img : { url: img }),
    url: rewriteImageUrl(typeof img === 'object' ? img.url : img, row.id, i, row.category),
  }));
  const filled = images.length ? images : [{ id: 0, url: localCarUrl(row.id, 0, row.category), sort_order: 0 }];
  return {
    ...row,
    images: filled,
    is_favorite: favoriteIds.includes(row.id),
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
    res.json({
      success: true,
      ...paginate({ rows: rows.map((r) => shapeCar(r, favoriteIds)), total, page, limit }),
    });
  }),

  featured: asyncHandler(async (req, res) => {
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const rows = await CarModel.featured(8);
    res.json({ success: true, data: rows.map((r) => shapeCar(r, favoriteIds)) });
  }),

  recent: asyncHandler(async (req, res) => {
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const rows = await CarModel.recent(8);
    res.json({ success: true, data: rows.map((r) => shapeCar(r, favoriteIds)) });
  }),

  popular: asyncHandler(async (req, res) => {
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const rows = await CarModel.popular(8);
    res.json({ success: true, data: rows.map((r) => shapeCar(r, favoriteIds)) });
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
    const car = await withTransaction(async (client) => {
      if (req.user.role === 'USER') {
        await client.query(`UPDATE users SET role = 'SELLER', updated_at = NOW() WHERE id = $1`, [req.user.id]);
      }
      const created = await CarModel.create(
        {
          seller_id: req.user.id,
          brand_id: Number(req.body.brand_id),
          model_id: Number(req.body.model_id),
          year: Number(req.body.year),
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
          category: req.body.category || 'passenger',
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
