import { phoneRegex } from "../reusable func/regex";

export interface ServiceData {
  serviceId: number;
  name: string;
  price?: number;
}

export interface MealOption {
  mealTypeId: number;
  name: string;
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
  latitude?: number;
  longitude?: number;
  description: string;
  images: string[];
  videos?: string[];
  license?: string;
  services?: ServiceData[];
  mealOptions?: MealOption[];
  secondaryContacts?: Contact[];
}

export interface HallFormProps {
  form: HallData;
  setForm: React.Dispatch<React.SetStateAction<HallData>>;
  errors: { [key: string]: string };
}

export const PALESTINE_CITIES: string[] = [
  "الخليل",
  "إذنا",
  "رام الله",
  "نابلس",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "بيت لحم",
  "أريحا",
  "طوباس",
  "سلفيت",
  "غزة",
  "القدس",
];

export const ValidateHall = (data: HallData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!data.name) errors.name = "اسم الصالة مطلوب";

  if (!data.capacity || data.capacity <= 0)
    errors.capacity = "سعة الصالة مطلوبة";

  if (!data.price || data.price <= 0) errors.price = "سعر الصالة مطلوب";

  if (!data.city) errors.city = "مدينة الصالة مطلوبة";

  if (!data.address) errors.address = "عنوان الصالة مطلوب";

  if (data.latitude === undefined || data.longitude === undefined)
    errors.location = "موقع الصالة مطلوب (GPS)";

  if (!data.license) errors.license = "رخصة الصالة مطلوبة";

  if (!data.description) errors.description = "وصف الصالة مطلوب";

  if (!data.images || data.images.length === 0)
    errors.images = "يجب إضافة صورة واحدة على الأقل";

  if (data.mealOptions && data.mealOptions.length > 0) {
    data.mealOptions.forEach((meal: MealOption, idx: number) => {
      if (!meal.pricePerPerson || meal.pricePerPerson <= 0) {
        errors[`mealPrice_${idx}`] = "يجب أن يكون سعر الوجبة أكبر من صفر";
      }
    });
  }

  if (data.services && data.services.length > 0) {
    data.services.forEach((service: ServiceData, idx: number) => {
      if (service.price === undefined || service.price < 0) {
        errors[`servicePrice_${idx}`] = "يجب أن يكون سعر الخدمة صحيحاً";
      }
    });
  }

  if (data.secondaryContacts && data.secondaryContacts.length > 0) {
    data.secondaryContacts.forEach((contact: Contact, idx: number) => {
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
