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
  handleActionResend: () => Promise<void> | void;
  resendLoading: boolean;
  loading?: boolean;
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
  errors,
}: CodeInputProps) {
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // countdown logic
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendPress = async () => {
    if (!canResend || resendLoading) return;

    setCanResend(false);
    setTimer(60); // start countdown immediately

    try {
      await handleActionResend();
    } catch {
      setTimer(0);
      setCanResend(true);
    }
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
            disabled={!canResend || resendLoading}
            style={{ marginVertical: 10 }}
          >
            {resendLoading ? (
              <ActivityIndicator color="#6C4AB6" />
            ) : (
              <Text style={[styles.actionText, !canResend && { opacity: 0.5 }]}>
                {canResend
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
