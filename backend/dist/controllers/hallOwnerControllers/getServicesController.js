import sql from "../../db.js";
export const getServices = async (req, res) => {
    try {
        const services = await sql `
      SELECT id, name
      FROM services
    `;
        if (!services)
            return res.status(404).send("❌ لا يوجد خدمات");
        return res.json(services);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send("❌ خطأ في الخادم");
    }
};
