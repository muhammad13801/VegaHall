import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Input } from "../reusable func/input";
import { NavigateTo } from "../reusable func/navigateTo";
import { SafeAreaView } from "react-native-safe-area-context";
import PasswordInput from "../reusable func/passwordInput";
import { styles } from "../styles";
import KeyboardAwareScreen from "../reusable func/keyboardAwarScreen";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = () => {
    if (password.length < 8) return setError("كلمة المرور قصيرة!");
    NavigateTo("Customer");
    setError("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScreen>
        <Text style={styles.title}>Vega Hall</Text>
        <Text style={styles.subtitle}>احجز مناسبتك بكل سهولة</Text>

        <View style={styles.card}>
          <Input
            placeholder="البريد الإلكتروني"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <PasswordInput password={password} setPassword={setPassword} />
          {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity onPress={() => NavigateTo("ForgotPassword")}>
            <Text style={styles.forgotPassword}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogin}>
            <Text style={styles.actionButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text>ليس لديك حساب؟</Text>
            <TouchableOpacity onPress={() => NavigateTo("SignUp")}>
              <Text style={styles.signUpText}> إنشاء حساب</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
