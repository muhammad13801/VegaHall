import { useState } from "react";
import { NavigateAndReset, NavigateTo } from "../../reusable func/navigateTo";
import { useRoute } from "@react-navigation/native";
import CodeInput from "../../reusable func/codeInput";
import { Alert } from "react-native";
import { resendCode, verifyCode } from "../../Services/api";

export default function PasswordCode() {
  const [code, setCode] = useState<string>("");
  const route = useRoute<any>();
  const { email } = route.params;

  const handleVerifyCode = async () => {
    if (code.length !== 5) {
      Alert.alert("خطأ", "الرجاء إدخال الكود المكون من 5 أرقام");
      return;
    }

    try {
      // Verify email and create account in one call
      // const result = await signupAPI.verifyEmail(email, code);
      await verifyCode(email);
      //await resendCode(email);
      // Success - navigate to phone verification
      NavigateAndReset("SetNewPassword");
    } catch (err) {
      Alert.alert("خطأ", "الكود غير صحيح أو منتهي الصلاحية " + err);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCode(email);
    } catch (err) {
      Alert.alert("خطا " + err);
    }
  };

  return (
    <CodeInput
      title="تاكيد البريد الالكتروني"
      subtitle="ادخل الكود المرسل الى بريد"
      valueToShow={email}
      handleAction={handleVerifyCode}
      handleActionResend={handleResendCode}
      codeValue={code}
      setCodeValue={setCode}
    />
  );
}
