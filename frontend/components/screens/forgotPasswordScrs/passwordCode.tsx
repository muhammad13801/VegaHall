import { useState } from "react";
import { useRoute } from "@react-navigation/native";

import CodeInput from "../../reusable func/codeInput";
import { NavigateTo } from "../../reusable func/navigateTo";
import { verifyResetCode, resendCode } from "../../Services/authApi";
import Toast from "react-native-toast-message";

export default function EmailCode() {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  const route = useRoute<any>();
  const { email } = route.params;

  const [error, setError] = useState<string>("");

  // Handle code verification
  const handleVerifyCode = async () => {
    if (code !== undefined && (code.length < 5 || isNaN(Number(code))))
      return setError("الرجاء ادخال الكود المكون من 5 ارقام");

    setLoading(true);

    try {
      const response = await verifyResetCode(email, code);
      // Success: navigate to login or next step
      Toast.show({
        type: "success",
        text1: response.data,
      });
      NavigateTo("SetNewPassword", { email });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setResendLoading(true);

    try {
      const response = await resendCode(email);

      Toast.show({
        type: "success",
        text1: response.data,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "حدث خطأ غير متوقع",
      });

      throw err;
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <CodeInput
      title="تأكيد البريد الإلكتروني"
      subtitle="ادخل الكود المرسل إلى بريدك"
      valueToShow={email}
      handleAction={handleVerifyCode}
      handleActionResend={handleResendCode}
      codeValue={code}
      setCodeValue={setCode}
      loading={loading}
      resendLoading={resendLoading}
      errors={error}
    />
  );
}
