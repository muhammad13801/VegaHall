import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBack } from "../../reusable func/navigateTo";
import { styles as s } from "./ibrahimStyles";
import { createRatingApi } from "../../Services/customerApi";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import Toast from "react-native-toast-message";
import { useRefresh } from "../../reusable func/refreshContext";

const RATING_LABELS = ["", "سيء جداً 😞", "سيء 😕", "جيد 🙂", "جيد جداً 😊", "ممتاز 🤩"];

export default function RateHall({ route }: any) {
  const hallName: string = route?.params?.hallName || "";
  const hallCity: string = route?.params?.hallCity || "";
  const bookingId: string = route?.params?.bookingId || "";
  const hallId: number = route?.params?.hallId;
  const { triggerRefresh } = useRefresh();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = rating > 0;

  const handleSubmit = async () => {
    if (!hallId || !bookingId) return;
    setLoading(true);
    try {
      await createRatingApi({
        hallId,
        bookingId,
        rating,
        comment: comment
      });

      Toast.show({
        type: "success",
        text1: `تم إرسال تقييمك لـ "${hallName}" بنجاح. ⭐`
      });
      triggerRefresh();
      setTimeout(goBack, 1500);
    } catch (err: any) { // [معدّل - كان error]
      console.error("Submission failed:", err);
      const errMsg = err.response?.data || "فشل في إرسال التقييم. يرجى المحاولة مرة أخرى."; // [معدّل]

      Toast.show({
        type: "error",
        text1: typeof errMsg === 'string' ? errMsg : "فشل في إرسال التقييم."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />
      <View style={[styles.info, { width: "90%", alignSelf: "center", marginTop: 30, alignItems: 'center' }]}>
        <Text style={[styles.title, { fontSize: 28, lineHeight: 35 }]}>تقييم الصالة</Text>
        <View style={{ marginBottom: -5, transform: [{ scaleX: -1 }] }}>
          <BackButton />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* بيانات الصالة */}
        <View style={[styles.card, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
          <View style={{ alignItems: "flex-start", marginRight: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1A1A2E" }}>{hallName}</Text>
            <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>📍 {hallCity}</Text>
          </View>
        </View>

        {/* النجوم */}
        <View style={s.card}>
          <Text style={[s.label, { textAlign: "center", fontSize: 16, marginBottom: 5 }]}>كيف كانت تجربتك؟</Text>
          <Text style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 15 }}>اضغط على النجوم لتقييم الصالة</Text>

          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={s.starBtn}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Feather
                  name="star"
                  size={42}
                  color={star <= rating ? "#F4B400" : "#E0E0E0"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={s.ratingLabel}>{RATING_LABELS[rating]}</Text>
          )}
        </View>

        {/* التعليق */}
        <View style={s.card}>
          <Text style={s.label}>📝 أضف تعليقك</Text>
          <TextInput
            style={[s.input, { height: 120, textAlignVertical: "top", paddingVertical: 12 }]}
            placeholder="شاركنا تجربتك بالتفصيل..."
            placeholderTextColor="#CCC"
            multiline
            value={comment}
            onChangeText={(text) => setComment(text.slice(0, 500))}
            maxLength={500}
          />
          <Text style={{ fontSize: 12, color: "#AAA", textAlign: "left" }}>{comment.length}/500</Text>
        </View>

        {/* زر الإرسال */}
        <TouchableOpacity
          style={[s.primaryButton, (!isValid || loading) && s.primaryButtonDisabled, { marginTop: 10 }]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? (
            <Feather name="loader" size={20} color="#FFF" />
          ) : (
            <Feather name="send" size={20} color="#FFF" />
          )}
          <Text style={s.primaryButtonText}>{loading ? "جاري الإرسال.." : "إرسال التقييم"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}