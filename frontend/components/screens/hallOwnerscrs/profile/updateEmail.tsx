import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../../styles";
import BackButton from "../../../reusable func/backButton";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { Input } from "../../../reusable func/input";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { NavigateAndReset } from "../../../reusable func/navigateTo";
import { AuthData, validateAuth } from "../../../Validations/validateAuth";
import { Ionicons } from "@expo/vector-icons";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { checkEmailApi, updateEmailApi } from "../../../Services/userApi";
import { Err } from "../../../reusable func/Err";

export default function UpdateEmail() {
  const [form, setForm] = useState<Partial<AuthData>>({ email: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<boolean>(false);

  const change = useHandleChange(setForm);

  const handleEmailCheck = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await checkEmailApi({ email: form.email });
      Toast.show({ type: "success", text1: response.data });
      setResult(true);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0)
      return setErrors(validationErrors);

    setLoading(true);

    try {
      const response = await updateEmailApi({
        email: form.email,
        code,
      });
      Toast.show({ type: "success", text1: response.data });
      NavigateAndReset("HallOwner", {
        screen: "Profile",
        params: { refresh: true },
      });
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
          name="mail-outline"
          size={40}
          style={styles.screenIcon}
        ></Ionicons>
        <Text style={styles.title}>تعديل البريد الإلكتروني</Text>
        <View style={styles.card}>
          <Input
            style={styles.input}
            placeholder="ادخل البريد الإلكتروني الجديد"
            value={form.email}
            onChangeText={(val) => change("email", val)}
            editable={!result}
          />
          <Err error={errors.email} />

          {result && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="key-outline"
                  size={24}
                  style={[styles.screenIcon, { marginLeft: 5 }]}
                />
                <Text style={styles.label}>رمز التحقق</Text>
              </View>
              <Input
                style={styles.input}
                placeholder="#####"
                value={code}
                onChangeText={setCode}
                maxLength={5}
              />
            </>
          )}

          <View style={{ height: 20 }} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={result ? handleUpdateEmail : handleEmailCheck}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>
                {result ? "حفظ التغييرات" : "إرسال رمز التحقق"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
