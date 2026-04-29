import sql from "../../db.js";
export const logout = async (req, res) => {
    try {
        const sessionId = req.headers.authorization;
        await sql `DELETE FROM sessions WHERE id = ${sessionId}`;
        res.send("✔️ تم تسجيل الخروج بنجاح");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ خطأ في الخادم");
    }
};
