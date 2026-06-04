import sql from "../db.js";

export const resetExpiredProposedDates = async (): Promise<number> => {
  try {
    const result = await sql`
      UPDATE bookings
      SET 
        status = 'confirmed',
        proposed_date = NULL
      WHERE
        status = 'owner_rescheduled'
        AND booking_date <= (CURRENT_DATE + INTERVAL '1 day')
      RETURNING id
    `;

    if (result.length > 0) {
      console.log(
        `✔️ Reset ${result.length} expired proposed dates back to confirmed status`,
      );
    }

    return result.length;
  } catch (err) {
    console.error("Error resetting expired proposed dates:", err);
    return 0;
  }
};
