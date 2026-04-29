import sql from "../../db.js";
export const getHallComments = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).send("❌ معرف غير صالح");
        const comments = await sql `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name,
        u.last_name
      FROM ratings r
      JOIN users u ON u.id = r.customer_id
      WHERE r.hall_id = ${id} 
        AND r.comment IS NOT NULL 
        AND r.comment != ''
      ORDER BY r.created_at DESC
    `;
        res.json(comments);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ خطأ في الخادم");
    }
};
