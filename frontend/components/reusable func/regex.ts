export const nameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+97(0|2)-5[0-9]{2}-[0-9]{3}-[0-9]{3}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,30}$/;
