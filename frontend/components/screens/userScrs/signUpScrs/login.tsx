import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Input } from "../../../reusable func/input";
import PasswordInput from "../../../reusable func/passwordInput";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { Err } from "../../../reusable func/Err";
import {
  NavigateAndReset,
  NavigateTo,
} from "../../../reusable func/navigateTo";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import { styles } from "../../../styles";
import { AuthData, validateAuth } from "../../../Validations/validateAuth";
import { login } from "../../../Services/authApi";
//import { registerPushToken } from "../../../Services/notificationApi";

export default function Login() {
  const [form, setForm] = useState<Partial<AuthData>>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const change = useHandleChange(setForm);

  const handleLogin = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const { data } = await login(form.email!, form.password!);

      // Store sessionId as before
      await AsyncStorage.setItem("sessionId", data.sessionId);
      await AsyncStorage.setItem("userId", data.userId.toString());

      //await registerPushToken();

      Toast.show({ type: "success", text1: data.message });

      const routes: Record<string, any> = {
        customer: "Customer",
        owner: "HallOwner",
        admin: "Admin",
      };
      if (routes[data.role]) return NavigateAndReset(routes[data.role]);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || err.message || "فشل الاتصال بالخادم",
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
            onChangeText={(t) => change("email", t)}
            keyboardType="email-address"
          />
          <Err error={errors.email} />

          <PasswordInput
            password={form.password!}
            setPassword={(t) => change("password", t)}
          />
          <Err error={errors.password} />

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

          <View style={[styles.justifyCenter, styles.row, { marginTop: 12 }]}>
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
