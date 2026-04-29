import type { Response } from "express";
import sql from "../../db.js";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.headers.authorization!;
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    res.send("✔️ تم تسجيل الخروج بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
