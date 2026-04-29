import type { Response } from "express";
import type { UserTable } from "../../services/authService.ts";
import type { AuthRequest } from "../../middleware/sessionMiddleware.ts";
import sql from "../../db.ts";

export const updateName = async (req: AuthRequest, res: Response) => {
  try {
    const { first_name, last_name } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const [userData] = await sql<UserTable[]>`
      SELECT first_name, last_name
      FROM users
      WHERE id = ${userId}
    `;
    if (!userData) return res.status(404).send("❌ المستخدم غير موجود");

    await sql`
      UPDATE users
      SET first_name = ${first_name}, last_name = ${last_name}
      WHERE id = ${userId}
    `;

    res.send("✔️ تم تحديث الاسم بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
