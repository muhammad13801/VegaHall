import { useState } from "react";
import { Alert } from "react-native";
import { NavigateAndReset } from "../../reusable func/navigateTo";
import CodeInput from "../../reusable func/codeInput";
import { useRoute } from "@react-navigation/native";
import { resendCode, verifyCode } from "../../Services/api";

export default function EmailCode() {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const route = useRoute<any>();
  const { email } = route.params;

  const handleVerifyCode = async () => {
    if (!code || code.length !== 5) {
      Alert.alert("خطأ", "الرجاء إدخال الكود المكون من 5 أرقام");
      return;
    }

    setLoading(true);

    try {
      // Verify email and create account in one call
      // const result = await signupAPI.verifyEmail(email, code);
      await verifyCode({ email, code });
      //await resendCode(email);
      // Success - navigate to phone verification
      NavigateAndReset("Login");
    } catch (err) {
      Alert.alert("خطأ", "الكود غير صحيح أو منتهي الصلاحية " + err);
    } finally {
      setLoading(false);
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
      loading={loading}
    />
  );
}
