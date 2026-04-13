import { Request, Response } from "express";
import sql from "../db";

export const getAppState = async (req: Request, res: Response) => {
  try {
    const [state] = await sql`SELECT last_updated FROM app_state WHERE id = 1`;
    if (!state) return res.status(404).send("❌ لا يوجد اي تحديث");

    return res.status(200).send(state);
  } catch (err: any) {
    console.error("GET APP STATE ERROR: ", err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};

export const updateAppState = async () => {
  try {
    await sql`UPDATE app_state SET last_updated = NOW() WHERE id = 1`;
  } catch (err: any) {
    return console.error("UPDATE APP STATE ERROR: ", err);
  }
};
