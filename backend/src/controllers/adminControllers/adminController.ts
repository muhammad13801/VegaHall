import { Response } from "express";
import sql from "../../db";
import { AuthRequest } from "../../middleware/sessionMiddleware";
import { insertNotification } from "../userControllers/notificationsController";

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const [stats] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM halls) as total_halls,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM halls WHERE status = 'pending') as pending_halls
    `;
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, rating } = req.query;

    const users = await sql`
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.email, u.phone_number, u.role, u.status,
        COALESCE(
          (SELECT ROUND(AVG(r.rating), 1) 
           FROM ratings r 
           JOIN halls h ON r.hall_id = h.id 
           WHERE h.owner_id = u.id), 
          0
        ) as owner_rating
      FROM users u
      WHERE 1=1
      ${search ? sql`AND (u.first_name ILIKE ${"%" + search + "%"} OR u.last_name ILIKE ${"%" + search + "%"} OR u.email ILIKE ${"%" + search + "%"})` : sql``}
      ${
        rating
          ? sql`AND (
        SELECT AVG(r.rating) 
        FROM ratings r 
        JOIN halls h ON r.hall_id = h.id 
        WHERE h.owner_id = u.id
      ) >= ${Number(rating)}`
          : sql``
      }
      ORDER BY u.id DESC
    `;

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // Expected 'active', 'suspended', 'pending'

    if (!id || !status) {
      return res.status(400).send("❌ معرف المستخدم أو الحالة غير موجودة");
    }

    const normalizedStatus = status.toLowerCase();

    await sql`
      UPDATE users 
      SET status = ${normalizedStatus}
      WHERE id = ${id}
    `;
    res.send(`✔️ تم تحديث حالة المستخدم إلى ${normalizedStatus}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const getPendingHalls = async (req: AuthRequest, res: Response) => {
  try {
    const halls = await sql`
      SELECT h.*, u.first_name as owner_name, u.last_name as owner_last_name
      FROM halls h
      JOIN users u ON h.owner_id = u.id
      WHERE h.status = 'pending'
      ORDER BY h.id DESC
    `;
    res.json(halls);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const approveHall = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send("❌ معرف القاعة غير صالح");

    const [hall] = await sql`
      SELECT owner_id, hall_name FROM halls WHERE id = ${id}
    `;
    if (!hall) return res.status(404).send("❌ القاعة غير موجودة");

    await sql`
      UPDATE halls 
      SET status = 'active'
      WHERE id = ${id}
    `;

    await insertNotification(
      hall.owner_id,
      "تهانينا! تم تفعيل قاعتك",
      `تمت الموافقة على انضمام صالتك (${hall.hall_name}) إلى النظام بنجاح.`,
      "hall_approved",
    );

    res.send("✔️ تم تفعيل القاعة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const addServiceToHall = async (req: AuthRequest, res: Response) => {
  try {
    const { hallId: rawHallId, name, price: rawPrice } = req.body;
    const hallId = Number(rawHallId);
    const price = Number(rawPrice) || 0;

    if (!hallId || !name) {
      return res.status(400).send("❌ يرجى تقديم معرف القاعة واسم الخدمة");
    }

    const [hall] = await sql`
      SELECT owner_id, hall_name FROM halls WHERE id = ${hallId}
    `;
    if (!hall) return res.status(404).send("❌ القاعة غير موجودة");

    // Find or create service ID by name
    let service = await sql`
      SELECT id FROM services WHERE name = ${name}
    `.then((res) => res[0]);

    if (!service) {
      const [newService] = await sql`
        INSERT INTO services (name) VALUES (${name}) RETURNING id
      `;
      service = newService;
    }

    await sql`
      INSERT INTO hall_services (hall_id, service_id, price)
      VALUES (${hallId}, ${(service as any).id}, ${price})
      ON CONFLICT (hall_id, service_id) DO UPDATE SET price = EXCLUDED.price
    `;

    await insertNotification(
      hall.owner_id,
      "خدمة جديدة لقاعتك",
      `تم إضافة/تحديث الخدمة (${name}) في صالتك: ${hall.hall_name}`,
      "service_added",
    );

    res.send("✔️ تم إضافة/تحديث الخدمة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const addServiceToAllHalls = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price: rawPrice } = req.body;
    const price = Number(rawPrice) || 0;

    if (!name) {
      return res.status(400).send("❌ يرجى تقديم اسم الخدمة");
    }

    await sql.begin(async (tx: any) => {
      // 1. Find or create service
      let service = await tx`SELECT id FROM services WHERE name = ${name}`.then(
        (res: any) => res[0],
      );
      if (!service) {
        const [newService] =
          await tx`INSERT INTO services (name) VALUES (${name}) RETURNING id`;
        service = newService;
      }

      // 2. Get all halls
      const halls = await tx`SELECT id, owner_id, hall_name FROM halls`;

      // 3. Add to each hall and notify
      for (const hall of halls) {
        await tx`
          INSERT INTO hall_services (hall_id, service_id, price)
          VALUES (${hall.id}, ${(service as any).id}, ${price})
          ON CONFLICT (hall_id, service_id) DO UPDATE SET price = EXCLUDED.price
        `;

        await insertNotification(
          hall.owner_id,
          "خدمة جديدة لقاعتك",
          `تم إضافة الخدمة العامة (${name}) في صالتك: ${hall.hall_name}`,
          "service_added",
        );
      }
    });

    res.send("✔️ تم إضافة الخدمة لجميع القاعات بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const getAllHallsSimple = async (req: AuthRequest, res: Response) => {
  try {
    const halls = await sql`
      SELECT id, hall_name FROM halls ORDER BY hall_name ASC
    `;
    res.json(halls);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const getAdminHalls = async (req: AuthRequest, res: Response) => {
  try {
    const { search, rating } = req.query;

    const halls = await sql`
      SELECT 
        h.*, 
        u.first_name as owner_name, u.last_name as owner_last_name,
        COALESCE((SELECT ROUND(AVG(rating), 1) FROM ratings WHERE hall_id = h.id), 0) as average_rating
      FROM halls h
      JOIN users u ON h.owner_id = u.id
      WHERE 1=1
      ${search ? sql`AND (h.hall_name ILIKE ${"%" + search + "%"} OR u.first_name ILIKE ${"%" + search + "%"} OR u.last_name ILIKE ${"%" + search + "%"})` : sql``}
      ${rating ? sql`AND (SELECT AVG(rating) FROM ratings WHERE hall_id = h.id) >= ${Number(rating)}` : sql``}
      ORDER BY h.id DESC
    `;

    res.json(halls);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

/* ================= SERVICE MANAGEMENT ================= */

export const getGlobalServices = async (req: AuthRequest, res: Response) => {
  try {
    const services = await sql`SELECT * FROM services ORDER BY name ASC`;
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const getServiceRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await sql`
      SELECT sr.*, u.first_name as owner_name, u.last_name as owner_last_name
      FROM service_requests sr
      JOIN users u ON sr.owner_id = u.id
      WHERE sr.status = 'pending'
      ORDER BY sr.id DESC
    `;
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const approveServiceRequest = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send("❌ معرف الطلب غير صالح");

    const [request] = await sql`
      SELECT * FROM service_requests WHERE id = ${id}
    `;
    if (!request) return res.status(404).send("❌ الطلب غير موجود");

    // Start transaction
    await sql.begin(async (tx: any) => {
      // 1. Update status
      await tx`
        UPDATE service_requests SET status = 'approved' WHERE id = ${id}
      `;

      // 2. Add to global services if not exists
      await tx`
        INSERT INTO services (name)
        VALUES (${request.name})
        ON CONFLICT (name) DO NOTHING
      `;

      // 3. Notify owner
      await insertNotification(
        request.owner_id,
        "تمت الموافقة على طلب الخدمة",
        `تم قبول طلبك لإضافة خدمة: ${request.name}. يمكنك الآن إضافتها لقاعتك.`,
        "service_approved",
      );
    });

    res.send("✔️ تم قبول الخدمة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const rejectServiceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send("❌ معرف الطلب غير صالح");

    const [request] = await sql`
      SELECT * FROM service_requests WHERE id = ${id}
    `;
    if (!request) return res.status(404).send("❌ الطلب غير موجود");

    await sql`
      UPDATE service_requests SET status = 'rejected' WHERE id = ${id}
    `;

    await insertNotification(
      request.owner_id,
      "تم رفض طلب الخدمة",
      `نعتذر، لقد تم رفض طلبك لإضافة خدمة: ${request.name}.`,
      "service_rejected",
    );

    res.send("✔️ تم رفض الطلب");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const addGlobalService = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send("❌ اسم الخدمة مطلوب");

    await sql`
      INSERT INTO services (name)
      VALUES (${name})
      ON CONFLICT (name) DO NOTHING
    `;

    res.send("✔️ تم إضافة الخدمة للنظام بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

/* ================= MEAL MANAGEMENT ================= */

export const getGlobalMealTypes = async (req: AuthRequest, res: Response) => {
  try {
    const meals = await sql`SELECT * FROM meal_types ORDER BY name ASC`;
    res.json(meals);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const getMealRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await sql`
      SELECT mr.*, u.first_name as owner_name, u.last_name as owner_last_name
      FROM meal_requests mr
      JOIN users u ON mr.owner_id = u.id
      WHERE mr.status = 'pending'
      ORDER BY mr.id DESC
    `;
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const approveMealRequest = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send("❌ معرف الطلب غير صالح");

    const [request] = await sql`
      SELECT * FROM meal_requests WHERE id = ${id}
    `;
    if (!request) return res.status(404).send("❌ الطلب غير موجود");

    await sql.begin(async (tx: any) => {
      await tx`
        UPDATE meal_requests SET status = 'approved' WHERE id = ${id}
      `;

      await tx`
        INSERT INTO meal_types (name)
        VALUES (${request.name})
        ON CONFLICT (name) DO NOTHING
      `;

      await insertNotification(
        request.owner_id,
        "تمت الموافقة على طلب الوجبة",
        `تم قبول طلبك لإضافة نوع وجبة: ${request.name}. يمكنك الآن إضافتها لقاعتك.`,
        "meal_approved",
      );
    });

    res.send("✔️ تم قبول نوع الوجبة بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const rejectMealRequest = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).send("❌ معرف الطلب غير صالح");

    const [request] = await sql`
      SELECT * FROM meal_requests WHERE id = ${id}
    `;
    if (!request) return res.status(404).send("❌ الطلب غير موجود");

    await sql`
      UPDATE meal_requests SET status = 'rejected' WHERE id = ${id}
    `;

    await insertNotification(
      request.owner_id,
      "تم رفض طلب الوجبة",
      `نعتذر، لقد تم رفض طلبك لإضافة نوع وجبة: ${request.name}.`,
      "meal_rejected",
    );

    res.send("✔️ تم رفض الطلب");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

export const addGlobalMealType = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send("❌ اسم الوجبة مطلوب");

    await sql`
      INSERT INTO meal_types (name)
      VALUES (${name})
      ON CONFLICT (name) DO NOTHING
    `;

    res.send("✔️ تم إضافة نوع الوجبة للنظام بنجاح");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};
