import { UserModel } from '../models/User.js';
import { CarModel } from '../models/Car.js';
import { query } from '../config/db.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { parsePagination } from '../utils/helpers.js';
import { AnalyticsService, notify } from '../services/analyticsService.js';

export const AdminController = {
  stats: asyncHandler(async (req, res) => {
    const data = await AnalyticsService.dashboard();
    res.json({ success: true, data });
  }),

  analytics: asyncHandler(async (req, res) => {
    const period = req.query.period || 'monthly';
    const [sales, brands, users, revenue] = await Promise.all([
      AnalyticsService.sales(period),
      AnalyticsService.popularBrands(),
      AnalyticsService.userGrowth(),
      AnalyticsService.revenue(),
    ]);
    res.json({ success: true, data: { sales, brands, users, revenue } });
  }),

  users: asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query);
    const result = await UserModel.list({ q: req.query.q, role: req.query.role, page, limit, offset });
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) || 1 },
    });
  }),

  getUser: asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    const listings = await CarModel.bySeller(user.id);
    res.json({ success: true, data: { user, listings } });
  }),

  blockUser: asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.user.id) throw new AppError('You cannot block yourself', 400);
    const user = await UserModel.setBlocked(req.params.id, true);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, user });
  }),

  unblockUser: asyncHandler(async (req, res) => {
    const user = await UserModel.setBlocked(req.params.id, false);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, user });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.user.id) throw new AppError('You cannot delete yourself', 400);
    await UserModel.remove(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  }),

  cars: asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await CarModel.list({
      ...req.query,
      includeAllStatuses: true,
      status: req.query.status,
      q: req.query.q,
      page,
      limit,
      offset,
    });
    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  }),

  approve: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    const car = await CarModel.update(existing.id, { status: 'APPROVED' });
    await notify({
      userId: existing.seller_id,
      type: 'listing_approved',
      title: 'Listing approved',
      body: `Your ${existing.brand} ${existing.model} is now live.`,
      relatedId: existing.id,
    });
    res.json({ success: true, data: car });
  }),

  reject: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    const car = await CarModel.update(existing.id, { status: 'REJECTED' });
    await notify({
      userId: existing.seller_id,
      type: 'listing_rejected',
      title: 'Listing rejected',
      body: req.body.reason || `Your ${existing.brand} ${existing.model} listing was rejected.`,
      relatedId: existing.id,
    });
    res.json({ success: true, data: car });
  }),

  feature: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    const car = await CarModel.update(existing.id, { is_featured: !existing.is_featured });
    res.json({ success: true, data: car });
  }),

  updateCar: asyncHandler(async (req, res) => {
    const existing = await CarModel.findById(req.params.id);
    if (!existing) throw new AppError('Car not found', 404);
    const car = await CarModel.update(existing.id, req.body);
    res.json({ success: true, data: car });
  }),

  deleteCar: asyncHandler(async (req, res) => {
    await CarModel.remove(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  }),
};
