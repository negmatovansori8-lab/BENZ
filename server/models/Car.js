import { query } from '../config/db.js';

export const CAR_SELECT = `
  c.id, c.seller_id, c.brand_id, c.model_id, c.year, c.price_usd, c.mileage,
  c.engine, c.power, c.fuel, c.transmission, c.body, c.color, c.vin,
  c.location_id, c.description, c.phone, c.status, c.is_featured, c.views,
  c.favorites_count, c.sold_at, c.created_at, c.updated_at, c.category,
  b.name AS brand, m.name AS model,
  l.country, l.city,
  u.name AS seller_name, u.email AS seller_email, u.phone AS seller_phone, u.avatar AS seller_avatar,
  (SELECT json_agg(json_build_object('id', ci.id, 'url', ci.url, 'sort_order', ci.sort_order) ORDER BY ci.sort_order)
     FROM car_images ci WHERE ci.car_id = c.id) AS images
`;

const FROM = `
  FROM cars c
  JOIN brands b ON b.id = c.brand_id
  JOIN models m ON m.id = c.model_id
  LEFT JOIN locations l ON l.id = c.location_id
  JOIN users u ON u.id = c.seller_id
`;

export const CarModel = {
  async findById(id) {
    const { rows } = await query(`SELECT ${CAR_SELECT} ${FROM} WHERE c.id = $1`, [id]);
    return rows[0] || null;
  },

  async incrementViews(id) {
    await query(`UPDATE cars SET views = views + 1 WHERE id = $1`, [id]);
  },

  async list(filters) {
    const { where, params, i } = buildWhere(filters);
    const sort = sortClause(filters.sort);
    const count = await query(`SELECT COUNT(*)::int AS total ${FROM} ${where}`, params);
    const { rows } = await query(
      `SELECT ${CAR_SELECT} ${FROM} ${where} ${sort} LIMIT $${i} OFFSET $${i + 1}`,
      [...params, filters.limit, filters.offset]
    );
    return { rows, total: count.rows[0].total };
  },

  async featured(limit = 8) {
    const { rows } = await query(
      `SELECT ${CAR_SELECT} ${FROM}
       WHERE c.status = 'APPROVED' AND c.is_featured = TRUE
       ORDER BY c.updated_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async recent(limit = 8) {
    const { rows } = await query(
      `SELECT ${CAR_SELECT} ${FROM}
       WHERE c.status = 'APPROVED'
       ORDER BY c.created_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async popular(limit = 8) {
    const { rows } = await query(
      `SELECT ${CAR_SELECT} ${FROM}
       WHERE c.status = 'APPROVED'
       ORDER BY c.views DESC, c.favorites_count DESC LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async bySeller(sellerId, status) {
    const params = [sellerId];
    let extra = '';
    if (status) {
      extra = ' AND c.status = $2';
      params.push(status);
    }
    const { rows } = await query(
      `SELECT ${CAR_SELECT} ${FROM} WHERE c.seller_id = $1${extra} ORDER BY c.created_at DESC`,
      params
    );
    return rows;
  },

  async create(data, client = { query }) {
    const { rows } = await client.query(
      `INSERT INTO cars (
         seller_id, brand_id, model_id, year, price_usd, mileage, engine, power,
         fuel, transmission, body, color, vin, location_id, description, phone, status, category
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        data.seller_id, data.brand_id, data.model_id, data.year, data.price_usd,
        data.mileage, data.engine, data.power, data.fuel, data.transmission,
        data.body, data.color, data.vin, data.location_id, data.description,
        data.phone, data.status || 'PENDING', data.category || 'passenger',
      ]
    );
    return rows[0];
  },

  async update(id, fields, client = { query }) {
    const allowed = [
      'brand_id', 'model_id', 'year', 'price_usd', 'mileage', 'engine', 'power',
      'fuel', 'transmission', 'body', 'color', 'vin', 'location_id', 'description',
      'phone', 'status', 'is_featured', 'sold_at', 'category',
    ];
    const sets = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${i++}`);
        values.push(fields[key]);
      }
    }
    if (!sets.length) return this.findById(id);
    values.push(id);
    await client.query(
      `UPDATE cars SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
      values
    );
    return this.findById(id);
  },

  async remove(id) {
    await query(`DELETE FROM cars WHERE id = $1`, [id]);
  },

  async addImages(carId, urls, client = { query }) {
    for (let i = 0; i < urls.length; i++) {
      await client.query(
        `INSERT INTO car_images (car_id, url, sort_order) VALUES ($1, $2, $3)`,
        [carId, urls[i], i]
      );
    }
  },

  async replaceImages(carId, urls, client = { query }) {
    await client.query(`DELETE FROM car_images WHERE car_id = $1`, [carId]);
    await this.addImages(carId, urls, client);
  },

  async bumpFavorite(carId, delta, client = { query }) {
    await client.query(
      `UPDATE cars SET favorites_count = GREATEST(favorites_count + $1, 0) WHERE id = $2`,
      [delta, carId]
    );
  },

  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS active,
        COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'SOLD')::int AS sold,
        COALESCE(SUM(price_usd) FILTER (WHERE status = 'SOLD'), 0)::float AS gmv,
        COALESCE(SUM(price_usd) FILTER (WHERE status = 'SOLD') * 0.03, 0)::float AS revenue
      FROM cars
    `);
    return rows[0];
  },
};

function buildWhere(f) {
  const where = [];
  const params = [];
  let i = 1;

  if (!f.includeAllStatuses) {
    where.push(`c.status = $${i++}`);
    params.push(f.status || 'APPROVED');
  } else if (f.status) {
    where.push(`c.status = $${i++}`);
    params.push(f.status);
  }

  if (f.q) {
    where.push(`(
      b.name ILIKE $${i} OR m.name ILIKE $${i} OR
      (b.name || ' ' || m.name) ILIKE $${i} OR
      c.description ILIKE $${i} OR c.color ILIKE $${i} OR c.engine ILIKE $${i}
    )`);
    params.push(`%${f.q}%`);
    i++;
  }
  if (f.brand) {
    where.push(`b.name ILIKE $${i++}`);
    params.push(f.brand);
  }
  if (f.brandId) {
    where.push(`c.brand_id = $${i++}`);
    params.push(f.brandId);
  }
  if (f.model) {
    where.push(`m.name ILIKE $${i++}`);
    params.push(`%${f.model}%`);
  }
  if (f.minPrice) {
    where.push(`c.price_usd >= $${i++}`);
    params.push(f.minPrice);
  }
  if (f.maxPrice) {
    where.push(`c.price_usd <= $${i++}`);
    params.push(f.maxPrice);
  }
  if (f.yearFrom) {
    where.push(`c.year >= $${i++}`);
    params.push(f.yearFrom);
  }
  if (f.yearTo) {
    where.push(`c.year <= $${i++}`);
    params.push(f.yearTo);
  }
  if (f.minMileage != null && f.minMileage !== '') {
    where.push(`c.mileage >= $${i++}`);
    params.push(f.minMileage);
  }
  if (f.maxMileage != null && f.maxMileage !== '') {
    where.push(`c.mileage <= $${i++}`);
    params.push(f.maxMileage);
  }
  if (f.fuel) {
    where.push(`c.fuel = $${i++}`);
    params.push(f.fuel);
  }
  if (f.transmission) {
    where.push(`c.transmission = $${i++}`);
    params.push(f.transmission);
  }
  if (f.body) {
    where.push(`c.body = $${i++}`);
    params.push(f.body);
  }
  if (f.category === 'heavy') {
    where.push(`c.category IN ('commercial', 'special', 'kamaz')`);
  } else if (f.category) {
    where.push(`c.category = $${i++}`);
    params.push(f.category);
  }
  if (f.country) {
    where.push(`l.country ILIKE $${i++}`);
    params.push(f.country);
  }
  if (f.city) {
    where.push(`l.city ILIKE $${i++}`);
    params.push(`%${f.city}%`);
  }
  if (f.featured === 'true' || f.featured === true) {
    where.push(`c.is_featured = TRUE`);
  }
  if (f.sellerId) {
    where.push(`c.seller_id = $${i++}`);
    params.push(f.sellerId);
  }

  return {
    where: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params,
    i,
  };
}

function sortClause(sort) {
  switch (sort) {
    case 'oldest':
      return 'ORDER BY c.created_at ASC';
    case 'price_asc':
      return 'ORDER BY c.price_usd ASC';
    case 'price_desc':
      return 'ORDER BY c.price_usd DESC';
    case 'mileage_asc':
      return 'ORDER BY c.mileage ASC';
    case 'popular':
      return 'ORDER BY c.views DESC, c.favorites_count DESC';
    case 'newest':
    default:
      return 'ORDER BY c.created_at DESC';
  }
}
