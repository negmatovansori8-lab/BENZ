import { FavoriteModel } from '../models/Favorite.js';
import { CarModel } from '../models/Car.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { notify } from '../services/analyticsService.js';
import { withTransaction } from '../config/db.js';
import { shapeCar } from './carController.js';

function shape(row) {
  return shapeCar(row, [row.id]);
}

export const FavoriteController = {
  list: asyncHandler(async (req, res) => {
    const favs = await FavoriteModel.list(req.user.id);
    const cars = [];
    for (const f of favs) {
      const car = await CarModel.findById(f.car_id);
      if (car) cars.push(shape(car));
    }
    res.json({ success: true, data: cars });
  }),

  add: asyncHandler(async (req, res) => {
    const carId = Number(req.body.car_id || req.body.carId);
    const car = await CarModel.findById(carId);
    if (!car) throw new AppError('Car not found', 404);

    const added = await withTransaction(async (client) => {
      const row = await FavoriteModel.add(req.user.id, carId, client);
      if (row) await CarModel.bumpFavorite(carId, 1, client);
      return row;
    });

    if (added) {
      await notify({
        userId: car.seller_id,
        type: 'favorite',
        title: 'Car added to favorites',
        body: `${req.user.name} saved your ${car.brand} ${car.model}.`,
        relatedId: car.id,
      });
    }

    res.status(201).json({ success: true, message: 'Added to favorites' });
  }),

  remove: asyncHandler(async (req, res) => {
    const carId = Number(req.params.id);
    const removed = await FavoriteModel.remove(req.user.id, carId);
    if (removed) await CarModel.bumpFavorite(carId, -1);
    res.json({ success: true, message: 'Removed from favorites' });
  }),
};
