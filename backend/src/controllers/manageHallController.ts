import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import sql from "../db";
import cron from "node-cron";

export interface Media {
  type: string;
  url: string;
}

export interface HallService {
  name: string;
  price: number;
}

export interface MealOption {
  name: string;
  price_per_person: number;
}

export interface SecondaryContact {
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface Hall {
  id: number;
  hall_name: string;
  city: string;
  address: string;
  location: string;
  description: string;
  capacity: number;
  price: number;
  status: string;
}

export interface HallFull extends Hall {
  images: string[];
  videos: string[];
  services: HallService[];
  mealOptions: MealOption[];
  secondaryContacts: SecondaryContact[];
}

export const getHall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [hall] = await sql<Hall[]>`
      SELECT id, hall_name, city, address, location, description, capacity, price, status
      FROM halls
      WHERE id = ${id} AND owner_id = ${req.userId!}
    `;
    if (!hall) return res.status(404).send("❌ الصالة غير موجودة");

    const media = await sql<
      Media[]
    >`SELECT type, url FROM media WHERE hall_id = ${id}`;
    const services = await sql<
      HallService[]
    >`SELECT name, price FROM hall_services WHERE hall_id = ${id}`;
    const mealOptions = await sql<
      MealOption[]
    >`SELECT name, price_per_person FROM meal_options WHERE hall_id = ${id}`;
    const contacts = await sql<
      SecondaryContact[]
    >`SELECT first_name, last_name, phone_number FROM secondary_contacts WHERE hall_id = ${id}`;

    const result: HallFull = {
      ...hall,
      images: media.filter((m) => m.type === "image").map((m) => m.url),
      videos: media.filter((m) => m.type === "video").map((m) => m.url),
      services,
      mealOptions,
      secondaryContacts: contacts,
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ" });
  }
};

export const updateHall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const {
      name,
      city,
      address,
      location,
      capacity,
      price,
      description,
      images,
      videos,
      services,
      mealOptions,
      secondaryContacts,
    } = req.body;

    const [hall] = await sql<
      Hall[]
    >`SELECT id FROM halls WHERE id = ${id} AND owner_id = ${req.userId!}`;
    if (!hall) return res.status(403).json({ message: "غير مصرح" });

    await sql`
      UPDATE halls SET
        hall_name = ${name},
        city = ${city},
        address = ${address},
        location = ${location},
        capacity = ${capacity},
        price = ${price},
        description = ${description}
      WHERE id = ${id}
    `;

    await sql`DELETE FROM media WHERE hall_id = ${id}`;
    for (const url of images || []) {
      await sql`INSERT INTO media (hall_id, type, url) VALUES (${id}, 'image', ${url})`;
    }
    for (const url of videos || []) {
      await sql`INSERT INTO media (hall_id, type, url) VALUES (${id}, 'video', ${url})`;
    }

    await sql`DELETE FROM hall_services WHERE hall_id = ${id}`;
    for (const s of services || []) {
      await sql`INSERT INTO hall_services (hall_id, name, price, status) VALUES (${id}, ${s.name}, ${s.price || 0}, 'Active')`;
    }

    await sql`DELETE FROM meal_options WHERE hall_id = ${id}`;
    for (const m of mealOptions || []) {
      await sql`INSERT INTO meal_options (hall_id, name, price_per_person) VALUES (${id}, ${m.type}, ${m.pricePerPerson})`;
    }

    await sql`DELETE FROM secondary_contacts WHERE hall_id = ${id}`;
    for (const c of secondaryContacts || []) {
      await sql`INSERT INTO secondary_contacts (hall_id, first_name, last_name, phone_number) VALUES (${id}, ${c.firstName}, ${c.lastName}, ${c.phone})`;
    }

    res.send("✔️ تم تحديث الصالة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ حدث خطأ");
  }
};

export const deleteHall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("❌ معرف غير صالح");

    const [hall] = await sql<
      Hall[]
    >`SELECT id FROM halls WHERE id = ${id} AND owner_id = ${req.userId!}`;
    if (!hall) return res.status(403).send("❌ غير مصرح");

    await sql`DELETE FROM halls WHERE id = ${id}`;
    res.send("✔️ تم حذف الصالة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running hall expiration job...");

    await sql`
      UPDATE halls
      SET status = 'Inactive'
      WHERE id IN (
        SELECT hall_id
        FROM hallPayment
        GROUP BY hall_id
        HAVING MAX(created_at) < NOW() - INTERVAL '1 year'
      )
    `;

    console.log("Halls updated successfully");
  } catch (err) {
    console.error("Cron error:", err);
  }
});
