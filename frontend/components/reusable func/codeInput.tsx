import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "./backButton";
import { styles } from "../styles";
import { Input } from "./input";
import KeyboardAwareScreen from "./keyboardAwarScreen";

interface CodeInputProps {
  title: string;
  subtitle: string;
  codeValue: string;
  valueToShow?: string;
  setCodeValue?: (text: string) => void;
  handleAction: () => void;
  handleActionResend: () => void;
  loading?: boolean;
}

export default function CodeInput({
  title,
  subtitle,
  codeValue,
  valueToShow,
  setCodeValue,
  handleAction,
  handleActionResend,
  loading,
}: CodeInputProps) {
  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <KeyboardAwareScreen>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <Text style={styles.subtitle}>{valueToShow}</Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>رمز الكود</Text>

          <Input
            placeholder="#####"
            value={codeValue}
            onChangeText={setCodeValue}
            keyboardType="numeric"
            maxLength={5}
          />

          <TouchableOpacity onPress={handleActionResend}>
            <Text style={styles.resendCode}>اعادة ارسال كود جديد</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAction}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>التالي</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
