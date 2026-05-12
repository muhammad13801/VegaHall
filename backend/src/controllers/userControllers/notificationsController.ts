import type { Response } from "express";
import type { AuthRequest } from "../../middleware/sessionMiddleware.js";
import sql from "../../db.js";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";

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

const expo = new Expo();

// PATCH /notifications/token — save push token for current user
export const savePushToken = async (req: AuthRequest, res: Response) => {
  const { token } = req.body;

  if (!token || !Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: "Invalid Expo push token" });
  }

  await sql`
    UPDATE users SET expo_push_token = ${token} WHERE id = ${req.userId!}
  `;

  res.json({ success: true });
};

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
  // 1. Save to DB
  await sql`
    INSERT INTO notifications (user_id, title, content, notification_type, channel, sent)
    VALUES (${userId}, ${title}, ${content}, ${notificationType}, 'app', true)
  `;

  // 2. Get user's push token
  const [user] = await sql<{ expo_push_token: string | null }[]>`
    SELECT expo_push_token FROM users WHERE id = ${userId}
  `;

  if (!user?.expo_push_token || !Expo.isExpoPushToken(user.expo_push_token))
    return; // No token saved, skip push silently

  // 3. Send push notification
  const message: ExpoPushMessage = {
    to: user.expo_push_token,
    sound: "default",
    title,
    body: content,
    data: { notification_type: notificationType },
  };

  try {
    const [ticket] = await expo.sendPushNotificationsAsync([message]);

    if (!ticket) return;
    if (ticket.status === "error") {
      console.error("Push failed:", ticket.message);

      if (ticket.details?.error === "DeviceNotRegistered") {
        await sql`UPDATE users SET expo_push_token = NULL WHERE id = ${userId}`;
      }
    }
  } catch (err) {
    console.error("Expo push error:", err);
  }
};
