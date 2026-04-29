import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import type { UserTable } from "../../services/authService.js";

export const updatePhone = async (req: AuthRequest, res: Response) => {
  try {
    const { phone } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const [userData] = await sql<UserTable[]>`
      SELECT phone_number FROM users WHERE id = ${userId}
    `;
    if (!userData) return res.status(404).send("❌ المستخدم غير موجود");

    await sql`
      UPDATE users SET phone_number = ${phone} WHERE id = ${userId}
    `;

    res.send("✔️ تم تحديث رقم الهاتف بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
