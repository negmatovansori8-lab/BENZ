import { query } from '../config/db.js';

export const MessageModel = {
  async findConversation({ buyerId, sellerId, carId }) {
    const { rows } = await query(
      `SELECT * FROM conversations WHERE buyer_id = $1 AND seller_id = $2 AND car_id IS NOT DISTINCT FROM $3`,
      [buyerId, sellerId, carId || null]
    );
    return rows[0] || null;
  },

  async getConversation(id) {
    const { rows } = await query(`SELECT * FROM conversations WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async createConversation({ buyerId, sellerId, carId }) {
    const { rows } = await query(
      `INSERT INTO conversations (buyer_id, seller_id, car_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (buyer_id, seller_id, car_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [buyerId, sellerId, carId || null]
    );
    return rows[0];
  },

  async listForUser(userId) {
    const { rows } = await query(
      `SELECT conv.*,
              CASE WHEN conv.buyer_id = $1 THEN su.name ELSE bu.name END AS other_name,
              CASE WHEN conv.buyer_id = $1 THEN su.avatar ELSE bu.avatar END AS other_avatar,
              CASE WHEN conv.buyer_id = $1 THEN conv.seller_id ELSE conv.buyer_id END AS other_id,
              b.name AS brand, m.name AS model, c.year AS car_year, c.price_usd,
              (SELECT url FROM car_images WHERE car_id = conv.car_id ORDER BY sort_order LIMIT 1) AS car_image,
              (SELECT content FROM messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) AS last_at,
              (SELECT COUNT(*)::int FROM messages WHERE conversation_id = conv.id AND is_read = FALSE AND sender_id <> $1) AS unread
       FROM conversations conv
       JOIN users bu ON bu.id = conv.buyer_id
       JOIN users su ON su.id = conv.seller_id
       LEFT JOIN cars c ON c.id = conv.car_id
       LEFT JOIN brands b ON b.id = c.brand_id
       LEFT JOIN models m ON m.id = c.model_id
       WHERE conv.buyer_id = $1 OR conv.seller_id = $1
       ORDER BY COALESCE(
         (SELECT created_at FROM messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1),
         conv.updated_at
       ) DESC`,
      [userId]
    );
    return rows;
  },

  async messages(conversationId) {
    const { rows } = await query(
      `SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );
    return rows;
  },

  async send({ conversationId, senderId, content }) {
    const { rows } = await query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, senderId, content]
    );
    await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
    return rows[0];
  },

  async markRead(conversationId, userId) {
    await query(
      `UPDATE messages SET is_read = TRUE
       WHERE conversation_id = $1 AND sender_id <> $2 AND is_read = FALSE`,
      [conversationId, userId]
    );
  },

  async unreadCount(userId) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE m.is_read = FALSE AND m.sender_id <> $1
         AND (c.buyer_id = $1 OR c.seller_id = $1)`,
      [userId]
    );
    return rows[0].total;
  },
};
