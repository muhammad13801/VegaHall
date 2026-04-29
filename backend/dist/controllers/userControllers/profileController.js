import sql from "../../db.js";
export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).send("❌ مستخدم غير مصرح");
        const [user] = await sql `
      SELECT first_name, last_name, email, phone_number, role
      FROM users
      WHERE id = ${userId}
    `;
        if (!user)
            return res.status(404).send("❌ المستخدم غير موجود");
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ خطأ في الخادم");
    }
};
