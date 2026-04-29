import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import BackButton from "../../../reusable func/backButton";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../../styles";
import { useState } from "react";
import { phoneRegex } from "../../../reusable func/regex";
import Toast from "react-native-toast-message";
import { NavigateAndReset } from "../../../reusable func/navigateTo";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { updatePhoneApi } from "../../../Services/userApi";
import MaskInput from "react-native-mask-input";
import { Err } from "../../../reusable func/Err";
import { phoneMask } from "../../userScrs/signUpScrs/signUp";

export default function UpdatePhone() {
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleUpdatePhone = async () => {
    if (!phone || !phoneRegex.test(phone))
      return setError("رقم الهاتف غير صالح");

    setLoading(true);

    try {
      const response = await updatePhoneApi({ phone });
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
          name="call-outline"
          size={40}
          style={styles.screenIcon}
        ></Ionicons>
        <Text style={styles.title}>تعديل رقم الهاتف</Text>
        <View style={styles.card}>
          <MaskInput
            value={phone}
            onChangeText={setPhone}
            mask={phoneMask}
            keyboardType="phone-pad"
            placeholder="+97X-5XX-XXX-XXX"
            placeholderTextColor="#999"
            style={[styles.input, { textAlign: "center", direction: "ltr" }]}
          />
          <Err error={error} />

          <View style={{ height: 20 }} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleUpdatePhone}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>حفظ التغييرات</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
