import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { NavigateTo } from "../../reusable func/navigateTo";
import {
  getBookingsApi,
  cancelBookingApi,
  requestRescheduleApi,
  respondRescheduleApi,
  getBusyDatesApi,
} from "../../Services/customerApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import BookingCalendarModal from "../../reusable func/Bookingcalendarmodal";
import { useRefresh } from "../../reusable func/refreshContext";
import BackButton from "../../reusable func/backButton";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { InfoRow } from "../../reusable func/infoRow";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: "مؤكد", color: "#22C55E" },
  customer_cancelled: { label: "ملغي من قبلك", color: "#EF4444" },
  owner_cancelled: { label: "ملغي من الصالة", color: "#EF4444" },
  owner_rescheduled: { label: "تعديل مقترح", color: "#6C4AB6" },
};

const NoticeBox = ({ icon, text, color, bg, border }: any) => (
  <View
    style={[
      styles.mealOptionRow,
      { gap: 8, marginBottom: 10, backgroundColor: bg, borderColor: border },
    ]}
  >
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[styles.profileLabel, { color, flex: 1 }]}>{text}</Text>
  </View>
);

const ItemChip = ({
  text,
  color = "#6C4AB6",
  bg = "#F5F3FF",
  border = "#E9E4FF",
}: any) => (
  <View
    style={[
      styles.items,
      {
        marginLeft: 0,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
      },
    ]}
  >
    <Text style={[styles.itemText, { color }]}>{text}</Text>
  </View>
);

const ActionBtn = ({ label, color, bg, onPress, border = false }: any) => (
  <TouchableOpacity
    style={[
      border ? styles.secondaryActionButton : styles.actionButton,
      { flex: 1, marginTop: 0, backgroundColor: bg },
    ]}
    onPress={onPress}
  >
    <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB");
};

