import { Request, Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

export const getHallRatings = async (req: Request, res: Response) => {
  try {
    const hallId = Number(req.params.hallId);
    const ratings = await sql`
      SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      WHERE r.hall_id = ${hallId}
      ORDER BY r.created_at DESC
    `;
    res.json(ratings);
  } catch (error: any) {
    res.status(500).send("❌ خطأ في الخادم: " + error.message);
  }
};

export const createRating = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { hallId, bookingId, rating, comment } = req.body;
    if (!userId) return res.status(401).send("Unauthorized");

    // Check if user actually booked this hall
    const [booking] = await sql`
      SELECT id FROM bookings WHERE id = ${bookingId} AND customer_id = ${userId} AND hall_id = ${hallId}
    `;
    if (!booking) return res.status(403).send("❌ لا يمكنك تقييم صالة لم تحجزها");

    // Check if already rated
    const [existing] = await sql`
        SELECT id FROM ratings WHERE booking_id = ${bookingId}
    `;
    if (existing) return res.status(400).send("❌ لقد قمت بتقييم هذا الحجز مسبقاً");

    const [newRating] = await sql`
      INSERT INTO ratings (hall_id, customer_id, booking_id, rating, comment)
      VALUES (${hallId}, ${userId}, ${bookingId}, ${rating}, ${comment})
      RETURNING *
    `;

    res.status(201).json(newRating);
  } catch (error: any) {
    res.status(500).send("❌ خطأ في الخادم: " + error.message);
  }
};
