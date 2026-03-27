import { emailRegex, passwordRegex } from "../reusable func/regex";

export interface AuthData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateAuth = (
  data: Partial<AuthData>,
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (
    data.email !== undefined &&
    !emailRegex.test(data.email.trim().toLowerCase())
  )
    errors.email = "البريد الإلكتروني غير صالح";

  if (data.password !== undefined && !passwordRegex.test(data.password))
    errors.password = "كلمة المرور غير صحيحة";

  if (
    data.confirmPassword !== undefined &&
    data.confirmPassword !== data.password
  )
    errors.confirmPassword = "كلمة المرور غير متطابقة";

  return errors;
};
