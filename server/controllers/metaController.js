import { query } from '../config/db.js';
import { getRates, fetchLiveRates, convert } from '../utils/currency.js';
import { asyncHandler } from '../utils/AppError.js';
import { FavoriteModel } from '../models/Favorite.js';
import { CarModel } from '../models/Car.js';
import { AppError } from '../utils/AppError.js';
import { shapeCar } from './carController.js';

export const MetaController = {
  brands: asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT b.*, (SELECT json_agg(json_build_object('id', m.id, 'name', m.name) ORDER BY m.name)
                    FROM models m WHERE m.brand_id = b.id) AS models
       FROM brands b ORDER BY b.name`
    );
    res.json({ success: true, data: rows });
  }),

  locations: asyncHandler(async (_req, res) => {
    const { rows } = await query(`SELECT * FROM locations ORDER BY country, city`);
    res.json({ success: true, data: rows });
  }),

  rates: asyncHandler(async (_req, res) => {
    await fetchLiveRates();
    res.json({ success: true, data: getRates() });
  }),

  convert: asyncHandler(async (req, res) => {
    const amount = Number(req.query.amount || 0);
    const to = req.query.to || 'USD';
    res.json({ success: true, amount: convert(amount, to), currency: to, rates: getRates() });
  }),
};

export const ReviewController = {
  list: asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT r.*, u.name AS reviewer_name, u.avatar AS reviewer_avatar
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.seller_id = $1 ORDER BY r.created_at DESC`,
      [req.params.sellerId]
    );
    res.json({ success: true, data: rows });
  }),

  create: asyncHandler(async (req, res) => {
    const sellerId = Number(req.body.seller_id);
    if (sellerId === req.user.id) throw new AppError('You cannot review yourself', 400);
    const { rows } = await query(
      `INSERT INTO reviews (reviewer_id, seller_id, car_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, sellerId, req.body.car_id || null, Number(req.body.rating), sanitizeString(req.body.comment, 1000)]
    );
    res.status(201).json({ success: true, data: rows[0] });
  }),
};

export const ProfileController = {
  public: asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, name, email, phone, avatar, role, created_at FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('User not found', 404);
    const listings = await CarModel.bySeller(rows[0].id, 'APPROVED');
    res.json({ success: true, data: { user: rows[0], listings } });
  }),

  viewed: asyncHandler(async (req, res) => {
    const ids = (req.body.ids || []).slice(0, 12).map(Number).filter(Boolean);
    if (!ids.length) return res.json({ success: true, data: [] });
    const favoriteIds = req.user ? await FavoriteModel.ids(req.user.id) : [];
    const cars = [];
    for (const id of ids) {
      const car = await CarModel.findById(id);
      if (car && car.status === 'APPROVED') {
        cars.push(shapeCar(car, favoriteIds));
      }
    }
    res.json({ success: true, data: cars });
  }),
};
