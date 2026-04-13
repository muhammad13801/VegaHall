import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { Text, ActivityIndicator, View, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import BackButton from "../../reusable func/backButton";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import { NavigateAndReset } from "../../reusable func/navigateTo";
import { getHallApi, updateHallApi } from "../../Services/hallApi";
import { uploadToSupabase } from "../../Services/uploadMedia";
import { styles } from "../../styles";
import { HallData, ValidateHall } from "../../Validations/validateHall";
import BasicInfo from "./addHall/basicInfo";
import LocationPicker from "./addHall/locationPicker";
import MediaPicker from "./addHall/mediaPicker";
import SecondaryContacts from "./addHall/secondaryContacts";
import ServicesPicker from "./addHall/servicesPicker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageHall() {
  const route = useRoute<any>();
  const hallId = route.params?.hallId;

  const [form, setForm] = useState<HallData>({
    name: "",
    city: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    capacity: 0,
    price: 0,
    description: "",
    images: [],
    videos: [],
    services: [],
    mealOptions: [],
    secondaryContacts: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const { data } = await getHallApi(hallId);
        setForm({
          name: data.hall_name,
          city: data.city,
          address: data.address,
          latitude: data.latitude ?? undefined,
          longitude: data.longitude ?? undefined,
          capacity: data.capacity,
          price: data.base_price,
          description: data.description,
          images: data.images || [],
          videos: data.videos || [],
          services:
            data.services?.map((s: any) => ({
              serviceId: s.service_id,
              name: s.name,
              price: s.price,
            })) || [],
          mealOptions:
            data.mealOptions?.map((m: any) => ({
              mealTypeId: m.meal_type_id,
              name: m.name,
              pricePerPerson: m.price_per_person,
            })) || [],
          secondaryContacts:
            data.secondaryContacts?.map((c: any) => ({
              firstName: c.first_name,
              lastName: c.last_name,
              phone: c.phone_number,
            })) || [],
        });
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: err.response?.data || "فشل تحميل بيانات الصالة",
        });
      } finally {
        setFetching(false);
      }
    };
    fetchHall();
  }, [hallId]);

  const handleSave = async () => {
    const validationErrors = ValidateHall(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const uploadedImages = await Promise.all(
        form.images.map((uri: string) =>
          uri.startsWith("http") ? uri : uploadToSupabase(uri, "images"),
        ),
      );

      const uploadedVideos = await Promise.all(
        (form.videos || []).map((uri: string) =>
          uri.startsWith("http") ? uri : uploadToSupabase(uri, "videos"),
        ),
      );

      const response = await updateHallApi(hallId, {
        ...form,
        images: uploadedImages,
        videos: uploadedVideos,
      });

      Toast.show({ type: "success", text1: response.data });
      NavigateAndReset("HallOwner", {
        screen: "Home",
        params: { refresh: true },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1:
          err.response?.data || "لا يمكن الاتصال بالخادم، حاول مرة أخرى لاحقا",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#6C4AB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />
      <KeyboardAwareScreen>
        <Ionicons name="business" size={80} color="#6C4AB6" />
        <Text style={styles.title}>إدارة الصالة</Text>
        <Text style={styles.subtitle}>تعديل تفاصيل صالتك</Text>

        <View style={styles.card}>
          <BasicInfo form={form} setForm={setForm} errors={errors} />
          <LocationPicker form={form} setForm={setForm} errors={errors} />
          <MediaPicker form={form} setForm={setForm} errors={errors} />
          <ServicesPicker form={form} setForm={setForm} errors={errors} />
          <SecondaryContacts form={form} setForm={setForm} errors={errors} />

          <View style={{ marginTop: 20, gap: 10 }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>حفظ التعديلات</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
