import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sql from "../db";
import { sendVerificationCode } from "../utils/email";
import {
  checkPending,
  emailExists,
  generateCode,
  phoneExists,
  processVerification,
} from "../services/authService";
import { handleVerificationError } from "../utils/handleVerificationError";

/* ================= REGISTER ================= */

export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      password,
      phoneNumber,
      role,
    } = req.body;

    const email = req.body.email.trim().toLowerCase();

    if (await emailExists(email))
      return res.status(400).send("❌ البريد الإلكتروني موجود بالفعل");

    if (await phoneExists(phoneNumber))
      return res.status(400).send("❌ رقم الهاتف موجود بالفعل");

    const existingPending = await checkPending({ email });
    if (existingPending.status === "valid") return resendCode(req, res);

    await sql`DELETE FROM pending_users WHERE expires_at < NOW()`;

    const hashed = await bcrypt.hash(password, 10);
    const code = generateCode();

    await sql`
      INSERT INTO pending_users
      (first_name, last_name, gender, date_of_birth,
       email, password, phone_number, role, status,
       code, attempts_left, expires_at)
      VALUES (
        ${firstName},
        ${lastName},
        ${gender},
        ${dateOfBirth},
        ${email},
        ${hashed},
        ${phoneNumber},
        ${role},
        ${"Active"},
        ${code},
        5,
        ${new Date(Date.now() + 10 * 60 * 1000)}
      )
    `;

    await sendVerificationCode(email, firstName, lastName, code);

    return res.send("✔️ تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

/* ================= VERIFY REGISTER ================= */

export const verifyRegister = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { code } = req.body;

    const result = await processVerification(email, code, "insert");

    if (result.status !== "success")
      return handleVerificationError(res, result);

    return res.send("✔️ تم إنشاء الحساب بنجاح!");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

/* ================= RESEND ================= */

export const resendCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const result = await checkPending({ email });

    if (result.status !== "valid")
      return res.status(400).send("❌ لا يوجد طلب صالح لهذا البريد.");

    const newCode = generateCode();

    await sql`
      UPDATE pending_users
      SET code = ${newCode},
          expires_at = ${new Date(Date.now() + 10 * 60 * 1000)},
          attempts_left = 5
      WHERE email = ${email}
    `;

    await sendVerificationCode(
      result.user.email,
      result.user.first_name,
      result.user.last_name,
      newCode,
    );

    return res.send("✔️ تم إرسال رمز جديد إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
