import { query } from '../config/db.js';
import { asyncHandler, AppError } from '../utils/AppError.js';

function shape(row) {
  let images = row.images;
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  if (!Array.isArray(images) || !images.length) {
    images = [{ url: `/homes/${((row.id - 1) % 3) + 1}.jpg` }];
  }
  return {
    ...row,
    images,
    location: row.city ? `${row.city}, ${row.country}` : row.country || null,
  };
}

const SELECT = `
  p.*, u.name AS seller_name, u.phone AS seller_phone, u.avatar AS seller_avatar,
  l.city, l.country,
  (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'sort_order', pi.sort_order) ORDER BY pi.sort_order)
     FROM property_images pi WHERE pi.property_id = p.id) AS images
`;

export const PropertyController = {
  list: asyncHandler(async (req, res) => {
    const kind = req.query.kind;
    const params = [];
    let where = `WHERE p.status = 'APPROVED'`;
    if (kind) {
      params.push(kind);
      where += ` AND p.kind = $${params.length}`;
    }
    const { rows } = await query(
      `SELECT ${SELECT} FROM properties p
       JOIN users u ON u.id = p.seller_id
       LEFT JOIN locations l ON l.id = p.location_id
       ${where}
       ORDER BY p.is_featured DESC, p.created_at DESC`,
      params
    );
    res.json({ success: true, data: rows.map(shape) });
  }),

  getOne: asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT ${SELECT} FROM properties p
       JOIN users u ON u.id = p.seller_id
       LEFT JOIN locations l ON l.id = p.location_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Not found', 404);
    await query(`UPDATE properties SET views = views + 1 WHERE id = $1`, [req.params.id]);
    res.json({ success: true, data: shape({ ...rows[0], views: rows[0].views + 1 }) });
  }),
};
