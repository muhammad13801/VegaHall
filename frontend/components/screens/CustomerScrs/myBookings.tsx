import { useState, useMemo, useCallback } from "react";
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
import { formatDate } from "../../reusable func/formatDate";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { InfoRow } from "../../reusable func/infoRow";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: "مؤكد", color: "#22C55E" },
  customer_cancelled: { label: "ملغي من قبلك", color: "#EF4444" },
  customer_cancelled_resolved: { label: "ملغي من قبلك", color: "#EF4444" },
  owner_cancelled: { label: "ملغي من الصالة", color: "#EF4444" },
  owner_rescheduled: { label: "تعديل مقترح", color: "#6C4AB6" },
  refunded: { label: "تم استرجاع المبلغ", color: "#22C55E" }, // [معدّل]
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
const BookingCard = ({
  item, // [معدّل - كان booking]
  actionLoading,
  onCancel,
  onOpenReschedule,
  onRescheduleResponse,
}: any) => {
  // [معدّل - كان isRefunded + statusCfg مفصولين]
  const isRefunded =
    (item.status === "customer_cancelled_resolved" ||
      item.status === "owner_cancelled") &&
    item.payment_type === "refund";

  const cfg =
    STATUS_CONFIG[isRefunded ? "refunded" : item.status] ||
    STATUS_CONFIG.confirmed;

  const bDate = new Date(item.booking_date || item.date);
  bDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPast = today > bDate; // [معدّل - كان isPastDate]
  const daysLeft = (bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24); // [معدّل - كان daysUntilEvent]

  const canRate = item.status === "confirmed" && isPast && !item.is_rated;

  // [معدّل - كان parseArray دالة منفصلة، الآن inline زي المالك]
  const svcs = useMemo(() => {
    if (!item.services) return [];
    if (Array.isArray(item.services)) return item.services;
    try {
      return JSON.parse(item.services);
    } catch {
      return [];
    }
  }, [item.services]);

  const meals = useMemo(() => {
    if (!item.meals) return [];
    if (Array.isArray(item.meals)) return item.meals;
    try {
      return JSON.parse(item.meals);
    } catch {
      return [];
    }
  }, [item.meals]);

  const guests = item.guest_count || item.guestCount || 0; // [معدّل - كان guestCount]
  const mTotal = meals.reduce(
    // [معدّل - كان mealsCost]
    (a: number, m: any) => a + (m.price_per_person || 0) * guests,
    0,
  );
  const total = Number(item.total_cost || item.totalCost || 0); // [معدّل - كان totalCost]
  const remaining = (total - mTotal) * 0.8; // [معدّل - كان remainingBalance]
  const paid = total - remaining; // [معدّل - كان paidAmount]

  return (
    <View style={styles.card}>
      {/* اسم الصالة + الحالة */}
      <View style={styles.info}>
        <InfoRow
          icon="business-outline"
          label={item.hall_name || item.hallName}
          containerStyle={{ width: "70%", paddingVertical: 4 }}
        />
        <Text style={[styles.itemText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>

      {/* الموقع */}
      <View style={styles.row}>
        <InfoRow
          icon="location-outline"
          label={item.hall_location || item.hallCity || "غير محدد"}
          containerStyle={{ paddingVertical: 4 }}
        />
      </View>
      {/* التاريخ + عدد الضيوف */}
      <View style={styles.row}>
        <InfoRow
          icon="calendar-outline"
          label={formatDate(item.booking_date || item.date)}
          containerStyle={{ width: "50%", paddingVertical: 4 }}
        />
        <InfoRow
          icon="people-outline"
          label={`${guests} ضيف`}
          containerStyle={{ paddingVertical: 4 }}
        />
      </View>

      {/* تنبيه قبل الموعد */}
      {item.status === "confirmed" && !isPast && daysLeft < 4 && (
        <NoticeBox
          icon="information-circle-outline"
          text="في حال يوجد أي تعديل تواصل مع صاحب الصالة"
          color="#EF4444"
          bg="#FEF2F2"
          border="#FECACA"
        />
      )}
      {/* موعد مقترح من المالك */}
      {item.status === "owner_rescheduled" && item.proposed_date && (
        <NoticeBox
          icon="alert-circle-outline"
          text={`صاحب الصالة يقترح تغيير الموعد إلى: ${formatDate(
            item.proposed_date,
          )}`}
          color="#FFA000"
          bg="#FFFBF0"
          border="#FFD54F"
        />
      )}

      {/* الخدمات */}
      {svcs.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { fontSize: 14, marginBottom: 8 }]}>
            الخدمات المختارة:
          </Text>
          <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
            {svcs.map((s: any, i: number) => (
              <ItemChip
                key={`svc-${i}`}
                text={`${s.name}${s.price > 0 ? ` ${s.price}₪` : ""}`}
              />
            ))}
          </View>
        </View>
      )}

      {/* الوجبات */}
      {meals.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { fontSize: 14, marginBottom: 8 }]}>
            الوجبات المختارة:
          </Text>
          <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
            {meals.map((m: any, i: number) => (
              <ItemChip
                key={`meal-${i}`}
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
            <Text style={[styles.profileValue, { color: "#F97316" }]}></Text>
          </View>

          <View style={[styles.info, { marginBottom: 5 }]}>
            <Text style={styles.profileValue}>المدفوع (عربون + وجبات)</Text>
            <Text style={[styles.profileValue, { color: "#6C4AB6" }]}>
              ₪{paid.toLocaleString()}
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
              ₪{remaining.toLocaleString()}
            </Text>
          </View>
        </View>
        {/* أزرار التحكم */}
        {actionLoading === item.id ? (
          <ActivityIndicator color="#6C4AB6" style={{ paddingVertical: 10 }} />
        ) : (
          <View style={[styles.row, { gap: 8, marginTop: 10 }]}>
            {item.status === "confirmed" && !isPast && daysLeft >= 4 && (
              <ActionBtn
                label="تعديل التاريخ"
                color="#6C4AB6"
                bg="#FFF"
                border
                onPress={() => onOpenReschedule(item)}
              />
            )}

            {item.status === "owner_rescheduled" && item.proposed_date && (
              <>
                <ActionBtn
                  label="قبول"
                  color="#FFF"
                  bg="#63c988ff"
                  onPress={() => onRescheduleResponse(item.id, true)}
                />
                <ActionBtn
                  label="رفض"
                  color="#FFF"
                  bg="#db6c6cff"
                  onPress={() => onRescheduleResponse(item.id, false)}
                />
              </>
            )}

            {(item.status === "confirmed" ||
              item.status === "owner_rescheduled") &&
              !isPast && (
                <ActionBtn
                  label="إلغاء الحجز"
                  color="#EF4444"
                  bg="#FEF2F2"
                  onPress={() => onCancel(item)}
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
                    hallName: item.hall_name || item.hallName,
                    hallCity: item.hall_location || item.hallCity,
                    bookingId: item.id,
                    hallId: item.hall_id,
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
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null); // [معدّل - كان selectedRescheduleId]
  const [busyDates, setBusyDates] = useState<(string | Date)[]>([]);
  const [fetchingBusy, setFetchingBusy] = useState(false); // [معدّل - كان fetchingBusyDates]

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
  // [معدّل - كان handleCancel مع booking param]
  const handleCancel = (item: any) => {
    Alert.alert(
      "إلغاء الحجز",
      `انت على وشك الغاء الحجز، يرجى التواصل مع صاحب الصاله (ممكن ان لا يتم استرداد العربون) "${
        item.hall_name || item.hallName
      }"؟`,
      [
        { text: "تراجع", style: "cancel" },
        {
          text: "نعم، إلغاء الحجز",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await cancelBookingApi(item.id);
              Toast.show({
                type: "success",
                text1: res?.data || "تم تحديث حالة الحجز",
              });
              triggerRefresh();
            } catch (err: any) {
              console.error(err);
              Toast.show({
                type: "error",
                text1: err.response?.data || "فشل إلغاء الحجز",
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
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: err.response?.data || "فشل في الاستجابة للتعديل",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRescheduleSubmit = async (dateString: string) => {
    if (!selectedId) return;
    setActionLoading(selectedId);
    setRescheduleModal(false);
    try {
      const res = await requestRescheduleApi(selectedId, dateString);
      Toast.show({
        type: "success",
        text1: res?.data?.message || "تم تعديل الموعد بنجاح",
      });
      triggerRefresh();
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: err.response?.data || "فشل تعديل الموعد",
      });
    } finally {
      setActionLoading(null);
      setSelectedId(null);
    }
  };

  // [معدّل - كان openRescheduleCustomer]
  const openReschedule = async (item: any) => {
    if (fetchingBusy) return;
    try {
      setFetchingBusy(true);
      const res = await getBusyDatesApi(item.hall_id);
      setBusyDates(res.data || []);
      Alert.alert(
        "تعديل الموعد",
        `هل تريد تعديل موعد حجز (${
          item.hall_name || item.hallName
        })؟\nسيتم تعديل الموعد فوراً وإرسال إشعار لصاحب الصالة.`,
        [
          { text: "تراجع", style: "cancel" },
          {
            text: "نعم",
            onPress: () => {
              setSelectedId(item.id);
              setRescheduleModal(true);
            },
          },
        ],
      );
    } catch (err) {
      console.error("Error fetching busy dates:", err);
      Toast.show({
        type: "error",
        text1: "فشل تحميل المواعيد المحجوزة، يرجى المحاولة لاحقاً",
      });
    } finally {
      setFetchingBusy(false);
    }
  };

  if (loading && bookings.length === 0)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6C4AB6" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />
      <FlatList
        data={bookings as any[]}
        keyExtractor={(item, index) => item.id?.toString() + "-" + index}
        style={{ width: "90%" }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore} // [معدّل - كان ملفوف بدالة]
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
            item={item}
            actionLoading={actionLoading}
            onCancel={handleCancel}
            onOpenReschedule={openReschedule}
            onRescheduleResponse={handleRescheduleResponse}
          />
        )}
      />

      <BookingCalendarModal
        visible={rescheduleModal}
        onClose={() => {
          setRescheduleModal(false);
          setSelectedId(null);
        }}
        onConfirm={handleRescheduleSubmit}
        bookedDates={busyDates}
        loading={actionLoading === selectedId}
        title="تعديل موعد الحجز"
        subtitle="اختر التاريخ الجديد لتعديل الموعد (الأحمر = محجوز)."
        confirmLabel="تعديل الموعد"
      />
    </SafeAreaView>
  );
}