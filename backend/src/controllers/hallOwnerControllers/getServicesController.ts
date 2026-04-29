import sql from "../../db";
import { Request, Response } from "express";

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await sql`
      SELECT id, name
      FROM services
    `;

    if (!services) return res.status(404).send("❌ لا يوجد خدمات");

    return res.json(services);
  } catch (err) {
    console.error(err);
    return res.status(500).send("❌ خطأ في الخادم");
  }
};
