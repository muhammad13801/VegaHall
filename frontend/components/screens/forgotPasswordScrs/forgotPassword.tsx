import { Text, TouchableOpacity, View } from "react-native";
import { Input } from "../../reusable func/input";
import { useState } from "react";
import { NavigateTo } from "../../reusable func/navigateTo";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const handleForgotPassword = () => {
    NavigateTo("PasswordCode", { email });
  };
  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <KeyboardAwareScreen>
        <Text style={styles.title}>نسيت كلمة المرور؟</Text>
        <Text style={styles.subtitle}> ادخل البريد الالكتروني الخاص بك</Text>

        <View style={styles.card}>
          <Input
            placeholder="البريد الالكتروني"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.actionButtonText}>التالي</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
