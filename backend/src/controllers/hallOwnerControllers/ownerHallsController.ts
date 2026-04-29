import { Response } from "express";
import sql from "../../db";
import { AuthRequest } from "../../middleware/sessionMiddleware";

export interface Hall {
  id: number;
  name: string;
  city: string;
  address: string;
  capacity: number;
  base_price: number;
  status: string;
  images: string[];
  videos: string[];
  avg_rating: number | null;
  comment_count: number;
}

export const ownerHalls = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const offset = (page - 1) * limit;

  try {
    const halls = await sql<Hall[]>`
      SELECT
        h.id, 
        h.hall_name AS name, 
        h.city, 
        h.address, 
        h.capacity, 
        h.base_price, 
        h.status,
        -- Get up to 3 images
        COALESCE(
          (SELECT json_agg(url) FROM (SELECT url FROM media WHERE hall_id = h.id AND type = 'image' LIMIT 3) t),
          '[]'::json
        ) AS images,
        -- Get up to 1 video
        COALESCE(
          (SELECT json_agg(url) FROM (SELECT url FROM media WHERE hall_id = h.id AND type = 'video' LIMIT 1) t),
          '[]'::json
        ) AS videos,
        ROUND(AVG(r.rating), 1) AS avg_rating,
        COUNT(r.comment) AS comment_count
      FROM halls h
      LEFT JOIN ratings r ON r.hall_id = h.id
      WHERE h.owner_id = ${userId}
      GROUP BY h.id
      ORDER BY h.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json(halls);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
