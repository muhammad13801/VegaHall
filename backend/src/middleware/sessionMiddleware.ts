import { Request, Response, NextFunction } from "express";
import sql from "../db";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export const sessionAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const sessionId = req.headers.authorization;
  if (!sessionId) return res.status(401).send("❌ لا يوجد جلسة");

  // adds role column from users table to session table
  // and checks expiry using database time to avoid timezone mismatches
  const [session] = await sql`
    SELECT s.*, u.role, 
           (NOW() - s.last_activity > INTERVAL '10 minutes') as is_expired
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id=${sessionId}
  `;
  if (!session) return res.status(401).send("❌ الجلسة غير صالحة");

  // check 10 mins inactivity
  if (session.is_expired) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    if (req.originalUrl.includes("/logout")) {
      return next();
    }
    return res.status(401).send("❌ انتهت صلاحية الجلسة");
  }

  // update last activity
  await sql`UPDATE sessions SET last_activity = NOW() WHERE id = ${sessionId}`;

  req.userId = session.user_id; //to know which user is making request
  req.userRole = session.role; // to redirect based on role
  next(); // to handle route
};
