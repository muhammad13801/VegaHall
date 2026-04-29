import sql from "../../db.js";
import bcrypt from "bcrypt";
import { comparePassword } from "./loginController.js";
export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, password } = req.body;
        const userId = req.userId;
        if (!userId)
            return res.status(401).send("❌ مستخدم غير مصرح");
        const [userData] = await sql `
      SELECT password FROM users WHERE id = ${userId}
    `;
        if (!userData)
            return res.status(404).send("❌ المستخدم غير موجود على النظام");
        if (!(await comparePassword(oldPassword, userData.password)))
            return res.status(401).send("❌ كلمة المرور الحالية خاطئة");
        const hashedNewPassword = await bcrypt.hash(password, 10);
        await sql `
      UPDATE users SET password = ${hashedNewPassword} WHERE id = ${userId}
    `;
        return res.status(200).send("✔️ تم تغيير كلمة المرور بنجاح");
    }
    catch (err) {
        console.error(err);
        return res.status(500).send("❌ خطأ في الخادم");
    }
};
