import sql from "../db.js";

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
  code: string;
  attempts_left: number;
  expires_at: Date;
}

// PendingUser is now just UserTable since everything is in one table
export type PendingUser = UserTable;

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
    SELECT email FROM users WHERE email = ${email} AND status != 'pending'
  `;
  return result.length > 0;
};

export const phoneExists = async (phoneNumber: string): Promise<boolean> => {
  const result = await sql`
    SELECT phone_number FROM users
    WHERE phone_number = ${phoneNumber} AND status != 'pending'
  `;
  return result.length > 0;
};

export const checkUserAvailability = async (
  email: string,
  phoneNumber: string,
) => {
  const records = await sql<UserTable[]>`
    SELECT * FROM users
    WHERE email = ${email} OR phone_number = ${phoneNumber}
  `;

  const emailRecord = records.find((r) => r.email === email);
  const phoneRecord = records.find((r) => r.phone_number === phoneNumber);

  const emailTaken = !!emailRecord && emailRecord.status !== "pending";
  const phoneTaken = !!phoneRecord && phoneRecord.status !== "pending";
  const pending = records.find(
    (r) => r.email === email && r.status === "pending",
  ) as PendingUser | undefined;

  return { emailTaken, phoneTaken, pending };
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
    SELECT * FROM users
    WHERE email = ${email}
  `;

  if (!pending) return { status: "invalid" };

  if (new Date() > pending.expires_at) {
    await sql`DELETE FROM users WHERE email = ${email} AND status = 'pending'`;
    return { status: "expired" };
  }

  if (pending.attempts_left < 1) {
    await sql`DELETE FROM users WHERE email = ${email} AND status = 'pending'`;
    return { status: "zeroAttempts" };
  }

  if (code && pending.code !== code) {
    await sql`
      UPDATE users
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
  operation: "activate" | "update" | "verifyOnly",
): Promise<VerificationResult> => {
  const result = await checkPending({ email, code });

  if (result.status !== "valid") return result;

  const pending = result.user;

  if (operation === "activate") {
    await sql`
      UPDATE users
      SET status = 'active',
          code = null,
          attempts_left = null,
          expires_at = null
      WHERE email = ${email} AND status = 'pending'
    `;
  }

  if (operation === "update") {
    await sql`
      UPDATE users
      SET password = ${pending.password},
          code = null,
          attempts_left = null,
          expires_at = null
      WHERE email = ${email}
    `;
  }

  return { status: "success" };
};
