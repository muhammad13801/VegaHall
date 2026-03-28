import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

export interface Hall {
  id: number;
  name: string;
  city: string;
  address: string;
  capacity: number;
  price: number;
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
    const owner = await sql<Hall[]>`
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
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'video'),
          '[]'::json
        ) as videos,
        ROUND(AVG(r.rating), 1) as avg_rating,
        COUNT(r.id) FILTER (WHERE r.comment IS NOT NULL AND r.comment != '') as comment_count
      FROM halls h
      LEFT JOIN ratings r ON r.hall_id = h.id
      WHERE h.owner_id = ${userId}
      GROUP BY h.id
      ORDER BY h.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json(owner);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
