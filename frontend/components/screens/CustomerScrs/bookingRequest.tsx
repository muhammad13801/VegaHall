import { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigateTo } from "../../reusable func/navigateTo";
import { styles as s, styles } from "./ibrahimStyles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BackButton from "../../reusable func/backButton";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { getBusyDatesApi } from "../../Services/customerApi";

LocaleConfig.locales['ar'] = {
  monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthNamesShort: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  dayNamesShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  today: 'اليوم'
};
LocaleConfig.defaultLocale = 'ar';

export default function BookingRequest({ route }: any) {
  const hall = route?.params?.hall;
  const [date, setDate] = useState<Date>(new Date());
  const [hasDate, setHasDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [busyDates, setBusyDates] = useState<string[]>([]);

  useEffect(() => {
    if (hall?.id) {
      loadBusyDates();
    }
  }, [hall?.id]);

  const loadBusyDates = async () => {
    try {
      const response = await getBusyDatesApi(hall.id);
      if (response.data) {
        // Normalize dates to YYYY-MM-DD
        const formatted = response.data.map((d: string) => d.split('T')[0]);
        setBusyDates(formatted);
      }
    } catch (error) {
      console.error("Error loading busy dates:", error);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // Mark busy dates
    busyDates.forEach(d => {
      marked[d] = { 
        disabled: true, 
        disableTouchEvent: true, 
        marked: true, 
        dotColor: 'red' 
      };
    });

    // Mark selected date
    if (hasDate) {
      const dateStr = date.toISOString().split('T')[0];
      marked[dateStr] = { 
        ...marked[dateStr],
        selected: true, 
        selectedColor: '#6C4AB6' 
      };
    }

    return marked;
  };

  const [guestCount, setGuestCount] = useState(100);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

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

  const toggleMeal = (mealName: string) => {
    setSelectedMeals((prev) =>
      prev.includes(mealName) ? prev.filter((m) => m !== mealName) : [...prev, mealName]
    );
  };

  const baseCost = hall.base_price || 0;
  
  const servicesCost = selectedServices.reduce((sum, name) => {
    const svc = (hall.services || []).find((s: any) => (typeof s === "string" ? s : s.name) === name);
    const price = typeof svc === "object" ? (svc.price || 0) : 0;
    return sum + price;
  }, 0);

  const mealsCost = selectedMeals.reduce((sum, name) => {
    const meal = ((hall as any).meal_options || []).find((m: any) => m.name === name);
    return sum + ((meal?.price_per_person || 0) * guestCount);
  }, 0);

  const totalCost = baseCost + servicesCost + mealsCost;
  const depositAmount = (baseCost + servicesCost) * 0.20;
  const remainingBalance = (baseCost + servicesCost) * 0.80;
  const amountToPayNow = depositAmount + mealsCost;

  const isValid = hasDate && guestCount > 0;

  const handleConfirm = () => {
    NavigateTo("Payment", {
      hallName: (hall as any).hall_name || hall.name,
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
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={{ textAlign: "left", color: hasDate ? "#000" : "#999", height: "100%", textAlignVertical: "center" }}>
              {hasDate ? formatDate(date) : "اختر تاريخ المناسبة"}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <View style={{ backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", marginBottom: 15, borderWidth: 1, borderColor: "#EEE" }}>
              <Calendar
                current={date.toISOString().split('T')[0]}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={(day: any) => {
                  setDate(new Date(day.dateString));
                  setHasDate(true);
                  setShowCalendar(false);
                }}
                renderArrow={(direction: any) => (
                  <Feather 
                    name={direction === 'left' ? 'chevron-right' : 'chevron-left'} 
                    size={24} 
                    color="#6C4AB6" 
                  />
                )}
                markedDates={getMarkedDates()}
                theme={{
                  selectedDayBackgroundColor: '#6C4AB6',
                  todayTextColor: '#6C4AB6',
                  arrowColor: '#6C4AB6',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: 'bold',
                }}
              />
            </View>
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

        {/* Meals */}
        {(hall as any).meal_options && (hall as any).meal_options.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>🍱 خيارات الطعام</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
              {(hall as any).meal_options.map((meal: any) => {
                const isActive = selectedMeals.includes(meal.name);
                return (
                  <TouchableOpacity
                    key={meal.name}
                    style={[
                      s.quickTag,
                      isActive && s.checkboxBoxActive,
                    ]}
                    onPress={() => toggleMeal(meal.name)}
                  >
                    <Text
                      style={[
                        s.quickTagText,
                        isActive && s.serviceChipTextActive,
                      ]}
                    >
                      {meal.name} (+{meal.price_per_person}₪)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Services */}
        <View style={styles.card}>
          <Text style={styles.label}>🎯 الخدمات الإضافية</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 }}>
            {(hall.services || []).map((svc: any) => {
              const svcName = typeof svc === "string" ? svc : svc.name;
              const svcPrice = typeof svc === "object" ? svc.price : 0;
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
                    {svcName} {svcPrice > 0 ? `(+${svcPrice}₪)` : ""}
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
                <Text style={{ color: "#666" }}>الخدمات الإضافية</Text>
                <Text style={{ fontWeight: "600" }}>+{servicesCost.toLocaleString()} ₪</Text>
              </View>
            )}

            {selectedMeals.length > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#666" }}>الوجبات ({guestCount} شخص)</Text>
                <Text style={{ fontWeight: "600" }}>+{mealsCost.toLocaleString()} ₪</Text>
              </View>
            )}

            <View style={{ height: 1, backgroundColor: "#F0F0F0", marginVertical: 4 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>المجموع الإجمالي</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>{totalCost.toLocaleString()} ₪</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#F8F8FF", padding: 8, borderRadius: 8, marginTop: 4 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#6C4AB6" }}>المطلوب سداده الآن</Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>عربون (20%) + الوجبات</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#6C4AB6" }}>{amountToPayNow.toLocaleString()} ₪</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              <Text style={{ fontSize: 14, color: "#666" }}>يُدفع لاحقاً في الصالة</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#666" }}>{remainingBalance.toLocaleString()} ₪</Text>
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