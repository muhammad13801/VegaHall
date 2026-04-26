import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { styles as s } from "./ibrahimStyles";
import { NavigateTo } from "../../reusable func/navigateTo";
import { getBookingsApi, cancelBookingApi, requestRescheduleApi, respondRescheduleApi, getBusyDatesApi } from "../../Services/customerApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import BookingCalendarModal from "../../reusable func/Bookingcalendarmodal";
import { useRefresh } from "../../reusable func/refreshContext";
import BackButton from "../../reusable func/backButton";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STATUS_CONFIG: Record<string, any> = {
    confirmed: {
        label: "مؤكد",
        color: "#22C55E",
        bg: "#E8F5E9",
        border: "#A5D6A7",
        icon: "check-circle" as const,
    },
    customer_cancelled: {
        label: "ملغي (من قبلك)",
        color: "#EF4444",
        bg: "#FFEBEE",
        border: "#EF9A9A",
        icon: "x-circle" as const,
    },
    owner_cancelled: {
        label: "ملغي من الصالة",
        color: "#EF4444",
        bg: "#FFEBEE",
        border: "#EF9A9A",
        icon: "x-circle" as const,
    },
    owner_rescheduled: {
        label: "تعديل مقترح",
        color: "#6C4AB6",
        bg: "#FFF3E0",
        border: "#FFE0B2",
        icon: "clock" as const,
    },
};

