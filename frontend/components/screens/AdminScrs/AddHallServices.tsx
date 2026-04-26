import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import { getAllHallsSimple, addHallService } from "../../Services/adminApi";
import BackButton from "../../reusable func/backButton";
import { Input } from "../../reusable func/input";
import { MaterialIcons } from "@expo/vector-icons";

export default function AddHallServices() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loadingHalls, setLoadingHalls] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedHall, setSelectedHall] = useState<any>(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const { data } = await getAllHallsSimple();
      setHalls(data);
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "فشل في جلب قائمة القاعات");
    } finally {
      setLoadingHalls(false);
    }
  };

  const handleAddService = async () => {
    if (!selectedHall) return Alert.alert("تنبيه", "يرجى اختيار القاعة أولاً");
    if (!serviceName.trim()) return Alert.alert("تنبيه", "يرجى إدخال اسم الخدمة");

    try {
      setSubmitting(true);
      await addHallService(selectedHall.id, serviceName, Number(servicePrice) || 0);
      Alert.alert("تم بنجاح", `تم إضافة خدمة "${serviceName}" لقاعة "${selectedHall.hall_name}"`);
      setServiceName("");
      setServicePrice("");
      setSelectedHall(null);
    } catch (error) {
      Alert.alert("خطأ", "فشل في إضافة الخدمة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FDFBFF" }]}>
      <View style={{ width: "100%", paddingHorizontal: 20, paddingTop: 10 }}>
        <BackButton />
        <Text style={[styles.title, { marginTop: 10 }]}>إضافة خدمات للقاعة</Text>
        {/* [معدّل - كان AI] النص "بناءً على طلب صاحب القاعة" كان صيغة آلية — أبقيناه كما هو */}
        <Text style={{ color: "#666", marginTop: 5 }}>بناءً على طلب صاحب القاعة</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} style={{ width: "100%" }}>
        <View style={styles.card}>
          <Text style={[styles.label, { marginBottom: 10 }]}>اختر القاعة:</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={{ textAlign: "right", color: selectedHall ? "#000" : "#999" }}>
              {selectedHall ? selectedHall.hall_name : "اضغط لاختيار القاعة..."}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 10, marginBottom: 10 }]}>اسم الخدمة (مثلاً: تصوير فيديو):</Text>
          <Input
            placeholder="أدخل اسم الخدمة"
            value={serviceName}
            onChangeText={setServiceName}
          />

          <Text style={[styles.label, { marginTop: 10, marginBottom: 10 }]}>السعر (اختياري - 0 يعني مجانية):</Text>
          <Input
            placeholder="أدخل السعر بالدينار"
            value={servicePrice}
            onChangeText={setServicePrice}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.actionButton, submitting && { opacity: 0.7 }]}
            onPress={handleAddService}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.actionButtonText}>إضافة الخدمة الآن</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* مودال اختيار القاعة */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اختر قاعة</Text>
            <FlatList
              data={halls}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    setSelectedHall(item);
                    setShowModal(false);
                  }}
                >
                  <Text style={styles.cityText}>{item.hall_name}</Text>
                </TouchableOpacity>
              )}
              initialNumToRender={10}
            />
            <TouchableOpacity style={styles.secondaryActionButton} onPress={() => setShowModal(false)}>
              <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
