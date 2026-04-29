import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";

interface Comment {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  first_name: string;
  last_name: string;
}

export const getHallComments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const comments = await sql<Comment[]>`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name
      FROM ratings r
      JOIN users u ON u.id = r.customer_id
      WHERE r.hall_id = ${id} 
        AND r.comment IS NOT NULL 
        AND r.comment != ''
      ORDER BY r.created_at DESC
    `;

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
