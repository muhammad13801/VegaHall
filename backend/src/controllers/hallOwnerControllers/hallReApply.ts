import { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import type { Response } from "express";

export const hallReapply = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send("❌ معرف القاعة مطلوب");

    await sql`
      UPDATE halls
      SET status = 'pending', rejection_reason = NULL
      WHERE id = ${id} AND status = 'rejected'
    `;

    return res.send("✔️ تم إعادة تقديم الطلب بنجاح");
  } catch (error) {
    console.error("Error reapplying hall:", error);
    return res.status(500).send("❌ حدث خطأ أثناء إعادة تقديم الطلب");
  }
};
