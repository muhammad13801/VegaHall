import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import BookingCalendarModal from "../../reusable func/Bookingcalendarmodal";
import {
  getOwnerBookingsApi,
  ownerCancelBookingApi,
  customerCancelResponseApi,
  proposeRescheduleApi,
} from "../../Services/hallApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { formatDate } from "../../reusable func/formatDate";

interface Service {
  name: string;
  price: number;
}

interface Booking {
  id: number;
  hall_name: string;
  customer_first_name: string;
  customer_last_name: string;
  booking_date: string;
  guests_number: number;
  services: Service[] | string | null;
  amount: number;
  status: string;
  proposed_date: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: "مؤكد", color: "#22C55E" },
  owner_rescheduled: { label: "تعديل مقترح", color: "#6C4AB6" },
  customer_cancelled: { label: "إلغاء من العميل", color: "#F97316" },
  owner_cancelled: { label: "ملغي", color: "#EF4444" },
};

// Helper function to check if a date has passed
const hasDatePassed = (dateString: string): boolean => {
  const bookingDate = new Date(dateString);
  const today = new Date();

  // Set time to start of day for accurate comparison
  bookingDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return bookingDate < today;
};

export default function ManageBookings() {
  const {
    items: bookings,
    setItems,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    onRefresh,
    loadMore,
  } = usePaginatedFetch({ fetchFunction: getOwnerBookingsApi, limit: 10 });

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // All confirmed booking dates — passed to the calendar as blocked dates
  const bookedDates = (bookings as Booking[])
    .filter((b) => b.status === "confirmed")
    .map((b) => b.booking_date);

  const updateStatus = useCallback(
    (id: number, status: string, extra = {}) =>
      setItems((prev) =>
        (prev as Booking[]).map((b) =>
          b.id === id ? { ...b, status, ...extra } : b,
        ),
      ),
    [setItems],
  );

  // Owner cancels a confirmed or owner_rescheduled booking → refund is automatic
  const handleOwnerCancel = useCallback(
    (id: number) => {
      Alert.alert(
        "إلغاء الحجز",
        "سيتم إلغاء الحجز وإعادة المبلغ كاملاً للعميل تلقائياً. هل تريد المتابعة؟",
        [
          { text: "تراجع", style: "cancel" },
          {
            text: "إلغاء الحجز",
            style: "destructive",
            onPress: async () => {
              setActionLoading(id);
              try {
                const response = await ownerCancelBookingApi(id);
                updateStatus(id, "owner_cancelled");
                Toast.show({
                  type: "success",
                  text1: response?.data,
                });
              } catch (error: any) {
                Toast.show({ type: "error", text1: error.response?.data });
              } finally {
                setActionLoading(null);
              }
            },
          },
        ],
      );
    },
    [updateStatus],
  );

  // Owner responds to a customer_cancelled booking → chooses refund or not
  const handleCustomerCancelResponse = useCallback(
    (id: number) => {
      Alert.alert(
        "رد على طلب الإلغاء",
        "قام العميل بإلغاء حجزه. هل تريد إعادة المبلغ المدفوع؟",
        [
          { text: "تراجع", style: "cancel" },
          {
            text: "لا، بدون إعادة",
            style: "destructive",
            onPress: async () => {
              setActionLoading(id);
              try {
                const response = await customerCancelResponseApi(id, false);
                updateStatus(id, "owner_cancelled");
                Toast.show({
                  type: "success",
                  text1: response?.data,
                });
              } catch (error: any) {
                Toast.show({ type: "error", text1: error.response?.data });
              } finally {
                setActionLoading(null);
              }
            },
          },
          {
            text: "نعم، أعد المبلغ",
            onPress: async () => {
              setActionLoading(id);
              try {
                const response = await customerCancelResponseApi(id, true);
                updateStatus(id, "owner_cancelled");
                Toast.show({
                  type: "success",
                  text1: response?.data,
                });
              } catch (error: any) {
                Toast.show({ type: "error", text1: error.response?.data });
              } finally {
                setActionLoading(null);
              }
            },
          },
        ],
      );
    },
    [updateStatus],
  );

  const handleReschedule = useCallback(
    async (dateString: string) => {
      if (!selectedId) return;
      setActionLoading(selectedId);
      setRescheduleModal(false);
      try {
        const response = await proposeRescheduleApi(selectedId, dateString);
        updateStatus(selectedId, "owner_rescheduled", {
          proposed_date: dateString,
        });
        Toast.show({ type: "success", text1: response?.data });
      } catch (error: any) {
        Toast.show({ type: "error", text1: error.response?.data });
      } finally {
        setActionLoading(null);
        setSelectedId(null);
      }
    },
    [selectedId, updateStatus],
  );

  const openReschedule = useCallback((id: number) => {
    Alert.alert(
      "تعديل الموعد",
      "هل تريد اقتراح موعد جديد للعميل؟\nسيصبح الحجز في حالة انتظار حتى يقبل العميل.",
      [
        { text: "تراجع", style: "cancel" },
        {
          text: "نعم",
          onPress: () => {
            setSelectedId(id);
            setRescheduleModal(true);
          },
        },
      ],
    );
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6C4AB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundDecoration />

      <FlatList
        data={bookings as Booking[]}
        keyExtractor={(b) => b.id.toString()}
        style={{ width: "90%" }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C4AB6"]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: "70%" }}>
            <Ionicons name="calendar-clear-outline" size={70} color="#DDD" />
            <Text style={styles.subtitle}>لا توجد حجوزات</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
          ) : !hasMore && (bookings as Booking[]).length > 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "#AAA",
                marginVertical: 20,
                fontSize: 13,
              }}
            >
              لا توجد حجوزات إضافية
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status] ?? {
            label: item.status,
            color: "#888",
          };
          const isConfirmed = item.status === "confirmed";
          const isOwnerRescheduled = item.status === "owner_rescheduled";
          const isCustomerCancelled = item.status === "customer_cancelled";
          const isOwnerCancelled = item.status === "owner_cancelled";
          const isActioning = actionLoading === item.id;

          // Determine if action buttons should be shown
          const confirmedDatePassed =
            isConfirmed && hasDatePassed(item.booking_date);
          const rescheduledDatePassed =
            isOwnerRescheduled &&
            item.proposed_date &&
            hasDatePassed(item.proposed_date);
          const shouldHideButtons =
            confirmedDatePassed || rescheduledDatePassed || isOwnerCancelled;

          return (
            <View style={[styles.card, { marginBottom: 14 }]}>
              {/* Hall name + status */}
              <View style={[styles.info, { marginBottom: 12 }]}>
                <Text style={[styles.profileValue, { fontSize: 16 }]}>
                  {item.hall_name}
                </Text>
                <Text style={[styles.itemText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>

              {/* Customer name */}
              <View
                style={[
                  styles.row,
                  { alignItems: "center", gap: 8, marginBottom: 10 },
                ]}
              >
                <Ionicons name="person-outline" size={15} color="#888" />
                <Text style={styles.profileValue}>
                  {item.customer_first_name} {item.customer_last_name}
                </Text>
              </View>

              {/* Date + guests */}
              <View style={[styles.row, { gap: 16, marginBottom: 10 }]}>
                <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                  <Ionicons name="calendar-outline" size={14} color="#888" />
                  <Text style={styles.profileLabel}>
                    {formatDate(item.booking_date)}
                  </Text>
                </View>
                <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                  <Ionicons name="people-outline" size={14} color="#888" />
                  <Text style={styles.profileLabel}>
                    {item.guests_number ?? "—"} ضيف
                  </Text>
                </View>
              </View>

              {/* Pending reschedule notice */}
              {isOwnerRescheduled && item.proposed_date && (
                <View
                  style={[
                    styles.mealOptionRow,
                    {
                      gap: 8,
                      marginBottom: 10,
                      backgroundColor: "#FFFBF0",
                      borderColor: "#FFD54F",
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={15}
                    color="#FFA000"
                  />
                  <Text style={[styles.profileLabel, { color: "#7F5600" }]}>
                    في انتظار رد العميل على: {formatDate(item.proposed_date)}
                  </Text>
                </View>
              )}

              {/* Customer cancelled notice */}
              {isCustomerCancelled && (
                <View
                  style={[
                    styles.mealOptionRow,
                    {
                      gap: 8,
                      marginBottom: 10,
                      backgroundColor: "#FFF7ED",
                      borderColor: "#FDBA74",
                    },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                    color="#F97316"
                  />
                  <Text style={[styles.profileLabel, { color: "#9A3412" }]}>
                    ألغى العميل الحجز — يرجى اتخاذ قرار بشأن استرجاع المبلغ
                  </Text>
                </View>
              )}

              {/* Services */}
              {((Array.isArray(item.services) &&
                (item.services as any[]).length > 0) ||
                (typeof item.services === "string" &&
                  item.services.length > 2)) && (
                <View style={{ marginBottom: 12 }}>
                  <View
                    style={[
                      styles.row,
                      { alignItems: "center", gap: 6, marginBottom: 8 },
                    ]}
                  >
                    <Ionicons
                      name="list-circle-outline"
                      size={18}
                      color="#6C4AB6"
                    />
                    <Text style={[styles.label, { fontSize: 14 }]}>
                      الخدمات المختارة:
                    </Text>
                  </View>
                  <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
                    {(typeof item.services === "string"
                      ? JSON.parse(item.services)
                      : item.services
                    ).map((s: any, i: number) => (
                      <View
                        key={i}
                        style={[
                          styles.items,
                          {
                            marginLeft: 0,
                            marginRight: 8,
                            backgroundColor: "#F5F3FF",
                            borderColor: "#E9E4FF",
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text style={[styles.itemText, { fontSize: 13 }]}>
                          {s.name}
                          {s.price > 0 ? ` ₪${s.price}` : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Total + action buttons */}
              <View
                style={[
                  styles.borderTopSection,
                  { marginTop: 8, paddingTop: 12 },
                ]}
              >
                <View style={[styles.info, { marginBottom: 10 }]}>
                  <Text style={styles.label}>إجمالي التكلفة</Text>
                  <Text
                    style={[styles.title, { fontSize: 20, color: "#22C55E" }]}
                  >
                    {item.amount != null ? `₪${item.amount}` : "—"}
                  </Text>
                </View>

                {!shouldHideButtons && (
                  <>
                    {isActioning ? (
                      <ActivityIndicator
                        color="#6C4AB6"
                        style={{ paddingVertical: 10 }}
                      />
                    ) : (
                      <>
                        {/* confirmed: reschedule or cancel (forced refund) */}
                        {isConfirmed && (
                          <View style={[styles.row, { gap: 8 }]}>
                            <TouchableOpacity
                              style={[
                                styles.secondaryActionButton,
                                { flex: 1, marginTop: 0 },
                              ]}
                              onPress={() => openReschedule(item.id)}
                            >
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  { color: "#6C4AB6" },
                                ]}
                              >
                                تعديل التاريخ
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                {
                                  flex: 1,
                                  marginTop: 0,
                                  backgroundColor: "#FEF2F2",
                                },
                              ]}
                              onPress={() => handleOwnerCancel(item.id)}
                            >
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  { color: "#D32F2F" },
                                ]}
                              >
                                إلغاء الحجز
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* owner_rescheduled: only cancel is allowed (forced refund) */}
                        {isOwnerRescheduled && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              { marginTop: 0, backgroundColor: "#FEF2F2" },
                            ]}
                            onPress={() => handleOwnerCancel(item.id)}
                          >
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: "#D32F2F" },
                              ]}
                            >
                              إلغاء الحجز
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* customer_cancelled: owner decides refund or not */}
                        {isCustomerCancelled && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              { marginTop: 0, backgroundColor: "#FFF7ED" },
                            ]}
                            onPress={() =>
                              handleCustomerCancelResponse(item.id)
                            }
                          >
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: "#C2410C" },
                              ]}
                            >
                              قرار استرجاع المبلغ
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        }}
      />

      <BookingCalendarModal
        visible={rescheduleModal}
        onClose={() => {
          setRescheduleModal(false);
          setSelectedId(null);
        }}
        onConfirm={handleReschedule}
        bookedDates={bookedDates}
        loading={actionLoading === selectedId}
        title="اقتراح موعد جديد"
        subtitle="اختر تاريخاً متاحاً. سيبقى الحجز في انتظار موافقة العميل."
        confirmLabel="إرسال الاقتراح"
      />
    </SafeAreaView>
  );
}
