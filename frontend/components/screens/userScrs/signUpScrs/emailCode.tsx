import { useState } from "react";
import { useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import CodeInput from "../../../reusable func/codeInput";
import { NavigateAndReset } from "../../../reusable func/navigateTo";
import { verifyRegisterCode, resendCode } from "../../../Services/authApi";

export default function EmailCode() {
  const route = useRoute<any>();
  const { email } = route.params;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code || code.length < 5 || isNaN(Number(code)))
      return setError("الرجاء ادخال الكود المكون من 5 ارقام");

    setLoading(true);
    try {
      const response = await verifyRegisterCode(email, code);
      Toast.show({ type: "success", text1: response.data });
      NavigateAndReset("Login");
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const { data } = await resendCode(email);
      Toast.show({ type: "success", text1: data });
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data });
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
