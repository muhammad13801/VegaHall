import { useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import BackButton from "../../../../reusable func/backButton";
import BackgroundDecoration from "../../../../reusable func/backgroundDecoration";
import { Err } from "../../../../reusable func/Err";
import { Input } from "../../../../reusable func/input";
import KeyboardAwareScreen from "../../../../reusable func/keyboardAwarScreen";
import { NavigateTo } from "../../../../reusable func/navigateTo";
import { useHandleChange } from "../../../../reusable func/useHandleChange";
import { sendResetCode } from "../../../../Services/authApi";
import { styles } from "../../../../styles";
import { AuthData, validateAuth } from "../../../../Validations/validateAuth";

export default function ForgotPassword() {
  const [form, setForm] = useState<Partial<AuthData>>({ email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const change = useHandleChange(setForm);

  const handleForgotPassword = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await sendResetCode(form.email!);
      Toast.show({ type: "success", text1: response.data });
      NavigateTo("PasswordCode", { email: form.email });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />
      <KeyboardAwareScreen>
        <Ionicons
          name="lock-closed-outline"
          size={64}
          style={styles.screenIcon}
        />
        <Text style={styles.title}>نسيت كلمة المرور؟</Text>
        <Text style={[styles.subtitle, { marginBottom: 20 }]}>
          ادخل البريد الإلكتروني الخاص بك
        </Text>

        <View style={styles.card}>
          <Input
            placeholder="البريد الالكتروني"
            value={form.email}
            onChangeText={(t) => change("email", t)}
            keyboardType="email-address"
          />
          <Err error={errors.email} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>التالي</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
