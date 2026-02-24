import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { NavigateAndReset } from "../../reusable func/navigateTo";
import { SafeAreaView } from "react-native-safe-area-context";
import PasswordInput from "../../reusable func/passwordInput";
import { styles } from "../../styles";
import BackButton from "../../reusable func/backButton";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";

export default function SetNewPassword() {
  const [password, setPassword] = useState<string>("");
  const [rePassword, setRePassword] = useState<string>("");

  const handleNewPassword = () => {
    NavigateAndReset("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <KeyboardAwareScreen>
        <Text style={[styles.title, { fontSize: 33, marginBottom: 10 }]}>
          تغيير كلمة المرور
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>كلمة المرور الجديدة</Text>
          <PasswordInput password={password} setPassword={setPassword} />

          <Text style={styles.cardText}>تاكيد كلمة المرور</Text>
          <PasswordInput password={rePassword} setPassword={setRePassword} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNewPassword}
          >
            <Text style={styles.actionButtonText}>حفظ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
