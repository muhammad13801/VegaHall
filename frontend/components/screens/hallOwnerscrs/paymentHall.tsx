import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { NavigateAndReset } from "../../reusable func/navigateTo";
import { handleErrorChange } from "../../reusable func/handleErrorChange";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import BackButton from "../../reusable func/backButton";
import { Input } from "../../reusable func/input";
import { TextInputMask } from "react-native-masked-text";

export default function PaymentHall() {
  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [loading, setLoading] = useState(false);

  const change = handleErrorChange(setForm);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);

    /// important fix
    NavigateAndReset("HallOwner", {
      screen: "Home",
      params: { refresh: true },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <KeyboardAwareScreen>
        <Ionicons name="card" size={40} style={styles.screenIcon}></Ionicons>
        <Text style={styles.title}>تفعيل الصالة</Text>
        <Text style={styles.subtitle}>يجب دفع رسوم التفعيل 50$ لنشر صالتك</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="person-outline"
              size={18}
              style={[styles.screenIcon, { marginLeft: 6 }]}
            />
            <Text style={styles.label}>الاسم على البطاقة</Text>
          </View>
          <Input
            placeholder={"الاسم الكامل كما يظهر على البطاقة"}
            value={form.name}
            onChangeText={(val) => change("name", val)}
          />

          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="medical-outline"
              size={18}
              style={[styles.screenIcon, { marginLeft: 6 }]}
            />
            <Text style={styles.label}>رقم البطاقة</Text>
          </View>
          <TextInputMask
            style={styles.input}
            type="only-numbers"
            options={{ format: "0000 0000 0000 0000" }}
            placeholder={"0000 0000 0000 0000"}
            value={form.cardNumber}
            onChangeText={(val) => change("cardNumber", val)}
          />

          <View style={styles.info}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  style={[styles.screenIcon, { marginLeft: 6 }]}
                />
                <Text style={styles.label}>تاريخ الانتهاء</Text>
              </View>

              <TextInputMask
                type="datetime"
                options={{ format: "MM/YY" }}
                style={[styles.input, { textAlign: "center" }]}
                placeholder="MM/YY"
                value={form.expiry}
                onChangeText={(val) => change("expiry", val)}
              />
            </View>
            <View style={styles.gapBetween} />

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  style={[styles.screenIcon, { marginLeft: 6 }]}
                />
                <Text style={styles.label}>رقم CVV</Text>
              </View>
              <Input style={{ textAlign: "center" }} placeholder={"123"} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { flexDirection: "row" }]}
            onPress={handlePay}
            disabled={loading}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "checkmark-circle-outline"}
              size={22}
              color="#FFF"
              style={{ marginLeft: 8 }}
            />
            <Text style={[styles.actionButtonText, { fontSize: 18 }]}>
              {loading ? "جاري الدفع..." : "تأكيد ودفع 50$"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
