import { Response } from "express";
import { AuthRequest } from "../middleware/sessionMiddleware";
import sql from "../db";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  notification_type: string;
  channel: string;
  sent: boolean;
  created_at: string;
}

// GET /notifications — fetch notifications for the current user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const notifications = await sql<Notification[]>`
      SELECT id, title, content, notification_type, channel, sent, created_at
      FROM notifications
      WHERE user_id = ${req.userId!}
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    if (!notifications) return res.status(404).send("❌ لا توجد إشعارات");

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ خطأ في الخادم");
  }
};

// HELPER — insert a notification (used by bookingController and other modules)
export const insertNotification = async (
  userId: number,
  title: string,
  content: string,
  notificationType: string,
) => {
  await sql`
    INSERT INTO notifications (user_id, title, content, notification_type, channel, sent)
    VALUES (${userId}, ${title}, ${content}, ${notificationType}, 'app', true)
  `;
};
