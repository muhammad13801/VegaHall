import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
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

  const handleNext = useCallback(async () => {
    const validationErrors = ValidateHall(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    NavigateTo("PaymentHall", { form });
  }, [form]);

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
              activeOpacity={0.8}
            >
              <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
                <Text style={styles.actionButtonText}>المتابعة للدفع</Text>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
