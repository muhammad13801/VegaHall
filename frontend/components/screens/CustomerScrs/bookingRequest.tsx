import { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigateTo } from "../../reusable func/navigateTo";
import { styles as s, styles } from "./ibrahimStyles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import BookingCalendarModal from "../../reusable func/Bookingcalendarmodal";
import { getBusyDatesApi } from "../../Services/customerApi";

const CostRow = ({ label, value, bold = false }: any) => (
  <View style={s.summaryRow}>
    <Text style={bold ? s.costTotalLabel : s.costLabel}>{label}</Text>
    <Text style={bold ? s.priceText : s.costValue}>{value}</Text>
  </View>
);

const OptionChip = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    style={[s.quickTag, active && s.checkboxBoxActive]}
    onPress={onPress}
  >
    <Text style={[s.quickTagText, active && s.serviceChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function BookingRequest({ route }: any) {
  const hall = route?.params?.hall;

  const [date, setDate] = useState<Date>(new Date());
  const [hasDate, setHasDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [busyDates, setBusyDates] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(100);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  useEffect(() => {
    if (hall?.id) loadBusyDates();
  }, [hall?.id]);

  const loadBusyDates = async () => {
    try {
      const response = await getBusyDatesApi(hall.id);
      const formatted = (response.data || []).map((d: string) =>
        d.split("T")[0]
      );
      setBusyDates(formatted);
    } catch (error) {
      console.error("Error loading busy dates:", error);
    }
  };

  if (!hall) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>لا توجد بيانات</Text>
      </View>
    );
  }

  const toggleItem = (value: string, setter: any) => {
    setter((prev: string[]) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const services = hall.services || [];
  const meals = (hall as any).meal_options || [];

  const baseCost = hall.base_price || 0;

  const servicesCost = selectedServices.reduce((sum, name) => {
    const svc = services.find(
      (s: any) => (typeof s === "string" ? s : s.name) === name
    );

    return sum + (typeof svc === "object" ? svc.price || 0 : 0);
  }, 0);

  const mealsCost = selectedMeals.reduce((sum, name) => {
    const meal = meals.find((m: any) => m.name === name);
    return sum + (meal?.price_per_person || 0) * guestCount;
  }, 0);

  const totalCost = baseCost + servicesCost + mealsCost;
  const depositAmount = (baseCost + servicesCost) * 0.2;
  const remainingBalance = (baseCost + servicesCost) * 0.8;
  const amountToPayNow = depositAmount + mealsCost;

  const isValid = hasDate && guestCount > 0;

  const handleConfirm = () => {
    NavigateTo("Payment", {
      hallName: hall.hall_name || hall.name,
      totalCost,
      amountToPayNow,
      remainingBalance,
      bookingForm: {
        hallId: hall.id,
        bookingDate: date.toISOString(),
        guestCount,
        services: selectedServices,
        meals: selectedMeals,
        totalCost,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />

      <View
        style={[
          styles.info,
          {
            width: "90%",
            alignSelf: "center",
            marginTop: 30,
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.title, { fontSize: 28, lineHeight: 35 }]}>
          طلب حجز
        </Text>

        <View style={{ marginBottom: -5, transform: [{ scaleX: -1 }] }}>
          <BackButton />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContainer}
      >
        <View style={s.card}>
          <Text style={s.label}>📅 تاريخ المناسبة</Text>

          <TouchableOpacity
            style={s.input}
            onPress={() => setShowCalendar(true)}
          >
            <Text
              style={{
                textAlign: "left",
                color: hasDate ? "#000" : "#999",
                height: "100%",
                textAlignVertical: "center",
              }}
            >
              {hasDate ? formatDate(date) : "اختر تاريخ المناسبة"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>👥 عدد الضيوف</Text>

          <View
            style={[
              styles.info,
              {
                backgroundColor: "#F8F8FF",
                borderRadius: 12,
                padding: 5,
              },
            ]}
          >
            <Text style={{ color: "#666" }}>الحد الأقصى: {hall.capacity}</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
              <TouchableOpacity
                onPress={() => setGuestCount(Math.max(10, guestCount - 10))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#E8DEFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="minus" size={18} color="#6C4AB6" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  minWidth: 40,
                  textAlign: "center",
                }}
              >
                {guestCount}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setGuestCount(Math.min(hall.capacity, guestCount + 10))
                }
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#E8DEFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="plus" size={18} color="#6C4AB6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {meals.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>🍱 خيارات الطعام</Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {meals.map((meal: any) => (
                <OptionChip
                  key={meal.name}
                  active={selectedMeals.includes(meal.name)}
                  label={`${meal.name} (+${meal.price_per_person}₪)`}
                  onPress={() => toggleItem(meal.name, setSelectedMeals)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>🎯 الخدمات الإضافية</Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {services.map((svc: any) => {
              const svcName = typeof svc === "string" ? svc : svc.name;
              const svcPrice = typeof svc === "object" ? svc.price : 0;

              return (
                <OptionChip
                  key={svcName}
                  active={selectedServices.includes(svcName)}
                  label={`${svcName} ${svcPrice > 0 ? `(+${svcPrice}₪)` : ""}`}
                  onPress={() => toggleItem(svcName, setSelectedServices)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>💰 ملخص التكلفة</Text>

          <View style={{ gap: 8 }}>
            <CostRow
              label="السعر الأساسي"
              value={`${baseCost.toLocaleString()} ₪`}
            />

            {selectedServices.length > 0 && (
              <CostRow
                label="الخدمات الإضافية"
                value={`+${servicesCost.toLocaleString()} ₪`}
              />
            )}

            {selectedMeals.length > 0 && (
              <CostRow
                label={`الوجبات (${guestCount} شخص)`}
                value={`+${mealsCost.toLocaleString()} ₪`}
              />
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#F0F0F0",
                marginVertical: 4,
              }}
            />

            <CostRow
              label="المجموع الإجمالي"
              value={`${totalCost.toLocaleString()} ₪`}
              bold
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: "#F8F8FF",
                padding: 8,
                borderRadius: 8,
                marginTop: 4,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#6C4AB6",
                  }}
                >
                  المطلوب سداده الآن
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                  عربون (20%) + الوجبات
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#6C4AB6",
                }}
              >
                {amountToPayNow.toLocaleString()} ₪
              </Text>
            </View>

            <CostRow
              label="يُدفع لاحقاً في الصالة"
              value={`${remainingBalance.toLocaleString()} ₪`}
            />
          </View>
        </View>

        <View style={{ width: "90%" }}>
          <TouchableOpacity
            style={[styles.actionButton, !isValid && { backgroundColor: "#DDD" }]}
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

      <BookingCalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={(dateString) => {
          setDate(new Date(dateString));
          setHasDate(true);
          setShowCalendar(false);
        }}
        bookedDates={busyDates}
        selectedDate={date}
        title="اختيار تاريخ المناسبة"
        subtitle="اختر تاريخاً متاحاً للحجز (الأحمر = محجوز)."
        confirmLabel="تأكيد التاريخ"
      />
    </SafeAreaView>
  );
}