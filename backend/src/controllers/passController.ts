import { Request, Response } from "express";
import sql from "../db";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/email";
import {
  emailExists,
  checkPending,
  UserTable,
  generateCode,
  processVerification,
} from "../services/authService";
import { handleVerificationError } from "../utils/handleVerificationError";

export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    if (!(await emailExists(email)))
      return res.status(400).send("❌ البريد الإلكتروني غير مسجل على النظام");

    const [userData] = await sql<UserTable[]>`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (!userData) return res.status(404).send("❌ المستخدم غير موجود");

    // If a valid pending reset already exists, just resend the same code
    const existing = await checkPending({ email });
    if (existing.status === "valid") {
      await sendVerificationCode(
        userData.email,
        userData.first_name,
        userData.last_name,
        userData.code,
      );
      return res.send("✔️ تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
    }

    const code = generateCode();

    await sql`
      UPDATE users
      SET code = ${code},
          attempts_left = 5,
          expires_at = ${new Date(Date.now() + 10 * 60 * 1000)}
      WHERE email = ${email}
    `;

    await sendVerificationCode(
      userData.email,
      userData.first_name,
      userData.last_name,
      code,
    );

    return res.send("✔️ تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

/* ================= VERIFY RESET PASSWORD ================= */

export const verifyResetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { code } = req.body;

    const result = await processVerification(email, code, "verifyOnly");

    if (result.status !== "success")
      return handleVerificationError(res, result);

    return res.send("✔️ تم تأكيد الرمز بنجاح!");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

/* ================= UPDATE NEW PASSWORD ================= */

export const updateNewPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET password = ${hash},
          code = null,
          attempts_left = null,
          expires_at = null
      WHERE email = ${email}
    `;

    res.send("✔️ تم تغيير كلمة المرور بنجاح");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
