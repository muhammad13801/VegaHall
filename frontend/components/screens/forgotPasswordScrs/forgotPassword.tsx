import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../reusable func/input";
import { useState } from "react";
import { NavigateTo } from "../../reusable func/navigateTo";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import { AuthData, validateAuth } from "../../Validations/validateAuth";
import { handleErrorChange } from "../../reusable func/handleErrorChange";
import { sendResetCode } from "../../Services/authApi";
import Toast from "react-native-toast-message";

export default function ForgotPassword() {
  const [form, setForm] = useState<Partial<AuthData>>({ email: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const change = handleErrorChange(setForm);

  const handleForgotPassword = async () => {
    const validationErrors = validateAuth(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await sendResetCode(form.email!);
      Toast.show({
        type: "success",
        text1: response.data,
        visibilityTime: 3000,
      });
      NavigateTo("PasswordCode", { email: form.email });
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
            onChangeText={(text) => change("email", text)}
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

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
