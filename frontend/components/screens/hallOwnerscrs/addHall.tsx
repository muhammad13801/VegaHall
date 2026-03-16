import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { NavigateTo } from "../../reusable func/navigateTo";
import { handleErrorChange } from "../../reusable func/handleErrorChange";
import * as ImagePicker from "expo-image-picker";
import { Input } from "../../reusable func/input";
import BackButton from "../../reusable func/backButton";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";

const PALESTINE_CITIES = [
  "الخليل",
  "إذنا",
  "رام الله",
  "نابلس",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "بيت لحم",
  "أريحا",
  "طوباس",
  "سلفيت",
  "غزة",
  "القدس",
];

const AVAILABLE_SERVICES = [
  "تكييف مركزي",
  "إضاءة ليزر",
  "دي جي (DJ)",
  "تصوير",
  "ضيافة",
  "وجبات عشاء",
  "زفة",
];

export default function AddHall() {
  const [form, setForm] = useState({
    name: "",
    size: "",
    price: "",
    city: "",
    locationDetails: "",
    description: "",
  });

  const [basicServices, setBasicServices] = useState<string[]>([]);
  const [additionalServices, setAdditionalServices] = useState<
    { name: string; price: string }[]
  >([]);
  const [media, setMedia] = useState<string[]>([]);

  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [basicServicePickerVisible, setBasicServicePickerVisible] =
    useState(false);
  const [addServicePickerVisible, setAddServicePickerVisible] = useState(false);
  const [tempAddService, setTempAddService] = useState<{
    name: string;
    price: string;
  } | null>(null);

  const handleFormChange = handleErrorChange(setForm);

  const handleNext = () => {
    const newHall = {
      id: Date.now().toString(),
      ...form,
      location: form.locationDetails
        ? `${form.city} - ${form.locationDetails}`
        : form.city,
      services: basicServices.join(", "),
      additionalServices: additionalServices
        .map((s) => `${s.name} (${s.price})`)
        .join(", "),
      media,
    };
    NavigateTo("PaymentHall", { hall: newHall });
  };

  const toggleBasicService = (service: string) => {
    if (basicServices.includes(service)) {
      setBasicServices((prev) => prev.filter((s) => s !== service));
    } else {
      setBasicServices((prev) => [...prev, service]);
    }
  };

  const removeAdditionalService = (serviceName: string) => {
    setAdditionalServices((prev) => prev.filter((s) => s.name !== serviceName));
  };

  const getAvailableForAdditional = () => {
    return AVAILABLE_SERVICES.filter(
      (s) =>
        !basicServices.includes(s) &&
        !additionalServices.find((addS) => addS.name === s),
    );
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newMediaURIs = result.assets.map((asset) => asset.uri);
      setMedia((prev) => [...prev, ...newMediaURIs]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <KeyboardAwareScreen>
        <Ionicons name="business" size={40} style={styles.screenIcon} />
        <Text style={styles.title}>إضافة صالة</Text>
        <Text style={styles.subtitle}>أدخل تفاصيل صالتك الرائعة</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="text-outline"
              size={18}
              style={[styles.screenIcon, { marginLeft: 6 }]}
            />
            <Text style={styles.label}>اسم الصالة</Text>
          </View>

          <Input
            placeholder="مثال: صالة الاحلام"
            value={form.name}
            onChangeText={(val) => handleFormChange("name", val)}
          />

          <View style={styles.info}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  style={[styles.screenIcon, { marginLeft: 6 }]}
                />
                <Text style={styles.label}>السعة</Text>
              </View>

              <Input
                placeholder="مثال: 100"
                value={form.size}
                onChangeText={(val) => handleFormChange("size", val)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.gapBetween} />

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Ionicons
                  name="cash-outline"
                  size={18}
                  style={[styles.screenIcon, { marginLeft: 6 }]}
                />
                <Text style={styles.label}>السعر</Text>
              </View>
              <Input
                placeholder="$ السعر"
                value={form.price}
                onChangeText={(val) => handleFormChange("price", val)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              <Ionicons
                name="location-outline"
                size={18}
                style={[styles.screenIcon, { marginLeft: 6 }]}
              />
              <Text style={styles.label}>الموقع</Text>
            </View>
            <View style={styles.info}>
              <TouchableOpacity
                style={[styles.pickerWrapper]}
                onPress={() => setCityPickerVisible(true)}
              >
                <View style={[styles.info, { paddingHorizontal: 12 }]}>
                  <Text
                    style={{ fontSize: 15, color: form.city ? "#333" : "#999" }}
                  >
                    {form.city || "المدينة"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#6C4AB6" />
                </View>
              </TouchableOpacity>
              <View style={styles.gapBetween} />
              <View style={{ flex: 2.5 }}>
                <Input
                  placeholder="الشارع..."
                  value={form.locationDetails}
                  onChangeText={(val) =>
                    handleFormChange("locationDetails", val)
                  }
                />
              </View>
            </View>
          </View>

          <View
            style={{
              marginVertical: 20,
              width: "100%",
              borderWidth: 1,
            }}
          />

          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="star-outline"
              size={18}
              style={[styles.screenIcon, { marginLeft: 6 }]}
            />
            <Text style={styles.label}>الخدمات الأساسية</Text>
          </View>

          <TouchableOpacity
            style={styles.pickerWrapper}
            onPress={() => setBasicServicePickerVisible(true)}
          >
            <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
              + إختر الخدمات المجانية
            </Text>
          </TouchableOpacity>

          {basicServices.length > 0 && (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}
            >
              {basicServices.map((srv, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F3EAFF",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    marginLeft: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#6C4AB6",
                      fontSize: 13,
                      fontWeight: "bold",
                      marginLeft: 6,
                    }}
                  >
                    {srv}
                  </Text>
                  <TouchableOpacity onPress={() => toggleBasicService(srv)}>
                    <Ionicons name="close-circle" size={18} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="add-circle-outline"
              size={18}
              style={[styles.screenIcon, { marginLeft: 6 }]}
            />
            <Text style={styles.label}>الخدمات الإضافية</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.pickerWrapper,
              { height: 50, justifyContent: "center", borderColor: "#EEE" },
            ]}
            onPress={() => setAddServicePickerVisible(true)}
          >
            <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
              + أضف خدمة مدفوعة
            </Text>
          </TouchableOpacity>

          {additionalServices.length > 0 && (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}
            >
              {additionalServices.map((srv, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#E8F5E9",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    marginLeft: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#2E7D32",
                      fontSize: 13,
                      fontWeight: "bold",
                      marginLeft: 6,
                    }}
                  >
                    {srv.name} ({srv.price})
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeAdditionalService(srv.name)}
                  >
                    <Ionicons name="close-circle" size={18} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="images-outline"
              size={18}
              style={[styles.screenIcon, { marginLeft: 6 }]}
            />
            <Text style={styles.label}>الصور والفيديوهات</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.pickerWrapper,
              { height: 50, justifyContent: "center", borderColor: "#EEE" },
            ]}
            onPress={pickMedia}
          >
            <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
              + أضف صور أو فيديوهات
            </Text>
          </TouchableOpacity>

          {media.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {media.map((uri, idx) => (
                <View
                  key={idx}
                  style={{ marginRight: 10, position: "relative" }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 10,
                      backgroundColor: "#EEE",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    {uri.endsWith(".mp4") || uri.endsWith(".mov") ? (
                      <Ionicons name="videocam" size={30} color="#999" />
                    ) : (
                      <Ionicons name="image" size={30} color="#999" />
                    )}
                  </View>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      backgroundColor: "#FFF",
                      borderRadius: 10,
                    }}
                    onPress={() =>
                      setMedia((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Ionicons name="close-circle" size={22} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View>
            <View style={{ flexDirection: "row" }}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                style={[styles.screenIcon, { marginLeft: 6 }]}
              />
              <Text style={styles.label}>تفاصيل إضافية</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  height: 130,
                  textAlignVertical: "top",
                },
              ]}
              placeholder="اكتب وصفاً جذاباً للصالة هنا..."
              value={form.description}
              onChangeText={(val) => handleFormChange("description", val)}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { flexDirection: "row" }]}
            onPress={handleNext}
          >
            <Text style={[styles.actionButtonText, { fontSize: 18 }]}>
              المتابعة للدفع
            </Text>
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFF"
              style={{ marginRight: 6 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>

      {/* City Picker Modal */}
      <Modal
        visible={cityPickerVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={[styles.container, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <View style={[styles.card, { maxHeight: "80%" }]}>
            <Text
              style={[
                styles.title,
                { fontSize: 20, marginBottom: 15, textAlign: "center" },
              ]}
            >
              اختر المدينة
            </Text>
            <FlatList
              data={PALESTINE_CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderColor: "#EEE",
                  }}
                  onPress={() => {
                    handleFormChange("city", item);
                    setCityPickerVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, textAlign: "center" }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setCityPickerVisible(false)}
            >
              <Text style={styles.actionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Basic Services Modal */}
      <Modal
        visible={basicServicePickerVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={[styles.container, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <View style={[styles.card, { maxHeight: "80%" }]}>
            <Text
              style={[
                styles.title,
                { fontSize: 20, marginBottom: 15, textAlign: "center" },
              ]}
            >
              الخدمات الأساسية
            </Text>
            <FlatList
              data={AVAILABLE_SERVICES.filter(
                (s) => !additionalServices.find((addS) => addS.name === s),
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = basicServices.includes(item);
                return (
                  <TouchableOpacity
                    style={{
                      padding: 15,
                      borderBottomWidth: 1,
                      borderColor: "#EEE",
                      backgroundColor: isSelected ? "#F3EAFF" : "transparent",
                    }}
                    onPress={() => toggleBasicService(item)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        textAlign: "center",
                        color: isSelected ? "#6C4AB6" : "#333",
                      }}
                    >
                      {item} {isSelected && "✓"}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setBasicServicePickerVisible(false)}
            >
              <Text style={styles.actionButtonText}>تم</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Additional Services Modal */}
      <Modal
        visible={addServicePickerVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={[styles.container, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <View style={[styles.card, { maxHeight: "80%" }]}>
            {!tempAddService ? (
              <>
                <Text
                  style={[
                    styles.title,
                    { fontSize: 20, marginBottom: 15, textAlign: "center" },
                  ]}
                >
                  إضافة خدمة مدفوعة
                </Text>
                <FlatList
                  data={getAvailableForAdditional()}
                  keyExtractor={(item) => item}
                  ListEmptyComponent={
                    <Text style={{ textAlign: "center" }}>
                      لا توجد خدمات متاحة للإضافة
                    </Text>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        padding: 15,
                        borderBottomWidth: 1,
                        borderColor: "#EEE",
                      }}
                      onPress={() =>
                        setTempAddService({ name: item, price: "" })
                      }
                    >
                      <Text style={{ fontSize: 16, textAlign: "center" }}>
                        {item} +
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setAddServicePickerVisible(false)}
                >
                  <Text style={styles.actionButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <Text
                  style={[
                    styles.title,
                    { fontSize: 20, marginBottom: 15, textAlign: "center" },
                  ]}
                >
                  سعر خدمة ({tempAddService.name})
                </Text>
                <TextInput
                  style={[styles.input, { textAlign: "right" }]}
                  placeholder="أدخل السعر (مثال: 50$)"
                  value={tempAddService.price}
                  onChangeText={(val) =>
                    setTempAddService({ ...tempAddService, price: val })
                  }
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (tempAddService.price) {
                      setAdditionalServices((prev) => [
                        ...prev,
                        tempAddService,
                      ]);
                      setTempAddService(null);
                      setAddServicePickerVisible(false);
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>إضافة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#999" }]}
                  onPress={() => setTempAddService(null)}
                >
                  <Text style={styles.actionButtonText}>رجوع</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
