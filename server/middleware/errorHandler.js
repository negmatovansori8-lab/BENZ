import { AppError } from '../utils/AppError.js';

export function notFound(_req, _res, next) {
  next(new AppError('Route not found', 404));
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED' || err.errors?.[0]?.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Database is not available. Please try again.',
    });
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 && isProd ? 'Something went wrong. Please try again.' : err.message || 'Something went wrong',
    details: err.details || undefined,
  });
}
