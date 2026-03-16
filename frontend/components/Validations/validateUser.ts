import { nameRegex, phoneRegex } from "../reusable func/regex";
import { AuthData, validateAuth } from "./validateAuth";

export interface UserData extends AuthData {
  firstName: string;
  lastName: string;
  gender: string;
  userType: string;
  date: Date;
  phoneNumber: string;
}

export const validateName = (
  data: Partial<UserData>,
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!data.firstName || !nameRegex.test(data.firstName))
    errors.firstName = "الاسم الاول يجب ان يحتوي على حروف فقط";

  if (!data.lastName || !nameRegex.test(data.lastName))
    errors.lastName = "اسم العائلة يجب ان يحتوي على حروف فقط";

  return errors;
};

export const validateUser = (data: UserData): { [key: string]: string } => {
  const errors = validateName(data);

  if (!data.gender) errors.gender = "اختر الجنس";

  if (!data.userType) errors.userType = "اختر نوع المستخدم";

  if (!data.date || !(data.date instanceof Date))
    errors.date = "اختر تاريخ الميلاد";

  if (!data.phoneNumber || !phoneRegex.test(data.phoneNumber))
    errors.phoneNumber = "رقم الهاتف غير صالح";

  return { ...validateAuth(data), ...errors };
};
