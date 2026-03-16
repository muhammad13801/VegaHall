import { Request, Response } from "express";
import sql from "../db";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { UserTable } from "../services/authService";

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [userData] = await sql<
      UserTable[]
    >`SELECT id, email, password, role, status FROM users WHERE email = ${email}`;

    if (!userData)
      return res.status(401).send("❌ المستخدم غير موجود على النظام");

    if (userData.status === "Inactive")
      return res.status(401).send("تم تعطيل حسابك");

    if (!(await comparePassword(password, userData.password)))
      return res.status(401).send("❌ كلمة المرور خاطئة");

    const sessionId = uuid();
    await sql`INSERT INTO sessions(id, user_id, last_activity)
    VALUES(${sessionId}, ${userData.id}, NOW())`;

    res.json({
      sessionId,
      role: userData.role,
      message: "✔️ تم تسجبل الدخول بنجاح",
    });
  } catch (err) {
    return res.status(500).send("❌ خطا في الخادم");
  }
};
