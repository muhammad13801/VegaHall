import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigateTo } from "../../reusable func/navigateTo";
import { styles as s, styles } from "./ibrahimStyles";
import { createBookingApi } from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { HallData } from "../../Validations/validateHall";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";

export default function BookingRequest({ route }: any) {
  const hall: HallData = route?.params?.hall;
  const { triggerRefresh } = useRefresh();

  const [date, setDate] = useState<Date>(new Date());
  const [hasDate, setHasDate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [guestCount, setGuestCount] = useState(100);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  if (!hall) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>لا توجد بيانات</Text>
      </View>
    );
  }

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const baseCost = hall.price;
  const servicesCost = selectedServices.length * 200;
  const totalCost = baseCost + servicesCost;

  const isValid = hasDate && guestCount > 0;

  const handleConfirm = () => {
    NavigateTo("Payment", {
      hallName: (hall as any).hall_name || hall.name,
      totalCost,
      bookingForm: {
        hallId: hall.id,
        bookingDate: date.toISOString(),
        guestCount,
        services: selectedServices,
        notes,
        totalCost,
      }
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />

      <View style={[styles.info, { width: "90%", marginVertical: 5 }]}>
        <Text style={styles.title}>طلب حجز</Text>
        <BackButton />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContainer}
      >
        {/* Date */}
        <View style={s.card}>
          <Text style={s.label}>📅 تاريخ المناسبة</Text>

          <TouchableOpacity
            style={s.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ textAlign: "left", color: hasDate ? "#000" : "#999", height: "100%", textAlignVertical: "center" }}>
              {hasDate ? formatDate(date) : "اختر تاريخ المناسبة"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  setDate(selected);
                  setHasDate(true);
                }
              }}
            />
          )}
        </View>

        {/* Guests */}
        <View style={styles.card}>
          <Text style={styles.label}>👥 عدد الضيوف</Text>

          <View style={[styles.info, { backgroundColor: "#F8F8FF", borderRadius: 12, padding: 5 }]}>
            <Text style={{ color: "#666" }}>الحد الأقصى: {hall.capacity}</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
              <TouchableOpacity
                onPress={() => setGuestCount(Math.max(10, guestCount - 10))}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#E8DEFF", alignItems: "center", justifyContent: "center" }}
              >
                <Feather name="minus" size={18} color="#6C4AB6" />
              </TouchableOpacity>

              <Text style={{ fontSize: 18, fontWeight: "bold", minWidth: 40, textAlign: "center" }}>{guestCount}</Text>

              <TouchableOpacity
                onPress={() =>
                  setGuestCount(Math.min(hall.capacity, guestCount + 10))
                }
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#E8DEFF", alignItems: "center", justifyContent: "center" }}
              >
                <Feather name="plus" size={18} color="#6C4AB6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.card}>
          <Text style={styles.label}>🎯 الخدمات الإضافية</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
            {(hall.services || []).map((svc: any) => {
              const svcName = typeof svc === "string" ? svc : svc.name;
              const isActive = selectedServices.includes(svcName);

              return (
                <TouchableOpacity
                  key={svcName}
                  style={[
                    s.quickTag,
                    isActive && s.checkboxBoxActive,
                  ]}
                  onPress={() => toggleService(svcName)}
                >
                  <Text
                    style={[
                      s.quickTagText,
                      isActive && s.serviceChipTextActive,
                    ]}
                  >
                    {svcName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Cost Summary */}
        <View style={styles.card}>
          <Text style={styles.label}>💰 ملخص التكلفة</Text>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#666" }}>السعر الأساسي</Text>
              <Text style={{ fontWeight: "600" }}>{baseCost.toLocaleString()} ₪</Text>
            </View>

            {selectedServices.length > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#666" }}>الخدمات ({selectedServices.length})</Text>
                <Text style={{ fontWeight: "600" }}>+{servicesCost.toLocaleString()} ₪</Text>
              </View>
            )}

            <View style={{ height: 1, backgroundColor: "#F0F0F0", marginVertical: 4 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>المجموع الإجمالي</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#6C4AB6" }}>{totalCost.toLocaleString()} ₪</Text>
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={{ width: "90%" }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleConfirm}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
              <Feather name="check-circle" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>تأكيد الحجز</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView >
  );
}