export default function MyBookings() {
    const { triggerRefresh } = useRefresh();
    const [ratedBookings, setRatedBookings] = useState<Record<string, boolean>>({});
    
    // Reschedule states
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [rescheduleModal, setRescheduleModal] = useState(false);
    const [selectedRescheduleId, setSelectedRescheduleId] = useState<number | null>(null);
    const [busyDates, setBusyDates] = useState<(string | Date)[]>([]);
    const [fetchingBusyDates, setFetchingBusyDates] = useState(false);

    useFocusEffect(
        useCallback(() => {
            triggerRefresh();
        }, [])
    );

    const {
        items: bookings,
        loading,
        loadingMore,
        refreshing,
        hasMore,
        onRefresh,
        loadMore
    } = usePaginatedFetch({
        fetchFunction: getBookingsApi,
        limit: 10,
    });

    const checkRatings = async (bookingsList: any[]) => {
        const ratedMap: Record<string, boolean> = {};
        for (const b of bookingsList) {
           const isRated = await AsyncStorage.getItem(`rated_booking_${b.id}`);
           if (isRated === 'true') {
               ratedMap[b.id] = true;
           }
        }
        setRatedBookings(prev => ({...prev, ...ratedMap}));
    };

    useEffect(() => {
        if (bookings.length > 0) {
            checkRatings(bookings);
        }
    }, [bookings]);

    const handleCancel = (booking: any) => {
        Alert.alert(
            "إلغاء الحجز",
            `انت على وشك الغاء الحجز، يرجى التواصل مع صاحب الصاله (ممكن ان لا يتم استرداد العربون) "${booking.hall_name || booking.hallName}"؟`,
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
                                text1: res?.data || "تم تحديث حالة الحجز"
                            });
                            triggerRefresh();
                        } catch (error: any) {
                            console.error(error);
                            Toast.show({
                                type: "error",
                                text1: error.response?.data || "فشل إلغاء الحجز"
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleRescheduleResponse = async (bookingId: number, accept: boolean) => {
        setActionLoading(bookingId);
        try {
            const res = await respondRescheduleApi(bookingId, accept);
            Toast.show({
                type: "success",
                text1: res?.data?.message || (accept ? "تم قبول التعديل بنجاح" : "تم رفض التعديل")
            });
            triggerRefresh();
        } catch (error: any) {
            console.error(error);
            Toast.show({
                type: "error",
                text1: error.response?.data || "فشل في الاستجابة للتعديل"
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
                text1: res?.data?.message || "تم تعديل الموعد بنجاح"
            });
            triggerRefresh();
        } catch (error: any) {
            console.error(error);
            Toast.show({
                type: "error",
                text1: error.response?.data || "فشل تعديل الموعد"
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
                `هل تريد تعديل موعد حجز (${booking.hall_name || booking.hallName})؟\nسيتم تعديل الموعد فوراً وإرسال إشعار لصاحب الصالة.`,
                [
                    { text: "تراجع", style: "cancel" },
                    {
                        text: "نعم",
                        onPress: () => {
                            setSelectedRescheduleId(booking.id);
                            setRescheduleModal(true);
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error fetching busy dates:", error);
            Toast.show({
                type: "error",
                text1: "فشل تحميل المواعيد المحجوزة، يرجى المحاولة لاحقاً"
            });
        } finally {
            setFetchingBusyDates(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("ar-EG", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]} >
            <BackgroundDecoration />
            <View style={[styles.info, { width: "90%", alignSelf: "center", marginTop: 30, alignItems: 'center' }]}>
                <Text style={[styles.title, { fontSize: 28, lineHeight: 35 }]}>حجوزاتي</Text>
                <View style={{ marginBottom: -5, transform: [{ scaleX: -1 }] }}>
                    <BackButton />
                </View>
            </View>

            <View style={{ flex: 1 }}>
                {loading && bookings.length === 0 ? (
                    <ActivityIndicator size="large" color="#6C4AB6" style={{ marginTop: 40 }} />
                ) : bookings.length === 0 ? (
                    <View style={s.emptyBox}>
                        <Feather name="calendar" size={56} color="#D4C4F7" />
                        <Text style={s.emptyTitle}>لا يوجد حجوزات بعد</Text>
                        <Text style={s.emptyText}>
                            ابحث عن صالة واحجز مناسبتك القادمة الآن!
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[s.body, { paddingHorizontal: 16 }]}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#6C4AB6"]}
                            />
                        }
                        onScroll={({ nativeEvent }) => {
                            const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 20;
                            if (isCloseToBottom && hasMore && !loadingMore) {
                                loadMore();
                            }
                        }}
                        scrollEventThrottle={400}
                    >
                        {bookings.map((booking: any) => {
                            const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
                            const isPastDate = new Date(booking.booking_date || booking.date) < new Date();
                            const canRate = booking.status === "confirmed" && isPastDate && !ratedBookings[booking.id];
                            
                            const hasServices = (Array.isArray(booking.services) && booking.services.length > 0) ||
                                              (typeof booking.services === "string" && booking.services.length > 2);
                            const parsedServices = typeof booking.services === "string" ? JSON.parse(booking.services) : booking.services;

                            return (
                                <View key={booking.id} style={[styles.card, { marginBottom: 14 }]}>
                                    {/* Header: Hall Name + Status */}
                                    <View style={[styles.info, { marginBottom: 12 }]}>
                                        <Text style={[styles.profileValue, { fontSize: 16 }]}>
                                            {booking.hall_name || booking.hallName}
                                        </Text>
                                        <Text style={[styles.itemText, { color: statusCfg.color, fontWeight: 'bold' }]}>
                                            {statusCfg.label}
                                        </Text>
                                    </View>

                                    {/* Hall Location */}
                                    <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 10 }]}>
                                        <Ionicons name="location-outline" size={15} color="#888" />
                                        <Text style={styles.profileValue}>
                                            {booking.hall_location || booking.hallCity}
                                        </Text>
                                    </View>

                                    {/* Date + Guests */}
                                    <View style={[styles.row, { gap: 16, marginBottom: 10 }]}>
                                        <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                                            <Ionicons name="calendar-outline" size={14} color="#888" />
                                            <Text style={styles.profileLabel}>
                                                {formatDate(booking.booking_date || booking.date)}
                                            </Text>
                                        </View>
                                        <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                                            <Ionicons name="people-outline" size={14} color="#888" />
                                            <Text style={styles.profileLabel}>
                                                {booking.guest_count || booking.guestCount} ضيف
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Services */}
                                    {hasServices && (
                                        <View style={{ marginBottom: 12 }}>
                                            <View style={[styles.row, { alignItems: "center", gap: 6, marginBottom: 8 }]}>
                                                <Ionicons name="list-circle-outline" size={18} color="#6C4AB6" />
                                                <Text style={[styles.label, { fontSize: 14 }]}>
                                                    الخدمات المختارة:
                                                </Text>
                                            </View>
                                            <View style={[styles.row, { flexWrap: "wrap", gap: 8 }]}>
                                                {parsedServices.map((s: any, i: number) => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.items,
                                                            {
                                                                marginLeft: 0,
                                                                marginRight: 0,
                                                                backgroundColor: "#F5F3FF",
                                                                borderColor: "#E9E4FF",
                                                                borderWidth: 1,
                                                            },
                                                        ]}
                                                    >
                                                        <Text style={[styles.itemText, { fontSize: 13 }]}>
                                                            {s.name} {s.price > 0 ? `${s.price}₪` : ""}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Total + Action Buttons */}
                                    <View style={[styles.borderTopSection, { marginTop: 8, paddingTop: 12 }]}>
                                        <View style={[styles.info, { marginBottom: 10 }]}>
                                            <Text style={styles.label}>إجمالي التكلفة</Text>
                                            <Text style={[styles.title, { fontSize: 20, color: "#22C55E" }]}>
                                                {booking.total_cost || booking.totalCost ? `₪${(Number(booking.total_cost || booking.totalCost)).toLocaleString()}` : "—"}
                                            </Text>
                                        </View>

                                        <View style={[styles.row, { gap: 8 }]}>
                                            {actionLoading === booking.id ? (
                                                <ActivityIndicator color="#6C4AB6" style={{ flex: 1, paddingVertical: 10 }} />
                                            ) : (
                                                <>
                                                    {booking.status === "confirmed" && !isPastDate && (
                                                        <TouchableOpacity
                                                            style={[styles.secondaryActionButton, { flex: 1, marginTop: 0 }]}
                                                            onPress={() => openRescheduleCustomer(booking)}
                                                        >
                                                            <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
                                                                تعديل التاريخ
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                    {booking.status === "owner_rescheduled" && booking.proposed_date && (
                                                        <View style={{ width: "100%", backgroundColor: "#FFF8E1", borderRadius: 10, borderWidth: 1, borderColor: "#FFD54F", padding: 12, marginBottom: 8 }}>
                                                            <Text style={{ fontSize: 13, color: "#E65100", fontWeight: "bold", textAlign: "right", marginBottom: 4 }}>
                                                                صاحب الصالة يقترح تغيير الموعد إلى: {formatDate(booking.proposed_date)}
                                                            </Text>
                                                            <View style={[styles.row, { gap: 8, marginTop: 8 }]}>
                                                                <TouchableOpacity
                                                                    style={[styles.actionButton, { flex: 1, marginTop: 0, backgroundColor: "#22C55E" }]}
                                                                    onPress={() => handleRescheduleResponse(booking.id, true)}
                                                                >
                                                                    <Text style={[styles.actionButtonText, { color: "#FFF" }]}>قبول</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={[styles.actionButton, { flex: 1, marginTop: 0, backgroundColor: "#EF4444" }]}
                                                                    onPress={() => handleRescheduleResponse(booking.id, false)}
                                                                >
                                                                    <Text style={[styles.actionButtonText, { color: "#FFF" }]}>رفض</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    )}

                                                    {(booking.status === "confirmed" || booking.status === "owner_rescheduled") && !isPastDate && (
                                                        <TouchableOpacity
                                                            style={[styles.actionButton, { flex: 1, marginTop: 0, backgroundColor: "#FEF2F2" }]}
                                                            onPress={() => handleCancel(booking)}
                                                        >
                                                            <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                                                                إلغاء الحجز
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                    {canRate && (
                                                        <TouchableOpacity
                                                            style={[styles.actionButton, { flex: 1, marginTop: 0, backgroundColor: "#FFFBF0", borderColor: "#F4B400", borderWidth: 1 }]}
                                                            onPress={() => NavigateTo("RateHall", {
                                                                hallName: booking.hall_name || booking.hallName,
                                                                hallCity: booking.hall_location || booking.hallCity,
                                                                bookingId: booking.id,
                                                                hallId: booking.hall_id
                                                            })}
                                                        >
                                                            <Text style={[styles.actionButtonText, { color: "#F4B400" }]}>
                                                                تقييم الحجز
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {loadingMore && (
                            <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 10 }} />
                        )}
                    </ScrollView>
                )}
            </View>

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
        </SafeAreaView >
    );
}