export interface CreditCardData {
  cardNumber: string;
  cardName: string;
  cardExpiry: string; // single field MM/YY
  cardCVV: string;
}

export const validateCreditCard = (
  cardData: CreditCardData,
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  // Card number
  if (!cardData.cardNumber || cardData.cardNumber.length !== 19) {
    errors.cardNumber = "رقم البطاقة غير صحيح";
  }

  // Card name
  if (!cardData.cardName || cardData.cardName.trim().length < 3) {
    errors.cardName = "اسم صاحب البطاقة غير صحيح";
  }

  // Expiry (MM/YY)
  const [monthStr, yearStr] = cardData.cardExpiry.split("/");
  const month = Number(monthStr);
  if (
    !cardData.cardExpiry ||
    !/^\d{2}\/\d{2}$/.test(cardData.cardExpiry) ||
    month < 1 ||
    month > 12
  )
    errors.cardExpiry = "تاريخ الانتهاء غير صحيح";
  else {
    const year = Number(yearStr);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.cardExpiry = "البطاقة منتهية الصلاحية";
    }
  }

  // CVV
  if (!cardData.cardCVV || cardData.cardCVV.length !== 3) {
    errors.cardCVV = "رمز التحقق غير صحيح";
  }

  return errors;
};
