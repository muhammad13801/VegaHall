import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import BackButton from "../../../../reusable func/backButton";
import BackgroundDecoration from "../../../../reusable func/backgroundDecoration";
import { Err } from "../../../../reusable func/Err";
import KeyboardAwareScreen from "../../../../reusable func/keyboardAwarScreen";
import { NavigateAndReset } from "../../../../reusable func/navigateTo";
import PasswordInput from "../../../../reusable func/passwordInput";
import { useHandleChange } from "../../../../reusable func/useHandleChange";
import { updateNewPassword } from "../../../../Services/authApi";
import { styles } from "../../../../styles";
import { AuthData, validateAuth } from "../../../../Validations/validateAuth";

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
      });
      NavigateAndReset("Login");
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
        <Text style={[styles.title, { fontSize: 33, marginBottom: 10 }]}>
          تغيير كلمة المرور
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>كلمة المرور الجديدة</Text>
          <PasswordInput
            password={form.password!}
            setPassword={(t) => change("password", t)}
          />
          <Err error={errors.password} />

          <Text style={styles.cardText}>تاكيد كلمة المرور</Text>
          <PasswordInput
            password={form.confirmPassword!}
            setPassword={(t) => change("confirmPassword", t)}
            placeholder="تاكيد كلمة المرور"
          />
          <Err error={errors.confirmPassword} />

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
