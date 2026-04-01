import { phoneRegex } from "../reusable func/regex";

export interface ServiceData {
  name: string;
  price?: number;
}

export interface MealOption {
  type: string;
  pricePerPerson: number;
}

export interface Contact {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface HallData {
  id?: number;
  name: string;
  capacity: number;
  price: number;
  city: string;
  address: string;
  location: string;
  description: string;
  images: string[];
  videos?: string[];
  services?: ServiceData[];
  mealOptions?: MealOption[];
  secondaryContacts?: Contact[];
}

export const ValidateHall = (data: HallData) => {
  const errors: { [key: string]: string } = {};

  if (!data.name) errors.name = "اسم الصالة مطلوب";

  if (!data.capacity || data.capacity <= 0)
    errors.capacity = "سعة الصالة مطلوبة";

  if (!data.price || data.price <= 0) errors.price = "سعر الصالة مطلوب";

  if (!data.city) errors.city = "مدينة الصالة مطلوبة";

  if (!data.address) errors.address = "عنوان الصالة مطلوب";

  if (!data.location) errors.location = "موقع الصالة مطلوب (GPS)";

  if (!data.description) errors.description = "وصف الصالة مطلوب";

  if (!data.images || data.images.length === 0)
    errors.images = "يجب إضافة صورة واحدة على الأقل";

  if (data.services?.some((s) => s.name === "وجبات عشاء")) {
    if (!data.mealOptions || data.mealOptions.length === 0) {
      errors.mealOptions = "يجب إضافة خيار واحد على الأقل للوجبات";
    } else {
      data.mealOptions.forEach((meal, idx) => {
        if (!meal.pricePerPerson || meal.pricePerPerson <= 0) {
          errors[`mealPrice_${idx}`] = "يجب أن يكون سعر الوجبة أكبر من صفر";
        }
      });
    }
  }

  if (data.secondaryContacts && data.secondaryContacts.length > 0) {
    data.secondaryContacts.forEach((contact, idx) => {
      if (!contact.firstName)
        errors[`contactFirstName_${idx}`] = "الاسم الأول مطلوب";
      if (!contact.lastName)
        errors[`contactLastName_${idx}`] = "اسم العائلة مطلوب";
      if (!contact.phone || !phoneRegex.test(contact.phone))
        errors[`contactPhone_${idx}`] = "رقم الهاتف غير صحيح";
    });
  }

  return errors;
};
