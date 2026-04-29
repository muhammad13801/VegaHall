import sql from "../../db.js";
import cron from "node-cron";
export const getHall = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).send("❌ معرف غير صالح");
        const [hall] = await sql `
      SELECT
        h.id, h.hall_name, h.city, h.address, h.latitude, h.longitude,
        h.description, h.capacity, h.base_price, h.status,
        u.phone_number, u.first_name, u.last_name,
        (SELECT AVG(rating) FROM ratings WHERE hall_id = h.id) AS avg_rating
      FROM halls h
      JOIN users u ON h.owner_id = u.id
      WHERE h.id = ${id} AND h.owner_id = ${req.userId}
    `;
        if (!hall)
            return res.status(404).send("❌ الصالة غير موجودة");
        const media = await sql `
      SELECT type, url FROM media WHERE hall_id = ${id}
    `;
        const services = await sql `
      SELECT hs.service_id, s.name, hs.price
      FROM hall_services hs
      JOIN services s ON s.id = hs.service_id
      WHERE hs.hall_id = ${id}
    `;
        const mealOptions = await sql `
      SELECT mo.meal_type_id, mt.name, mo.price_per_person
      FROM meal_options mo
      JOIN meal_types mt ON mt.id = mo.meal_type_id
      WHERE mo.hall_id = ${id}
    `;
        const contacts = await sql `
      SELECT first_name, last_name, phone_number
      FROM secondary_contacts
      WHERE hall_id = ${id}
    `;
        const result = {
            ...hall,
            images: media.filter((m) => m.type === "image").map((m) => m.url),
            videos: media.filter((m) => m.type === "video").map((m) => m.url),
            services,
            mealOptions,
            secondaryContacts: contacts,
        };
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ خطأ في الخادم");
    }
};
export const updateHall = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).send("❌ معرف غير صالح");
        const { name, city, address, latitude, longitude, capacity, price, description, images, videos, services, mealOptions, secondaryContacts, } = req.body;
        const [hall] = await sql `
      SELECT id FROM halls WHERE id = ${id} AND owner_id = ${req.userId}
    `;
        if (!hall)
            return res.status(403).send("❌ غير مصرح");
        await sql `
      UPDATE halls SET
        hall_name    = ${name},
        city         = ${city},
        address      = ${address},
        latitude     = ${latitude ?? null},
        longitude    = ${longitude ?? null},
        capacity     = ${capacity},
        base_price   = ${price},
        description  = ${description}
      WHERE id = ${id}
    `;
        // Media
        await sql `DELETE FROM media WHERE hall_id = ${id}`;
        for (const url of images || []) {
            await sql `INSERT INTO media (hall_id, type, url) VALUES (${id}, 'image', ${url})`;
        }
        for (const url of videos || []) {
            await sql `INSERT INTO media (hall_id, type, url) VALUES (${id}, 'video', ${url})`;
        }
        // hall_services — look up service_id by name
        await sql `DELETE FROM hall_services WHERE hall_id = ${id}`;
        for (const s of services || []) {
            const [svc] = await sql `SELECT id FROM services WHERE name = ${s.name}`;
            if (!svc)
                throw new Error(`SERVICE_NOT_FOUND:${s.name}`);
            await sql `
        INSERT INTO hall_services (hall_id, service_id, price)
        VALUES (${id}, ${svc.id}, ${s.price ?? 0})
      `;
        }
        // meal_options — look up meal_type_id by name
        await sql `DELETE FROM meal_options WHERE hall_id = ${id}`;
        for (const m of mealOptions || []) {
            const [mt] = await sql `SELECT id FROM meal_types WHERE name = ${m.type ?? m.name}`;
            if (!mt)
                throw new Error(`MEAL_NOT_FOUND:${m.type ?? m.name}`);
            await sql `
        INSERT INTO meal_options (hall_id, meal_type_id, price_per_person)
        VALUES (${id}, ${mt.id}, ${m.pricePerPerson ?? m.price_per_person})
      `;
        }
        // Secondary contacts
        await sql `DELETE FROM secondary_contacts WHERE hall_id = ${id}`;
        for (const c of secondaryContacts || []) {
            await sql `
        INSERT INTO secondary_contacts (hall_id, first_name, last_name, phone_number)
        VALUES (${id}, ${c.firstName}, ${c.lastName}, ${c.phone})
      `;
        }
        res.send("✔️ تم تحديث الصالة بنجاح");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ خطأ في الخادم");
    }
};
cron.schedule("0 0 * * *", async () => {
    try {
        console.log("Running hall expiration job...");
        await sql `
      UPDATE halls
      SET status = 'suspended'
      WHERE id IN (
        SELECT hall_id
        FROM hall_payments
        GROUP BY hall_id
        HAVING MAX(created_at) < NOW() - INTERVAL '1 year'
      )
    `;
        console.log("Halls updated successfully");
    }
    catch (err) {
        console.error("Cron error:", err);
    }
});
