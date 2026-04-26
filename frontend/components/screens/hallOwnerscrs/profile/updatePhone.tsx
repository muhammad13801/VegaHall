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
import { phoneMask } from "../../signUpScrs/signUp";
import MaskInput from "react-native-mask-input";

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
        <Text style={styles.title}>تعديل رقم الهاتف</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="call-outline"
              size={24}
              style={[styles.screenIcon, { marginLeft: 5 }]}
            />
            <Text style={styles.label}>رقم الهاتف</Text>
          </View>
          <MaskInput
            value={phone}
            onChangeText={setPhone}
            mask={phoneMask}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            style={[styles.input, { textAlign: "center", direction: "ltr" }]}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

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