const parseArray = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const BookingCard = ({
  booking,
  ratedBookings,
  actionLoading,
  onCancel,
  onOpenReschedule,
  onRescheduleResponse,
}: any) => {
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;

  const bDate = new Date(booking.booking_date || booking.date);
  bDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPastDate = today > bDate;
  const daysUntilEvent =
    (bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  const canRate =
    booking.status === "confirmed" &&
    isPastDate &&
    !ratedBookings[booking.id];

  const parsedServices = useMemo(
    () => parseArray(booking.services),
    [booking.services],
  );

  const parsedMeals = useMemo(() => parseArray(booking.meals), [booking.meals]);

  const guestCount = booking.guest_count || booking.guestCount || 0;

  const mealsCost = parsedMeals.reduce((sum: number, meal: any) => {
    return sum + (meal.price_per_person || 0) * guestCount;
  }, 0);

  const totalCost = Number(booking.total_cost || booking.totalCost || 0);
  const remainingBalance = (totalCost - mealsCost) * 0.8;
  const paidAmount = totalCost - remainingBalance;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <InfoRow
          icon="business-outline"
          label={booking.hall_name || booking.hallName}
          containerStyle={{ flex: 1, paddingVertical: 4 }}
        />
        <Text style={[styles.itemText, { color: statusCfg.color }]}>
          {statusCfg.label}
        </Text>
      </View>

      <View style={styles.row}>
        <InfoRow
          icon="location-outline"
          label={booking.hall_location || booking.hallCity || "غير محدد"}
          containerStyle={{ paddingVertical: 4 }}
        />
      </View>

      <View style={styles.row}>
        <InfoRow
          icon="calendar-outline"
          label={formatDate(booking.booking_date || booking.date)}
          containerStyle={{ width: "50%", paddingVertical: 4 }}
        />

        <InfoRow
          icon="people-outline"
          label={`${guestCount} ضيف`}
          containerStyle={{ paddingVertical: 4 }}
        />
      </View>

      {booking.status === "confirmed" && !isPastDate && daysUntilEvent < 4 && (
        <NoticeBox
          icon="information-circle-outline"
          text="في حال يوجد أي تعديل تواصل مع صاحب الصالة"
          color="#EF4444"
          bg="#FEF2F2"
          border="#FECACA"
        />
      )}

      {booking.status === "owner_rescheduled" && booking.proposed_date && (
        <NoticeBox
          icon="alert-circle-outline"
          text={`صاحب الصالة يقترح تغيير الموعد إلى: ${formatDate(
            booking.proposed_date,
          )}`}
          color="#FFA000"
          bg="#FFFBF0"
          border="#FFD54F"
        />
      )}

      {parsedServices.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { fontSize: 14, marginBottom: 8 }]}>
            الخدمات المختارة:
          </Text>

          <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
            {parsedServices.map((s: any, i: number) => (
              <ItemChip
                key={i}
                text={`${s.name}${s.price > 0 ? ` ${s.price}₪` : ""}`}
              />
            ))}
          </View>
        </View>
      )}

      {parsedMeals.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { fontSize: 14, marginBottom: 8 }]}>
            الوجبات المختارة:
          </Text>

          <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
            {parsedMeals.map((m: any, i: number) => (
              <ItemChip
                key={i}
                text={`${m.name} (${m.price_per_person}₪)`}
                color="#C2410C"
                bg="#FFF7ED"
                border="#FFEDD5"
              />
            ))}
          </View>
        </View>
      )}

      <View style={[styles.borderTopSection, { paddingTop: 12 }]}>
        <View>
          <View style={[styles.info, { marginBottom: 5 }]}>
            <Text style={styles.profileValue}>الإجمالي</Text>
            <Text style={[styles.profileValue, { color: "#F97316" }]}>
              ₪{totalCost.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.info, { marginBottom: 5 }]}>
            <Text style={styles.profileValue}>المدفوع (عربون + وجبات)</Text>
            <Text style={[styles.profileValue, { color: "#6C4AB6" }]}>
              ₪{paidAmount.toLocaleString()}
            </Text>
          </View>

          <View
            style={[
              styles.info,
              {
                borderTopWidth: 1,
                borderTopColor: "#F0F0F5",
                paddingTop: 8,
              },
            ]}
          >
            <Text style={styles.label}>المتبقي للدفع</Text>
            <Text style={[styles.title, { fontSize: 20, color: "#22C55E" }]}>
              ₪{remainingBalance.toLocaleString()}
            </Text>
          </View>
        </View>

        {actionLoading === booking.id ? (
          <ActivityIndicator color="#6C4AB6" style={{ paddingVertical: 10 }} />
        ) : (
          <View style={[styles.row, { gap: 8, marginTop: 10 }]}>
            {booking.status === "confirmed" &&
              !isPastDate &&
              daysUntilEvent >= 4 && (
                <ActionBtn
                  label="تعديل التاريخ"
                  color="#6C4AB6"
                  bg="#FFF"
                  border
                  onPress={() => onOpenReschedule(booking)}
                />
              )}

            {booking.status === "owner_rescheduled" &&
              booking.proposed_date && (
                <>
                  <ActionBtn
                    label="قبول"
                    color="#FFF"
                    bg="#22C55E"
                    onPress={() => onRescheduleResponse(booking.id, true)}
                  />

                  <ActionBtn
                    label="رفض"
                    color="#FFF"
                    bg="#EF4444"
                    onPress={() => onRescheduleResponse(booking.id, false)}
                  />
                </>
              )}

            {(booking.status === "confirmed" ||
              booking.status === "owner_rescheduled") &&
              !isPastDate && (
                <ActionBtn
                  label="إلغاء الحجز"
                  color="#EF4444"
                  bg="#FEF2F2"
                  onPress={() => onCancel(booking)}
                />
              )}

            {canRate && (
              <ActionBtn
                label="تقييم الحجز"
                color="#F4B400"
                bg="#FFFBF0"
                border
                onPress={() =>
                  NavigateTo("RateHall", {
                    hallName: booking.hall_name || booking.hallName,
                    hallCity: booking.hall_location || booking.hallCity,
                    bookingId: booking.id,
                    hallId: booking.hall_id,
                  })
                }
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default function MyBookings() {
  const { triggerRefresh } = useRefresh();
  const [ratedBookings, setRatedBookings] = useState<Record<string, boolean>>(
    {},
  );

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedRescheduleId, setSelectedRescheduleId] = useState<
    number | null
  >(null);
  const [busyDates, setBusyDates] = useState<(string | Date)[]>([]);
  const [fetchingBusyDates, setFetchingBusyDates] = useState(false);

  useFocusEffect(
    useCallback(() => {
      triggerRefresh();
    }, []),
  );

  const {
    items: bookings,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    onRefresh,
    loadMore,
  } = usePaginatedFetch({
    fetchFunction: getBookingsApi,
    limit: 10,
  });

  const checkRatings = async (bookingsList: any[]) => {
    const ratedMap: Record<string, boolean> = {};

    for (const b of bookingsList) {
      const isRated = await AsyncStorage.getItem(`rated_booking_${b.id}`);
      if (isRated === "true") {
        ratedMap[b.id] = true;
      }
    }

    setRatedBookings((prev) => ({ ...prev, ...ratedMap }));
  };

  useEffect(() => {
    if (bookings.length > 0) {
      checkRatings(bookings);
    }
  }, [bookings]);

  const handleCancel = (booking: any) => {
    Alert.alert(
      "إلغاء الحجز",
      `انت على وشك الغاء الحجز، يرجى التواصل مع صاحب الصاله (ممكن ان لا يتم استرداد العربون) "${
        booking.hall_name || booking.hallName
      }"؟`,
      [
        { text: "تراجع", style: "cancel" },
        {
          text: "نعم، إلغاء الحجز",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await cancelBookingApi(booking.id);
              Toast.show({
                type: "success",
                text1: res?.data || "تم تحديث حالة الحجز",
              });
              triggerRefresh();
            } catch (error: any) {
              console.error(error);
              Toast.show({
                type: "error",
                text1: error.response?.data || "فشل إلغاء الحجز",
              });
            }
          },
        },
      ],
    );
  };

  const handleRescheduleResponse = async (
    bookingId: number,
    accept: boolean,
  ) => {
    setActionLoading(bookingId);

    try {
      const res = await respondRescheduleApi(bookingId, accept);
      Toast.show({
        type: "success",
        text1:
          res?.data?.message ||
          (accept ? "تم قبول التعديل بنجاح" : "تم رفض التعديل"),
      });
      triggerRefresh();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: error.response?.data || "فشل في الاستجابة للتعديل",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRescheduleSubmit = async (dateString: string) => {
    if (!selectedRescheduleId) return;

    setActionLoading(selectedRescheduleId);
    setRescheduleModal(false);

    try {
      const res = await requestRescheduleApi(selectedRescheduleId, dateString);
      Toast.show({
        type: "success",
        text1: res?.data?.message || "تم تعديل الموعد بنجاح",
      });
      triggerRefresh();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: error.response?.data || "فشل تعديل الموعد",
      });
    } finally {
      setActionLoading(null);
      setSelectedRescheduleId(null);
    }
  };

  const openRescheduleCustomer = async (booking: any) => {
    if (fetchingBusyDates) return;

    try {
      setFetchingBusyDates(true);
      const res = await getBusyDatesApi(booking.hall_id);
      setBusyDates(res.data || []);

      Alert.alert(
        "تعديل الموعد",
        `هل تريد تعديل موعد حجز (${
          booking.hall_name || booking.hallName
        })؟\nسيتم تعديل الموعد فوراً وإرسال إشعار لصاحب الصالة.`,
        [
          { text: "تراجع", style: "cancel" },
          {
            text: "نعم",
            onPress: () => {
              setSelectedRescheduleId(booking.id);
              setRescheduleModal(true);
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error fetching busy dates:", error);
      Toast.show({
        type: "error",
        text1: "فشل تحميل المواعيد المحجوزة، يرجى المحاولة لاحقاً",
      });
    } finally {
      setFetchingBusyDates(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6C4AB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
          حجوزاتي
        </Text>

        <View style={{ marginBottom: -5, transform: [{ scaleX: -1 }] }}>
          <BackButton />
        </View>
      </View>

      <FlatList
        data={bookings as any[]}
        keyExtractor={(b) => b.id.toString()}
        style={{ width: "90%" }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            loadMore();
          }
        }}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: "70%" }}>
            <Ionicons name="calendar-clear-outline" size={70} color="#DDD" />
            <Text style={styles.subtitle}>لا توجد حجوزات</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
          ) : !hasMore && bookings.length > 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "#AAA",
                marginVertical: 20,
                fontSize: 14,
              }}
            >
              لا توجد حجوزات إضافية
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            ratedBookings={ratedBookings}
            actionLoading={actionLoading}
            onCancel={handleCancel}
            onOpenReschedule={openRescheduleCustomer}
            onRescheduleResponse={handleRescheduleResponse}
          />
        )}
      />

      <BookingCalendarModal
        visible={rescheduleModal}
        onClose={() => {
          setRescheduleModal(false);
          setSelectedRescheduleId(null);
        }}
        onConfirm={handleRescheduleSubmit}
        bookedDates={busyDates}
        loading={actionLoading === selectedRescheduleId}
        title="تعديل موعد الحجز"
        subtitle="اختر التاريخ الجديد لتعديل الموعد (الأحمر = محجوز)."
        confirmLabel="تعديل الموعد"
      />
    </SafeAreaView>
  );
}