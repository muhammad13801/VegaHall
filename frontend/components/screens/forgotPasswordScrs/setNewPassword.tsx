import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { NavigateAndReset } from "../../reusable func/navigateTo";
import { SafeAreaView } from "react-native-safe-area-context";
import PasswordInput from "../../reusable func/passwordInput";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import { AuthData, validateAuth } from "../../Validations/validateAuth";

import { useRoute } from "@react-navigation/native";
import { updateNewPassword } from "../../Services/authApi";
import Toast from "react-native-toast-message";
import { useHandleChange } from "../../reusable func/useHandleChange";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

export default function SetNewPassword() {
  const [form, setForm] = useState<Partial<AuthData>>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const route = useRoute<any>();
  const { email } = route.params;

  const change = useHandleChange(setForm);

  const handleNewPassword = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await updateNewPassword(email, form.password!);
      Toast.show({
        type: "success",
        text1: response.data,
        visibilityTime: 3000,
      });
      NavigateAndReset("Login");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data,
        visibilityTime: 3000,
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
        <Text style={[styles.title, { fontSize: 33, marginBottom: 10 }]}>
          تغيير كلمة المرور
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>كلمة المرور الجديدة</Text>
          <PasswordInput
            password={form.password!}
            setPassword={(text) => change("password", text)}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <Text style={styles.cardText}>تاكيد كلمة المرور</Text>
          <PasswordInput
            password={form.confirmPassword!}
            setPassword={(text) => change("confirmPassword", text)}
            placeholder="تاكيد كلمة المرور"
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNewPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>حفظ</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
