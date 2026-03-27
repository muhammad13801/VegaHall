import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

interface Hall {
  id: number;
  name: string;
  city: string;
  address: string;
  capacity: number;
  price: number;
  status: string;
  images: string[];
  videos: string[];
}

export const ownerHalls = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const offset = (page - 1) * limit;

  try {
    // Select specific fields and aggregate images/videos
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
        ) as videos
      FROM halls h
      WHERE h.owner_id = ${userId}
      ORDER BY h.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json(owner);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
