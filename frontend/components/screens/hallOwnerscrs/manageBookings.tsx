import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import {
  getOwnerBookingsApi,
  rejectBookingApi,
  proposeRescheduleApi,
} from "../../Services/hallApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";

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
  Confirmed: { label: "مؤكد", color: "#22C55E" },
  Pending: { label: "قيد الانتظار", color: "#F59E0B" },
  Rejected: { label: "مرفوض", color: "#EF4444" },
  RescheduleRequested: { label: "تعديل مقترح", color: "#6C4AB6" },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
  const [proposedDate, setProposedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateStatus = useCallback(
    (id: number, status: string, extra = {}) =>
      setItems((prev) =>
        (prev as Booking[]).map((b) =>
          b.id === id ? { ...b, status, ...extra } : b,
        ),
      ),
    [setItems],
  );

  // Reject → refund amount back to customer
  const handleReject = useCallback(
    (id: number) => {
      Alert.alert(
        "رفض الحجز",
        "سيتم رفض الحجز وإعادة المبلغ كاملاً للعميل. هل تريد المتابعة؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "رفض وإعادة المبلغ",
            style: "destructive",
            onPress: async () => {
              setActionLoading(id);
              try {
                await rejectBookingApi(id);
                updateStatus(id, "Rejected");
                Toast.show({
                  type: "success",
                  text1: "تم رفض الحجز وإعادة المبلغ للعميل",
                });
              } catch {
                Toast.show({ type: "error", text1: "فشل رفض الحجز" });
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

  // Propose new date → status becomes Pending until customer accepts
  const handleReschedule = useCallback(async () => {
    if (!selectedId) return;
    setActionLoading(selectedId);
    setRescheduleModal(false);
    try {
      const dateStr = proposedDate.toISOString().split("T")[0];
      await proposeRescheduleApi(selectedId, dateStr);
      updateStatus(selectedId, "Pending", { proposed_date: dateStr });
      Toast.show({ type: "success", text1: "تم إرسال الموعد الجديد للعميل" });
    } catch {
      Toast.show({ type: "error", text1: "فشل إرسال طلب الموعد" });
    } finally {
      setActionLoading(null);
      setSelectedId(null);
    }
  }, [selectedId, proposedDate, updateStatus]);

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
            setProposedDate(new Date());
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

      {/* Header */}
      <View style={[styles.info, { width: "90%", marginVertical: 12 }]}>
        <Text style={styles.title}>إدارة الحجوزات</Text>
        <Ionicons name="calendar-outline" size={26} color="#6C4AB6" />
      </View>

      {/* Bookings List */}
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
          const isConfirmed = item.status === "Confirmed";
          const isPending = item.status === "Pending";
          const isActioning = actionLoading === item.id;

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

              {/* Customer */}
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

              {/* Proposed date — shown when status is Pending (awaiting customer response) */}
              {isPending && item.proposed_date && (
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

              {/* Selected Services Section */}
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
                          {s.price > 0 ? `₪${s.price}` : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Cost + actions */}
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

                {isActioning ? (
                  <ActivityIndicator
                    color="#6C4AB6"
                    style={{ paddingVertical: 10 }}
                  />
                ) : (
                  <>
                    {/* Confirmed: owner can propose new date or reject (refund) */}
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
                          onPress={() => handleReject(item.id)}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              { color: "#D32F2F" },
                            ]}
                          >
                            رفض وإعادة المبلغ
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Pending: waiting for customer to accept proposed date — owner can only reject */}
                    {isPending && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { marginTop: 0, backgroundColor: "#FEF2F2" },
                        ]}
                        onPress={() => handleReject(item.id)}
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: "#D32F2F" },
                          ]}
                        >
                          رفض وإعادة المبلغ
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اقتراح موعد جديد</Text>
            <Text
              style={[
                styles.profileLabel,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              اختر التاريخ الجديد. سيبقى الحجز في حالة انتظار حتى يقبل العميل.
            </Text>

            <TouchableOpacity
              style={[
                styles.secondaryActionButton,
                { marginTop: 0, marginBottom: 12 },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                <Ionicons name="calendar-outline" size={20} color="#6C4AB6" />
                <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
                  {proposedDate.toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReschedule}
            >
              <Text style={styles.actionButtonText}>إرسال الاقتراح</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionButton, { borderWidth: 0 }]}
              onPress={() => setRescheduleModal(false)}
            >
              <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
                إلغاء
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        minimumDate={new Date()}
        date={proposedDate}
        onConfirm={(date) => {
          setProposedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        confirmTextIOS="تأكيد"
        cancelTextIOS="إلغاء"
      />
    </SafeAreaView>
  );
}
