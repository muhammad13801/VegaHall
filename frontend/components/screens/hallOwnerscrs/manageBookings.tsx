import { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
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
import { InfoRow } from "../../reusable func/infoRow";
import { supabase } from "../../Services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Service {
  name: string;
  price: number;
}
interface Meal {
  name: string;
  price_per_person: number;
}
interface Booking {
  id: number;
  hall_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  booking_date: string;
  guests_number: number;
  services: Service[] | string | null;
  meals: Meal[] | null;
  amount: number;
  status: string;
  proposed_date: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed: { label: "مؤكد", color: "#22C55E" },
  owner_rescheduled: { label: "تعديل مقترح", color: "#6C4AB6" },
  customer_cancelled: { label: "ملغي من قبل العميل", color: "#F97316" },
  customer_cancelled_resolved: {
    label: "تم الرد على إلغاء الحجز ",
    color: "#6C4AB6",
  },
  owner_cancelled: { label: "ملغي من قبلك", color: "#EF4444" },
};

const NoticeBox = ({ icon, text, color, bg, border }: any) => (
  <View
    style={[
      styles.mealOptionRow,
      { gap: 8, marginBottom: 10, backgroundColor: bg, borderColor: border },
    ]}
  >
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[styles.profileLabel, { color }]}>{text}</Text>
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
  item,
  onReschedule,
  onCancel,
  onRefundResponse,
  actionLoading,
  today,
}: any) => {
  const cfg = STATUS_CONFIG[item.status] || {
    label: item.status,
    color: "#888",
  };
  const mTotal = (item.meals || []).reduce(
    (a: number, m: any) =>
      a + (m.price_per_person || 0) * (item.guests_number || 0),
    0,
  );
  const paid = Math.round((item.amount - mTotal) * 0.2 + mTotal);

  const svcs = useMemo(() => {
    if (!item.services) return [];
    if (Array.isArray(item.services)) return item.services;
    try {
      return JSON.parse(item.services);
    } catch {
      return [];
    }
  }, [item.services]);

  const hasPassed = new Date(item.booking_date).setHours(0, 0, 0, 0) < today;
  const hideBtn =
    (item.status === "confirmed" && hasPassed) ||
    item.status === "owner_cancelled";

  return (
    <View style={[styles.card]}>
      {/* Hall name + status */}
      <View style={styles.info}>
        <InfoRow
          icon="business-outline"
          label={item.hall_name}
          containerStyle={{ flex: 1, paddingVertical: 0 }}
        />
        <Text style={[styles.itemText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>

      {/* Customer name */}
      <View style={styles.row}>
        <InfoRow
          icon={"person-outline"}
          label={`${item.customer_first_name} ${item.customer_last_name}`}
        />
      </View>

      {/* Date + guests */}
      <View style={styles.row}>
        <InfoRow
          icon={"calendar-outline"}
          label={formatDate(item.booking_date)}
          containerStyle={{ width: "50%", paddingVertical: 0 }}
        />
        <InfoRow
          icon={"people-outline"}
          label={`${item.guests_number} ضيف`}
          containerStyle={{ paddingVertical: 0 }}
        />
      </View>

      {item.status === "owner_rescheduled" && item.proposed_date && (
        <NoticeBox
          icon="alert-circle-outline"
          text={`موعد مقترح: ${formatDate(item.proposed_date)}`}
          color="#FFA000"
          bg="#FFFBF0"
          border="#FFD54F"
        />
      )}
      {svcs.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={[
              styles.label,
              { fontSize: 14, marginBottom: 8, marginTop: 8 },
            ]}
          >
            الخدمات المختارة:
          </Text>
          <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
            {svcs.map((s: any, i: number) => (
              <ItemChip
                key={i}
                text={`${s.name}${s.price > 0 ? ` ${s.price}₪` : ""}`}
              />
            ))}
          </View>
        </View>
      )}
      {item.meals?.length > 0 && (
        <View>
          <Text style={[styles.label, { fontSize: 14, marginBottom: 8 }]}>
            الوجبات المختارة:
          </Text>
          <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
            {item.meals.map((m: any, i: number) => (
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
              ₪{item.amount.toLocaleString()}
            </Text>
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
            <Text style={styles.label}>المتبقي للدفع (في الصالة)</Text>
            <Text style={[styles.title, { fontSize: 20, color: "#22C55E" }]}>
              ₪{(item.amount - paid).toLocaleString()}
            </Text>
          </View>
        </View>

        {!hideBtn &&
          (actionLoading === item.id ? (
            <ActivityIndicator
              color="#6C4AB6"
              style={{ paddingVertical: 10 }}
            />
          ) : (
            <View style={[styles.row, { gap: 8, marginTop: 10 }]}>
              {item.status === "confirmed" && (
                <ActionBtn
                  label="تعديل التاريخ"
                  color="#6C4AB6"
                  bg="#FFF"
                  border
                  onPress={() => onReschedule(item.id)}
                />
              )}
              {(item.status === "confirmed" ||
                item.status === "owner_rescheduled") && (
                <ActionBtn
                  label="إلغاء الحجز"
                  color="#D32F2F"
                  bg="#FEF2F2"
                  onPress={() => onCancel(item.id)}
                />
              )}
              {item.status === "customer_cancelled" && (
                <ActionBtn
                  label="قرار الاسترجاع"
                  color="#C2410C"
                  bg="#FFF7ED"
                  onPress={() => onRefundResponse(item.id)}
                />
              )}
            </View>
          ))}
      </View>
    </View>
  );
};

export default function ManageBookings() {
  const {
    items: bookings,
    setItems,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    onRefresh,
    loadMore,
  } = usePaginatedFetch({ fetchFunction: getOwnerBookingsApi, limit: 10 });

  const hallIdsRef = useRef<number[]>([]);

  const loadHallIds = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    const { data } = await supabase
      .from("halls")
      .select("id")
      .eq("owner_id", Number(userId));

    hallIdsRef.current = data?.map((h) => h.id) || [];
  };

  useEffect(() => {
    let channel: any;

    const setup = async () => {
      await loadHallIds();

      channel = supabase
        .channel("bookings-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
          },
          (payload: any) => {
            const hallIds = hallIdsRef.current;

            const hallId = payload.new?.hall_id;

            if (hallIds.includes(hallId)) {
              onRefresh();
            }
          },
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const today = useMemo(() => new Date().setHours(0, 0, 0, 0), []);
  const bookedDates = useMemo(
    () =>
      (bookings as Booking[])
        .filter((b) => b.status === "confirmed")
        .map((b) => b.booking_date),
    [bookings],
  );

  const handleAction = async (
    id: number,
    apiFunc: any,
    status: string,
    args: any[] = [],
  ) => {
    setActionLoading(id);
    try {
      const res = await apiFunc(id, ...args);
      setItems((prev) =>
        (prev as Booking[]).map((b) =>
          b.id === id ? { ...b, status, ...(args[1] || {}) } : b,
        ),
      );
      Toast.show({ type: "success", text1: res?.data });
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundResponse = (id: number) =>
    Alert.alert("قرار استرجاع", "هل تريد إعادة المبلغ؟", [
      {
        text: "لا، بدون إعادة",
        style: "destructive",
        onPress: () =>
          handleAction(
            id,
            customerCancelResponseApi,
            "customer_cancelled_resolved",
            [false],
          ),
      },
      {
        text: "نعم، أعد المبلغ",
        onPress: () =>
          handleAction(
            id,
            customerCancelResponseApi,
            "customer_cancelled_resolved",
            [true],
          ),
      },
      { text: "تراجع", style: "cancel" },
    ]);

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
        data={bookings as Booking[]}
        keyExtractor={(b) => b.id.toString()}
        style={{ width: "90%" }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
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
            today={today}
            actionLoading={actionLoading}
            onReschedule={(id: number) => {
              setSelectedId(id);
              setRescheduleModal(true);
            }}
            onCancel={(id: number) =>
              Alert.alert("إلغاء", "تأكيد إلغاء الحجز؟", [
                { text: "تراجع" },
                {
                  text: "تأكيد",
                  onPress: () =>
                    handleAction(id, ownerCancelBookingApi, "owner_cancelled"),
                },
              ])
            }
            onRefundResponse={handleRefundResponse}
          />
        )}
      />
      <BookingCalendarModal
        visible={rescheduleModal}
        onClose={() => {
          setRescheduleModal(false);
          setSelectedId(null);
        }}
        onConfirm={async (date: string) => {
          setRescheduleModal(false);
          await handleAction(
            selectedId!,
            proposeRescheduleApi,
            "owner_rescheduled",
            [date],
          );
          setItems((prev) =>
            (prev as Booking[]).map((b) =>
              b.id === selectedId
                ? { ...b, status: "owner_rescheduled", proposed_date: date }
                : b,
            ),
          );
        }}
        bookedDates={bookedDates}
        loading={actionLoading === selectedId}
        title="موعد جديد"
        confirmLabel="إرسال"
      />
    </SafeAreaView>
  );
}
