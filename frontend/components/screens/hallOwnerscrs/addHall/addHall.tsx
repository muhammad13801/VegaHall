import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import BackButton from "../../../reusable func/backButton";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { NavigateTo } from "../../../reusable func/navigateTo";
import { styles } from "../../../styles";
import { HallData, ValidateHall } from "../../../Validations/validateHall";

import BasicInfo from "./basicInfo";
import LocationPicker from "./locationPicker";
import MediaPicker from "./mediaPicker";
import ServicesPicker from "./servicesPicker";
import SecondaryContacts from "./secondaryContacts";
import Toast from "react-native-toast-message";
import { uploadToSupabase } from "../../../Services/uploadMedia";

export default function AddHall() {
  const [form, setForm] = useState<HallData>({
    name: "",
    city: "",
    address: "",
    location: "",
    capacity: 0,
    price: 0,
    description: "",
    services: [],
    images: [],
    videos: [],
    mealOptions: [],
    secondaryContacts: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const validationErrors = ValidateHall(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const uploadImagesUrls = await Promise.all(
        form.images.map((image) => uploadToSupabase(image, "images")),
      );

      let uploadVideosUrls: string[] = [];
      if (form.videos && form.videos.length > 0) {
        uploadVideosUrls = await Promise.all(
          form.videos.map((video) => uploadToSupabase(video, "videos")),
        );
      }

      const finalForm = {
        ...form,
        images: uploadImagesUrls,
        videos: uploadVideosUrls,
      };

      NavigateTo("PaymentHall", { form: finalForm });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "لا يمكن الاتصال بالخادم، حاول مرة أخرى لاحقا",
        visibilityTime: 3000,
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
        <Ionicons name="business" size={80} color={"#6C4AB6"} />
        <Text style={styles.title}>اضافة صالة</Text>
        <Text style={styles.subtitle}>اضف تفاصيل صالتك الرائعة</Text>

        <View style={styles.card}>
          <BasicInfo form={form} setForm={setForm} errors={errors} />

          <LocationPicker form={form} setForm={setForm} errors={errors} />

          <MediaPicker form={form} setForm={setForm} errors={errors} />

          <ServicesPicker form={form} setForm={setForm} errors={errors} />

          <SecondaryContacts form={form} setForm={setForm} errors={errors} />

          {/* next button */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
                  <Text style={styles.actionButtonText}>المتابعة للدفع</Text>
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
