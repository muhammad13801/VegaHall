import type { Response } from "express";
import type { VerificationResult } from "../services/authService.js";

export const handleVerificationError = (
  res: Response,
  result: VerificationResult,
) => {
  switch (result.status) {
    case "invalid":
      return res.status(400).send("لا يوجد طلب.");
    case "expired":
      return res.status(400).send("انتهت صلاحية الرمز.");
    case "zeroAttempts":
      return res.status(400).send("تم تجاوز عدد المحاولات.");
    case "incorrectCode":
      return res
        .status(400)
        .send(`رمز خاطئ. المحاولات المتبقية: ${result.attemptsLeft}`);
    default:
      return res.status(400).send("حدث خطأ.");
  }
};
