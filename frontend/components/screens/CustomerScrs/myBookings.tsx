import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles as s } from "./ibrahimStyles";
import { NavigateTo } from "../../reusable func/navigateTo";
import { getBookingsApi, cancelBookingApi } from "../../Services/customerApi";
import { usePaginatedFetch } from "../../reusable func/usePaginatedFetch";
import { useRefresh } from "../../reusable func/refreshContext";
import BackButton from "../../reusable func/backButton";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

const STATUS_CONFIG: Record<string, any> = {
    pending: {
        label: "بانتظار التأكيد",
        color: "#F4B400",
        bg: "#FFF8E1",
        border: "#FFE082",
        icon: "clock" as const,
    },
    confirmed: {
        label: "مؤكد",
        color: "#4CAF50",
        bg: "#E8F5E9",
        border: "#A5D6A7",
        icon: "check-circle" as const,
    },
    cancelled: {
        label: "ملغي",
        color: "#E74C3C",
        bg: "#FFEBEE",
        border: "#EF9A9A",
        icon: "x-circle" as const,
    },
};

export default function MyBookings({ onOpenDrawer }: { onOpenDrawer?: () => void }) {
    const { triggerRefresh } = useRefresh();

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
            `هل تريد إلغاء حجز "${booking.hall_name || booking.hallName}"؟`,
            [
                { text: "لا", style: "cancel" },
                {
                    text: "نعم، إلغاء",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await cancelBookingApi(booking.id);
                            Alert.alert("نجاح", "تم إلغاء الحجز بنجاح");
                            triggerRefresh();
                        } catch (error) {
                            Alert.alert("خطأ", "فشل إلغاء الحجز");
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
                            const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
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

                                    <View style={s.bookingCardFooter}>
                                        <View>
                                            <Text style={s.bookingTotalLabel}>المبلغ الإجمالي</Text>
                                            <Text style={s.bookingTotalValue}>
                                                {(Number(booking.total_cost || booking.totalCost)).toLocaleString()} <Text style={s.currency}>₪</Text>
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: "row-reverse", gap: 8 }}>
                                            {booking.status === "pending" && (
                                                <TouchableOpacity
                                                    style={s.cancelBtn}
                                                    onPress={() => handleCancel(booking)}
                                                >
                                                    <Feather name="x" size={16} color="#E74C3C" />
                                                    <Text style={s.cancelBtnText}>إلغاء</Text>
                                                </TouchableOpacity>
                                            )}
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