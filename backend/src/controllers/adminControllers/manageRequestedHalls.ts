import { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import type { Response } from "express";
import { insertNotification } from "../userControllers/notificationsController.js";

export const getRequestedHalls = async (req: AuthRequest, res: Response) => {
  try {
    const halls = await sql`
        SELECT h.id, h.hall_name, h.base_price, h.city, h.address, h.capacity, h.description,
        h.latitude, h.longitude, u.first_name, u.last_name, m.type, m.url
        FROM halls h, users u, media m
        WHERE h.status = 'pending' AND h.owner_id = u.id AND m.hall_id = h.id`;

    return res.send(halls);
  } catch (err) {
    console.error("GET REQUESTED HALLS ERROR:", err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

export const approveHall = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(401).send("❌ مستخدم غير مصرح");

    const [hall] = await sql`
      UPDATE halls
      SET status = 'active'
      WHERE id = ${id}
      RETURNING owner_id
    `;

    if (!hall) return res.status(404).send("❌ القاعة غير موجودة");
    insertNotification(
      hall.owner_id,
      "تمت الموافقة على قاعتك",
      "تهانينا! تم الموافقة على قاعتك وهي الآن نشطة وجاهزة للحجز.",
      "hall_approved",
    );

    return res.send("✔️ تم الموافقة على القاعة");
  } catch (err) {
    console.error("MANAGE REQUESTED HALLS ERROR:", err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

export const rejectHall = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;
    if (!id) return res.status(400).send("❌ مستخدم غير مصرح");
    if (!reason) return res.status(400).send("❌ سبب الرفض مطلوب");

    const [hall] = await sql`
  UPDATE halls
  SET status = 'rejected', rejection_reason = ${reason}
  WHERE id = ${id}
  RETURNING owner_id
`;

    if (!hall) return res.status(404).send("❌ القاعة غير موجودة");
    await insertNotification(
      hall.owner_id,
      "تم رفض قاعتك",
      `نأسف لإبلاغك أن قاعتك تم رفضها. السبب: ${reason}`,
      "hall_rejected",
    );

    return res.send("✔️ تم رفض القاعة");
  } catch (err) {
    console.error("MANAGE REQUESTED HALLS ERROR:", err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
