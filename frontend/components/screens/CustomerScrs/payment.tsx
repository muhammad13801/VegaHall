import { useState } from "react";
import { Text, TouchableOpacity, View, StatusBar } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePaymentSheet } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";
import { NavigateTo } from "../../reusable func/navigateTo";
import { chargeBookingApi, confirmBookingPaymentApi } from "../../Services/customerApi";
import { styles as s } from "./ibrahimStyles";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";

const SummaryRow = ({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) => (
  <View style={total ? s.costTotalRow : s.summaryRow}>
    <Text style={total ? s.costTotalLabel : s.costLabel}>{label}</Text>
    <Text style={total ? s.priceText : s.costValue}>
      {value}
      {total && <Text style={s.currency}> ₪</Text>}
    </Text>
  </View>
);

export default function Payment({ route }: any) {
  const hallName: string = route?.params?.hallName || "";
  const totalCost: number = route?.params?.totalCost || 0;
  const amountToPayNow: number = route?.params?.amountToPayNow || totalCost;
  const remainingBalance: number = route?.params?.remainingBalance || 0;
  const bookingForm = route?.params?.bookingForm;

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const handlePay = async () => {
    if (!bookingForm) {
      Toast.show({ type: "error", text1: "بيانات الحجز مفقودة" });
      return;
    }

    setLoading(true);

    try {
      const { data } = await chargeBookingApi({ amount: amountToPayNow });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.paymentIntent,
        customerEphemeralKeySecret: data.ephemeralKey,
        customerId: data.customer,
        merchantDisplayName: "VegaHall",
        allowsDelayedPaymentMethods: false,
      });

      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Toast.show({ type: "error", text1: presentError.message });
        return;
      }

      const intentId = data.paymentIntent.split("_secret_")[0];

      await confirmBookingPaymentApi({
        paymentIntentId: intentId,
        ...bookingForm,
      });

      setPaid(true);
    } catch (err: any) {
      console.error(err);

      const errMsg =
        err.message ||
        err.response?.data ||
        "لا يمكن الاتصال بالخادم، حاول مرة أخرى لاحقاً";

      Toast.show({
        type: "error",
        text1: typeof errMsg === "string" ? errMsg : "لا يمكن الاتصال بالخادم",
      });
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <View style={s.successOverlay}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />

        <LinearGradient colors={["#E8F5E9", "#C8E6C9"]} style={s.successIconBox}>
          <Feather name="check" size={48} color="#4CAF50" />
        </LinearGradient>

        <Text style={s.successTitle}>تمت عملية الدفع بنجاح!</Text>

        <Text style={s.successAmount}>
          {amountToPayNow.toLocaleString()}{" "}
          <Text style={s.successCurrency}>₪</Text>
        </Text>

        <Text style={s.successSubtitle}>
          تم تأكيد حجزك في "{hallName}" بدفعة مبدئية.{"\n"}
          المتبقي للدفع لاحقاً: {remainingBalance.toLocaleString()} ₪{"\n"}
          ستصلك رسالة تأكيد قريباً عبر التطبيق.
        </Text>

        <TouchableOpacity style={s.successBtn} onPress={() => NavigateTo("Customer")}>
          <LinearGradient
            colors={["#7B5EC6", "#5B3A9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.successBtnGradient}
          >
            <Feather name="home" size={20} color="#FFF" />
            <Text style={s.successBtnText}>العودة للرئيسية</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#5B3A9E" />
      <BackgroundDecoration />
      <BackButton />

      <KeyboardAwareScreen>
        <Ionicons name="card" size={40} style={styles.screenIcon} />

        <Text style={styles.title}>الدفع الإلكتروني</Text>
        <Text style={styles.subtitle}>يتم الدفع بشكل آمن عبر Stripe</Text>

        <View style={styles.card}>
          <Text style={[styles.label, { textAlign: "center", marginBottom: 20 }]}>
            ملخص الدفع
          </Text>

          <View style={{ gap: 8 }}>
            <SummaryRow label="الصالة" value={hallName || "—"} />
            <SummaryRow label="التكلفة الكلية" value={`${totalCost.toLocaleString()} ₪`} />
            <SummaryRow
              label="الباقي يُدفع في الصالة"
              value={`${remainingBalance.toLocaleString()} ₪`}
            />
            <SummaryRow
              label="المطلوب الآن"
              value={amountToPayNow.toLocaleString()}
              total
            />
          </View>

          <Text
            style={[
              styles.profileLabel,
              {
                textAlign: "center",
                marginTop: 20,
                marginBottom: 8,
                color: "#666",
              },
            ]}
          >
            سيتم فتح بوابة دفع آمنة عند الضغط على الزر أدناه
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { flexDirection: "row", gap: 8 }]}
            activeOpacity={0.8}
            onPress={handlePay}
            disabled={loading}
          >
            <Feather name="credit-card" size={20} color="#FFF" />
            <Text style={[styles.actionButtonText, { fontSize: 16 }]}>
              {loading
                ? "جاري المعالجة..."
                : `إتمام الدفع (${amountToPayNow.toLocaleString()} ₪)`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}