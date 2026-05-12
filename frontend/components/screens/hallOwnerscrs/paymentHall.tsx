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
import { payHallApi, confirmPaymentApi } from "../../Services/hallApi";
import { styles } from "../../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadToSupabase } from "../../Services/uploadMedia";

export default function PaymentHall() {
  const route = useRoute<any>();
  const hallForm = route.params?.form;
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const handlePay = async () => {
    if (!hallForm)
      return Toast.show({ type: "error", text1: "بيانات الصالة مفقودة" });

    setLoading(true);
    try {
      const { data } = await payHallApi();

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.paymentIntent,
        customerEphemeralKeySecret: data.ephemeralKey,
        customerId: data.customer,
        merchantDisplayName: "VegaHall",
        allowsDelayedPaymentMethods: false,
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw new Error(presentError.message);

      const uploadMedia = (uris: string[] = [], type: "images" | "videos") =>
        Promise.all(uris.map((u) => uploadToSupabase(u, type)));

      const [uploadImagesUrls, uploadVideosUrls] = await Promise.all([
        uploadMedia(hallForm.images, "images"),
        uploadMedia(hallForm.videos, "videos"),
      ]);

      const intentId = data.paymentIntent.split("_secret_")[0];
      const response = await confirmPaymentApi({
        paymentIntentId: intentId,
        ...hallForm,
        images: uploadImagesUrls,
        videos: uploadVideosUrls,
      });

      Toast.show({ type: "success", text1: response.data });
      NavigateAndReset("HallOwner", {
        screen: "Home",
        params: { refresh: true },
      });
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1:
          err.message || err.response?.data || "فشل الدفع أو الاتصال بالخادم",
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
        <Ionicons name="card" size={40} style={styles.screenIcon} />
        <Text style={styles.title}>تفعيل الصالة</Text>
        <Text style={styles.subtitle}>يتم الدفع بشكل آمن عبر Stripe</Text>

        <View style={styles.card}>
          <Text
            style={[styles.label, { textAlign: "center", marginBottom: 20 }]}
          >
            ليتم تفعيل واضافة صالتك يجب عليك دفع 50$
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { flexDirection: "row" }]}
            onPress={handlePay}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, { fontSize: 18 }]}>
              {loading ? "جاري المعالجة..." : "ابدأ الدفع (50$)"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
