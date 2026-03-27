import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import sql from "../db";

export const addHall = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      capacity,
      price,
      city,
      address,
      location,
      description,
      images,
      videos,
      services,
      mealOptions,
      secondaryContacts,
    } = req.body;

    console.log("just entered here");
    const owner_id = req.userId;

    if (!owner_id) return res.status(401).send("❌ مستخدم غير مصرح");

    // Start a transaction to ensure all data is inserted or none is inserted
    const hallId = await sql.begin(async (tx: any) => {
      // 1. Insert into halls
      const [newHall] = await tx`
        INSERT INTO halls (hall_name, location, city, address, capacity, description, price, status, owner_id)
        VALUES (${name}, ${location}, ${city}, ${address}, ${capacity}, ${description}, ${price}, 'Pending', ${owner_id})
        RETURNING id
      `;

      console.log("Passed adding hall details");
      const insertedHallId = newHall.id;

      // 2. Insert meal_options if any
      if (mealOptions && mealOptions.length > 0) {
        await Promise.all(
          mealOptions.map(
            (meal: any) =>
              tx`INSERT INTO meal_options (hall_id, name, price_per_person)
            VALUES (${insertedHallId}, ${meal.name}, ${meal.price})`,
          ),
        );
      }

      // 3. Insert images into media
      if (images && images.length > 0) {
        await Promise.all(
          images.map(
            (imgUrl: string) =>
              tx`INSERT INTO media (hall_id, type, url)
            VALUES (${insertedHallId}, 'image', ${imgUrl})`,
          ),
        );
      }

      // 4. Insert videos into media
      if (videos && videos.length > 0) {
        await Promise.all(
          videos.map(
            (videoUrl: string) =>
              tx`INSERT INTO media (hall_id, type, url)
            VALUES (${insertedHallId}, 'video', ${videoUrl})`,
          ),
        );
      }

      // 5. Insert services into hall_services
      if (services && services.length > 0) {
        await Promise.all(
          services.map((service: any) => {
            const servicePrice = service.price || 0;
            return tx`INSERT INTO hall_services (hall_id, name, status, price)
            VALUES (${insertedHallId}, ${service.name}, 'active', ${servicePrice})`;
          }),
        );
      }

      // 6. Insert secondary contacts
      if (secondaryContacts && secondaryContacts.length > 0) {
        await Promise.all(
          secondaryContacts.map(
            (contact: any) =>
              tx`INSERT INTO secondary_contacts (hall_id, first_name, last_name, phone_number)
            VALUES (${insertedHallId}, ${contact.firstName}, ${contact.lastName}, ${contact.phoneNumber})`,
          ),
        );
      }

      return insertedHallId;
    });

    return res.status(201).json({
      message: "✔️ تمت إضافة الصالة بنجاح",
      hallId: hallId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطا في الخادم");
  }
};
