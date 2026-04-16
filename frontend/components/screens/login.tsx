import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Input } from "../reusable func/input";
import { NavigateAndReset, NavigateTo } from "../reusable func/navigateTo";
import { SafeAreaView } from "react-native-safe-area-context";
import PasswordInput from "../reusable func/passwordInput";
import { styles } from "../styles";
import KeyboardAwareScreen from "../reusable func/keyboardAwarScreen";
import { AuthData, validateAuth } from "../Validations/validateAuth";
import { login } from "../Services/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useHandleChange } from "../reusable func/useHandleChange";
import BackgroundDecoration from "../reusable func/backgroundDecoration";
//import { registerPushToken } from "../Services/notificationApi";

export default function Login() {
  const [form, setForm] = useState<Partial<AuthData>>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const change = useHandleChange(setForm);

  const handleLogin = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await login(form.email!, form.password!);
      const { sessionId, role } = res.data;
      await AsyncStorage.setItem("sessionId", sessionId);

     // await registerPushToken();

      Toast.show({
        type: "success",
        text1: res.data.message,
      });

      if (role === "customer") return NavigateAndReset("Customer");
      else if (role === "owner") return NavigateAndReset("HallOwner");
      else if (role === "admin") return NavigateAndReset("Admin");
    } catch (err: any) {
      return Toast.show({
        type: "error",
        text1:
          err.response?.data || "لا يمكن الاتصال بالخادم، حاول مرة أخرى لاحقا",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <KeyboardAwareScreen>
        <Text style={styles.title}>Vega Hall</Text>
        <Text style={styles.subtitle}>احجز مناسبتك بكل سهولة</Text>

        <View style={styles.card}>
          <Input
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChangeText={(text) => change("email", text)}
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <PasswordInput
            password={form.password!}
            setPassword={(text) => change("password", text)}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TouchableOpacity onPress={() => NavigateTo("ForgotPassword")}>
            <Text style={styles.actionText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>

          <View style={{ marginTop: 12 }} />
          <View style={[styles.justifyCenter, styles.row]}>
            <Text>ليس لديك حساب؟</Text>
            <TouchableOpacity onPress={() => NavigateTo("SignUp")}>
              <Text style={styles.actionText}> إنشاء حساب</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
