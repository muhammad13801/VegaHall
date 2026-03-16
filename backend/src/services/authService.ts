import sql from "../db";

/* ================= TYPES ================= */
export interface UserTable {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  email: string;
  password: string;
  phone_number: string;
  role: string;
  status: string;
}
export interface PendingUser extends UserTable {
  code: string;
  attempts_left: number;
  expires_at: Date;
}

type CheckPendingInput = {
  email: string;
  code?: string;
};

export type VerificationResult =
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "zeroAttempts" }
  | { status: "incorrectCode"; attemptsLeft: number }
  | { status: "success" };

/* ================= HELPERS ================= */

export const generateCode = (): string =>
  Math.floor(10000 + Math.random() * 90000).toString();

export const emailExists = async (email: string): Promise<boolean> => {
  const result = await sql`
    SELECT email FROM users WHERE email = ${email}
  `;
  return result.length > 0;
};

export const phoneExists = async (phoneNumber: string): Promise<boolean> => {
  const result =
    await sql`SELECT phone_number FROM users WHERE phone_number = ${phoneNumber}`;
  return result.length > 0;
};

/* ================= CHECK PENDING ================= */

export const checkPending = async ({
  email,
  code,
}: CheckPendingInput): Promise<
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "zeroAttempts" }
  | { status: "incorrectCode"; attemptsLeft: number }
  | { status: "valid"; user: PendingUser }
> => {
  const [pending] = await sql<PendingUser[]>`
    SELECT *
    FROM pending_users
    WHERE email = ${email}
  `;

  if (!pending) return { status: "invalid" };

  if (new Date() > pending.expires_at) {
    await sql`DELETE FROM pending_users WHERE email = ${email}`;
    return { status: "expired" };
  }

  if (pending.attempts_left < 1) {
    await sql`DELETE FROM pending_users WHERE email = ${email}`;
    return { status: "zeroAttempts" };
  }

  if (code && pending.code !== code) {
    await sql`
      UPDATE pending_users
      SET attempts_left = attempts_left - 1
      WHERE email = ${email}
    `;
    return {
      status: "incorrectCode",
      attemptsLeft: pending.attempts_left - 1,
    };
  }

  return { status: "valid", user: pending };
};

/* ================= PROCESS VERIFICATION ================= */

export const processVerification = async (
  email: string,
  code: string,
  operation: "insert" | "update" | "verifyOnly",
): Promise<VerificationResult> => {
  const result = await checkPending({ email, code });

  if (result.status !== "valid") return result;

  const pending = result.user;

  if (operation === "insert") {
    await sql`
      INSERT INTO users
      (first_name, last_name, gender, date_of_birth,
       email, password, phone_number, role, status)
      VALUES (
        ${pending.first_name},
        ${pending.last_name},
        ${pending.gender},
        ${pending.date_of_birth},
        ${pending.email},
        ${pending.password},
        ${pending.phone_number},
        ${pending.role},
        ${pending.status}
      )
    `;
    await sql`DELETE FROM pending_users WHERE email = ${email}`;
  }

  if (operation === "update") {
    await sql`
      UPDATE users
      SET password = ${pending.password}
      WHERE email = ${pending.email}
    `;
  }
  if (operation === "verifyOnly") return { status: "success" };

  return { status: "success" };
};
