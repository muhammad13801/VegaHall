import { Response } from "express";

import { AuthRequest } from "../middleware/sessionMiddleware";
import sql from "../db";
import {
  emailExists,
  generateCode,
  processVerification,
  UserTable,
} from "../services/authService";
import { sendVerificationCode } from "../utils/email";
import { handleVerificationError } from "../utils/handleVerificationError";

export const checkEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const userId = req.userId;
    console.log(email, userId);
    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    if (await emailExists(email))
      return res.status(409).send("❌ البريد الإلكتروني موجود");

    const [userData] = await sql<UserTable[]>`
                SELECT *
                FROM users
                WHERE id = ${userId}
            `;
    if (!userData) return res.status(404).send("❌ المستخدم غير موجود");

    const code = generateCode();

    // Store in pending_users to use processVerification later
    await sql`DELETE FROM pending_users WHERE email = ${email} OR expires_at < NOW()`;
    await sql`
      INSERT INTO pending_users
      (first_name, last_name, gender, date_of_birth,
       email, password, phone_number, role, status,
       code, attempts_left, expires_at)
      VALUES (
        ${userData.first_name},
        ${userData.last_name},
        ${userData.gender},
        ${userData.date_of_birth},
        ${email},
        ${userData.password},
        ${userData.phone_number},
        ${userData.role},
        ${userData.status},
        ${code},
        5,
        ${new Date(Date.now() + 10 * 60 * 1000)}
      )
    `;

    await sendVerificationCode(
      email,
      userData.first_name,
      userData.last_name,
      code,
    );

    return res.send("✔️ تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const updateEmail = async (req: AuthRequest, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const code = req.body.code;
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const result = await processVerification(email, code, "verifyOnly");
    if (result.status !== "success")
      return handleVerificationError(res, result);

    await sql`UPDATE users SET email = ${email} WHERE id = ${userId}`;
    await sql`DELETE FROM pending_users WHERE email = ${email}`;
    res.send("✅ تم تحديث البريد الإلكتروني بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
