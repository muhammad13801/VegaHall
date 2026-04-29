import sql from "../db.js";
export const getAppState = async (req, res) => {
    try {
        const [state] = await sql `SELECT last_updated FROM app_state WHERE id = 1`;
        if (!state)
            return res.status(404).send("❌ لا يوجد اي تحديث");
        return res.status(200).send(state);
    }
    catch (err) {
        console.error("GET APP STATE ERROR: ", err);
        return res.status(500).send("❌ خطأ في الخادم");
    }
};
export const updateAppState = async () => {
    try {
        await sql `UPDATE app_state SET last_updated = NOW() WHERE id = 1`;
    }
    catch (err) {
        return console.error("UPDATE APP STATE ERROR: ", err);
    }
};
