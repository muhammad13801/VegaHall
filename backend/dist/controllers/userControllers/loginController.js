import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import sql from "../../db.js";
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
export const login = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();
        const [userData] = await sql `
      SELECT id, email, password, role, status
      FROM users
      WHERE email = ${email}
    `;
        if (!userData)
            return res.status(401).send("❌ المستخدم غير موجود على النظام");
        if (userData.status === "pending")
            return res.status(401).send("❌ لم يتم تفعيل الحساب بعد");
        if (userData.status === "suspended")
            return res.status(401).send("❌ تم تعطيل حسابك");
        if (!(await comparePassword(password, userData.password)))
            return res.status(401).send("❌ كلمة المرور خاطئة");
        const sessionId = uuid();
        await sql `
      INSERT INTO sessions (id, user_id, last_activity)
      VALUES (${sessionId}, ${userData.id}, NOW())
    `;
        res.json({
            sessionId,
            role: userData.role,
            message: "✔️ تم تسجيل الدخول بنجاح",
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send("❌ خطأ في الخادم");
    }
};
