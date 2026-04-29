import { HallData } from "../../../Validations/validateHall";

export const PALESTINE_CITIES = [
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

export const SERVICES = [
  "تكييف مركزي",
  "إضاءة ليزر",
  "دي جي (DJ)",
  "تصوير",
  "ضيافة",
  "وجبات عشاء",
  "زفة",
];

export const MEAL_TYPES = ["منسف", "أوزي", "مقلوبة", "قدرة", "فريكة", "مشاوي"];

export interface HallFormProps {
  form: HallData;
  setForm: React.Dispatch<React.SetStateAction<HallData>>;
  errors: { [key: string]: string };
}
