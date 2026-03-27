import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { usePaymentSheet } from "@stripe/stripe-react-native";
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import BackButton from "../../reusable func/backButton";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import { NavigateAndReset } from "../../reusable func/navigateTo";
import {
  addHallApi,
  payHallApi,
  confirmPaymentApi,
} from "../../Services/hallApi";
import { styles } from "../../styles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentHall() {
  const route = useRoute<any>();
  const hallForm = route.params?.form;
  const [loading, setLoading] = useState(false);

  // 1. Initialize Stripe Hook
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const handlePay = async () => {
    setLoading(true);

    try {
      if (!hallForm) throw new Error("بيانات الصالة مفقودة");

      // 1. Create the hall first, get back hallId
      const addResponse = await addHallApi(hallForm);
      const hallId = addResponse.data.hallId;

      // 2. Ask backend for a Stripe PaymentIntent + ephemeralKey
      const { data } = await payHallApi({ hallId });

      // 3. Initialize the Payment Sheet with all required params
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.paymentIntent,
        customerEphemeralKeySecret: data.ephemeralKey,
        customerId: data.customer,
        merchantDisplayName: "VegaHall",
        allowsDelayedPaymentMethods: false,
      });

      if (initError) throw new Error(initError.message);

      // 4. Present the Stripe Payment Sheet UI
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Toast.show({
          type: "error",
          text1: "فشل الدفع",
          text2: presentError.message,
        });
      } else {
        // 5. Confirm to backend → activates the hall
        const intentId = data.paymentIntent.split("_secret_")[0]; // extract paymentIntentId
        await confirmPaymentApi({ hallId, paymentIntentId: intentId });

        Toast.show({
          type: "success",
          text1: "تم الدفع وتفعيل الصالة بنجاح ✔️",
        });
        NavigateAndReset("HallOwner", {
          screen: "Home",
          params: { refresh: true },
        });
      }
    } catch (err: any) {
      console.error(err);
      Toast.show({ type: "error", text1: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />
      <KeyboardAwareScreen>
        <Ionicons name="card" size={40} style={styles.screenIcon} />
        <Text style={styles.title}>تفعيل الصالة</Text>
        <Text style={styles.subtitle}>يتم الدفع بشكل آمن عبر Stripe</Text>

        <View style={styles.card}>
          {/* We remove the manual TextInputs for Card Number/CVV */}
          <Text
            style={[styles.label, { textAlign: "center", marginBottom: 20 }]}
          >
            سيتم فتح بوابة دفع آمنة عند الضغط على الزر أدناه
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { flexDirection: "row" }]}
            onPress={handlePay}
            disabled={loading}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "logo-usd"}
              size={22}
              color="#FFF"
              style={{ marginLeft: 8 }}
            />
            <Text style={[styles.actionButtonText, { fontSize: 18 }]}>
              {loading ? "جاري المعالجة..." : "ابدأ الدفع (50$)"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
