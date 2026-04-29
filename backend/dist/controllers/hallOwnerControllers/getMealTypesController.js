import sql from "../../db.js";
export const getMealTypes = async (req, res) => {
    try {
        const mealTypes = await sql `SELECT * FROM meal_types`;
        if (!mealTypes)
            return res.status(404).send("❌ لا يوجد أنواع وجبات");
        return res.json(mealTypes);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send("❌ خطأ في الخادم");
    }
};
