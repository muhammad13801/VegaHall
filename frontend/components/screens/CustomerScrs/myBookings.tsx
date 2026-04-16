import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles as s } from "./ibrahimStyles";
import { NavigateTo } from "../../reusable func/navigateTo";
import { getBookingsApi, cancelBookingApi, respondRescheduleApi } from "../../Services/customerApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { useRefresh } from "../../reusable func/refreshContext";
import BackButton from "../../reusable func/backButton";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

const STATUS_CONFIG: Record<string, any> = {
    confirmed: {
        label: "مؤكد",
        color: "#4CAF50",
        bg: "#E8F5E9",
        border: "#A5D6A7",
        icon: "check-circle" as const,
    },
    customer_cancelled: {
        label: "تم الإلغاء (من قبلك)",
        color: "#E74C3C",
        bg: "#FFEBEE",
        border: "#EF9A9A",
        icon: "x-circle" as const,
    },
    owner_cancelled: {
        label: "تم الإلغاء من صاحب القاعة",
        color: "#E74C3C",
        bg: "#FFEBEE",
        border: "#EF9A9A",
        icon: "x-circle" as const,
    },
    cancelled: {
        label: "ملغي",
        color: "#E74C3C",
        bg: "#FFEBEE",
        border: "#EF9A9A",
        icon: "x-circle" as const,
    },
    owner_rescheduled: {
        label: "تعديل موعد",
        color: "#F39C12",
        bg: "#FFF3E0",
        border: "#FFE0B2",
        icon: "clock" as const,
    },
};

