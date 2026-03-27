import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../styles";
import BackButton from "../../../reusable func/backButton";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import { NavigateTo } from "../../../reusable func/navigateTo";
import Toast from "react-native-toast-message";
import { AuthData, validateAuth } from "../../../Validations/validateAuth";
import PasswordInput from "../../../reusable func/passwordInput";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { changePasswordApi } from "../../../Services/userApi";

export default function UpdatePassword() {
  const [form, setForm] = useState<Partial<AuthData>>({
    password: "",
    confirmPassword: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const change = useHandleChange(setForm);

  const handlePasswordChange = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (oldPassword === "")
      return setErrors((prev) => ({ ...prev, oldPassword: "الحقل مطلوب" }));

    if (oldPassword === form.password)
      return setErrors((prev) => ({
        ...prev,
        password: "كلمة المرور القديمة والجديدة متطابقة",
      }));
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await changePasswordApi({
        oldPassword,
        password: form.password,
      });

      Toast.show({ type: "success", text1: "✅ تم تغيير كلمة المرور بنجاح" });
      setTimeout(() => {
        NavigateTo("HallOwner", {
          screen: "Profile",
          params: { refresh: true },
        });
      }, 1500);
    } catch (err: any) {
      console.log("Change password error:", err);
      const errorMessage =
        err.response?.data || err.message || "حدث خطأ غير متوقع";
      Toast.show({
        type: "error",
        text1: errorMessage,
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
          size={40}
          style={styles.screenIcon}
        ></Ionicons>
        <Text style={[styles.title, { fontSize: 33 }]}>تغيير كلمة المرور</Text>
        <Text style={styles.subtitle}>أدخل كلمة المرور الحالية والجديدة</Text>

        <View style={styles.card}>
          <PasswordInput
            password={oldPassword}
            setPassword={setOldPassword}
            placeholder="كلمة المرور الحالية"
          />
          {errors.oldPassword && (
            <Text style={styles.errorText}>{errors.oldPassword}</Text>
          )}

          <PasswordInput
            password={form.password!}
            setPassword={(val) => change("password", val)}
            placeholder={"كلمة المرور الجديدة"}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <View style={styles.passwordHintBox}>
            <Text style={styles.passwordHintTitle}>
              كلمة المرور يجب أن تحتوي على:
            </Text>
            <Text style={styles.passwordHintText}>• 8 إلى 30 حرف</Text>
            <Text style={styles.passwordHintText}>• رقم واحد على الأقل</Text>
            <Text style={styles.passwordHintText}>• رمز واحد على الأقل</Text>
            <Text style={styles.passwordHintText}>
              • حرف كبير واحد على الأقل
            </Text>
          </View>

          <PasswordInput
            password={form.confirmPassword!}
            setPassword={(text) => change("confirmPassword", text)}
            placeholder={"تاكيد كلمة المرور الجديدة"}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { flexDirection: "row" }]}
            onPress={handlePasswordChange}
            disabled={loading}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "checkmark-circle-outline"}
              size={22}
              color="#FFF"
              style={{ marginLeft: 8 }}
            />
            <Text style={[styles.actionButtonText, { fontSize: 18 }]}>
              {loading ? "جاري التحقق..." : "تحقق"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
