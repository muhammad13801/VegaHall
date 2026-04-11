import { Response } from "express";
import sql from "../db";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middleware/sessionMiddleware";
import { UserTable } from "../services/authService";
import { comparePassword } from "./loginController";

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, password } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const [userData] = await sql<UserTable[]>`
      SELECT password FROM users WHERE id = ${userId}
    `;

    if (!userData)
      return res.status(404).send("❌ المستخدم غير موجود على النظام");

    if (!(await comparePassword(oldPassword, userData.password)))
      return res.status(401).send("❌ كلمة المرور الحالية خاطئة");

    const hashedNewPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users SET password = ${hashedNewPassword} WHERE id = ${userId}
    `;

    return res.status(200).send("✅ تم تغيير كلمة المرور بنجاح");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