export default function MyBookings() {
    const { triggerRefresh } = useRefresh();
    
    useFocusEffect(
        useCallback(() => {
            triggerRefresh();
        }, [])
    );

    const {
        items: bookings,
        loading,
        loadingMore,
        hasMore,
        loadMore
    } = usePaginatedFetch({
        fetchFunction: getBookingsApi,
        limit: 10,
    });

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
                            await cancelBookingApi(booking.id);
                            Alert.alert("نجاح", "تم إلغاء الحجز بنجاح بنجاح، تواصل مع صاحب الصالة لاسترداد العربون");
                            triggerRefresh();
                        } catch (error) {
                            console.error(error);
                            Alert.alert("خطأ", "فشل إلغاء الحجز");
                        }
                    },
                },
            ]
        );
    };

    const handleRescheduleResponse = (booking: any, accept: boolean) => {
        Alert.alert(
            accept ? "قبول الموعد الجديد" : "رفض الموعد الجديد",
            accept 
                ? `هل أنت متأكد من قبول الموعد الجديد ${formatDate(booking.proposed_date)}؟`
                : "هل أنت متأكد من رفض الموعد المقترح والعودة للموعد الأصلي؟",
            [
                { text: "تراجع", style: "cancel" },
                {
                    text: accept ? "قبول" : "رفض",
                    onPress: async () => {
                        try {
                            await respondRescheduleApi(booking.id, accept);
                            Alert.alert("نجاح", accept ? "تم قبول الموعد الجديد" : "تم رفض الموعد المقترح");
                            triggerRefresh();
                        } catch (error) {
                            console.error(error);
                            Alert.alert("خطأ", "فشل في إرسال الرد");
                        }
                    },
                },
            ]
        );
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
            <View style={[styles.info, { width: "90%", marginVertical: 5 }]}>
                <Text style={styles.title}>حجوزاتي</Text>
                <BackButton />
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
                            return (
                                <View key={booking.id} style={s.card}>
                                    {/* Header */}
                                    <View style={s.bookingCardHeader}>
                                        <LinearGradient
                                            colors={["#E8DEFF", "#F5F0FF"]}
                                            style={s.bookingCardIcon}
                                        >
                                            <MaterialCommunityIcons name="office-building" size={24} color="#7B5EC6" />
                                        </LinearGradient>
                                        <View style={s.bookingCardHeaderInfo}>
                                            <Text style={s.bookingCardHallName}>{booking.hall_name || booking.hallName}</Text>
                                            <View style={s.bookingCardLocationRow}>
                                                <Feather name="map-pin" size={12} color="#999" />
                                                <Text style={s.infoGridLabel}>{booking.hall_location || booking.hallCity}</Text>
                                            </View>
                                        </View>
                                        <View style={[s.statusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                                            <Feather name={statusCfg.icon} size={12} color={statusCfg.color} />
                                            <Text style={[s.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                                        </View>
                                    </View>

                                    {/* Details */}
                                    <View style={s.bookingCardDetails}>
                                        <View style={s.verticalInfoPill}>
                                            <Feather name="calendar" size={14} color="#6C4AB6" />
                                            <Text style={s.bookingDetailText}>{formatDate(booking.booking_date || booking.date)}</Text>
                                        </View>
                                        <View style={s.verticalInfoPill}>
                                            <Feather name="users" size={14} color="#6C4AB6" />
                                            <Text style={s.bookingDetailText}>{booking.guest_count || booking.guestCount} ضيف</Text>
                                        </View>
                                        {(booking.services?.length || 0) > 0 && (
                                            <View style={s.verticalInfoPill}>
                                                <Feather name="grid" size={14} color="#6C4AB6" />
                                                <Text style={s.bookingDetailText}>{booking.services.length} خدمات</Text>
                                            </View>
                                        )}
                                    </View>

                                    {booking.status === "owner_rescheduled" && booking.proposed_date && (
                                        <View style={{ 
                                            backgroundColor: "#FFF9E6", 
                                            padding: 12, 
                                            borderRadius: 8, 
                                            marginHorizontal: 16, 
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: "#F39C12",
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <Feather name="alert-circle" size={18} color="#F39C12" />
                                                <Text style={{ fontWeight: "bold", color: "#F39C12" }}>اقتراح موعد جديد من القاعة</Text>
                                            </View>
                                            <Text style={{ color: "#856404", fontSize: 13 }}>تاريخ الموعد الجديد المقترح هو:</Text>
                                            <Text style={{ fontWeight: "bold", color: "#6C4AB6", marginTop: 4 }}>{formatDate(booking.proposed_date)}</Text>
                                        </View>
                                    )}

                                    <View style={s.bookingCardFooter}>
                                        <View>
                                            <Text style={s.bookingTotalLabel}>المبلغ الإجمالي</Text>
                                            <Text style={s.bookingTotalValue}>
                                                {(Number(booking.total_cost || booking.totalCost)).toLocaleString()} <Text style={s.currency}>₪</Text>
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: "row-reverse", gap: 8 }}>
                                            {(booking.status === "confirmed" || booking.status === "owner_rescheduled") && (
                                                <TouchableOpacity
                                                    style={s.cancelBtn}
                                                    onPress={() => handleCancel(booking)}
                                                >
                                                    <Feather name="x" size={16} color="#E74C3C" />
                                                    <Text style={s.cancelBtnText}>إلغاء</Text>
                                                </TouchableOpacity>
                                            )}

                                            {booking.status === "owner_rescheduled" && (
                                                <View style={{ flexDirection: "row-reverse", gap: 8 }}>
                                                    <TouchableOpacity
                                                        style={[s.rateBtn, { backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }]}
                                                        onPress={() => handleRescheduleResponse(booking, true)}
                                                    >
                                                        <Feather name="check" size={16} color="#4CAF50" />
                                                        <Text style={[s.rateBtnText, { color: "#4CAF50" }]}>قبول الموعد</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[s.cancelBtn, { backgroundColor: "#FFF3E0", borderColor: "#FFE0B2" }]}
                                                        onPress={() => handleRescheduleResponse(booking, false)}
                                                    >
                                                        <Feather name="rotate-ccw" size={16} color="#F39C12" />
                                                        <Text style={[s.cancelBtnText, { color: "#F39C12" }]}>رفض</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}

                                            {booking.status === "confirmed" && (
                                                <TouchableOpacity
                                                    style={s.rateBtn}
                                                    onPress={() => NavigateTo("RateHall", {
                                                        hallName: booking.hall_name || booking.hallName,
                                                        hallCity: booking.hall_location || booking.hallCity,
                                                        bookingId: booking.id,
                                                        hallId: booking.hall_id
                                                    })}
                                                >
                                                    <Feather name="star" size={16} color="#F4B400" />
                                                    <Text style={s.rateBtnText}>تقييم</Text>
                                                </TouchableOpacity>
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
        </SafeAreaView >
    );
}