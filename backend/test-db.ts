import sql from "./src/db";

(async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ DB connected:", result);
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();
