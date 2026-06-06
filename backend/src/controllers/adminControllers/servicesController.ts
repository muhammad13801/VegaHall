import { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import type { Response } from "express";

export const renameRequestedMeal = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    if (!id) return res.status(400).send("❌ مستخدم غير مصرح");
    if (!name) return res.status(400).send("❌ اسم الوجبة مطلوب");

    await sql`UPDATE meal_requests SET name = ${name} WHERE id = ${id}`;
    return res.send("✔️ تم تحديث اسم الوجبة");
  } catch (err) {
    console.error("RENAME REQUESTED MEAL ERROR:", err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

export const renameRequestedService = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    if (!id) return res.status(400).send("❌ مستخدم غير مصرح");
    if (!name) return res.status(400).send("❌ اسم الخدمة مطلوب");

    await sql`UPDATE service_requests SET name = ${name} WHERE id = ${id}`;
    return res.send("✔️ تم تحديث اسم الوجبة");
  } catch (err) {
    console.error("RENAME REQUESTED SERVICE ERROR:", err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
