import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import BackButton from "../../../reusable func/backButton";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { useState } from "react";
import { phoneRegex } from "../../../reusable func/regex";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updatePhoneApi } from "../../../Services/authApi";
import { NavigateAndReset } from "../../../reusable func/navigateTo";
import { TextInputMask } from "react-native-masked-text";

export default function UpdatePhone() {
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleUpdatePhone = async () => {
    if (!phone || !phoneRegex.test(phone))
      return setError("رقم الهاتف غير صالح");

    setLoading(true);

    try {
      const sessionId = await AsyncStorage.getItem("sessionId");
      const response = await updatePhoneApi(sessionId!, { phone });
      Toast.show({ type: "success", text1: response.data });
      NavigateAndReset("HallOwner", {
        screen: "Profile",
        params: { refresh: true },
      });
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data });
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
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
          <TextInputMask
            type={"custom"}
            options={{
              mask: "+97C-5DD-DDD-DDD",
              translation: {
                "9": (val: string) => (val === "9" ? val : "9"),
                "7": (val: string) => (val === "7" ? val : "7"),
                C: (val: string) => (/[02]/.test(val) ? val : null),
                D: (val: string) => (/[0-9]/.test(val) ? val : null),
              },
            }}
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            placeholder="+97X-XXX-XXX-XXX"
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
