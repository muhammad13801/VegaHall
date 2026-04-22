import { Response } from "express";
import sql from "../db";
import { AuthRequest } from "../middleware/sessionMiddleware";

export const getAllHalls = async (req: AuthRequest, res: Response) => {
  try {
    const halls = await sql`
      SELECT 
        h.*, 
        h.hall_name as name,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as images,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'video'),
          '[]'::json
        ) as videos,
        COALESCE(
          (SELECT json_agg(s.name) FROM hall_services hs JOIN services s ON hs.service_id = s.id WHERE hs.hall_id = h.id),
          '[]'::json
        ) as services,
        ROUND(COALESCE((SELECT AVG(rating) FROM ratings WHERE hall_id = h.id), 0), 1) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE hall_id = h.id) as reviews_count
      FROM halls h
      ORDER BY h.id DESC
    `;
    res.json(halls);
  } catch (error: any) {
    res.status(500).send("❌ خطأ في الخادم: " + error.message);
  }
};

export const getHallById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [hall] = await sql`
      SELECT 
        h.*, 
        h.hall_name as name,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as images,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'video'),
          '[]'::json
        ) as videos,
        COALESCE(
          (SELECT json_agg(json_build_object('name', s.name, 'price', hs.price)) FROM hall_services hs JOIN services s ON hs.service_id = s.id WHERE hs.hall_id = h.id),
          '[]'::json
        ) as services,
        COALESCE(
          (SELECT json_agg(json_build_object('name', mt.name, 'price_per_person', mo.price_per_person)) FROM meal_options mo JOIN meal_types mt ON mo.meal_type_id = mt.id WHERE mo.hall_id = h.id),
          '[]'::json
        ) as meal_options,
        COALESCE(
          (SELECT json_agg(json_build_object('first_name', first_name, 'last_name', last_name, 'phone_number', phone_number)) FROM secondary_contacts WHERE hall_id = h.id),
          '[]'::json
        ) as secondary_contacts,
        ROUND(COALESCE((SELECT AVG(rating) FROM ratings WHERE hall_id = h.id), 0), 1) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE hall_id = h.id) as reviews_count
      FROM halls h
      WHERE h.id = ${id}
    `;

    if (!hall) return res.status(404).send("❌ القاعة غير موجودة");
    res.json(hall);
  } catch (error: any) {
    res.status(500).send("❌ خطأ في الخادم: " + error.message);
  }
};

export const getBusyDates = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const dates = await sql`
      SELECT booking_date 
      FROM bookings 
      WHERE hall_id = ${id} 
      AND status IN ('confirmed', 'owner_rescheduled')
    `;
    res.json(dates.map(d => d.booking_date));
  } catch (error: any) {
    res.status(500).send("❌ خطأ في الخادم: " + error.message);
  }
};

export const searchHalls = async (req: AuthRequest, res: Response) => {
  try {
    const { query, city, service, minPrice, maxPrice, date } = req.body;
    
    let conditions = [];

    if (query) {
      conditions.push(sql`h.hall_name ILIKE ${`%${query}%`} OR h.description ILIKE ${`%${query}%`}`);
    }

    if (city) {
      conditions.push(sql`h.city = ${city}`);
    }

    if (service) {
      conditions.push(sql`s.name ILIKE ${`%${service}%`}`);
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push(sql`h.base_price >= ${Number(minPrice)}`);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push(sql`h.base_price <= ${Number(maxPrice)}`);
    }

    if (date) {
      conditions.push(sql`h.id NOT IN (
        SELECT hall_id FROM bookings 
        WHERE booking_date = ${date} 
        AND status IN ('confirmed', 'owner_rescheduled')
      )`);
    }

    let whereClause: any = sql``;
    if (conditions.length > 0) {
      let combined = conditions[0];
      for (let i = 1; i < conditions.length; i++) {
        combined = sql`${combined as any} AND ${conditions[i] as any}`;
      }
      whereClause = sql`WHERE ${combined as any}`;
    }

    const halls = await sql`
      SELECT 
        h.*, 
        h.hall_name as name,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'image'),
          '[]'::json
        ) as images,
        COALESCE(
          (SELECT json_agg(url) FROM media WHERE hall_id = h.id AND type = 'video'),
          '[]'::json
        ) as videos,
        COALESCE(
          (SELECT json_agg(s.name) FROM hall_services hs JOIN services s ON hs.service_id = s.id WHERE hs.hall_id = h.id),
          '[]'::json
        ) as services,
        ROUND(COALESCE((SELECT AVG(rating) FROM ratings WHERE hall_id = h.id), 0), 1) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE hall_id = h.id) as reviews_count
      FROM halls h
      ${service ? sql`LEFT JOIN hall_services hs ON h.id = hs.hall_id LEFT JOIN services s ON hs.service_id = s.id` : sql``}
      ${whereClause}
      ${service ? sql`GROUP BY h.id` : sql``}
      ORDER BY h.id DESC
    `;

    res.json(halls);
  } catch (error: any) {
    console.error("❌ Search error details:", error);
    res.status(500).send("❌ خطأ في الخادم: " + error.message);
  }
};
