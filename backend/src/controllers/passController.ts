import { Request, Response } from "express";
import sql from "../db";
import bcrypt from "bcryptjs";
import { sendVerificationCode } from "../utils/email";
import {
  emailExists,
  checkPending,
  PendingUser,
  generateCode,
  processVerification,
} from "../services/authService";
import { resendCode } from "./signUpController";
import { handleVerificationError } from "../utils/handleVerificationError";

export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    if (!(await emailExists(email)))
      return res.status(400).send("البريد الإلكتروني غير مسجل على النظام");

    const existing = await checkPending({ email });
    if (existing.status === "valid") return resendCode(req, res);

    await sql`DELETE FROM pending_users WHERE expires_at < NOW()`;

    const [userData] = await sql<PendingUser[]>`
      SELECT *
      FROM users
      WHERE email = ${email}
    `;

    if (!userData) return res.status(404).send("المستخدم غير موجود");

    const code = generateCode();

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
        ${userData.email},
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
      userData.email,
      userData.first_name,
      userData.last_name,
      code,
    );

    return res.send("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("خطأ في الخادم");
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

    return res.send("✔️ تم تاكيد الرمز بنجاح!");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

export const updateNewPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await sql`UPDATE users SET password = ${hash} WHERE email = ${email}`;
    await sql`DELETE FROM pending_users WHERE email = ${email}`;

    res.send("✔️ تم تغيير كلمة المرور بنجاح");
  } catch (err) {
    return res.send(500).send("❌ خطأ في الخادم");
  }
};
