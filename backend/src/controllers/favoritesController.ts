import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

export const getFavorites = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const offset = (page - 1) * limit;

  try {
    const favorites = await sql`
      SELECT 
        h.id, 
        h.hall_name as name, 
        h.city, 
        h.address, 
        h.capacity, 
        h.price, 
        h.status,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as images,
        ROUND(AVG(r.rating), 1) as avg_rating,
        COUNT(r.id) FILTER (WHERE r.comment IS NOT NULL AND r.comment != '') as comment_count
      FROM favorite_halls f
      JOIN halls h ON f.hall_id = h.id
      LEFT JOIN ratings r ON r.hall_id = h.id
      WHERE f.user_id = ${userId}
      GROUP BY 
        h.id, 
        h.hall_name, 
        h.city, 
        h.address, 
        h.capacity, 
        h.price, 
        h.status
      ORDER BY h.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json(favorites);
  } catch (err) {
    console.error("GET FAVORITES ERROR:", err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const { hallId } = req.body;
  if (!hallId) return res.status(400).send("❌ رقم الصالة مطلوب");

  try {
    const [existing] = await sql`
      SELECT 1 FROM favorite_halls WHERE customer_id = ${userId} AND hall_id = ${hallId}
    `;

    if (existing) {
      await sql`DELETE FROM favorite_halls WHERE customer_id = ${userId} AND hall_id = ${hallId}`;
      return res.json({ message: "تمت إزالة الصالة من المفضلة", status: "removed" });
    } else {
      await sql`
        INSERT INTO favorite_halls (customer_id, hall_id)
        VALUES (${userId}, ${hallId})
      `;
      return res.json({ message: "تمت إضافة الصالة للمفضلة", status: "added" });
    }
  } catch (err) {
    console.error("TOGGLE FAVORITE ERROR:", err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
