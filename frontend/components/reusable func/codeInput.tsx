import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "./backButton";
import { styles } from "../styles";
import { Input } from "./input";
import KeyboardAwareScreen from "./keyboardAwarScreen";
import React, { useState, useEffect } from "react";
import BackgroundDecoration from "./backgroundDecoration";

interface CodeInputProps {
  title: string;
  subtitle: string;
  codeValue: string;
  valueToShow?: string;
  setCodeValue?: (text: string) => void;
  handleAction: () => void;
  handleActionResend: () => void;
  resendLoading: boolean;
  loading?: boolean;
  canResend?: boolean; // optional cooldown flag
  errors?: string;
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
  resendLoading,
  canResend = true,
  errors,
}: CodeInputProps) {
  const [timer, setTimer] = useState(0);
  const [internalCanResend, setInternalCanResend] = useState(canResend);

  // countdown effect
  useEffect(() => {
    setInternalCanResend(canResend);
  }, [canResend]);

  useEffect(() => {
    if (timer === 0) return setInternalCanResend(true);

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendPress = () => {
    if (!internalCanResend) return;

    handleActionResend();
    setTimer(60); // start 60s countdown
    setInternalCanResend(false); // disable button while counting down
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />
      <KeyboardAwareScreen>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {valueToShow && <Text style={styles.subtitle}>{valueToShow}</Text>}

        <View style={styles.card}>
          <Text style={styles.cardText}>رمز الكود</Text>

          <Input
            placeholder="#####"
            value={codeValue}
            onChangeText={setCodeValue}
            keyboardType="numeric"
            maxLength={5}
          />
          {errors && <Text style={styles.errorText}>{errors}</Text>}

          <TouchableOpacity
            onPress={handleResendPress}
            disabled={resendLoading || !internalCanResend}
            style={{ marginVertical: 10 }}
          >
            {resendLoading ? (
              <ActivityIndicator color="#6C4AB6" />
            ) : (
              <Text
                style={[
                  styles.resendCode,
                  !internalCanResend && { opacity: 0.5 },
                ]}
              >
                {internalCanResend
                  ? "إعادة إرسال كود جديد"
                  : `يمكن إعادة الإرسال بعد ${timer} ثانية`}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAction}
            disabled={loading}
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
