import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import sql from "../db";
import { insertNotification } from "./notificationsController";

export const requestService = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).send("❌ اسم الخدمة مطلوب");

    const serviceName = name.trim();

    // Get owner data
    const [user] = await sql`
      SELECT id, name FROM users WHERE id = ${userId}
    `;

    const ownerName = user?.name || "مستخدم";
    const ownerId = user?.id;

    // Check if already requested
    const [existing] = await sql`
      SELECT id FROM service_requests
      WHERE owner_id = ${userId}
      AND name = ${serviceName}
      AND status = 'pending'
    `;

    if (existing) {
      return res.status(409).send("❌ لقد أرسلت هذا الطلب مسبقاً");
    }

    // Insert request
    await sql`
      INSERT INTO service_requests (owner_id, name, status)
      VALUES (${userId}, ${serviceName}, 'pending')
    `;

    // Get admins
    const admins = await sql`
      SELECT id FROM users WHERE role = 'admin'
    `;

    // Notify admins
    await Promise.all(
      admins.map((admin: any) =>
        insertNotification(
          admin.id,
          "طلب خدمة جديد",
          `${ownerName} (ID: ${ownerId}) طلب خدمة جديدة: ${serviceName}`,
          "service_request",
        ),
      ),
    );

    return res.send("✔️ تم إرسال طلبك للمراجعة");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

export const requestMeal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).send("❌ مستخدم غير مصرح");

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).send("❌ اسم الوجبة مطلوب");

    const mealName = name.trim();

    // Get owner data
    const [user] = await sql`
      SELECT id, name FROM users WHERE id = ${userId}
    `;

    const ownerName = user?.name || "مستخدم";
    const ownerId = user?.id;

    // Check if already requested
    const [existing] = await sql`
      SELECT id FROM meal_requests
      WHERE owner_id = ${userId}
      AND name = ${mealName}
      AND status = 'pending'
    `;

    if (existing) {
      return res.status(409).send("❌ لقد أرسلت هذا الطلب مسبقاً");
    }

    // Insert request
    await sql`
      INSERT INTO meal_requests (owner_id, name, status)
      VALUES (${userId}, ${mealName}, 'pending')
    `;

    // Get admins
    const admins = await sql`
      SELECT id FROM users WHERE role = 'admin'
    `;

    // Notify admins
    await Promise.all(
      admins.map((admin: any) =>
        insertNotification(
          admin.id,
          "طلب وجبة جديد",
          `${ownerName} (ID: ${ownerId}) طلب وجبة جديدة: ${mealName}`,
          "meal_request",
        ),
      ),
    );

    return res.send("✔️ تم إرسال طلبك للمراجعة");
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
