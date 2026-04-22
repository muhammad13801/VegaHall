import { useState } from "react";
import {
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { NavigateTo } from "../../reusable func/navigateTo";
import { styles as s } from "./ibrahimStyles";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import { usePaymentSheet } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";
import { chargeBookingApi, confirmBookingPaymentApi } from "../../Services/customerApi";

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
                Toast.show({
                    type: "error",
                    text1: presentError.message,
                    
                });
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
            const errMsg = err.response?.data || "لا يمكن الاتصال بالخادم، حاول مرة أخرى لاحقا";
            Toast.show({
                type: "error",
                text1: typeof errMsg === 'string' ? errMsg : "لا يمكن الاتصال بالخادم",
            });
        } finally {
            setLoading(false);
        }
    };

    if (paid) {
        return (
            <View style={s.successOverlay}>
                <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />
                <LinearGradient
                    colors={["#E8F5E9", "#C8E6C9"]}
                    style={s.successIconBox}
                >
                    <Feather name="check" size={48} color="#4CAF50" />
                </LinearGradient>

                <Text style={s.successTitle}>تمت عملية الدفع بنجاح!</Text>
                <Text style={s.successAmount}>
                    {amountToPayNow.toLocaleString()} <Text style={s.successCurrency}>₪</Text>
                </Text>
                <Text style={s.successSubtitle}>
                    تم تأكيد حجزك في "{hallName}" بدفعة مبدئية.{"\n"}
                    المتبقي للدفع لاحقاً: {remainingBalance.toLocaleString()} ₪{"\n"}
                    ستصلك رسالة تأكيد قريباً عبر التطبيق.
                </Text>

                <TouchableOpacity
                    style={s.successBtn}
                    onPress={() => NavigateTo("Customer")}
                >
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
            <BackgroundDecoration/>
            <View style={[styles.info,{width:"90%",marginVertical:5}]}>
                  <Text style={styles.title}>الدفع الإلكتروني</Text>
                  <BackButton/>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.listContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Order Summary */}
                <View style={s.card}>
                    <Text style={s.label}>💰 ملخص الدفع</Text>
                    <View style={s.summaryRow}>
                        <Text style={s.costLabel}>الاسم</Text>
                        <Text style={s.costValue}>{hallName}</Text>
                    </View>
                    <View style={[s.summaryRow, { marginTop: 10 }]}>
                        <Text style={[s.costLabel, { fontSize: 14 }]}>التكلفة الكلية</Text>
                        <Text style={[s.costValue, { fontSize: 14 }]}>{totalCost.toLocaleString()} ₪</Text>
                    </View>
                    <View style={s.summaryRow}>
                        <Text style={[s.costLabel, { fontSize: 14 }]}>الباقي (يُدفع في الصالة)</Text>
                        <Text style={[s.costValue, { fontSize: 14 }]}>{remainingBalance.toLocaleString()} ₪</Text>
                    </View>
                    <View style={s.costTotalRow}>
                        <Text style={s.costTotalLabel}>المبلغ المطلوب الآن</Text>
                        <Text style={s.priceText}>
                            {amountToPayNow.toLocaleString()} <Text style={s.currency}>₪</Text>
                        </Text>
                    </View>
                </View>

                {/* Stripe Checkout */}
                <View style={[s.card, { alignItems: 'center' }]}>
                    <Text style={[s.label, { textAlign: "center", marginBottom: 20 }]}>
                        سيتم فتح بوابة دفع آمنة عند الضغط على الزر أدناه
                    </Text>

                    <TouchableOpacity
                        style={[s.primaryButton, loading && s.primaryButtonDisabled]}
                        activeOpacity={0.8}
                        onPress={handlePay}
                        disabled={loading}
                    >
                        <Feather name="credit-card" size={20} color="#FFF" />
                        <Text style={s.primaryButtonText}>
                            {loading ? "جاري المعالجة..." : `إتمام عملية الدفع (${amountToPayNow.toLocaleString()} ₪)`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}