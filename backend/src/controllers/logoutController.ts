import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

export const logout = async (req: AuthRequest, res: Response) => {
  const sessionId = req.headers.authorization!;
  await sql`DELETE FROM sessions WHERE id = ${sessionId} `;

  res.send("✔️ تم تسجبل الخروج بنجاح");
};
