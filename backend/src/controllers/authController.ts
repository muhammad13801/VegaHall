import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { sendVerificationCode } from "../utils/email";
import sql from "../db";

type PendingUser = {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  email: string;
  password: string;
  phone_number: string;
  role: string;
  status: string;
  code: string;
  attempts_left: number;
  expires_at: Date;
};

const generateCode = (): string =>
  Math.floor(10000 + Math.random() * 90000).toString();

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      date_of_birth,
      password,
      phone_number,
      role,
    } = req.body;

    const email = req.body.email.trim().toLowerCase();

    // check users table
    const exists = await sql`
      SELECT 1 FROM users WHERE email = ${email}
    `;

    if (exists.length)
      return res.status(400).send("البريد الإلكتروني موجود بالفعل");

    // check pending
    const [pending] = await sql<PendingUser[]>`
      SELECT * FROM pending_users WHERE email = ${email}
    `;

    if (pending) {
      if (new Date() > pending.expires_at) {
        await sql`
          DELETE FROM pending_users WHERE email = ${email}
        `;
      } else {
        return verifyCode(req, res);
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const code = generateCode();

    await sql`
      INSERT INTO pending_users
      (first_name, last_name, gender, date_of_birth, email,
       password, phone_number, role, status,
       code, attempts_left, expires_at)
      VALUES (
        ${first_name},
        ${last_name},
        ${gender},
        ${date_of_birth},
        ${email},
        ${hashed},
        ${phone_number},
        ${role},
        ${role === "Customer" ? "Active" : "Inactive"},
        ${code},
        5,
        ${new Date(Date.now() + 10 * 60 * 1000)}
      )
    `;

    await sendVerificationCode(email, first_name, last_name, code);

    res.send("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطأ في الخادم");
  }
};

// Verify Code
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { code } = req.body;

    const [pendingUser] = await sql<PendingUser[]>`
      SELECT * FROM pending_users WHERE email = ${email}
    `;
    console.log(code);
    if (!pendingUser)
      return res.status(400).send("لا يوجد طلب تسجيل لهذا البريد.");

    if (new Date() > pendingUser.expires_at) {
      await sql`
        DELETE FROM pending_users WHERE email = ${email}
      `;
      return res.status(400).send("انتهت صلاحية الرمز. سجل مرة أخرى.");
    }

    if (pendingUser.attempts_left <= 0) {
      await sql`
        DELETE FROM pending_users WHERE email = ${email}
      `;
      return res.status(400).send("تم تجاوز عدد المحاولات. سجل مرة أخرى.");
    }

    if (pendingUser.code !== code) {
      await sql`
        UPDATE pending_users
        SET attempts_left = attempts_left - 1
        WHERE email = ${email}
      `;

      return res
        .status(400)
        .send(`رمز خاطئ. المحاولات المتبقية: ${pendingUser.attempts_left - 1}`);
    }

    // insert into users
    await sql`
      INSERT INTO users
      (first_name, last_name, gender, date_of_birth,
       email, password, phone_number, role, status)
      VALUES (
        ${pendingUser.first_name},
        ${pendingUser.last_name},
        ${pendingUser.gender},
        ${pendingUser.date_of_birth},
        ${pendingUser.email},
        ${pendingUser.password},
        ${pendingUser.phone_number},
        ${pendingUser.role},
        ${pendingUser.status}
      )
    `;

    await sql`
      DELETE FROM pending_users WHERE email = ${email}
    `;

    res.send("تم التحقق من البريد الإلكتروني وإنشاء الحساب بنجاح!");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطأ في الخادم");
  }
};

// Resend Code
export const resendCode = async (req: Request, res: Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const [pendingUser] = await sql<PendingUser[]>`
      SELECT * FROM pending_users WHERE email = ${email}
    `;

    console.log(pendingUser);
    if (!pendingUser)
      return res.status(400).send("لا يوجد طلب تسجيل لهذا البريد.");

    const newCode = generateCode();

    await sql`
      UPDATE pending_users
      SET code = ${newCode},
          expires_at = ${new Date(Date.now() + 10 * 60 * 1000)},
          attempts_left = 5
      WHERE email = ${email}
    `;

    await sendVerificationCode(
      pendingUser.email,
      pendingUser.first_name,
      pendingUser.last_name,
      newCode,
    );

    res.send("تم إرسال رمز جديد إلى بريدك الإلكتروني.");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطأ في الخادم");
  }
};
