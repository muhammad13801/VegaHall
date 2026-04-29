import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import {
  emailExists,
  generateCode,
  type UserTable,
} from "../../services/authService.js";
import { sendVerificationCode } from "../../utils/email.js";

export const checkEmail = async (req: AuthRequest, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const userId = req.userId;

    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    if (await emailExists(email))
      return res.status(409).send("❌ البريد الإلكتروني موجود");

    const [userData] = await sql<UserTable[]>`
      SELECT * FROM users WHERE id = ${userId}
    `;
    if (!userData) return res.status(404).send("❌ المستخدم غير موجود");

    const code = generateCode();

    // Store the new email + code temporarily on the user row itself
    await sql`
      UPDATE users
      SET code = ${code},
          attempts_left = 5,
          expires_at = ${new Date(Date.now() + 10 * 60 * 1000)}
      WHERE id = ${userId}
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

    // Verify the code directly against the user's own row
    const [userData] = await sql<UserTable[]>`
      SELECT * FROM users WHERE id = ${userId}
    `;

    if (!userData) return res.status(404).send("❌ المستخدم غير موجود");

    if (!userData.code || !userData.expires_at || !userData.attempts_left)
      return res.status(400).send("❌ لا يوجد طلب تحقق نشط");

    if (new Date() > userData.expires_at) {
      await sql`
        UPDATE users SET code = null, attempts_left = null, expires_at = null
        WHERE id = ${userId}
      `;
      return res.status(400).send("❌ انتهت صلاحية الرمز");
    }

    if (userData.attempts_left < 1) {
      await sql`
        UPDATE users SET code = null, attempts_left = null, expires_at = null
        WHERE id = ${userId}
      `;
      return res.status(400).send("❌ لقد استنفدت جميع المحاولات");
    }

    if (userData.code !== code) {
      await sql`
        UPDATE users SET attempts_left = attempts_left - 1 WHERE id = ${userId}
      `;
      return res
        .status(400)
        .send(
          `❌ الرمز غير صحيح، المحاولات المتبقية: ${userData.attempts_left - 1}`,
        );
    }

    await sql`
      UPDATE users
      SET email = ${email},
          code = null,
          attempts_left = null,
          expires_at = null
      WHERE id = ${userId}
    `;

    res.send("✔️ تم تحديث البريد الإلكتروني بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
